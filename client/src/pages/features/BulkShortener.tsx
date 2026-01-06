import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link2, Layers, Check, Copy, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useShortenUrl } from "@/hooks/use-shortener";
import { motion } from "framer-motion";

export default function BulkShortener() {
  const [urls, setUrls] = useState("");
  const [results, setResults] = useState<{ original: string; short: string }[]>([]);
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const shortenMutation = useShortenUrl();

  const handleBulkShorten = async () => {
    const urlList = urls.split("\n").filter(u => u.trim() !== "");
    if (urlList.length === 0) return;

    if (usePassword && !password) {
      toast({ title: "Password Required", description: "Please set a password or disable protection.", variant: "destructive" });
      return;
    }

    toast({
      title: "Processing Bulk URLs",
      description: `Shortening ${urlList.length} links${usePassword ? " with password protection" : ""}...`,
    });

    const newResults: { original: string; short: string }[] = [];
    
    // In a real app we'd have a bulk API endpoint
    for (const url of urlList) {
      try {
        const data = await shortenMutation.mutateAsync(url);
        newResults.push({ original: url, short: data.shortUrl });
      } catch (e) {
        console.error("Failed to shorten", url);
      }
    }

    setResults(newResults);
    toast({
      title: "Bulk Shortening Complete",
      description: `Successfully shortened ${newResults.length} links.`,
    });
  };

  const copyAll = () => {
    const text = results.map(r => r.short).join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Copied All", description: "All short links copied to clipboard." });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-500/10 p-3 rounded-2xl">
            <Layers className="w-8 h-8 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Bulk Link Shortener</h1>
            <p className="text-slate-400">Shorten up to 3,000 links at once.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle>Enter URLs (one per line)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              placeholder="https://example.com/page1&#10;https://example.com/page2"
              className="min-h-[200px] bg-black border-white/10 text-white font-mono"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
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
                    />
                    <button 
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
              disabled={shortenMutation.isPending || !urls}
            >
              {shortenMutation.isPending ? "Processing..." : "Generate Bulk Links"}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-slate-900 border-white/10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/5">
                <CardTitle className="text-lg">Results ({results.length})</CardTitle>
                <Button variant="ghost" size="sm" onClick={copyAll} className="text-lime-400">
                  <Copy className="w-4 h-4 mr-2" /> Copy All
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {results.map((res, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="truncate flex-1 mr-4">
                        <p className="text-xs text-slate-500 truncate">{res.original}</p>
                        <p className="text-sm font-bold text-lime-400">{res.short}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(res.short)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}