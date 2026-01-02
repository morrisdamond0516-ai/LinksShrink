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
        example: "Clicking this will take you to the dashboard where you can paste a long URL and get a 1-2 character unique link like snap.link/a1 instantly." 
      },
      { 
        text: "No analytics", 
        example: "This feature is not available in the free plan. Upgrade to Starter to see your link performance." 
      },
      { 
        text: "No custom domain", 
        example: "This feature is not available in the free plan. Upgrade to Pro to use your own branding." 
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
        example: "Clicking this will open your analytics dashboard showing a real-time total click count for all your active links." 
      },
      { 
        text: "Custom QR Codes", 
        example: "Clicking this will open the QR generator where you can download a high-resolution, branded QR code for any of your links." 
      },
      { 
        text: "Custom Slugs", 
        example: "Clicking this will let you edit your link's suffix, allowing you to create personalized URLs like snap.link/your-name." 
      },
      { 
        text: "Faster Redirects", 
        example: "This feature is automatically enabled. Your visitors will experience near-instant loading times via our premium server routing." 
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
        example: "Clicking this will take you to the domain settings page where you can connect your own domain like yourbrand.com/offer." 
      },
      { 
        text: "Advanced Analytics", 
        example: "Clicking this will show you detailed heatmaps and charts of your visitors' locations, device types, and browser data." 
      },
      { 
        text: "Expiring Links", 
        example: "Clicking this will open the link scheduler where you can set an automatic deactivation date and time for any URL." 
      },
      { 
        text: "Password Protection", 
        example: "Clicking this will let you set a secret password, showing a secure prompt screen to visitors before they can access your content." 
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
        example: "Clicking this will open the bulk uploader where you can import a CSV file to shorten 3,000 URLs in a single click." 
      },
      { 
        text: "50 Custom Domains", 
        example: "Clicking this will take you to the multi-domain manager where you can control and switch between 50 different custom brands." 
      },
      { 
        text: "Bulk Password Protection", 
        example: "Clicking this will open the bulk security manager to apply password locks across thousands of links at once." 
      },
      { 
        text: "Full API Access", 
        example: "Clicking this will take you to your API settings page where you can generate keys for programmatic link management." 
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
