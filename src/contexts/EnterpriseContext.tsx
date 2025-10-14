import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useEnterpriseHierarchy, EnterpriseHierarchy } from '@/hooks/useEnterpriseHierarchy';

interface EnterpriseContextValue {
  hierarchy: EnterpriseHierarchy | undefined;
  isLoading: boolean;
  error: Error | null;
  
  // Estado de selección para filtros
  selectedBrandId: string | null;
  setSelectedBrandId: (brandId: string | null) => void;
  
  selectedStoreId: string | null;
  setSelectedStoreId: (storeId: string | null) => void;
  
  // Helpers
  getBrand: (brandId: string) => any | undefined;
  getAllBrands: () => any[];
  getStoresByBrand: (brandId: string) => any[];
}

const EnterpriseContext = createContext<EnterpriseContextValue | undefined>(undefined);

/**
 * Provider para estado global de Enterprise Hierarchy
 * 
 * @example
 * <EnterpriseProvider>
 *   <App />
 * </EnterpriseProvider>
 */
export function EnterpriseProvider({ children }: { children: ReactNode }) {
  const { data: hierarchy, isLoading, error } = useEnterpriseHierarchy();
  
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const getBrand = (brandId: string) => {
    if (!hierarchy) return undefined;
    
    for (const legalEntity of hierarchy.legalEntities) {
      const brand = legalEntity.brands.find(b => b.id === brandId);
      if (brand) {
        return {
          ...brand,
          legal_entity_id: legalEntity.id,
          legal_entity_name: legalEntity.name,
          rfc: legalEntity.rfc
        };
      }
    }
    return undefined;
  };

  const getAllBrands = () => {
    if (!hierarchy) return [];
    
    return hierarchy.legalEntities.flatMap(le => 
      le.brands.map(brand => ({
        ...brand,
        legal_entity_id: le.id,
        legal_entity_name: le.name,
        rfc: le.rfc
      }))
    );
  };

  const getStoresByBrand = (brandId: string) => {
    // TODO: Implementar query para obtener stores por brand_id
    // Por ahora retorna array vacío
    return [];
  };

  const value: EnterpriseContextValue = {
    hierarchy,
    isLoading,
    error: error as Error | null,
    selectedBrandId,
    setSelectedBrandId,
    selectedStoreId,
    setSelectedStoreId,
    getBrand,
    getAllBrands,
    getStoresByBrand
  };

  return (
    <EnterpriseContext.Provider value={value}>
      {children}
    </EnterpriseContext.Provider>
  );
}

/**
 * Hook para consumir el contexto enterprise
 * 
 * @example
 * const { hierarchy, selectedBrandId, setSelectedBrandId } = useEnterprise();
 * 
 * // Filtrar por brand
 * <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
 *   {hierarchy?.legalEntities.flatMap(le => le.brands).map(brand => (
 *     <SelectItem value={brand.id}>{brand.name}</SelectItem>
 *   ))}
 * </Select>
 */
export function useEnterprise() {
  const context = useContext(EnterpriseContext);
  
  if (context === undefined) {
    throw new Error('useEnterprise must be used within EnterpriseProvider');
  }
  
  return context;
}
