import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Globe, Smartphone, Monitor, MousePointer2 } from "lucide-react";

export default function Analytics() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-400/10 p-3 rounded-2xl">
            <BarChart className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Advanced Analytics</h1>
            <p className="text-slate-400">Real-time performance metrics for your links.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-white/10 p-6">
            <span className="text-slate-500 text-xs font-bold uppercase">Total Clicks</span>
            <div className="text-4xl font-black text-lime-400 mt-2">12,842</div>
            <div className="text-xs text-green-500 mt-1">+12% from last week</div>
          </Card>
          <Card className="bg-slate-900 border-white/10 p-6">
            <span className="text-slate-500 text-xs font-bold uppercase">Unique Visitors</span>
            <div className="text-4xl font-black text-white mt-2">8,211</div>
            <div className="text-xs text-slate-500 mt-1">Global reach</div>
          </Card>
          <Card className="bg-slate-900 border-white/10 p-6">
            <span className="text-slate-500 text-xs font-bold uppercase">Avg. Latency</span>
            <div className="text-4xl font-black text-white mt-2">12ms</div>
            <div className="text-xs text-lime-500 mt-1">Optimal performance</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-slate-900 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" /> Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "United States", val: 65, color: "bg-blue-500" },
                { label: "United Kingdom", val: 15, color: "bg-indigo-500" },
                { label: "Germany", val: 10, color: "bg-purple-500" },
                { label: "Other", val: 10, color: "bg-slate-700" }
              ].map(item => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-white font-bold">{item.val}%</span>
                  </div>
                  <div className="h-2 bg-black rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-lime-400" /> Device Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-around py-8">
                <div className="text-center space-y-2">
                  <Smartphone className="w-12 h-12 text-lime-400 mx-auto" />
                  <p className="font-bold text-2xl">68%</p>
                  <p className="text-xs text-slate-500">Mobile</p>
                </div>
                <div className="text-center space-y-2">
                  <Monitor className="w-12 h-12 text-white mx-auto" />
                  <p className="font-bold text-2xl">24%</p>
                  <p className="text-xs text-slate-500">Desktop</p>
                </div>
                <div className="text-center space-y-2">
                  <MousePointer2 className="w-12 h-12 text-slate-500 mx-auto" />
                  <p className="font-bold text-2xl">8%</p>
                  <p className="text-xs text-slate-500">Other</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}