import { Link } from "wouter";

export default function Footer() {
  return (
    <footer data-testid="footer-nav" className="bg-slate-900 border-t border-white/10 mt-auto">
      {/* EbookGamez Affiliate Band */}
      <div className="border-b border-[hsl(43,68%,54%)]/20 bg-[hsl(43,68%,54%)]/5 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <span className="text-[hsl(43,68%,54%)] text-xs font-semibold uppercase tracking-widest">✦ An EbookGamez Brand</span>
          <span className="hidden sm:inline text-slate-600 text-xs">|</span>
          <a
            href="https://ebookgamez.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-[hsl(43,68%,54%)] transition-colors"
            data-testid="link-footer-ebookgamez"
          >
            LinksShrink.com is a branch of EbookGamez.com — visit our parent platform for ebooks, games & learning resources
          </a>
        </div>
      </div>

      <div className="py-6 px-4">
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
            <a
              href="https://ebookgamez.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(43,68%,54%)] hover:text-[hsl(43,80%,68%)] transition-colors font-medium"
              data-testid="link-footer-ebookgamez-main"
            >
              📚 EbookGamez.com
            </a>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-slate-500">
            <a href="mailto:ProductionLinks@yahoo.com" className="hover:text-lime-400 transition-colors" data-testid="link-footer-email">
              ProductionLinks@yahoo.com
            </a>
            <span className="hidden sm:inline">|</span>
            <span>&copy; {new Date().getFullYear()} LinksShrink.com · <span className="text-[hsl(43,68%,54%)]">EbookGamez Family</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
