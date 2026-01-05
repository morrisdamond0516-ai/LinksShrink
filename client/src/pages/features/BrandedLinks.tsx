import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Plus, Trash2, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function BrandedLinks() {
  const [domains, setDomains] = useState<{ id: string; domain: string; status: string }[]>([
    { id: "1", domain: "link.mybrand.com", status: "Active" }
  ]);
  const [newDomain, setNewDomain] = useState("");
  const { toast } = useToast();

  const addDomain = () => {
    if (!newDomain) return;
    const domain = {
      id: Math.random().toString(36).substr(2, 9),
      domain: newDomain,
      status: "Pending Verification"
    };
    setDomains([...domains, domain]);
    setNewDomain("");
    toast({
      title: "Domain Added",
      description: "Please configure your DNS settings to verify ownership.",
    });
  };

  const removeDomain = (id: string) => {
    setDomains(domains.filter(d => d.id !== id));
    toast({ title: "Domain Removed", description: "The custom domain has been detached." });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="bg-lime-500/10 p-3 rounded-2xl">
            <Globe className="w-8 h-8 text-lime-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Branded Links</h1>
            <p className="text-slate-400">Connect your own domains for professional, trusted links.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle>Add Custom Domain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="domain">Domain Name</Label>
                <Input 
                  id="domain"
                  placeholder="link.yourbrand.com" 
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="bg-black border-white/10 h-12"
                />
              </div>
              <Button 
                className="mt-auto h-12 bg-lime-400 text-black hover:bg-lime-500 font-bold px-8"
                onClick={addDomain}
                disabled={!newDomain}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Domain
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Note: You'll need to add a CNAME record in your DNS provider pointing to `cname.linkshrink.io`.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Your Domains</h2>
          <div className="grid gap-4">
            {domains.map((domain) => (
              <motion.div 
                key={domain.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="bg-slate-900 border-white/10">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-black p-2 rounded-lg border border-white/5">
                        <Globe className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{domain.domain}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`w-2 h-2 rounded-full ${domain.status === 'Active' ? 'bg-lime-400' : 'bg-yellow-400 animate-pulse'}`} />
                          <span className="text-xs text-slate-500">{domain.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        <ExternalLink className="w-4 h-4 mr-2" /> DNS Settings
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10" onClick={() => removeDomain(domain.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <Card className="bg-lime-400/5 border-lime-400/10 border-dashed border-2 p-8 text-center space-y-4">
          <div className="bg-lime-400/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Domain Verified</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Your links will now automatically use your custom domain when sharing. 
              Example: `link.yourbrand.com/summer-sale`
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}