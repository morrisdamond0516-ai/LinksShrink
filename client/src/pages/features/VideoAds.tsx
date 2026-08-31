import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clapperboard } from "lucide-react";
import Footer from "@/components/Footer";

/**
 * Customer AI Video Ads is shelved until scrape / package / payment
 * are wired end-to-end. Admin Kids Shorts still uses HeyGen separately.
 */
export default function VideoAds() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mb-6">
          <Clapperboard className="w-8 h-8 text-slate-500" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-3">AI Video Ads — coming soon</h1>
        <p className="text-slate-400 max-w-md mb-8">
          This feature is temporarily unavailable while we finish payment and packaging.
          Link shortening and premium link tools still work as usual.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/">
            <Button className="bg-lime-400 hover:bg-lime-500 text-black font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" className="border-white/20">
              See pricing
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
