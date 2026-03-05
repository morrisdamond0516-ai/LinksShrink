import { Link } from "wouter";

export default function Footer() {
  return (
    <footer data-testid="footer-nav" className="bg-slate-900 border-t border-white/10 py-6 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link href="/privacy" className="text-slate-400 hover:text-lime-400 transition-colors" data-testid="link-footer-privacy">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-slate-400 hover:text-lime-400 transition-colors" data-testid="link-footer-terms">
            Terms of Service
          </Link>
          <Link href="/contact" className="text-slate-400 hover:text-lime-400 transition-colors" data-testid="link-footer-contact">
            Contact
          </Link>
          <Link href="/rules" className="text-slate-400 hover:text-lime-400 transition-colors" data-testid="link-footer-rules">
            Acceptable Use
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-slate-500">
          <a href="mailto:ProductionLinks@yahoo.com" className="hover:text-lime-400 transition-colors" data-testid="link-footer-email">
            ProductionLinks@yahoo.com
          </a>
          <span className="hidden sm:inline">|</span>
          <span>&copy; {new Date().getFullYear()} LinksShrink.com</span>
        </div>
      </div>
    </footer>
  );
}
