import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Pricing from "@/pages/Pricing";
import Rules from "./pages/Rules";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BulkShortener from "./pages/features/BulkShortener";
import Analytics from "./pages/features/Analytics";
import SmartQRCode from "./pages/features/SmartQRCode";
import PasswordProtection from "./pages/features/PasswordProtection";
import ExpiringLinks from "./pages/features/ExpiringLinks";
import BrandedLinks from "./pages/features/BrandedLinks";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/rules" component={Rules} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/features/bulk" component={BulkShortener} />
      <Route path="/features/analytics" component={Analytics} />
      <Route path="/features/qr" component={SmartQRCode} />
      <Route path="/features/password" component={PasswordProtection} />
      <Route path="/features/expiry" component={ExpiringLinks} />
      <Route path="/features/branded" component={BrandedLinks} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
