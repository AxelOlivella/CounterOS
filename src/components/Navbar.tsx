import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Settings, Upload, TrendingUp, BarChart3 } from "lucide-react";

const navItems = [
  {
    label: "Onboarding",
    href: "/onboarding",
    icon: Settings
  },
  {
    label: "Datos",
    href: "/datos",
    icon: Upload
  },
  {
    label: "Food Cost",
    href: "/foodcost",
    icon: TrendingUp
  },
  {
    label: "P&L",
    href: "/pnl",
    icon: BarChart3
  }
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            CounterOS MVP
          </Link>
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    location.pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}