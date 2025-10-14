import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentTenant } from '@/lib/db_new';
import { logger } from '@/lib/logger';

export interface Store {
  id: string;
  name: string;
  slug: string | null;
  location: string | null;
  concept: string | null;
  target_food_cost: number;
  active: boolean;
  created_at: string;
}

export function useStores() {
  const [data, setData] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    try {
      setIsLoading(true);
      setError(null);

      const tenantId = await getCurrentTenant();
      
      if (!tenantId) {
        throw new Error('No tenant found');
      }

      const { data: stores, error: fetchError } = await supabase
        .from('stores')
        .select('store_id, name, slug, location, concept, target_food_cost_pct, active, created_at')
        .eq('tenant_id', tenantId)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Map to interface format
      const mappedStores: Store[] = (stores || []).map(s => ({
        id: s.store_id,
        name: s.name,
        slug: s.slug,
        location: s.location,
        concept: s.concept,
        target_food_cost: s.target_food_cost_pct || 28.5,
        active: s.active,
        created_at: s.created_at
      }));

      logger.info(`Stores fetched: ${mappedStores.length} stores`);
      setData(mappedStores);

    } catch (err) {
      logger.error('Failed to fetch stores', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }

  return { data, isLoading, error, refetch: fetchStores };
}
