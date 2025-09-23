import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Store, 
  Package, 
  Upload, 
  Settings, 
  ChefHat,
  FileText,
  AlertTriangle,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'stores', label: 'Tiendas', icon: Store },
  { id: 'inventory', label: 'Inventario', icon: Package },
  { id: 'pos-upload', label: 'Cargar POS', icon: Upload },
  { id: 'recipes', label: 'Recetas', icon: ChefHat },
  { id: 'invoices', label: 'CFDI', icon: FileText },
  { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export const Navigation = ({ currentPage, onPageChange }: NavigationProps) => {
  const { currentTenant } = useTenant();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r transition-transform duration-300",
        "md:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-primary-dark">
            {currentTenant.displayName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sistema de Gestión
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  currentPage === item.id && "bg-primary text-primary-foreground"
                )}
                onClick={() => {
                  onPageChange(item.id);
                  setIsMobileOpen(false);
                }}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 w-full p-4 border-t bg-muted/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Admin Usuario</p>
              <p className="text-xs text-muted-foreground">admin@{currentTenant.name}.com</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};