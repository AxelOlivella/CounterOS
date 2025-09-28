// Store Context for Multi-tenant Navigation
// Provides current store slug from URL params

import { createContext, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getStoreName, isValidStoreSlug, type StoreSlug } from '@/routes';

interface StoreContextValue {
  slug: StoreSlug | null;
  name: string | null;
  isValid: boolean;
}

const StoreContext = createContext<StoreContextValue>({ 
  slug: null, 
  name: null, 
  isValid: false 
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  
  const value = useMemo(() => {
    if (!storeSlug) {
      return { slug: null, name: null, isValid: false };
    }
    
    const isValid = isValidStoreSlug(storeSlug);
    
    return {
      slug: isValid ? storeSlug : null,
      name: isValid ? getStoreName(storeSlug) : null,
      isValid,
    };
  }, [storeSlug]);
  
  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

// Hook for components that require a valid store
export const useRequiredStore = () => {
  const store = useStore();
  if (!store.isValid || !store.slug) {
    throw new Error('Valid store slug is required for this component');
  }
  return store as Required<StoreContextValue>;
};