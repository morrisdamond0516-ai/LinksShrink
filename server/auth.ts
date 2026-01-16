import bcrypt from 'bcrypt';
import { db } from './db';
import { users, registerSchema, loginSchema, type User, type RegisterInput, type LoginInput } from '@shared/schema';
import { eq } from 'drizzle-orm';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(input: RegisterInput): Promise<{ user: User } | { error: string }> {
  const validation = registerSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { email, password, firstName, lastName } = validation.data;

  const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (existingUser.length > 0) {
    return { error: 'An account with this email already exists' };
  }

  const passwordHash = await hashPassword(password);

  const [newUser] = await db.insert(users).values({
    email: email.toLowerCase(),
    passwordHash,
    firstName,
    lastName: lastName || null,
    emailVerified: false,
  }).returning();

  return { user: newUser };
}

export async function loginUser(input: LoginInput): Promise<{ user: User } | { error: string }> {
  const validation = loginSchema.safeParse(input);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { email, password } = validation.data;

  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  
  if (!user) {
    return { error: 'Invalid email or password' };
  }

  if (!user.passwordHash) {
    return { error: 'Please use Replit login for this account' };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { error: 'Invalid email or password' };
  }

  return { user };
}

export async function getUserById(id: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return user || null;
}
