import { ReactNode, useState } from 'react';
import { useCounter } from '@/contexts/CounterContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { UploadPage } from '@/components/pages/UploadPage';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children?: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { userProfile, tenant, signOut } = useCounter();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Apply tenant theme
  const primaryColor = tenant?.theme?.primary || '#00C853';

  return (
    <div 
      className="min-h-screen bg-background"
      style={{
        '--tenant-primary': primaryColor,
      } as React.CSSProperties}
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar className="w-64" currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col md:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between p-4">
            {/* Mobile Menu */}
            <div className="flex items-center gap-4 md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
                </SheetContent>
              </Sheet>
            </div>

            {/* Tenant Name */}
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold" style={{ color: primaryColor }}>
                {tenant?.name || 'CounterOS'}
              </h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{userProfile?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{userProfile?.role}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {currentPage === 'dashboard' && children}
          {currentPage === 'upload' && <UploadPage />}
          {currentPage === 'food-cost' && <div className="p-8 text-center text-muted-foreground">Módulo Food Cost - Próximamente</div>}
          {currentPage === 'pnl' && <div className="p-8 text-center text-muted-foreground">Módulo P&L - Próximamente</div>}
          {currentPage === 'stores' && <div className="p-8 text-center text-muted-foreground">Módulo de Tiendas - Próximamente</div>}
          {currentPage === 'reports' && <div className="p-8 text-center text-muted-foreground">Módulo de Reportes - Próximamente</div>}
          {currentPage === 'settings' && <div className="p-8 text-center text-muted-foreground">Configuración - Próximamente</div>}
        </main>
      </div>
    </div>
  );
};