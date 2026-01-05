import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link2, Layers, Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useShortenUrl } from "@/hooks/use-shortener";
import { motion } from "framer-motion";

export default function BulkShortener() {
  const [urls, setUrls] = useState("");
  const [results, setResults] = useState<{ original: string; short: string }[]>([]);
  const { toast } = useToast();
  const shortenMutation = useShortenUrl();

  const handleBulkShorten = async () => {
    const urlList = urls.split("\n").filter(u => u.trim() !== "");
    if (urlList.length === 0) return;

    toast({
      title: "Processing Bulk URLs",
      description: `Shortening ${urlList.length} links...`,
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