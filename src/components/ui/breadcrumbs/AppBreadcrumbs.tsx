import { useLocation, Link } from 'react-router-dom';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbConfig {
  path: string;
  label: string;
  icon?: React.ReactNode;
}

const breadcrumbMap: Record<string, BreadcrumbConfig> = {
  '/resumen': { path: '/resumen', label: 'Resumen', icon: <Home className="h-4 w-4" /> },
  '/tiendas': { path: '/tiendas', label: 'Tiendas' },
  '/cargar': { path: '/cargar', label: 'Cargar Datos' },
  '/alertas': { path: '/alertas', label: 'Alertas' },
  '/configuracion': { path: '/configuracion', label: 'Configuración' },
  '/food-cost-analysis': { path: '/food-cost-analysis', label: 'Análisis Food Cost' },
  '/pnl-reports': { path: '/pnl-reports', label: 'Reportes P&L' },
  '/upload': { path: '/upload', label: 'Subir Archivos' },
};

export function AppBreadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Build breadcrumb trail
  const breadcrumbs: BreadcrumbConfig[] = [];
  let currentPath = '';

  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    const config = breadcrumbMap[currentPath];
    
    if (config) {
      breadcrumbs.push(config);
    } else {
      // Handle dynamic routes like /tiendas/:storeSlug
      if (segment && currentPath.includes('/tiendas/')) {
        breadcrumbs.push({
          path: currentPath,
          label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')
        });
      }
    }
  }

  // Don't show breadcrumbs for home page or if only one level
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <div key={crumb.path} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-2 text-foreground">
                    {crumb.icon}
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    asChild
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Link to={crumb.path}>
                      {crumb.icon}
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              
              {!isLast && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </BreadcrumbSeparator>
              )}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}