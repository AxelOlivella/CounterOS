import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { InventoryPage } from '@/components/InventoryPage';
import { POSUploadPage } from '@/components/POSUploadPage';
import { TenantSelector } from '@/components/TenantSelector';
import { useTenant } from '@/contexts/TenantContext';
import { cn } from '@/lib/utils';

const Index = () => {
  const { currentTenant } = useTenant();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <InventoryPage />;
      case 'pos-upload':
        return <POSUploadPage />;
      case 'stores':
        return <div className="p-8 text-center text-muted-foreground">Módulo de Tiendas - Próximamente</div>;
      case 'recipes':
        return <div className="p-8 text-center text-muted-foreground">Módulo de Recetas - Próximamente</div>;
      case 'invoices':
        return <div className="p-8 text-center text-muted-foreground">Módulo CFDI - Próximamente</div>;
      case 'alerts':
        return <div className="p-8 text-center text-muted-foreground">Módulo de Alertas - Próximamente</div>;
      case 'settings':
        return <div className="p-8 text-center text-muted-foreground">Configuración - Próximamente</div>;
      default:
        return <Dashboard />;
    }
  };

  if (showOnboarding) {
    return <OnboardingWizard onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className={cn("min-h-screen bg-background", `tenant-${currentTenant.theme}`)}>
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="md:ml-64 min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between p-4">
            <div className="md:hidden">
              {/* Mobile menu button is in Navigation component */}
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <h2 className="text-lg font-semibold capitalize">
                {currentPage.replace('-', ' ')}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <TenantSelector />
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-sm text-primary hover:underline"
              >
                Wizard Setup
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default Index;
