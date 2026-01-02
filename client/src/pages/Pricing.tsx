import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const plans = [
  {
    name: "FREE",
    price: "0",
    description: "Get started with basic link shortening.",
    features: [
      "Basic link shortening",
      "No analytics",
      "No custom domain",
    ],
    buttonText: "Get Started",
    recommended: true,
  },
  {
    name: "Starter",
    price: "3-5",
    description: "Perfect for growing brands.",
    features: [
      "Analytics",
      "QR codes",
      "Custom slugs",
      "Faster redirects",
    ],
    buttonText: "Choose Starter",
    recommended: false,
  },
  {
    name: "Pro",
    price: "10-15",
    description: "Advanced features for professionals.",
    features: [
      "Custom domain support",
      "Advanced analytics",
      "Expiring links",
      "Password-protected links",
    ],
    buttonText: "Go Pro",
    recommended: false,
  },
  {
    name: "Enterprise",
    price: "20-49",
    description: "Scale your business with powerful tools.",
    features: [
      "Bulk link creation",
      "API access",
    ],
    buttonText: "Contact Us",
    recommended: false,
  },
];

export default function Pricing() {
  const handlePayment = (planName: string) => {
    if (planName === "FREE") return;
    window.alert(`Redirecting to payment for ${planName} plan...`);
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
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="leading-tight">{feature}</span>
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
