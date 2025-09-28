import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/contexts/TenantContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Upload,
  DollarSign,
  Store,
  PieChart,
  FileText,
  Settings,
  Home,
  AlertTriangle
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const menuItems = [
  { id: 'resumen', label: 'Resumen', icon: Home, path: '/resumen' },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  { id: 'datos', label: 'Cargar Datos', icon: Upload, path: '/datos' },
  { id: 'food-cost', label: 'Food Cost', icon: PieChart, path: '/food-cost-analysis' },
  { id: 'pnl', label: 'P&L', icon: DollarSign, path: '/pnl-reports' },
  { id: 'alertas', label: 'Alertas', icon: AlertTriangle, path: '/alertas' },
  { id: 'upload', label: 'Subir Datos (Legacy)', icon: Upload, path: '/upload' },
  { id: 'stores', label: 'Tiendas', icon: Store, path: '/stores' },
  { id: 'reports', label: 'Reportes', icon: FileText, path: '/reports' },
  { id: 'settings', label: 'Configuración', icon: Settings, path: '/settings' },
];

export const Sidebar = ({ className }: SidebarProps) => {
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();
  
  const primaryColor = tenant?.theme?.primary || 'hsl(var(--primary))';

  return (
    <div className={cn('flex h-screen flex-col border-r bg-card', className)}>
      {/* Logo/Brand */}
      <div className="flex h-16 items-center justify-center border-b">
        <h2 
          className="text-lg font-bold text-primary"
        >
          {tenant?.name || 'CounterOS'}
        </h2>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start',
                isActive && 'text-white'
              )}
              style={{
                backgroundColor: isActive ? primaryColor : undefined,
              }}
              onClick={() => navigate(item.path)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          CounterOS v1.0
        </p>
      </div>
    </div>
  );
};