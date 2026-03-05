import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

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
          <p className="text-slate-400" data-testid="text-privacy-effective">Effective Date: February 20, 2026 | Last Updated: March 5, 2026</p>
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
            <p className="text-slate-300 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to maintain your session, improve your experience, and support advertising features. Below is a summary of the types of cookies we use:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-3 px-4 text-white font-semibold">Cookie Type</th>
                    <th className="py-3 px-4 text-white font-semibold">Purpose</th>
                    <th className="py-3 px-4 text-white font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-200">Essential Cookies</td>
                    <td className="py-3 px-4">Session cookies for login state</td>
                    <td className="py-3 px-4">httpOnly, secure. Required for core functionality.</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-200">Analytics Cookies</td>
                    <td className="py-3 px-4">Anonymous click tracking for shortened URLs</td>
                    <td className="py-3 px-4">Used to provide click analytics and usage statistics.</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-200">Advertising Cookies</td>
                    <td className="py-3 px-4">Retargeting pixels (Facebook, Google, TikTok, Microsoft)</td>
                    <td className="py-3 px-4">Only activated with user consent. Used for ad measurement and retargeting.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-300 leading-relaxed mt-4">
              If you disable cookies in your browser, you may not be able to use certain features of our service such as remaining logged in.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Advertising and Tracking Technologies</h2>

            <h3 className="text-lg font-semibold text-slate-200 mb-2">Microsoft Advertising / UET Tracking</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              This website may use Microsoft Advertising tracking features including Universal Event Tracking (UET). When you interact with our advertisements on Microsoft platforms, the destination page may contain tracking code that helps us measure ad performance and understand your path to our website.
            </p>

            <h3 className="text-lg font-semibold text-slate-200 mb-2">Retargeting Pixels</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              Our premium users may embed third-party retargeting pixels (Facebook Pixel, Google Analytics, TikTok Pixel) in their shortened links. When you click a link containing retargeting pixels, these third-party scripts may set cookies and collect data according to their respective privacy policies.
            </p>

            <h3 className="text-lg font-semibold text-slate-200 mb-2">Third-Party Privacy Policies</h3>
            <p className="text-slate-300 leading-relaxed mb-2">
              For more information about how these third parties handle your data, please review their privacy policies:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li><a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">Facebook Privacy Policy</a></li>
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">Google Privacy Policy</a></li>
              <li><a href="https://www.tiktok.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">TikTok Privacy Policy</a></li>
              <li><a href="https://privacy.microsoft.com/en-us/privacystatement" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">Microsoft Privacy Statement</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Consent and Cookie Preferences</h2>
            <p className="text-slate-300 leading-relaxed">
              For visitors located in the EU/EEA, United Kingdom, and Switzerland, non-essential cookies (including analytics and advertising cookies) are only activated after you provide consent via our cookie consent banner. Essential cookies required for the operation of the service are always active. You can change your cookie preferences at any time by clearing your browser cookies and revisiting the site, which will cause the consent banner to reappear.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Data Sharing and Disclosure</h2>
            <p className="text-slate-300 leading-relaxed mb-4">We do not sell your personal information. We may share your information only in the following circumstances:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li><strong className="text-white">Payment Processing:</strong> With Stripe, Inc. to process your payments securely</li>
              <li><strong className="text-white">Legal Requirements:</strong> When required by law, subpoena, or legal process</li>
              <li><strong className="text-white">Safety:</strong> To protect the rights, property, or safety of LinksShrink.com, our users, or the public</li>
              <li><strong className="text-white">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Data Security</h2>
            <p className="text-slate-300 leading-relaxed">
              We implement industry-standard security measures to protect your information. Passwords are encrypted using bcrypt hashing with salt rounds. Sessions are managed with secure, HTTP-only cookies. All data is transmitted over HTTPS. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Data Retention</h2>
            <p className="text-slate-300 leading-relaxed">
              We retain your account information for as long as your account is active or as needed to provide our services. If you wish to delete your account, contact us at the email address below, and we will delete your personal information within 30 days. Shortened URLs and their associated analytics data may be retained for operational purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Your Rights</h2>
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
            <h2 className="text-2xl font-bold text-white mb-4">11. Your Rights Under GDPR (EU/EEA Users)</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              If you are located in the European Union or European Economic Area, you have the following rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li><strong className="text-white">Right of Access:</strong> You have the right to request a copy of the personal data we hold about you.</li>
              <li><strong className="text-white">Right to Rectification:</strong> You have the right to request correction of inaccurate or incomplete personal data.</li>
              <li><strong className="text-white">Right to Erasure:</strong> You have the right to request deletion of your personal data ("right to be forgotten").</li>
              <li><strong className="text-white">Right to Restriction of Processing:</strong> You have the right to request that we restrict the processing of your personal data under certain conditions.</li>
              <li><strong className="text-white">Right to Data Portability:</strong> You have the right to receive your personal data in a structured, commonly used, and machine-readable format.</li>
              <li><strong className="text-white">Right to Object:</strong> You have the right to object to the processing of your personal data for direct marketing or other purposes.</li>
              <li><strong className="text-white">Right to Withdraw Consent:</strong> Where processing is based on consent, you have the right to withdraw your consent at any time without affecting the lawfulness of processing based on consent before its withdrawal.</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              To exercise these rights, contact us at <a href="mailto:ProductionLinks@yahoo.com" className="text-lime-400 hover:underline">ProductionLinks@yahoo.com</a>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Your Rights Under CCPA (California Residents)</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li><strong className="text-white">Right to Know:</strong> You have the right to know what personal information we collect, use, disclose, and sell about you.</li>
              <li><strong className="text-white">Right to Delete:</strong> You have the right to request deletion of your personal information, subject to certain exceptions.</li>
              <li><strong className="text-white">Right to Opt-Out of Sale:</strong> You have the right to opt out of the sale of your personal information. Please note: We do not sell personal information.</li>
              <li><strong className="text-white">Right to Non-Discrimination:</strong> You have the right not to be discriminated against for exercising your CCPA rights.</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              To exercise these rights, contact us at <a href="mailto:ProductionLinks@yahoo.com" className="text-lime-400 hover:underline">ProductionLinks@yahoo.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Third-Party Services</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              We use the following third-party services in connection with our platform:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li><strong className="text-white">Stripe:</strong> Payment processing for subscriptions and link credit purchases. Stripe handles all payment data securely.</li>
              <li><strong className="text-white">Microsoft Advertising:</strong> Ad measurement and campaign performance tracking via Universal Event Tracking (UET).</li>
              <li><strong className="text-white">Retargeting Pixels:</strong> Premium users may configure third-party retargeting pixels (Facebook Pixel, Google Analytics, TikTok Pixel) within their shortened links. These pixels are configured and managed by the individual users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">14. International Data Transfers</h2>
            <p className="text-slate-300 leading-relaxed">
              Your information may be transferred to and processed in the United States, where our servers and service providers are located. By using our services, you acknowledge that your data may be processed in a jurisdiction that may have different data protection laws than your country of residence. We take appropriate measures to ensure your data is protected in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">15. Children's Privacy</h2>
            <p className="text-slate-300 leading-relaxed">
              Our services are not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">16. Changes to This Policy</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on this page and updating the "Last Updated" date. Your continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">17. Contact Us</h2>
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
      <Footer />
    </div>
  );
}