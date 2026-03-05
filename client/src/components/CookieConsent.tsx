import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  }

  function handleReject() {
    localStorage.setItem("cookie_consent", "rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      data-testid="cookie-banner"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-900 px-4 py-4 sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm text-slate-300">
          We use cookies for essential site functionality, analytics, and advertising purposes including retargeting.{" "}
          <Link
            href="/privacy"
            data-testid="link-cookie-privacy"
            className="text-lime-400 underline underline-offset-2 hover:text-lime-300"
          >
            Learn more in our Privacy Policy
          </Link>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            data-testid="button-reject-cookies"
            onClick={handleReject}
            className="rounded-md border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
          >
            Reject Non-Essential
          </button>
          <button
            data-testid="button-accept-cookies"
            onClick={handleAccept}
            className="rounded-md bg-lime-400 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-lime-300"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
