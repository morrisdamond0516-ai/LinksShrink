import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Mail, ArrowLeft, Clock, MessageSquare, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";

export default function Contact() {
  useEffect(() => {
    document.title = "Contact Us | LinksShrink.com";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Get in touch with LinksShrink.com for support, billing questions, abuse reports, or privacy requests. Email us at ProductionLinks@yahoo.com.");
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = "Get in touch with LinksShrink.com for support, billing questions, abuse reports, or privacy requests. Email us at ProductionLinks@yahoo.com.";
      document.head.appendChild(newMeta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
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
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-lime-400" data-testid="text-contact-title">Contact Us</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            We're here to help. Reach out to us with any questions, concerns, or feedback about LinksShrink.com.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-900 border-lime-400/20 h-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-lime-400/10 rounded-lg">
                  <Mail className="w-6 h-6 text-lime-400" />
                </div>
                <CardTitle className="text-xl text-white">Email Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 mb-4 leading-relaxed">
                  For general inquiries, account issues, billing questions, or technical support, email us directly.
                </p>
                <a
                  href="mailto:ProductionLinks@yahoo.com"
                  className="text-lime-400 text-lg font-semibold hover:underline"
                  data-testid="link-contact-email"
                >
                  ProductionLinks@yahoo.com
                </a>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-900 border-lime-400/20 h-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-lime-400/10 rounded-lg">
                  <Clock className="w-6 h-6 text-lime-400" />
                </div>
                <CardTitle className="text-xl text-white">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 mb-4 leading-relaxed">
                  We aim to respond to all inquiries within 24-48 business hours. For urgent issues, please include "URGENT" in your email subject line.
                </p>
                <p className="text-slate-500 text-sm">
                  Business hours: Monday - Friday, 9:00 AM - 5:00 PM EST
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-900 border-lime-400/20">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-lime-400/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-lime-400" />
              </div>
              <CardTitle className="text-xl text-white">Common Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-semibold mb-2">Account & Billing</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    For questions about your subscription, billing, or account management, email us with your registered email address and a description of your issue.
                  </p>
                  <Link href="/refund" className="text-lime-400 text-sm font-semibold hover:underline mt-2 inline-block" data-testid="link-request-refund">
                    Request a Refund
                  </Link>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Technical Support</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    If you're experiencing issues with link shortening, redirects, analytics, or any premium features, please describe the problem in detail including the affected URL or short code.
                  </p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Report Abuse</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    To report a shortened link that contains malicious content, spam, or violates our Terms of Service, email us with the short link URL and a description of the issue. We take abuse reports seriously and will investigate promptly.
                  </p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Data & Privacy Requests</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    To request access to, correction of, or deletion of your personal data, please email us from the email address associated with your account. We will process your request within 30 days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-slate-900 border-lime-400/20" data-testid="card-business-info">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-lime-400/10 rounded-lg">
                <Building2 className="w-6 h-6 text-lime-400" />
              </div>
              <CardTitle className="text-xl text-white">Business Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-500 text-sm">Business Name</span>
                  <p className="text-white font-semibold" data-testid="text-business-name">LinksShrink.com</p>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">Email</span>
                  <p>
                    <a
                      href="mailto:ProductionLinks@yahoo.com"
                      className="text-lime-400 font-semibold hover:underline"
                      data-testid="link-business-email"
                    >
                      ProductionLinks@yahoo.com
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-sm">Business Hours</span>
                  <p className="text-white" data-testid="text-business-hours">Monday - Friday, 9:00 AM - 5:00 PM EST</p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed pt-2" data-testid="text-business-description">
                  LinksShrink.com is a digital services company providing URL shortening and link management solutions.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
      <Footer />
    </div>
  );
}