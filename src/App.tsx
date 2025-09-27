import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TenantProvider } from "@/contexts/TenantContext";
import { AppLayout } from "@/components/layout/AppLayout";
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
import PlaceholderPage from "./pages/PlaceholderPage";
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
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
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
                <AppLayout>
                  <UploadPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/food-cost-analysis" element={
              <ProtectedRoute>
                <AppLayout>
                  <FoodCostAnalysisPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/pnl-reports" element={
              <ProtectedRoute>
                <AppLayout>
                  <PnLReportsPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/alertas" element={
              <ProtectedRoute>
                <AlertasPage />
              </ProtectedRoute>
            } />
            <Route path="/stores" element={
              <ProtectedRoute>
                <PlaceholderPage title="Gestión de Tiendas" message="Administra todas tus ubicaciones desde un solo lugar" />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <PlaceholderPage title="Centro de Reportes" message="Genera reportes personalizados y exporta tus datos" />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <PlaceholderPage title="Configuración" message="Personaliza tu experiencia y configuraciones del sistema" />
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
