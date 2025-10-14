import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { toast } from '@/hooks/use-toast';

export interface Brand {
  id: string;
  legal_entity_id: string;
  name: string;
  slug: string;
  concept: string;
  description: string | null;
  branding: any;
  target_food_cost: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBrandInput {
  legal_entity_id: string;
  name: string;
  concept: string;
  description?: string;
  target_food_cost?: number;
  branding?: {
    logo?: string;
    primary_color?: string;
    secondary_color?: string;
  };
}

/**
 * Hook para obtener brands de un legal entity específico o todas las brands
 * 
 * @param legalEntityId - ID del legal entity (opcional)
 * @returns Lista de brands
 * 
 * @example
 * const { data: brands, isLoading } = useBrands(); // Todas las brands
 * const { data: brands, isLoading } = useBrands('legal-entity-uuid'); // Filtradas
 */
export function useBrands(legalEntityId?: string) {
  return useQuery({
    queryKey: ['brands', legalEntityId],
    queryFn: async (): Promise<any[]> => {
      logger.info('[useBrands] Fetching brands', { legalEntityId });

      let query = supabase
        .from('brands')
        .select(`
          *,
          legal_entity:legal_entities(id, name, rfc, corporate_id)
        `)
        .order('name');

      if (legalEntityId) {
        query = query.eq('legal_entity_id', legalEntityId);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('[useBrands] Error fetching brands', error);
        throw error;
      }

      // Enriquecer con store count
      const brandsWithCount = await Promise.all(
        (data || []).map(async (brand) => {
          const { count } = await supabase
            .from('stores')
            .select('id', { count: 'exact', head: true })
            .eq('brand_id', brand.id);

          return {
            ...brand,
            _count: { stores: count || 0 }
          };
        })
      );

      return brandsWithCount;
    },
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000
  });
}

/**
 * Hook para obtener un brand específico por ID
 */
export function useBrand(brandId: string | undefined) {
  return useQuery({
    queryKey: ['brand', brandId],
    queryFn: async (): Promise<Brand> => {
      if (!brandId) {
        throw new Error('Brand ID requerido');
      }

      logger.info('[useBrand] Fetching brand', { brandId });

      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', brandId)
        .single();

      if (error) {
        logger.error('[useBrand] Error fetching brand', error);
        throw error;
      }

      return data;
    },
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook para crear un nuevo brand
 * 
 * @example
 * const createBrand = useCreateBrand();
 * 
 * createBrand.mutate({
 *   legal_entity_id: 'uuid',
 *   name: 'Moshi Moshi',
 *   concept: 'sushi',
 *   target_food_cost: 28
 * });
 */
export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBrandInput) => {
      logger.info('[useCreateBrand] Creating brand', input);

      // Auto-generar slug
      const slug = input.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data, error } = await supabase
        .from('brands')
        .insert({
          legal_entity_id: input.legal_entity_id,
          name: input.name,
          slug,
          concept: input.concept,
          description: input.description || null,
          target_food_cost: input.target_food_cost || 30.0,
          branding: input.branding || {}
        })
        .select()
        .single();

      if (error) {
        logger.error('[useCreateBrand] Error creating brand', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      logger.info('[useCreateBrand] Brand created successfully', data);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['enterprise-hierarchy'] });
      
      toast({
        title: "Marca creada",
        description: `${data.name} fue creada exitosamente`,
      });
    },
    onError: (error: any) => {
      logger.error('[useCreateBrand] Mutation failed', error);
      
      toast({
        title: "Error al crear marca",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
    }
  });
}

/**
 * Hook para actualizar un brand existente
 */
export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ brandId, updates }: { brandId: string; updates: Partial<CreateBrandInput> }) => {
      logger.info('[useUpdateBrand] Updating brand', { brandId, updates });

      const { data, error } = await supabase
        .from('brands')
        .update(updates)
        .eq('id', brandId)
        .select()
        .single();

      if (error) {
        logger.error('[useUpdateBrand] Error updating brand', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      logger.info('[useUpdateBrand] Brand updated successfully', data);
      
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brand', data.id] });
      queryClient.invalidateQueries({ queryKey: ['enterprise-hierarchy'] });
      
      toast({
        title: "Marca actualizada",
        description: `${data.name} fue actualizada exitosamente`,
      });
    },
    onError: (error: any) => {
      logger.error('[useUpdateBrand] Mutation failed', error);
      
      toast({
        title: "Error al actualizar marca",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
    }
  });
}

/**
 * Hook para eliminar un brand
 * NOTA: Requiere que no haya stores asociadas (ON DELETE RESTRICT)
 */
export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandId: string) => {
      logger.info('[useDeleteBrand] Deleting brand', { brandId });

      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId);

      if (error) {
        logger.error('[useDeleteBrand] Error deleting brand', error);
        throw error;
      }

      return brandId;
    },
    onSuccess: (brandId) => {
      logger.info('[useDeleteBrand] Brand deleted successfully', { brandId });
      
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['enterprise-hierarchy'] });
      
      toast({
        title: "Marca eliminada",
        description: "La marca fue eliminada exitosamente",
      });
    },
    onError: (error: any) => {
      logger.error('[useDeleteBrand] Mutation failed', error);
      
      let description = error.message || "Ocurrió un error inesperado";
      
      // Mensaje específico si hay stores asociadas
      if (error.code === '23503') {
        description = "No se puede eliminar la marca porque tiene tiendas asociadas";
      }
      
      toast({
        title: "Error al eliminar marca",
        description,
        variant: "destructive",
      });
    }
  });
}
