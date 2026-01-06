import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Lock, ShieldCheck, Eye, EyeOff, Link2, Globe, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PasswordProtection() {
  const [url, setUrl] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [managedAccess, setManagedAccess] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!url) {
      toast({ title: "URL Required", description: "Please enter a URL to protect.", variant: "destructive" });
      return;
    }
    if (!password) {
      toast({ title: "Password Required", description: "Please set a password for the link.", variant: "destructive" });
      return;
    }
    toast({ title: "Link Secured", description: "Password protection has been applied to your link." });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="bg-red-500/10 p-3 rounded-2xl">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Password Protection</h1>
            <p className="text-slate-400">Secure your links with enterprise-grade access control.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/10 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-lime-400" /> Access Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="target-url">Target URL</Label>
              <div className="relative">
                <Input 
                  id="target-url"
                  placeholder="https://example.com/sensitive-doc" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-black border-white/10 pl-10 h-12"
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Set Link Password</Label>
              <div className="relative">
                <Input 
                  type={show ? "text" : "password"}
                  placeholder="Enter a strong password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black border-white/10 pr-10 h-12"
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500">Visitors will be required to enter this password before being redirected.</p>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold">Managed Access Control</p>
                  <p className="text-xs text-slate-500">Only allow specific referrers or IPs.</p>
                </div>
                <Switch 
                  checked={managedAccess} 
                  onCheckedChange={setManagedAccess}
                  className="data-[state=checked]:bg-lime-400"
                />
              </div>

              {managedAccess && (
                <div className="space-y-4 p-4 bg-lime-400/5 rounded-xl border border-lime-400/10">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-lime-400">Allowed Referrers</Label>
                    <Input placeholder="yourdomain.com, internal.app" className="bg-black border-white/10 text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-lime-400">Allowed IP Ranges</Label>
                    <Input placeholder="192.168.1.0/24" className="bg-black border-white/10 text-xs" />
                  </div>
                </div>
              )}
            </div>

            <Button className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold h-12" onClick={handleSave}>
              Save Security Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}