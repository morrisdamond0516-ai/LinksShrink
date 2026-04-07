import { motion } from "framer-motion";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Footer from "@/components/Footer";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const forgotMutation = useMutation({
    mutationFn: async (data: ForgotFormData) => {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Request failed");
      }
      return result;
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ForgotFormData) => {
    forgotMutation.mutate(data);
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
            <CardTitle className="text-2xl text-white">
              {submitted ? "Check Your Email" : "Forgot Password?"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-lime-400 mx-auto" />
                <p className="text-slate-300">
                  If an account with that email exists, we've sent a password reset link. Check your inbox (and spam folder).
                </p>
                <p className="text-slate-400 text-sm">
                  The link expires in 1 hour.
                </p>
                <Link href="/login">
                  <Button className="mt-4 bg-lime-400 text-black hover:bg-lime-500 font-bold" data-testid="button-back-to-login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <p className="text-slate-400 text-sm mb-6 text-center">
                  Enter your email and we'll send you a link to reset your password.
                </p>
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
                              data-testid="input-forgot-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold"
                      disabled={forgotMutation.isPending}
                      data-testid="button-send-reset"
                    >
                      {forgotMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Reset Link
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
                <p className="mt-6 text-center text-sm text-slate-400">
                  Remember your password?{" "}
                  <Link href="/login" className="text-lime-400 hover:underline" data-testid="link-login">
                    Log In
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
      <Footer />
    </div>
  );
}
