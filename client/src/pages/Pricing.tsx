import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const plans = [
  {
    name: "FREE",
    price: "0",
    description: "Essential link shortening for personal use.",
    features: [
      { 
        text: "Basic link shortening", 
        example: "What it does: Shortens any URL. | Shows: A 1-2 character unique link like snap.link/a1" 
      },
      { 
        text: "No analytics", 
        example: "What it does: Simple redirection. | Shows: No tracking data provided." 
      },
      { 
        text: "No custom domain", 
        example: "What it does: Uses our default domain. | Shows: Always snap.link branding." 
      },
    ],
    buttonText: "Get Started",
    recommended: false,
  },
  {
    name: "Starter",
    price: "10",
    description: "Perfect for growing brands.",
    features: [
      { 
        text: "Click Analytics", 
        example: "What it does: Counts every visitor. | Shows: Total click count on your dashboard." 
      },
      { 
        text: "Custom QR Codes", 
        example: "What it does: Generates scannable codes. | Shows: A downloadable QR image for your link." 
      },
      { 
        text: "Custom Slugs", 
        example: "What it does: Lets you name your link. | Shows: snap.link/your-name instead of random characters." 
      },
      { 
        text: "Faster Redirects", 
        example: "What it does: Uses premium server routing. | Shows: Near-instant loading for your visitors." 
      },
    ],
    buttonText: "Choose Starter",
    recommended: true,
  },
  {
    name: "Pro",
    price: "25",
    description: "Advanced features for professionals.",
    features: [
      { 
        text: "Custom Domain", 
        example: "What it does: Connects your own domain. | Shows: yourbrand.com/offer instead of snap.link." 
      },
      { 
        text: "Advanced Analytics", 
        example: "What it does: Detailed visitor tracking. | Shows: Charts of location, device types, and browser data." 
      },
      { 
        text: "Expiring Links", 
        example: "What it does: Sets an end date. | Shows: Link automatically deactivates after your chosen time." 
      },
      { 
        text: "Password Protection", 
        example: "What it does: Adds a security layer. | Shows: A password prompt screen before redirecting." 
      },
    ],
    buttonText: "Go Pro",
    recommended: false,
  },
  {
    name: "Enterprise",
    price: "50",
    description: "Maximum scale for agencies and power users.",
    features: [
      { 
        text: "3,000 Bulk Links", 
        example: "What it does: Shortens many links at once. | Shows: 3,000 short links generated from your CSV file." 
      },
      { 
        text: "50 Custom Domains", 
        example: "What it does: Manage multiple brands. | Shows: A dashboard to control 50 different custom domains." 
      },
      { 
        text: "Bulk Password Protection", 
        example: "What it does: Secures entire sets. | Shows: Password locks applied across thousands of links instantly." 
      },
      { 
        text: "Full API Access", 
        example: "What it does: Integrates with your apps. | Shows: Programmatic access to create and manage links." 
      },
    ],
    buttonText: "Get Enterprise",
    recommended: false,
  },
];

export default function Pricing() {
  const handlePayment = (planName: string) => {
    if (planName === "FREE") return;
    window.alert(`Redirecting to secure payment for ${planName} plan ($${plans.find(p => p.name === planName)?.price}/mo)...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Choose the plan that's right for your links. All plans include our core shortening technology.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`h-full flex flex-col relative ${plan.recommended ? 'border-primary shadow-xl scale-105 z-10' : 'border-border/50 hover:shadow-lg transition-shadow'}`}>
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Recommended
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-extrabold">${plan.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex flex-col gap-1">
                        <div className="flex items-start gap-3 text-sm">
                          <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="font-medium leading-tight">{feature.text}</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-9 italic">{feature.example}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-6">
                  <Button 
                    className="w-full font-bold h-12 hover-elevate active-elevate-2"
                    variant={plan.recommended ? "default" : "outline"}
                    onClick={() => handlePayment(plan.name)}
                  >
                    {plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
