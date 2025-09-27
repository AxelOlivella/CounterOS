import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TenantProvider } from "@/contexts/TenantContext";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UploadPage } from "./components/pages/UploadPage";
import { FoodCostAnalysisPage } from "./components/pages/FoodCostAnalysisPage";
import { PnLReportsPage } from "./components/pages/PnLReportsPage";
import { SetupPage } from "./pages/SetupPage";
import OnboardingPage from "./pages/OnboardingPage";
import DatosPage from "./pages/DatosPage";
import AlertasPage from "./pages/AlertasPage";
import ResumenPage from "./pages/ResumenPage";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TenantProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/resumen" element={
              <ProtectedRoute>
                <ResumenPage />
              </ProtectedRoute>
            } />
            <Route path="/datos" element={
              <ProtectedRoute>
                <DatosPage />
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            } />
            <Route path="/food-cost-analysis" element={
              <ProtectedRoute>
                <FoodCostAnalysisPage />
              </ProtectedRoute>
            } />
            <Route path="/pnl-reports" element={
              <ProtectedRoute>
                <PnLReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/alertas" element={
              <ProtectedRoute>
                <AlertasPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TenantProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
