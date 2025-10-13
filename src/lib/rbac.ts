// RBAC - Role-Based Access Control System for CounterOS
// Enterprise-grade permission system

export type UserRole = 'owner' | 'manager' | 'analyst' | 'staff';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface RolePermissions {
  [key: string]: Permission[];
}

// Comprehensive permission matrix for CounterOS
export const ROLE_PERMISSIONS: RolePermissions = {
  owner: [
    // Full access to everything
    { resource: 'dashboard', action: 'read' },
    { resource: 'stores', action: 'manage' },
    { resource: 'financial_data', action: 'manage' },
    { resource: 'users', action: 'manage' },
    { resource: 'settings', action: 'manage' },
    { resource: 'reports', action: 'manage' },
    { resource: 'uploads', action: 'manage' },
    { resource: 'alerts', action: 'manage' },
  ],
  manager: [
    // Store and operational management
    { resource: 'dashboard', action: 'read' },
    { resource: 'stores', action: 'read' },
    { resource: 'financial_data', action: 'read' },
    { resource: 'financial_data', action: 'update' },
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'create' },
    { resource: 'uploads', action: 'create' },
    { resource: 'uploads', action: 'read' },
    { resource: 'alerts', action: 'read' },
  ],
  analyst: [
    // Read-only access to data and reports
    { resource: 'dashboard', action: 'read' },
    { resource: 'stores', action: 'read' },
    { resource: 'financial_data', action: 'read' },
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'create' },
    { resource: 'alerts', action: 'read' },
  ],
  staff: [
    // Basic access for operational staff
    { resource: 'dashboard', action: 'read' },
    { resource: 'uploads', action: 'create' },
    { resource: 'alerts', action: 'read' },
  ]
};

// Security utility functions
export function hasPermission(
  userRole: UserRole, 
  resource: string, 
  action: string
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  
  return permissions.some(permission => 
    permission.resource === resource && 
    (permission.action === action || permission.action === 'manage')
  );
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const routePermissions: Record<string, { resource: string; action: string }> = {
    '/dashboard': { resource: 'dashboard', action: 'read' },
    '/resumen': { resource: 'dashboard', action: 'read' },
    '/tiendas': { resource: 'stores', action: 'read' },
    '/cargar': { resource: 'uploads', action: 'create' },
    '/alertas': { resource: 'alerts', action: 'read' },
    '/food-cost-analysis': { resource: 'financial_data', action: 'read' },
    '/pnl-reports': { resource: 'reports', action: 'read' },
    '/configuracion': { resource: 'settings', action: 'read' },
  };

  const routePermission = routePermissions[route];
  if (!routePermission) return false;

  return hasPermission(userRole, routePermission.resource, routePermission.action);
}

export function getAvailableRoutes(userRole: UserRole): string[] {
  const allRoutes = [
    '/dashboard', '/resumen', '/tiendas', '/cargar', 
    '/alertas', '/food-cost-analysis', '/pnl-reports', '/configuracion'
  ];

  return allRoutes.filter(route => canAccessRoute(userRole, route));
}

// Advanced security checks
export function validateUserAction(
  userRole: UserRole,
  resource: string,
  action: string,
  context?: { storeId?: string; tenantId?: string }
): { allowed: boolean; reason?: string } {
  // Check basic permission
  if (!hasPermission(userRole, resource, action)) {
    return { 
      allowed: false, 
      reason: `Role '${userRole}' does not have '${action}' permission on '${resource}'` 
    };
  }

  // Additional context-based validations
  if (context?.storeId && userRole === 'staff') {
    // Staff can only access their assigned store (would need store assignment logic)
    // This is a placeholder for store-level access control
  }

  return { allowed: true };
}

// Audit trail for security compliance
export interface SecurityAuditLog {
  userId: string;
  userRole: UserRole;
  action: string;
  resource: string;
  timestamp: Date;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export function logSecurityAction(log: SecurityAuditLog): void {
  // In production, this would send to a secure audit service
  if (process.env.NODE_ENV === 'development') {
    console.group('🔒 Security Audit Log');
    // Audit logs only in development
    if (import.meta.env.DEV) {
      console.log('User:', log.userId);
      console.log('Role:', log.userRole);
      console.log('Action:', log.action);
      console.log('Resource:', log.resource);
      console.log('Success:', log.success);
      console.log('Timestamp:', log.timestamp.toISOString());
    }
    console.groupEnd();
  }
}