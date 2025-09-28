import { NavLink, useLocation } from 'react-router-dom';
import { Home, Upload, AlertTriangle, MoreHorizontal, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const tabItems = [
  {
    id: 'resumen',
    label: 'Resumen',
    path: '/resumen',
    icon: Home,
  },
  {
    id: 'datos',
    label: 'Datos',
    path: '/datos', 
    icon: Upload,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/food-cost-analysis',
    icon: BarChart3,
  },
  {
    id: 'alertas',
    label: 'Alertas',
    path: '/alertas',
    icon: AlertTriangle,
    badge: 3,
  },
  {
    id: 'mas',
    label: 'Más',
    path: '/settings',
    icon: MoreHorizontal,
  },
];

export function MobileTabBar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    // Special handling for analytics routes
    if (path === '/food-cost-analysis') {
      return location.pathname === '/food-cost-analysis' || location.pathname === '/pnl-reports';
    }
    return location.pathname === path;
  };

  return (
    <div className="tab-bar md:hidden">
      <div className="flex items-center justify-around">
        {tabItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={cn(
                'tab-item',
                active ? 'active' : 'inactive'
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}