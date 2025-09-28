import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import {
  BarChart3,
  Upload,
  DollarSign,
  Store,
  PieChart,
  FileText,
  Settings,
  Home,
  AlertTriangle,
  LogOut,
  User
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const menuItems = [
  { id: 'resumen', label: 'Resumen', icon: Home, path: '/resumen' },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  { id: 'datos', label: 'Cargar Datos', icon: Upload, path: '/datos' },
  { id: 'food-cost', label: 'Food Cost', icon: PieChart, path: '/food-cost-analysis' },
  { id: 'pnl', label: 'P&L', icon: DollarSign, path: '/pnl-reports' },
  { id: 'alertas', label: 'Alertas', icon: AlertTriangle, path: '/alertas' },
];

const secondaryItems = [
  { id: 'stores', label: 'Tiendas', icon: Store, path: '/stores' },
  { id: 'reports', label: 'Reportes', icon: FileText, path: '/reports' },
  { id: 'settings', label: 'Configuración', icon: Settings, path: '/settings' },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { userProfile, tenant, signOut } = useTenant();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isCollapsed = state === 'collapsed';
  const primaryColor = tenant?.theme?.primary || 'hsl(var(--primary))';
  
  const isActive = (path: string) => location.pathname === path;
  
  const getNavClass = (path: string) => {
    const active = isActive(path);
    return active 
      ? 'bg-primary text-primary-foreground font-medium' 
      : 'hover:bg-accent hover:text-accent-foreground';
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-2 py-1">
          <div 
            className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-primary-foreground text-sm bg-primary"
          >
            {tenant?.name?.charAt(0) || 'C'}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold" style={{ color: primaryColor }}>
                {tenant?.name ? `${tenant.name} OS` : 'Crepas OS'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Food Cost Analytics
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2">
            {!isCollapsed ? 'Principal' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.path}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${getNavClass(item.path)}`}
                        style={active ? { backgroundColor: primaryColor } : undefined}
                      >
                        <Icon className="h-4 w-4" />
                        {!isCollapsed && <span className="text-sm">{item.label}</span>}
                        {item.id === 'alertas' && !isCollapsed && (
                          <Badge variant="destructive" className="ml-auto h-5 text-xs">
                            3
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2">
            {!isCollapsed ? 'Gestión' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.path}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${getNavClass(item.path)}`}
                        style={active ? { backgroundColor: primaryColor } : undefined}
                      >
                        <Icon className="h-4 w-4" />
                        {!isCollapsed && <span className="text-sm">{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {userProfile?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{userProfile?.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {userProfile?.role}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={signOut}
                    className="h-6 w-6"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {!isCollapsed && (
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground text-center">
              {tenant?.name ? `${tenant.name} OS` : 'Crepas OS'} v1.0
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}