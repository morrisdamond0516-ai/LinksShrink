import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Footer from "@/components/Footer";
import { usePageView, trackFunnelEvent } from "@/hooks/use-funnel";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  usePageView("/login");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const pendingPlan = localStorage.getItem('pendingPlan');
      if (pendingPlan) {
        navigate('/pricing');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, authLoading, navigate]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      let result: any;
      try {
        result = await response.json();
      } catch {
        throw new Error("Invalid email or password");
      }
      
      if (!response.ok) {
        throw new Error(result?.message || "Invalid email or password");
      }
      
      return result;
    },
    onSuccess: () => {
      trackFunnelEvent("login", "/login");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      const pendingPlan = localStorage.getItem('pendingPlan');
      if (pendingPlan) {
        navigate('/pricing');
      } else {
        navigate('/');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="w-full max-w-md bg-slate-900 border-lime-400/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Link href="/">
                <Link2 className="w-12 h-12 text-lime-400 cursor-pointer" />
              </Link>
            </div>
            <CardTitle className="text-2xl text-white">Welcome back to LinksShrink.com</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          placeholder="you@example.com"
                          className="bg-black border-lime-400/20 text-white" 
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          {...field} 
                          placeholder="Enter your password"
                          className="bg-black border-lime-400/20 text-white" 
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold"
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>
            </Form>
            <p className="mt-4 text-center text-sm">
              <Link href="/forgot-password" className="text-lime-400 hover:underline" data-testid="link-forgot-password">
                Forgot your password?
              </Link>
            </p>
            <p className="mt-3 text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link href="/register" className="text-lime-400 hover:underline" data-testid="link-register">
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
      <Footer />
    </div>
  );
}
