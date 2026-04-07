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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import BulkShortener from "./pages/features/BulkShortener";
import Analytics from "./pages/features/Analytics";
import SmartQRCode from "./pages/features/SmartQRCode";
import PasswordProtection from "./pages/features/PasswordProtection";
import ExpiringLinks from "./pages/features/ExpiringLinks";
import BrandedLinks from "./pages/features/BrandedLinks";
import BioPageBuilder from "./pages/features/BioPageBuilder";
import Teams from "./pages/features/Teams";
import ConversionTracking from "./pages/features/ConversionTracking";
import UTMBuilder from "./pages/features/UTMBuilder";
import RetargetingPixels from "./pages/features/RetargetingPixels";
import LinkScheduling from "./pages/features/LinkScheduling";
import ClickLimits from "./pages/features/ClickLimits";
import ABTesting from "./pages/features/ABTesting";
import GeoRouting from "./pages/features/GeoRouting";
import DeepLinks from "./pages/features/DeepLinks";
import VideoAds from "./pages/features/VideoAds";
import AdminFunnel from "./pages/AdminFunnel";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";
import RequestRefund from "./pages/RequestRefund";
import CookieConsent from "./components/CookieConsent";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/rules" component={Rules} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/contact" component={Contact} />
      <Route path="/refund" component={RequestRefund} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/features/bulk" component={BulkShortener} />
      <Route path="/features/analytics" component={Analytics} />
      <Route path="/features/qr" component={SmartQRCode} />
      <Route path="/features/password" component={PasswordProtection} />
      <Route path="/features/expiry" component={ExpiringLinks} />
      <Route path="/features/branded" component={BrandedLinks} />
      <Route path="/features/bio" component={BioPageBuilder} />
      <Route path="/features/teams" component={Teams} />
      <Route path="/features/conversions" component={ConversionTracking} />
      <Route path="/features/utm" component={UTMBuilder} />
      <Route path="/features/retargeting" component={RetargetingPixels} />
      <Route path="/features/scheduling" component={LinkScheduling} />
      <Route path="/features/click-limits" component={ClickLimits} />
      <Route path="/features/ab-testing" component={ABTesting} />
      <Route path="/features/geo-routing" component={GeoRouting} />
      <Route path="/features/deep-links" component={DeepLinks} />
      <Route path="/features/video-ads" component={VideoAds} />
      <Route path="/admin/funnel" component={AdminFunnel} />
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
        <CookieConsent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
