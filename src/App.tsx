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
import StoreDashboardPage from "./pages/StoreDashboardPage";
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
                <AppLayout>
                  <ResumenPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/datos" element={
              <ProtectedRoute>
                <AppLayout>
                  <DatosPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/tienda/:storeId" element={
              <ProtectedRoute>
                <StoreDashboardPage />
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
            <Route path="/upload" element={
              <ProtectedRoute>
                <AppLayout>
                  <UploadPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/alertas" element={
              <ProtectedRoute>
                <AppLayout>
                  <AlertasPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/stores" element={
              <ProtectedRoute>
                <AppLayout>
                  <PlaceholderPage title="Gestión de Tiendas" message="Administra todas tus ubicaciones desde un solo lugar" />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <AppLayout>
                  <PlaceholderPage title="Centro de Reportes" message="Genera reportes personalizados y exporta tus datos" />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout>
                  <PlaceholderPage title="Configuración" message="Personaliza tu experiencia y configuraciones del sistema" />
                </AppLayout>
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
