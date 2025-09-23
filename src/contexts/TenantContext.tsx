import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Tenant {
  id: string;
  name: string;
  displayName: string;
  logo?: string;
  primaryColor: string;
  theme: 'nutrisa' | 'moyo' | 'crepas';
}

interface TenantContextType {
  currentTenant: Tenant;
  setTenant: (tenant: Tenant) => void;
  tenants: Tenant[];
}

const defaultTenants: Tenant[] = [
  {
    id: '1',
    name: 'nutrisa',
    displayName: 'NutrisaOS',
    primaryColor: '#3B82F6',
    theme: 'nutrisa'
  },
  {
    id: '2', 
    name: 'moyo',
    displayName: 'MoyoOS',
    primaryColor: '#8B5CF6',
    theme: 'moyo'
  },
  {
    id: '3',
    name: 'crepas',
    displayName: 'CrepasOS',
    primaryColor: '#F59E0B',
    theme: 'crepas'
  }
];

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant>(defaultTenants[0]);
  const [tenants] = useState<Tenant[]>(defaultTenants);

  const setTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    // Apply theme class to document
    document.documentElement.className = `tenant-${tenant.theme}`;
  };

  React.useEffect(() => {
    // Apply default theme
    document.documentElement.className = `tenant-${currentTenant.theme}`;
  }, []);

  return (
    <TenantContext.Provider value={{ currentTenant, setTenant, tenants }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};