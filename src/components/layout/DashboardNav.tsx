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
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/resumen"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a App</span>
          </Link>
          
          <div className="h-6 w-px bg-gray-200" />
          
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              {tenant?.name?.charAt(0) || 'C'}
            </div>
            <span className="text-sm font-semibold text-gray-900">
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
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
                <span className="text-xs text-gray-300">(Próximamente)</span>
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
                  "hover:bg-gray-50",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
                    : "text-gray-600"
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
