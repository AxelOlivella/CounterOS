import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Corporate } from '@/lib/hierarchy';

export function useCorporates() {
  return useQuery<Corporate[]>({
    queryKey: ['corporates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corporates')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useCorporate(corporateId?: string) {
  return useQuery<Corporate | null>({
    queryKey: ['corporate', corporateId],
    queryFn: async () => {
      if (!corporateId) return null;

      const { data, error } = await supabase
        .from('corporates')
        .select('*')
        .eq('id', corporateId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!corporateId,
    staleTime: 10 * 60 * 1000,
  });
}
