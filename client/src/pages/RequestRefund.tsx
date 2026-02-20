import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, RotateCcw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RequestRefund() {
  useEffect(() => {
    document.title = "Refund Policy | LinksShrink.com";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Request a refund for your LinksShrink.com purchase. Contact us via email within 7 days for eligible refunds.");
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = "Request a refund for your LinksShrink.com purchase. Contact us via email within 7 days for eligible refunds.";
      document.head.appendChild(newMeta);
    }
  }, []);

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
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-lime-400" data-testid="text-refund-title">Refund Policy</h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            We offer refunds within 7 days of purchase for subscriptions and unused link packs.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-900 border-lime-400/20">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <div className="p-4 bg-lime-400/10 rounded-full w-fit mx-auto">
                  <Mail className="w-8 h-8 text-lime-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">To request a refund, email us at:</h2>
                  <a
                    href="mailto:ProductionLinks@yahoo.com"
                    className="text-lime-400 text-lg font-semibold hover:underline"
                    data-testid="link-refund-email"
                  >
                    ProductionLinks@yahoo.com
                  </a>
                </div>
                <div className="text-left space-y-4 text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
                  <p>Please include the following in your email:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Your full name</li>
                    <li>The email address used for purchase</li>
                    <li>Your transaction or session ID (from your email receipt)</li>
                    <li>The reason for your refund request</li>
                  </ul>
                  <p>
                    Eligible refunds are typically processed within 5-10 business days back to your original payment method.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
