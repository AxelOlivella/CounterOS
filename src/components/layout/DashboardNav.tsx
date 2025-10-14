import { NavLink, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTenant } from "@/contexts/TenantContext";
import { 
  LayoutDashboard, 
  Store, 
  Bell, 
  TrendingUp, 
  FileText,
  ArrowLeft
} from "lucide-react";

const navItems = [
  {
    title: "Overview",
    href: "/dashboard/operations",
    icon: LayoutDashboard,
  },
  {
    title: "Tiendas",
    href: "/dashboard/stores",
    icon: Store,
    disabled: true,
  },
  {
    title: "Alertas",
    href: "/dashboard/alerts",
    icon: Bell,
    disabled: true,
  },
  {
    title: "Benchmarks",
    href: "/dashboard/benchmarks",
    icon: TrendingUp,
    disabled: true,
  },
  {
    title: "Reportes",
    href: "/dashboard/reports",
    icon: FileText,
    disabled: true,
  },
];

export function DashboardNav() {
  const { tenant } = useTenant();
  
  return (
    <nav className="bg-card border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/resumen"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a App</span>
          </Link>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              {tenant?.name?.charAt(0) || 'C'}
            </div>
            <span className="text-sm font-semibold text-foreground">
              Operations Dashboard
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          if (item.disabled) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed"
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
                <span className="text-xs text-muted-foreground/60">(Próximamente)</span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  "hover:bg-muted",
                  isActive
                    ? "bg-primary/10 text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
        </div>
      </div>
    </nav>
  );
}
