import { useState } from 'react';
import { useStores } from './useStores';

export interface Store {
  store_id: string;
  name: string;
  code: string;
  city?: string;
  active: boolean;
  tenant_id: string;
}

export const useStoreSelection = () => {
  const { data: storesData, isLoading } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState<string | 'all'>('all');

  // Map stores from useStores format to useStoreSelection format
  const stores: Store[] = (storesData || []).map(store => ({
    store_id: store.id,
    name: store.name,
    code: store.slug || store.id,
    city: store.location || undefined,
    active: store.active,
    tenant_id: store.tenant_id
  }));

  const selectedStore = stores.find(store => store.store_id === selectedStoreId);

  const isConsolidatedView = selectedStoreId === 'all';

  return {
    stores,
    selectedStoreId,
    setSelectedStoreId,
    selectedStore,
    isConsolidatedView,
    loading: isLoading
  };
};