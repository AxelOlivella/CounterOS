import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TenantProvider } from "@/contexts/TenantContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { LandingEnterprise } from "./pages/LandingEnterprise";
import { LoginPage } from "./pages/LoginPage";

import { UploadPage } from "./components/pages/UploadPage";
import { FoodCostAnalysisPage } from "./components/pages/FoodCostAnalysisPage";
import { PnLReportsPage } from "./components/pages/PnLReportsPage";
import { MenuEngineeringPage } from "./components/pages/MenuEngineeringPage";
import { SupplierManagementPage } from "./components/pages/SupplierManagementPage";
import { ProductMixPage } from "./components/pages/ProductMixPage";
import InventoryCountPage from "./components/pages/InventoryCountPage";
import { SetupPage } from "./pages/SetupPage";
import OnboardingPage from "./pages/OnboardingPage";
import DatosPage from "./pages/DatosPage";
import StoreDashboardPage from "./pages/StoreDashboardPage";
import TiendasPage from "./pages/TiendasPage";
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
            {/* Public Routes */}
            <Route path="/" element={<LandingEnterprise />} />
            <Route path="/enterprise" element={<LandingEnterprise />} />
            <Route path="/original" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/setup" element={<SetupPage />} />
            
            {/* Protected Onboarding */}
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } />
            
            {/* Main App Routes - OBLIGATORY: /resumen, /tiendas, /cargar, /alertas */}
            <Route path="/resumen" element={
              <ProtectedRoute>
                <AppLayout>
                  <ResumenPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/tiendas" element={
              <ProtectedRoute>
                <AppLayout>
                  <TiendasPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/tiendas/:storeSlug" element={
              <ProtectedRoute>
                <AppLayout>
                  <StoreDashboardPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/cargar" element={
              <ProtectedRoute>
                <AppLayout>
                  <DatosPage />
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

            {/* Configuration Route */}
            <Route path="/configuracion" element={
              <ProtectedRoute>
                <AppLayout>
                  <PlaceholderPage 
                    title="Configuración" 
                    message="Personaliza tu experiencia CounterOS y configuraciones del sistema" 
                  />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Legacy Routes - Maintain backward compatibility */}
            <Route path="/dashboard" element={<Navigate to="/resumen" replace />} />
            <Route path="/datos" element={<Navigate to="/cargar" replace />} />
            <Route path="/tienda/:storeId" element={<Navigate to="/tiendas/portal-centro" replace />} />
            <Route path="/settings" element={<Navigate to="/configuracion" replace />} />
            
            {/* Additional Analysis Routes */}
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
            
            {/* Advanced Analysis Routes */}
            <Route path="/menu-engineering" element={
              <ProtectedRoute>
                <AppLayout>
                  <MenuEngineeringPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/variance-analysis" element={
              <ProtectedRoute>
                <AppLayout>
                  <FoodCostAnalysisPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/supplier-management" element={
              <ProtectedRoute>
                <AppLayout>
                  <SupplierManagementPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/product-mix" element={
              <ProtectedRoute>
                <AppLayout>
                  <ProductMixPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/inventory-count" element={
              <ProtectedRoute>
                <AppLayout>
                  <InventoryCountPage />
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
            
            {/* New Routes - Safe additions */}
            <Route path="/foodcost" element={
              <ProtectedRoute>
                <AppLayout>
                  <FoodCostAnalysisPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/pnl" element={
              <ProtectedRoute>
                <AppLayout>
                  <PnLReportsPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Placeholder Routes - Keep for development */}
            <Route path="/stores" element={
              <ProtectedRoute>
                <AppLayout>
                  <PlaceholderPage 
                    title="Gestión de Tiendas" 
                    message="Administra todas tus ubicaciones desde un solo lugar" 
                  />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <AppLayout>
                  <PlaceholderPage 
                    title="Centro de Reportes" 
                    message="Genera reportes personalizados y exporta tus datos" 
                  />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* 404 Handler - OBLIGATORY custom page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TenantProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
