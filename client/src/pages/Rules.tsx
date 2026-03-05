import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, Scale, FileText, AlertCircle, Ban, ShieldCheck, Eye, Gavel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

export default function Rules() {
  useEffect(() => {
    document.title = "Acceptable Use Policy | LinksShrink.com";
  }, []);

  const sections = [
    {
      title: "Acceptable Use Policy",
      icon: <ShieldCheck className="w-6 h-6 text-lime-400" />,
      content: "LinksShrink.com is a link management platform designed for legitimate marketing, business, and personal use. All users must use our service responsibly and in compliance with all applicable local, state, national, and international laws and regulations."
    },
    {
      title: "Strictly Prohibited Content",
      icon: <Ban className="w-6 h-6 text-red-500" />,
      items: [
        "Spam, bulk unsolicited messages, or any form of phishing",
        "Malware, viruses, trojans, ransomware, or any malicious software distribution",
        "Links to illegal content, including pirated software, counterfeit goods, or controlled substances",
        "Fraudulent or deceptive schemes, including scams and pyramid schemes",
        "Content that promotes violence, hate speech, terrorism, or exploitation of minors",
        "Links designed to harvest personal data or credentials without consent",
        "Content that infringes on intellectual property rights, trademarks, or copyrights",
        "Any activity that circumvents security measures or exploits system vulnerabilities"
      ]
    },
    {
      title: "Link Monitoring & Enforcement",
      icon: <Eye className="w-6 h-6 text-yellow-400" />,
      content: "We actively monitor links created on our platform for abuse. Links found to violate our policies are immediately deactivated without notice. We cooperate with law enforcement agencies and will provide information in response to valid legal requests. Repeat offenders are permanently banned from our platform."
    },
    {
      title: "User Obligations",
      icon: <FileText className="w-6 h-6 text-lime-400" />,
      content: "Users must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You agree not to use LinksShrink.com to mask, hide, or disguise the true destination of a link for deceptive purposes."
    },
    {
      title: "Payment & Refunds",
      icon: <Scale className="w-6 h-6 text-yellow-400" />,
      content: "All payments are processed securely through Stripe. We never store your credit card information. Premium features are accessible only during the paid period. We offer a 7-day refund policy for subscriptions and unused link packs. Refund requests can be submitted through our Refund page or by emailing ProductionLinks@yahoo.com."
    },
    {
      title: "Consequences of Violations",
      icon: <Gavel className="w-6 h-6 text-red-400" />,
      content: "Violations of these policies may result in immediate link deactivation, account suspension, permanent ban, forfeiture of paid credits without refund, and reporting to relevant authorities. We reserve the right to take action at our sole discretion to protect our platform and users."
    },
    {
      title: "Data Privacy & Security",
      icon: <Shield className="w-6 h-6 text-lime-500" />,
      content: "We are committed to protecting user privacy. We do not sell personal data to third parties. Analytics data is aggregated and anonymized. For full details, please review our Privacy Policy. We use industry-standard security measures including HTTPS encryption and secure session management."
    },
    {
      title: "Reporting Abuse",
      icon: <AlertCircle className="w-6 h-6 text-orange-400" />,
      content: "If you encounter a link on LinksShrink.com that violates our policies, please report it immediately to ProductionLinks@yahoo.com. Include the short link URL and a description of the violation. We review all reports and take appropriate action within 24 hours."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-lime-400" data-testid="text-rules-title">Acceptable Use Policy</h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Our commitment to maintaining a safe, trustworthy, and compliant platform for all users.
            </p>
            <p className="text-sm text-slate-500 mt-4">Last updated: February 2026</p>
          </motion.div>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-slate-900 border-lime-400/20">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-2 bg-black rounded-lg border border-lime-400/20">
                    {section.icon}
                  </div>
                  <CardTitle className="text-xl text-white">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {"items" in section && section.items ? (
                    <ul className="space-y-3">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-400 leading-relaxed">
                          <span className="text-red-400 mt-1 shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 leading-relaxed">{section.content}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center space-y-4">
          <p className="text-slate-400">
            Questions about our policies? Contact us at{" "}
            <a href="mailto:ProductionLinks@yahoo.com" className="text-lime-400 hover:underline">ProductionLinks@yahoo.com</a>
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/terms">
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Terms of Service
              </Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Privacy Policy
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
