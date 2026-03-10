import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/bottom-nav";
import HomePage from "@/pages/home";
import TalkPage from "@/pages/talk";
import BlueprintsPage from "@/pages/blueprints";
import ProceduresPage from "@/pages/procedures";
import JobLogPage from "@/pages/job-log";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/talk" component={TalkPage} />
      <Route path="/blueprints" component={BlueprintsPage} />
      <Route path="/procedures" component={ProceduresPage} />
      <Route path="/job-log" component={JobLogPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen bg-[#0a0a0a]">
          <Router />
          <BottomNav />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
