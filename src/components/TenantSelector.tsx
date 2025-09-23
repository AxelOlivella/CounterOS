import { useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';

export const TenantSelector = () => {
  const { currentTenant, setTenant, tenants } = useTenant();
  const [isOpen, setIsOpen] = useState(false);

  const handleTenantChange = (tenant: typeof currentTenant) => {
    setTenant(tenant);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="justify-between min-w-[200px]"
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: currentTenant.primaryColor }}
          />
          {currentTenant.displayName}
        </div>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute top-full mt-2 w-full z-20 p-2">
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => handleTenantChange(tenant)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left ${
                  currentTenant.id === tenant.id ? 'bg-muted' : ''
                }`}
              >
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: tenant.primaryColor }}
                />
                <div className="flex-1">
                  <p className="font-medium">{tenant.displayName}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    Tenant: {tenant.name}
                  </p>
                </div>
                {currentTenant.id === tenant.id && (
                  <Badge variant="secondary" className="text-xs">
                    Activo
                  </Badge>
                )}
              </button>
            ))}
          </Card>
        </>
      )}
    </div>
  );
};