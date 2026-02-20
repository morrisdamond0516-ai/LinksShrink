import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy | LinksShrink.com";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Learn how LinksShrink.com collects, uses, and protects your personal information. Read our full privacy policy.");
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = "Learn how LinksShrink.com collects, uses, and protects your personal information. Read our full privacy policy.";
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
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-lime-400/10 rounded-lg">
              <Shield className="w-8 h-8 text-lime-400" />
            </div>
            <h1 className="text-4xl font-extrabold text-lime-400" data-testid="text-privacy-title">Privacy Policy</h1>
          </div>
          <p className="text-slate-400" data-testid="text-privacy-effective">Effective Date: February 20, 2026 | Last Updated: February 20, 2026</p>
        </motion.div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-slate-300 leading-relaxed">
              LinksShrink.com ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at LinksShrink.com and use our URL shortening services. Please read this policy carefully. By using our services, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Personal Information</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              When you create an account, we collect:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Password (stored securely using industry-standard encryption)</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-200 mb-2 mt-6">Payment Information</h3>
            <p className="text-slate-300 leading-relaxed">
              When you purchase a paid plan or link credits, payment processing is handled entirely by Stripe, Inc. We do not store your credit card numbers, bank account details, or other financial information on our servers. Please refer to <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">Stripe's Privacy Policy</a> for details on how your payment information is handled.
            </p>

            <h3 className="text-lg font-semibold text-slate-200 mb-2 mt-6">Usage Data</h3>
            <p className="text-slate-300 leading-relaxed">
              We automatically collect certain information when you use our services, including:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>IP address (hashed for anonymous usage tracking)</li>
              <li>Browser type and version</li>
              <li>Device type</li>
              <li>Referring website URLs</li>
              <li>Pages visited and links clicked</li>
              <li>Date and time of visits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-300 leading-relaxed mb-4">We use the information we collect for the following purposes:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>To provide, maintain, and improve our URL shortening services</li>
              <li>To create and manage your account</li>
              <li>To process payments and manage subscriptions</li>
              <li>To provide analytics data for your shortened links (premium feature)</li>
              <li>To monitor usage and enforce our free tier limits</li>
              <li>To detect and prevent fraud, abuse, and security threats</li>
              <li>To communicate with you about your account, updates, or support requests</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Cookies and Tracking Technologies</h2>
            <p className="text-slate-300 leading-relaxed">
              We use session cookies to maintain your login state and provide a seamless experience. These cookies are essential for the operation of our service and are set as HTTP-only cookies for security. We do not use third-party advertising cookies. If you disable cookies in your browser, you may not be able to use certain features of our service such as remaining logged in.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-slate-300 leading-relaxed mb-4">We do not sell your personal information. We may share your information only in the following circumstances:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li><strong className="text-white">Payment Processing:</strong> With Stripe, Inc. to process your payments securely</li>
              <li><strong className="text-white">Legal Requirements:</strong> When required by law, subpoena, or legal process</li>
              <li><strong className="text-white">Safety:</strong> To protect the rights, property, or safety of LinksShrink.com, our users, or the public</li>
              <li><strong className="text-white">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Security</h2>
            <p className="text-slate-300 leading-relaxed">
              We implement industry-standard security measures to protect your information. Passwords are encrypted using bcrypt hashing with salt rounds. Sessions are managed with secure, HTTP-only cookies. All data is transmitted over HTTPS. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
            <p className="text-slate-300 leading-relaxed">
              We retain your account information for as long as your account is active or as needed to provide our services. If you wish to delete your account, contact us at the email address below, and we will delete your personal information within 30 days. Shortened URLs and their associated analytics data may be retained for operational purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Your Rights</h2>
            <p className="text-slate-300 leading-relaxed mb-4">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li><strong className="text-white">Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong className="text-white">Correction:</strong> Request that we correct inaccurate or incomplete data</li>
              <li><strong className="text-white">Deletion:</strong> Request that we delete your personal data</li>
              <li><strong className="text-white">Opt-Out:</strong> Opt out of non-essential data collection</li>
              <li><strong className="text-white">Portability:</strong> Request your data in a portable format</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              To exercise any of these rights, please contact us at <a href="mailto:ProductionLinks@yahoo.com" className="text-lime-400 hover:underline">ProductionLinks@yahoo.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
            <p className="text-slate-300 leading-relaxed">
              Our services are not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on this page and updating the "Last Updated" date. Your continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mt-4">
              <p className="text-white font-semibold">LinksShrink.com</p>
              <p className="text-slate-300 mt-2">Email: <a href="mailto:ProductionLinks@yahoo.com" className="text-lime-400 hover:underline">ProductionLinks@yahoo.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}