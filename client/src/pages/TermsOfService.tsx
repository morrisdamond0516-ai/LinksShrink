import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  useEffect(() => {
    document.title = "Terms of Service | LinksShrink.com";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Read the Terms of Service for LinksShrink.com. Understand our acceptable use policy, payment terms, refund policy, and user obligations.");
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = "Read the Terms of Service for LinksShrink.com. Understand our acceptable use policy, payment terms, refund policy, and user obligations.";
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
              <FileText className="w-8 h-8 text-lime-400" />
            </div>
            <h1 className="text-4xl font-extrabold text-lime-400" data-testid="text-terms-title">Terms of Service</h1>
          </div>
          <p className="text-slate-400" data-testid="text-terms-effective">Effective Date: February 20, 2026 | Last Updated: March 5, 2026</p>
        </motion.div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              By accessing or using LinksShrink.com ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service. We reserve the right to modify these Terms at any time, and your continued use of the Service constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              LinksShrink.com provides a comprehensive URL shortening and link management platform. The Service includes both free and paid tiers with varying features, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>URL shortening and redirection</li>
              <li>Click analytics and performance tracking</li>
              <li>Smart QR code generation</li>
              <li>Password-protected links</li>
              <li>Expiring links with automatic deactivation</li>
              <li>Bulk link creation and management</li>
              <li>Branded and custom short links</li>
              <li>UTM campaign parameter tracking</li>
              <li>Retargeting pixel embedding (Facebook, Google, TikTok, Microsoft)</li>
              <li>A/B traffic split testing</li>
              <li>Geo-routing by country</li>
              <li>Link scheduling with start and end dates</li>
              <li>Click limits per link</li>
              <li>Link-in-bio pages with customizable themes</li>
              <li>Bio page digital product shop</li>
              <li>Team workspaces with role-based access control</li>
              <li>Conversion tracking and goal measurement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Account Registration</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              To access certain features, you must create an account. When registering, you agree to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information as needed</li>
              <li>Keep your password secure and confidential</li>
              <li>Accept responsibility for all activity that occurs under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              You must be at least 13 years of age to create an account and use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Free and Paid Services</h2>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Free Tier</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              All users receive 5 free link shortenings per month. Free tier limits reset on the first day of each calendar month.
            </p>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Paid Plans</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              Paid plans (Starter, Pro, Enterprise) unlock additional features and higher usage limits. Prices are listed on our Pricing page and are subject to change with reasonable notice. All prices are in US Dollars.
            </p>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Link Credit Packs</h3>
            <p className="text-slate-300 leading-relaxed">
              Users may purchase additional link credits ($20 for 20 links). Purchased credits do not expire on a monthly basis and remain available until used.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Payment and Billing</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              All payments are processed securely through Stripe, Inc. By making a purchase, you agree to Stripe's terms of service. You represent that you are authorized to use the payment method provided. We reserve the right to suspend or terminate access to paid features if payment fails or is disputed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Refund Policy</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              We want you to be satisfied with our Service. Our refund policy is as follows:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li><strong className="text-white">Subscription Plans:</strong> You may request a refund within 7 days of your initial purchase if you are not satisfied. Refunds are not available after the 7-day period or for renewal payments.</li>
              <li><strong className="text-white">Link Credit Packs:</strong> Unused link credits may be refunded within 7 days of purchase. Partially used credit packs are not eligible for refund.</li>
              <li><strong className="text-white">How to Request:</strong> Contact us at <a href="mailto:ProductionLinks@yahoo.com" className="text-lime-400 hover:underline">ProductionLinks@yahoo.com</a> with your account email and reason for the refund.</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              Refunds will be processed to the original payment method within 5-10 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Acceptable Use</h2>
            <p className="text-slate-300 leading-relaxed mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Create links to malware, phishing sites, or any malicious content</li>
              <li>Distribute spam or unsolicited communications</li>
              <li>Engage in any illegal activity or promote illegal content</li>
              <li>Infringe upon the intellectual property rights of others</li>
              <li>Harass, threaten, or harm other users or individuals</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Create links to content that promotes violence, hate speech, or discrimination</li>
              <li>Use automated systems to create links in excess of your plan limits</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              We reserve the right to remove any links and suspend or terminate accounts that violate these terms without notice or refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. User-Generated Content</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Users are solely responsible for all content associated with their accounts, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Content displayed on link-in-bio pages</li>
              <li>Digital products listed in bio page shops</li>
              <li>Destination URLs linked through shortened links</li>
              <li>Custom branded link slugs and domains</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              We reserve the right to review, remove, or disable access to any user-generated content that violates these Terms, our Acceptable Use Policy, or applicable law, without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Third-Party Tracking and Advertising Compliance</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Users who enable retargeting pixels or third-party tracking features must comply with all applicable advertising platform policies, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Facebook/Meta Advertising Policies</li>
              <li>Google Ads Policies</li>
              <li>TikTok Advertising Policies</li>
              <li>Microsoft Advertising Policies</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              Users are responsible for having appropriate privacy disclosures on their own websites and landing pages when using retargeting pixels through our Service. Links created through the Service must not violate any advertising platform policies. LinksShrink.com is not liable for any penalties or actions taken by advertising platforms against users who fail to comply with their respective policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Team Workspaces</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Workspace owners are responsible for all actions taken by team members within their workspace. Owners have full control over their workspace, including the ability to:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Invite and remove team members</li>
              <li>Assign admin roles and manage permissions</li>
              <li>Control access to links, analytics, and other workspace resources</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              All team members must comply with these Terms. The workspace owner remains responsible for ensuring that their team members adhere to our policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Data Processing</h2>
            <p className="text-slate-300 leading-relaxed">
              We process personal data as described in our <Link href="/privacy" className="text-lime-400 hover:underline">Privacy Policy</Link>. By using the Service, you acknowledge and consent to our data processing practices, including the collection and use of click analytics, device information, and geographic data for the purpose of providing our link management features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Intellectual Property</h2>
            <p className="text-slate-300 leading-relaxed">
              The Service, including its design, features, and content, is owned by LinksShrink.com and is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on our Service without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Disclaimer of Warranties</h2>
            <p className="text-slate-300 leading-relaxed">
              The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or secure. We are not responsible for the content of URLs that users shorten through our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">14. Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              To the fullest extent permitted by law, LinksShrink.com shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, arising from your use of or inability to use the Service. Our total liability for any claim related to the Service shall not exceed the amount you paid to us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">15. Termination</h2>
            <p className="text-slate-300 leading-relaxed">
              We may suspend or terminate your account and access to the Service at any time, with or without cause, and with or without notice. You may also terminate your account at any time by contacting us. Upon termination, your right to use the Service will immediately cease. Provisions that by their nature should survive termination shall survive.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">16. Governing Law</h2>
            <p className="text-slate-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the United States. Any disputes arising from these Terms or the Service shall be resolved through binding arbitration or in the courts of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">17. Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
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