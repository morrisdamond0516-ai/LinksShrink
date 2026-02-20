import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";

const refundFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  transactionId: z.string().optional(),
  reason: z.string().min(10, "Please provide more detail about your refund request (at least 10 characters)"),
});

type RefundFormValues = z.infer<typeof refundFormSchema>;

export default function RequestRefund() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Request Refund | LinksShrink.com";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Request a refund for your LinksShrink.com purchase. We process refund requests within 48 hours for eligible purchases within 7 days.");
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = "Request a refund for your LinksShrink.com purchase. We process refund requests within 48 hours for eligible purchases within 7 days.";
      document.head.appendChild(newMeta);
    }
  }, []);

  const form = useForm<RefundFormValues>({
    resolver: zodResolver(refundFormSchema),
    defaultValues: {
      name: "",
      email: "",
      transactionId: "",
      reason: "",
    },
  });

  async function onSubmit(values: RefundFormValues) {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/refund-request", values);
      const data = await response.json();

      setRequestId(data.requestId);
      setSubmitted(true);

      toast({
        title: "Refund Request Submitted",
        description: "We'll review your request and get back to you within 48 hours.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit refund request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="bg-slate-900 border-lime-400/20">
              <CardContent className="pt-8 pb-8">
                <CheckCircle2 className="w-16 h-16 text-lime-400 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-white mb-4" data-testid="text-refund-success">Refund Request Submitted</h1>
                <p className="text-slate-400 mb-2 leading-relaxed">
                  Your request <span className="text-lime-400 font-semibold">#{requestId}</span> has been received.
                </p>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  We'll review your request and respond to your email within 48 hours. Eligible refunds will be processed through Stripe back to your original payment method.
                </p>
                <Link href="/">
                  <Button variant="outline" data-testid="button-back-home-success">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-slate-400" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="p-4 bg-lime-400/10 rounded-full w-fit mx-auto mb-6">
            <RotateCcw className="w-8 h-8 text-lime-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-lime-400" data-testid="text-refund-title">Request a Refund</h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            We offer refunds within 7 days of purchase for subscriptions and unused link packs. Fill out the form below and we'll review your request.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-900 border-lime-400/20">
            <CardHeader>
              <CardTitle className="text-xl text-white">Refund Request Form</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your full name"
                            className="bg-slate-800 border-slate-700 text-white"
                            data-testid="input-refund-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            className="bg-slate-800 border-slate-700 text-white"
                            data-testid="input-refund-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transactionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Transaction or Session ID (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., cs_live_... or from your email receipt"
                            className="bg-slate-800 border-slate-700 text-white"
                            data-testid="input-refund-transaction"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Reason for Refund</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Please describe why you're requesting a refund..."
                            className="flex min-h-[120px] w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            data-testid="input-refund-reason"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-lime-400 text-black font-bold"
                    disabled={isSubmitting}
                    data-testid="button-submit-refund"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Refund Request"}
                  </Button>
                </form>
              </Form>

              <p className="text-sm text-slate-500 mt-6 leading-relaxed">
                By submitting this form, you agree to our{" "}
                <Link href="/terms" className="text-lime-400 hover:underline">Terms of Service</Link> and{" "}
                <Link href="/privacy" className="text-lime-400 hover:underline">Privacy Policy</Link>.
                Refunds are typically processed within 5-10 business days back to your original payment method.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
