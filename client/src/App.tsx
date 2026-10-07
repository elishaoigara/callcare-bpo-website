import { lazy, Suspense } from "react";
import PageMetadata from "@/components/PageMetadata";
/* Quiet Authority: the public-facing shell keeps navigation calm, accessible, and conversion-focused. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
const Operations = lazy(() => import("@/pages/Operations"));
const Contact = lazy(() => import("@/pages/Contact"));
const WorkTogether = lazy(() => import("@/pages/WorkTogether"));
const Orders = lazy(() => import("@/pages/Orders"));
import Home from "@/pages/Home";
const Careers = lazy(() => import("@/pages/Careers"));
const JobDetail = lazy(() => import("@/pages/JobDetail"));
const RecruitmentDashboard = lazy(() => import("@/pages/RecruitmentDashboard"));

const Legal = lazy(() => import("@/pages/Legal"));
import LegalFooter from "@/components/LegalFooter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/operations" component={Operations} />
      <Route path="/contact" component={Contact} />
      <Route path="/work-with-us" component={WorkTogether} />
      <Route path="/orders" component={Orders} />
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
          <Suspense
            fallback={
              <main className="grid min-h-[65vh] place-items-center bg-[#fbfdfc]">
                <p role="status" className="text-sm text-[#27503e]">
                  Loading CallCare…
                </p>
              </main>
            }
          >
            <PageMetadata />
            <Router />
          </Suspense>
          <LegalFooter />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
