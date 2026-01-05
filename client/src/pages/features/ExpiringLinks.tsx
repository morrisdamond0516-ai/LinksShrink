import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExpiringLinks() {
  const [expiryDate, setExpiryDate] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: "Expiration Set", description: "Your link will automatically deactivate on the selected date." });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500/10 p-3 rounded-2xl">
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Expiring Links</h1>
            <p className="text-slate-400">Automatic deactivation for time-sensitive content.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/10 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" /> Expiry Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Expiration Date & Time</Label>
              <Input 
                type="datetime-local"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="bg-black border-white/10 h-12"
              />
            </div>

            <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/10 flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Once the link expires, visitors will see a custom "Expired" landing page instead of being redirected to the destination URL.
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 text-sm">
                <span className="text-slate-400">Custom Expired Redirect</span>
                <Button variant="link" className="text-orange-500 p-0 h-auto">Set Destination</Button>
              </div>
            </div>

            <Button className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold h-12" onClick={handleSave}>
              Apply Expiration
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}