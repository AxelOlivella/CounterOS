import { useQuery } from '@tanstack/react-query';
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
  tenant_id: string;
}

async function fetchStores(): Promise<Store[]> {
  const tenantId = await getCurrentTenant();
  
  if (!tenantId) {
    throw new Error('No tenant found');
  }

  const { data: stores, error: fetchError } = await supabase
    .from('stores')
    .select('store_id, name, slug, location, concept, target_food_cost_pct, active, created_at, tenant_id')
    .eq('tenant_id', tenantId)
    .eq('active', true)
    .order('name', { ascending: true });

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
    created_at: s.created_at,
    tenant_id: s.tenant_id
  }));

  logger.info(`Stores fetched from cache/server: ${mappedStores.length} stores`);
  return mappedStores;
}

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: fetchStores,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
