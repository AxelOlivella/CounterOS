import { NavLink, useLocation } from 'react-router-dom';
import { Home, BarChart3, Upload, Bell, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const tabItems = [
  {
    id: 'home',
    label: 'Home',
    path: '/hoy',
    icon: Home
  },
  {
    id: 'stats',
    label: 'Stats',
    path: '/datos',
    icon: BarChart3
  },
  {
    id: 'upload',
    label: 'Upload',
    path: '/cargar',
    icon: Upload
  },
  {
    id: 'alerts',
    label: 'Alertas',
    path: '/alertas',
    icon: Bell,
    badge: 2
  },
  {
    id: 'more',
    label: 'Más',
    path: '/tiendas',
    icon: Store
  }
];

export function MobileTabBar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    // Special handling for tiendas routes
    if (path === '/tiendas') {
      return location.pathname === '/tiendas' || location.pathname.startsWith('/tiendas/');
    }
    // Special handling for cargar routes  
    if (path === '/cargar') {
      return location.pathname === '/cargar' || location.pathname === '/datos';
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