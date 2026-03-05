import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Download, Palette, Link2, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function SmartQRCode() {
  const [url, setUrl] = useState("");
  const [color, setColor] = useState("#a3e635");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!url) {
      toast({ title: "URL Required", description: "Please enter a destination URL.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/premium/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-feature-key": "qr_single" },
        body: JSON.stringify({ url, color, backgroundColor, size: 400 }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to generate QR code");
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      toast({ title: "QR Code Generated", description: "Your branded QR code is ready." });
    } catch (err: any) {
      toast({ title: "Generation Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!url) {
      toast({ title: "URL Required", description: "Please generate a QR code first.", variant: "destructive" });
      return;
    }

    setIsDownloading(true);
    try {
      const params = new URLSearchParams({
        url,
        color,
        backgroundColor,
        size: "2000",
      });

      const response = await fetch(`/api/premium/qr/download?${params}`, {
        credentials: "include",
        headers: { "x-feature-key": "qr_single" },
      });
      
      if (!response.ok) {
        throw new Error("Failed to download QR code");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "qr-code.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      toast({ title: "Downloaded", description: "High-resolution QR code saved." });
    } catch (err: any) {
      toast({ title: "Download Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          <div className="bg-lime-500/10 p-3 rounded-2xl">
            <QrCode className="w-8 h-8 text-lime-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Smart QR Codes</h1>
            <p className="text-slate-400">Custom branded QR codes for print and web.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-slate-900 border-white/10">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Destination URL</Label>
                <Input 
                  placeholder="https://example.com" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-black border-white/10"
                  data-testid="input-qr-url"
                />
              </div>
              <div className="space-y-2">
                <Label>QR Code Color</Label>
                <div className="flex gap-4 items-center">
                  <Input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-12 p-1 bg-black border-white/10 cursor-pointer"
                    data-testid="input-qr-color"
                  />
                  <span className="text-sm font-mono text-slate-400">{color}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-4 items-center">
                  <Input 
                    type="color" 
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-12 p-1 bg-black border-white/10 cursor-pointer"
                    data-testid="input-qr-bg-color"
                  />
                  <span className="text-sm font-mono text-slate-400">{backgroundColor}</span>
                </div>
              </div>
              <Button 
                className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold h-12 gap-2"
                onClick={handleGenerate}
                disabled={isGenerating}
                data-testid="button-generate-qr"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
                {isGenerating ? "Generating..." : "Generate QR Code"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center space-y-6">
            <motion.div 
              className="w-64 h-64 rounded-xl flex items-center justify-center relative overflow-hidden border-4"
              style={{ borderColor: color, backgroundColor }}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              {qrCode ? (
                <img src={qrCode} alt="QR Code" className="w-full h-full object-contain" data-testid="img-qr-code" />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <QrCode className="w-16 h-16 mb-2" style={{ color }} />
                  <span className="text-sm">Preview will appear here</span>
                </div>
              )}
            </motion.div>
            <Button 
              variant="outline" 
              className="w-full border-slate-200 text-slate-900 font-bold h-12 gap-2" 
              onClick={handleDownload}
              disabled={!qrCode || isDownloading}
              data-testid="button-download-qr"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isDownloading ? "Downloading..." : "Download PNG (2000px)"}
            </Button>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
