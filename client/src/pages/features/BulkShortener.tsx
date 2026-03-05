import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Layers, Copy, Lock, Eye, EyeOff, ArrowLeft, Loader2, Check, X, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Footer from "@/components/Footer";

interface BulkResult {
  originalUrl: string;
  shortUrl?: string;
  shortCode?: string;
  success: boolean;
  error?: string;
}

export default function BulkShortener() {
  const [urls, setUrls] = useState("");
  const [results, setResults] = useState<BulkResult[]>([]);
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleBulkShorten = async () => {
    const urlList = urls.split("\n").map(u => u.trim()).filter(u => u !== "");
    if (urlList.length === 0) {
      toast({ title: "No URLs", description: "Please enter at least one URL.", variant: "destructive" });
      return;
    }

    if (urlList.length > 100) {
      toast({ title: "Too Many URLs", description: "Maximum 100 URLs per batch.", variant: "destructive" });
      return;
    }

    if (usePassword && !password) {
      toast({ title: "Password Required", description: "Please set a password or disable protection.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/premium/bulk-shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-feature-key": "bulk_100" },
        body: JSON.stringify({ 
          urls: urlList, 
          password: usePassword ? password : undefined 
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Bulk shortening failed");
      }

      const data = await response.json();
      setResults(data.results);
      toast({
        title: "Bulk Shortening Complete",
        description: `Successfully shortened ${data.summary.success} of ${data.summary.total} links.`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyAll = () => {
    const text = results.filter(r => r.success).map(r => r.shortUrl).join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Copied All", description: "All successful short links copied to clipboard." });
  };

  const downloadCSV = () => {
    const csv = ["Original URL,Short URL,Status"]
      .concat(results.map(r => `"${r.originalUrl}","${r.shortUrl || ''}","${r.success ? 'Success' : r.error}"`))
      .join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-links.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "CSV file saved." });
  };

  const successCount = results.filter(r => r.success).length;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          <div className="bg-yellow-500/10 p-3 rounded-2xl">
            <Layers className="w-8 h-8 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Bulk Link Shortener</h1>
            <p className="text-slate-400">Shorten up to 100 links at once.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle>Enter URLs (one per line)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              placeholder={"https://example.com/page1\nhttps://example.com/page2\nhttps://example.com/page3"}
              className="min-h-[200px] bg-black border-white/10 text-white font-mono"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              data-testid="textarea-urls"
            />

            <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/10 p-2 rounded-lg">
                    <Lock className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Password Protection</p>
                    <p className="text-xs text-slate-500">Apply to all links in this batch</p>
                  </div>
                </div>
                <Switch 
                  checked={usePassword} 
                  onCheckedChange={setUsePassword}
                  className="data-[state=checked]:bg-red-500"
                  data-testid="switch-password"
                />
              </div>

              {usePassword && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2 pt-2"
                >
                  <Label className="text-xs text-slate-400">Batch Password</Label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Set password for all links"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-black border-white/10 pr-10"
                      data-testid="input-password"
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <Button 
              className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold h-12"
              onClick={handleBulkShorten}
              disabled={isProcessing || !urls.trim()}
              data-testid="button-shorten"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Layers className="w-4 h-4 mr-2" />}
              {isProcessing ? "Processing..." : "Generate Bulk Links"}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-slate-900 border-white/10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/5">
                <CardTitle className="text-lg">
                  Results ({successCount}/{results.length} successful)
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={downloadCSV} className="text-slate-400">
                    <Download className="w-4 h-4 mr-2" /> CSV
                  </Button>
                  <Button variant="ghost" size="sm" onClick={copyAll} className="text-lime-400">
                    <Copy className="w-4 h-4 mr-2" /> Copy All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                <div className="divide-y divide-white/5">
                  {results.map((res, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="truncate flex-1 mr-4">
                        <p className="text-xs text-slate-500 truncate">{res.originalUrl}</p>
                        {res.success ? (
                          <p className="text-sm font-bold text-lime-400">{res.shortUrl}</p>
                        ) : (
                          <p className="text-sm text-red-400">{res.error}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {res.success ? (
                          <>
                            <Check className="w-4 h-4 text-lime-400" />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                navigator.clipboard.writeText(res.shortUrl!);
                                toast({ title: "Copied", description: "Link copied." });
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <X className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
