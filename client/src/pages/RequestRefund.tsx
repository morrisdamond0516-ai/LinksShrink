import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, RotateCcw, CheckCircle2, XCircle, Mail } from "lucide-react";
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
import Footer from "@/components/Footer";

const refundFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  transactionId: z.string().min(1, "Transaction or session ID is required to check your refund eligibility"),
  reason: z.string().min(10, "Please provide more detail about your refund request (at least 10 characters)"),
});

type RefundFormValues = z.infer<typeof refundFormSchema>;

interface RefundResult {
  qualified: boolean;
  reasons: string[];
  requestId: number;
  message: string;
}

export default function RequestRefund() {
  const { toast } = useToast();
  const [result, setResult] = useState<RefundResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Request Refund | LinksShrink.com";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Request a refund for your LinksShrink.com purchase. Our system automatically checks your eligibility based on our 7-day refund policy.");
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = "Request a refund for your LinksShrink.com purchase. Our system automatically checks your eligibility based on our 7-day refund policy.";
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

      setResult({
        qualified: data.qualified,
        reasons: data.reasons || [],
        requestId: data.requestId,
        message: data.message,
      });

      toast({
        title: data.qualified ? "Refund Approved" : "Refund Not Eligible",
        description: data.message,
        variant: data.qualified ? "default" : "destructive",
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

  if (result) {
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
                {result.qualified ? (
                  <>
                    <CheckCircle2 className="w-16 h-16 text-lime-400 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-white mb-4" data-testid="text-refund-success">Refund Request Approved</h1>
                    <p className="text-slate-400 mb-2 leading-relaxed">
                      Your request <span className="text-lime-400 font-semibold">#{result.requestId}</span> has been approved and forwarded for processing.
                    </p>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                      Your refund will be processed within 5-10 business days back to your original payment method.
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-white mb-4" data-testid="text-refund-denied">Refund Not Eligible</h1>
                    <p className="text-slate-400 mb-4 leading-relaxed">
                      Request <span className="text-slate-300 font-semibold">#{result.requestId}</span> — unfortunately, your request does not meet our refund policy:
                    </p>
                    <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-4 mb-6 text-left">
                      <ul className="space-y-2">
                        {result.reasons.map((reason, i) => (
                          <li key={i} className="text-red-300 text-sm flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                      We've also sent you an email with these details. If you believe this is an error, please contact us at{" "}
                      <a href="mailto:ProductionLinks@yahoo.com" className="text-lime-400 hover:underline">ProductionLinks@yahoo.com</a>.
                    </p>
                  </>
                )}
                <div className="flex gap-4 justify-center">
                  <Link href="/">
                    <Button variant="outline" data-testid="button-back-home-result">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                  {!result.qualified && (
                    <Button
                      variant="ghost"
                      className="text-slate-400"
                      onClick={() => { setResult(null); form.reset(); }}
                      data-testid="button-try-again"
                    >
                      Try Again
                    </Button>
                  )}
                </div>
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
            Submit your refund request below. Our system will automatically check if your purchase qualifies under our 7-day refund policy.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-900 border-lime-400/20 mb-6">
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
                            placeholder="The email you used when purchasing"
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
                        <FormLabel className="text-slate-300">Transaction or Session ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., cs_live_... or pi_... (from your email receipt)"
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
                    {isSubmitting ? "Checking Eligibility..." : "Submit Refund Request"}
                  </Button>
                </form>
              </Form>

              <p className="text-sm text-slate-500 mt-6 leading-relaxed">
                By submitting this form, you agree to our{" "}
                <Link href="/terms" className="text-lime-400 hover:underline">Terms of Service</Link> and{" "}
                <Link href="/privacy" className="text-lime-400 hover:underline">Privacy Policy</Link>.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-lime-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-300 text-sm">
                    You can also email us directly at{" "}
                    <a href="mailto:ProductionLinks@yahoo.com" className="text-lime-400 hover:underline font-semibold" data-testid="link-refund-email">
                      ProductionLinks@yahoo.com
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
