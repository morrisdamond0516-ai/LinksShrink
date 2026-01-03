import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, Scale, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Rules() {
  const sections = [
    {
      title: "User Obligations",
      icon: <FileText className="w-6 h-6 text-lime-400" />,
      content: "Users must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials. Any links created must not violate international laws or promote illegal activities."
    },
    {
      title: "Payment & Access",
      icon: <Scale className="w-6 h-6 text-yellow-400" />,
      content: "Premium features are accessible only during the paid period. If a payment is missed, access to premium features will continue until the end of the current billing cycle. After that, the account will revert to the free tier."
    },
    {
      title: "Safety & AI Support",
      icon: <Shield className="w-6 h-6 text-lime-500" />,
      content: "LinkShrink provides an AI support bot to assist with technical issues. If the system malfunctions, the AI can grant a 2-week access extension. Refund requests for the current month are handled via AI, which may offer a free month of access or a full refund for the current period."
    },
    {
      title: "Prohibited Content",
      icon: <AlertCircle className="w-6 h-6 text-red-500" />,
      content: "Links directing to malware, phishing sites, or explicit illegal content will be removed immediately without refund. We reserve the right to suspend accounts that repeatedly violate these policies."
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
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-lime-400">Rules & Regulations</h1>
            <p className="text-xl text-slate-400">Our commitment to transparency and user safety.</p>
          </motion.div>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-900 border-lime-400/20">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-2 bg-black rounded-lg border border-lime-400/20">
                    {section.icon}
                  </div>
                  <CardTitle className="text-xl text-white">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 leading-relaxed">{section.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center space-y-4">
          <p className="text-slate-400">Questions? Contact us at <a href="mailto:ProductionLinks@yahoo.com" className="text-lime-400 hover:underline">ProductionLinks@yahoo.com</a></p>
          <Link href="/">
            <Button variant="outline" className="border-lime-400 text-lime-400 hover:bg-lime-400 hover:text-black">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
