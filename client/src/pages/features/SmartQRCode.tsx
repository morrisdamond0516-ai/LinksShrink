import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Download, Palette, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function SmartQRCode() {
  const [url, setUrl] = useState("");
  const [color, setColor] = useState("#a3e635");
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    toast({ title: "Downloading...", description: "Your high-resolution QR code is being generated." });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
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
                  placeholder="https://yourlink.com" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-black border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Brand Color</Label>
                <div className="flex gap-4 items-center">
                  <Input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-12 p-1 bg-black border-white/10"
                  />
                  <span className="text-sm font-mono">{color}</span>
                </div>
              </div>
              <Button className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold h-12 gap-2">
                <Palette className="w-4 h-4" /> Apply Branding
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center space-y-6">
            <div 
              ref={qrRef}
              className="w-64 h-64 bg-slate-100 rounded-xl flex items-center justify-center relative overflow-hidden border-4 border-slate-200"
            >
              <div className="grid grid-cols-12 gap-1 p-3 w-full h-full" style={{ color: color }}>
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className={`aspect-square rounded-[1px] ${Math.random() > 0.7 ? 'bg-current' : 'bg-transparent'}`} />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white border-2 rounded-lg flex items-center justify-center shadow-xl" style={{ borderColor: color }}>
                  <Link2 className="w-6 h-6" style={{ color: color }} />
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full border-slate-200 text-slate-900 font-bold h-12 gap-2" onClick={handleDownload}>
              <Download className="w-4 h-4" /> Download PNG (4000px)
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}