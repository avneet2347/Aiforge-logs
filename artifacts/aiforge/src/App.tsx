import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Anomalies from "@/pages/Anomalies";
import Patterns from "@/pages/Patterns";
import Alerts from "@/pages/Alerts";
import Predictions from "@/pages/Predictions";
import Services from "@/pages/Services";
import Logs from "@/pages/Logs";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/anomalies" component={Anomalies} />
      <Route path="/patterns" component={Patterns} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/predictions" component={Predictions} />
      <Route path="/services" component={Services} />
      <Route path="/logs" component={Logs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
