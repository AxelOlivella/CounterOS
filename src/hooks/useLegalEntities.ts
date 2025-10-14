import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LegalEntity } from '@/lib/hierarchy';

export function useLegalEntities(corporateId?: string) {
  return useQuery<LegalEntity[]>({
    queryKey: ['legalEntities', corporateId],
    queryFn: async () => {
      let query = supabase
        .from('legal_entities')
        .select('*')
        .order('name');

      if (corporateId) {
        query = query.eq('corporate_id', corporateId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useLegalEntity(legalEntityId?: string) {
  return useQuery<LegalEntity | null>({
    queryKey: ['legalEntity', legalEntityId],
    queryFn: async () => {
      if (!legalEntityId) return null;

      const { data, error } = await supabase
        .from('legal_entities')
        .select('*')
        .eq('id', legalEntityId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!legalEntityId,
    staleTime: 10 * 60 * 1000,
  });
}
