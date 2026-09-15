/* Quiet Authority: the public-facing shell keeps navigation calm, accessible, and conversion-focused. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "@/pages/Home";
import Careers from "@/pages/Careers";
import JobDetail from "@/pages/JobDetail";
import RecruitmentDashboard from "@/pages/RecruitmentDashboard";

import Legal from "@/pages/Legal";
import LegalFooter from "@/components/LegalFooter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/careers" component={Careers} />
      <Route path="/careers/jobs/:slug" component={JobDetail} />
      <Route path="/recruitment-preview" component={RecruitmentDashboard} />
      <Route path="/terms">{() => <Legal kind="terms" />}</Route>
      <Route path="/privacy">{() => <Legal kind="privacy" />}</Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <LegalFooter />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
