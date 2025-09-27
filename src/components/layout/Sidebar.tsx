import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCounter } from '@/contexts/CounterContext';
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
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

const menuItems = [
  { id: 'resumen', label: 'Resumen', icon: Home },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'datos', label: 'Cargar Datos', icon: Upload },
  { id: 'food-cost', label: 'Food Cost', icon: PieChart },
  { id: 'pnl', label: 'P&L', icon: DollarSign },
  { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
  { id: 'upload', label: 'Subir Datos (Legacy)', icon: Upload },
  { id: 'stores', label: 'Tiendas', icon: Store },
  { id: 'reports', label: 'Reportes', icon: FileText },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export const Sidebar = ({ className, currentPage = 'dashboard', onPageChange }: SidebarProps) => {
  const { tenant } = useCounter();
  
  const primaryColor = tenant?.theme?.primary || '#00C853';

  return (
    <div className={cn('flex h-screen flex-col border-r bg-card', className)}>
      {/* Logo/Brand */}
      <div className="flex h-16 items-center justify-center border-b">
        <h2 
          className="text-lg font-bold"
          style={{ color: primaryColor }}
        >
          {tenant?.name || 'CounterOS'}
        </h2>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
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
              onClick={() => onPageChange?.(item.id)}
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