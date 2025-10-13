import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface Store {
  store_id: string;
  name: string;
  code: string;
  city?: string;
  active: boolean;
  tenant_id: string;
}

export const useStoreSelection = () => {
  const { tenant } = useTenant();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant?.tenant_id) {
      fetchStores();
    }
  }, [tenant?.tenant_id]);

  const fetchStores = async () => {
    if (!tenant?.tenant_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('tenant_id', tenant.tenant_id)
        .eq('active', true)
        .order('name');

      if (error) {
        // Silently fail - stores will be empty array
        return;
      }

      setStores(data || []);
    } catch (error) {
      // Silently fail - stores will be empty array
    } finally {
      setLoading(false);
    }
  };

  const selectedStore = stores.find(store => store.store_id === selectedStoreId);

  const isConsolidatedView = selectedStoreId === 'all';

  return {
    stores,
    selectedStoreId,
    setSelectedStoreId,
    selectedStore,
    isConsolidatedView,
    loading
  };
};