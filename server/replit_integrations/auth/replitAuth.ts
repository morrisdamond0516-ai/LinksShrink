import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import crypto from "crypto";
import { registerUser, loginUser, getUserById, getUserByEmail, hashPassword } from "../../auth";
import { authStorage } from "./storage";
import type { User } from "@shared/schema";
import { passwordResetTokens } from "@shared/schema";
import { db } from "../../db";
import { eq, and, isNull, gt } from "drizzle-orm";
import { sendPasswordResetEmail } from "../../emailService";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const result = await loginUser({ email, password });
          if ('error' in result) {
            return done(null, false, { message: result.error });
          }
          return done(null, result.user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user: Express.User, cb) => {
    const u = user as User;
    cb(null, { id: u.id, claims: { sub: u.id } });
  });

  passport.deserializeUser(async (sessionUser: { id: string; claims: { sub: string } }, cb) => {
    try {
      const user = await getUserById(sessionUser.id);
      if (user) {
        cb(null, { ...user, claims: { sub: user.id } });
      } else {
        cb(null, false);
      }
    } catch (err) {
      cb(err);
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      const result = await registerUser({ email, password, firstName, lastName });
      
      if ('error' in result) {
        return res.status(400).json({ message: result.error });
      }

      req.login({ ...result.user, claims: { sub: result.user.id } }, (err) => {
        if (err) {
          console.error("Login after register failed:", err);
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        res.json({ 
          success: true, 
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
          }
        });
      });
    } catch (err: any) {
      console.error("Registration error:", err);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate('local', (err: any, user: User | false, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid email or password" });
      }
      
      req.login({ ...user, claims: { sub: user.id } }, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          }
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await getUserByEmail(email);
      res.json({ success: true, message: "If an account with that email exists, we've sent a password reset link." });

      if (!user || !user.passwordHash) return;

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      const baseUrl = process.env.NODE_ENV === "production"
        ? "https://linksshrink.com"
        : `${req.protocol}://${req.get("host")}`;
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      await sendPasswordResetEmail(email, resetUrl);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const [resetToken] = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, token),
            isNull(passwordResetTokens.usedAt),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!resetToken) {
        return res.status(400).json({ message: "This reset link is invalid or has expired. Please request a new one." });
      }

      const newHash = await hashPassword(password);
      const { users } = await import("@shared/schema");
      await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, resetToken.userId));

      await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, resetToken.id));

      res.json({ success: true, message: "Your password has been reset. You can now log in." });
    } catch (err: any) {
      console.error("Reset password error:", err);
      res.status(500).json({ message: "Something went wrong" });
    }
  });

  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      res.redirect('/');
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
