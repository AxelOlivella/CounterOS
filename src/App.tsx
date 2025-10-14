import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TenantProvider } from "@/contexts/TenantContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { OperationsLayout } from "@/components/layout/OperationsLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { lazy, Suspense, useEffect } from "react";
import { LoadingState } from "./components/ui/states/LoadingState";

// Eager loading for critical pages
import { LandingEnterprise } from "./pages/LandingEnterprise";
import { LoginPage } from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

// Code-splitting for heavy pages
const LandingPage = lazy(() => import("./pages/LandingPage").then(m => ({ default: m.LandingPage })));
const SetupPage = lazy(() => import("./pages/SetupPage").then(m => ({ default: m.SetupPage })));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const WelcomePage = lazy(() => import("./pages/onboarding/WelcomePage"));
const StoresPage = lazy(() => import("./pages/onboarding/StoresPage"));
const OnboardingUploadPage = lazy(() => import("./pages/onboarding/UploadPage"));
const PreviewPage = lazy(() => import("./pages/onboarding/PreviewPage"));
const ProcessingPage = lazy(() => import("./pages/onboarding/ProcessingPage"));
const SuccessPage = lazy(() => import("./pages/onboarding/SuccessPage"));
const ResumenPage = lazy(() => import("./pages/ResumenPage"));
const TiendasPage = lazy(() => import("./pages/TiendasPage"));
const StoreDashboardPage = lazy(() => import("./pages/StoreDashboardPage"));
const DatosPage = lazy(() => import("./pages/DatosPage"));
const AlertasPage = lazy(() => import("./pages/AlertasPage"));
const PlaceholderPage = lazy(() => import("./pages/PlaceholderPage"));

// Analysis pages
const OperationsDashboard = lazy(() => import("./pages/OperationsDashboard"));
const StoreDetailPage = lazy(() => import("./pages/StoreDetailPage"));
const FoodCostAnalysisPage = lazy(() => import("./components/pages/FoodCostAnalysisPage").then(m => ({ default: m.FoodCostAnalysisPage })));
const PnLReportsPage = lazy(() => import("./components/pages/PnLReportsPage").then(m => ({ default: m.PnLReportsPage })));
const MenuEngineeringPage = lazy(() => import("./components/pages/MenuEngineeringPage").then(m => ({ default: m.MenuEngineeringPage })));
const SupplierManagementPage = lazy(() => import("./components/pages/SupplierManagementPage").then(m => ({ default: m.SupplierManagementPage })));
const ProductMixPage = lazy(() => import("./components/pages/ProductMixPage").then(m => ({ default: m.ProductMixPage })));
const InventoryCountPage = lazy(() => import("./components/pages/InventoryCountPage"));
const UploadPage = lazy(() => import("./components/pages/UploadPage").then(m => ({ default: m.UploadPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - no refetch
      gcTime: 10 * 60 * 1000, // 10 minutos en cache (gcTime reemplaza cacheTime en v5)
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Theming component
const ThemeApplier = () => {
  useEffect(() => {
    // Get current tenant/store from localStorage or context
    // For now, we'll use a default skin
    const currentSkin = localStorage.getItem('tenant_skin') || 'default';
    
    // Apply data-skin attribute to root element
    if (currentSkin !== 'default') {
      document.documentElement.setAttribute('data-skin', currentSkin);
    } else {
      document.documentElement.removeAttribute('data-skin');
    }
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeApplier />
      <TenantProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}>
            <Suspense fallback={<LoadingState />}>
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
            
            {/* New Onboarding Wizard */}
            <Route path="/onboarding/welcome" element={
              <ProtectedRoute>
                <WelcomePage />
              </ProtectedRoute>
            } />
            
            <Route path="/onboarding/stores" element={
              <ProtectedRoute>
                <StoresPage />
              </ProtectedRoute>
            } />
            
            <Route path="/onboarding/upload" element={
              <ProtectedRoute>
                <OnboardingUploadPage />
              </ProtectedRoute>
            } />
            
            <Route path="/onboarding/preview" element={
              <ProtectedRoute>
                <PreviewPage />
              </ProtectedRoute>
            } />
            
            <Route path="/onboarding/processing" element={
              <ProtectedRoute>
                <ProcessingPage />
              </ProtectedRoute>
            } />
            
            <Route path="/onboarding/success" element={
              <ProtectedRoute>
                <SuccessPage />
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
            
            {/* Redirect /cargar to onboarding upload for real data processing */}
            <Route path="/cargar" element={<Navigate to="/onboarding/upload" replace />} />
            
            {/* Manual data entry */}
            <Route path="/captura-manual" element={
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
            
            {/* Operations Dashboard Routes */}
            <Route path="/dashboard/operations" element={
              <ProtectedRoute>
                <OperationsLayout>
                  <OperationsDashboard />
                </OperationsLayout>
              </ProtectedRoute>
            } />
            
            {/* Store Detail Page */}
            <Route path="/dashboard/operations/store/:storeId" element={
              <ProtectedRoute>
                <OperationsLayout>
                  <StoreDetailPage />
                </OperationsLayout>
              </ProtectedRoute>
            } />
            
            {/* Analysis Routes - Consolidated */}
            <Route path="/food-cost-analysis" element={
              <ProtectedRoute>
                <AppLayout>
                  <FoodCostAnalysisPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Redirect duplicate route */}
            <Route path="/foodcost" element={<Navigate to="/food-cost-analysis" replace />} />
            <Route path="/variance-analysis" element={<Navigate to="/food-cost-analysis" replace />} />
            
            <Route path="/pnl-reports" element={
              <ProtectedRoute>
                <AppLayout>
                  <PnLReportsPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Redirect duplicate route */}
            <Route path="/pnl" element={<Navigate to="/pnl-reports" replace />} />
            
            {/* Advanced Analysis Routes */}
            <Route path="/menu-engineering" element={
              <ProtectedRoute>
                <AppLayout>
                  <MenuEngineeringPage />
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
            
            {/* Redirect /upload to /cargar */}
            <Route path="/upload" element={<Navigate to="/cargar" replace />} />
            
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
            </Suspense>
        </BrowserRouter>
        </ErrorBoundary>
      </TenantProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
