import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Candidates from "./pages/Candidates";
import CandidateDetail from "./pages/CandidateDetail";
import Assessments from "./pages/Assessments";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import { makeServer } from "@/lib/mirage-server";
import { seedDatabase } from "@/lib/seed-data";

const queryClient = new QueryClient();

if (import.meta.env.DEV) {
  makeServer();
}

const App = () => {
  useEffect(() => {
    // Seed database only when empty. Do NOT force reseed on every reload so
    // user edits and generated candidate/job data persist across refreshes.
    seedDatabase();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="talentflow-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:jobId" element={<JobDetail />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/candidates/:id" element={<CandidateDetail />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/assessments/:jobId" element={<Assessments />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
