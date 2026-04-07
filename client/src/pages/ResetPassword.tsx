import { motion } from "framer-motion";
import { Link, useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Loader2, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Footer from "@/components/Footer";

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);

  const params = new URLSearchParams(search);
  const token = params.get("token");

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const resetMutation = useMutation({
    mutationFn: async (data: ResetFormData) => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Reset failed");
      }
      return result;
    },
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ResetFormData) => {
    resetMutation.mutate(data);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="w-full max-w-md bg-slate-900 border-lime-400/20">
            <CardHeader className="text-center">
              <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <CardTitle className="text-2xl text-white">Invalid Reset Link</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-400 mb-6">This password reset link is invalid. Please request a new one.</p>
              <Link href="/forgot-password">
                <Button className="bg-lime-400 text-black hover:bg-lime-500 font-bold" data-testid="button-request-new-reset">
                  Request New Reset Link
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
        <Footer />
      </div>
    );
  }

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
            <CardTitle className="text-2xl text-white">
              {success ? "Password Reset!" : "Create New Password"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-lime-400 mx-auto" />
                <p className="text-slate-300">
                  Your password has been updated. You can now log in with your new password.
                </p>
                <Link href="/login">
                  <Button className="mt-4 bg-lime-400 text-black hover:bg-lime-500 font-bold" data-testid="button-go-to-login">
                    <Lock className="mr-2 h-4 w-4" />
                    Go to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            placeholder="At least 8 characters"
                            className="bg-black border-lime-400/20 text-white"
                            data-testid="input-new-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            placeholder="Re-enter your password"
                            className="bg-black border-lime-400/20 text-white"
                            data-testid="input-confirm-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold"
                    disabled={resetMutation.isPending}
                    data-testid="button-reset-password"
                  >
                    {resetMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Reset Password
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </motion.div>
      <Footer />
    </div>
  );
}
