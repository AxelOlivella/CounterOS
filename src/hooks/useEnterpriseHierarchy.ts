import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

/**
 * Enterprise Hierarchy Structure
 * Corporate → Legal Entity → Brand → Store
 */
export interface EnterpriseHierarchy {
  corporate: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  };
  legalEntities: Array<{
    id: string;
    name: string;
    rfc: string;
    tax_regime: string | null;
    brands: Array<{
      id: string;
      name: string;
      slug: string;
      concept: string;
      target_food_cost: number;
      branding: any;
      store_count: number;
    }>;
  }>;
}

/**
 * Hook para obtener la jerarquía enterprise completa del usuario actual
 * 
 * @returns Jerarquía completa: Corporate → Legal Entities → Brands → Store counts
 * 
 * @example
 * const { data: hierarchy, isLoading } = useEnterpriseHierarchy();
 * 
 * if (hierarchy) {
 *   console.log(hierarchy.corporate.name); // "Grupo MYT"
 *   hierarchy.legalEntities.forEach(le => {
 *     console.log(le.rfc); // "MYT890123ABC"
 *     le.brands.forEach(brand => {
 *       console.log(brand.name, brand.store_count); // "Moshi Moshi", 12
 *     });
 *   });
 * }
 */
export function useEnterpriseHierarchy() {
  return useQuery({
    queryKey: ['enterprise-hierarchy'],
    queryFn: async (): Promise<EnterpriseHierarchy> => {
      logger.info('[useEnterpriseHierarchy] Fetching hierarchy');

      // 1. Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // 2. Obtener corporate_id del usuario
      const { data: userAccess, error: accessError } = await supabase
        .from('corporate_users')
        .select('corporate_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (accessError) {
        logger.error('[useEnterpriseHierarchy] Error fetching corporate access', accessError);
        throw accessError;
      }

      if (!userAccess) {
        throw new Error('Usuario sin acceso a ningún corporate');
      }

      // 3. Fetch corporate
      const { data: corporate, error: corporateError } = await supabase
        .from('corporates')
        .select('id, name, slug, logo_url')
        .eq('id', userAccess.corporate_id)
        .single();

      if (corporateError) {
        logger.error('[useEnterpriseHierarchy] Error fetching corporate', corporateError);
        throw corporateError;
      }

      // 4. Fetch legal entities
      const { data: legalEntities, error: legalError } = await supabase
        .from('legal_entities')
        .select('id, name, rfc, tax_regime')
        .eq('corporate_id', corporate.id);

      if (legalError) {
        logger.error('[useEnterpriseHierarchy] Error fetching legal entities', legalError);
        throw legalError;
      }

      // 5. Fetch brands por cada legal entity
      const hierarchyData: EnterpriseHierarchy = {
        corporate,
        legalEntities: []
      };

      for (const legalEntity of legalEntities || []) {
        const { data: brands, error: brandsError } = await supabase
          .from('brands')
          .select('id, name, slug, concept, target_food_cost, branding')
          .eq('legal_entity_id', legalEntity.id);

        if (brandsError) {
          logger.error('[useEnterpriseHierarchy] Error fetching brands', brandsError);
          throw brandsError;
        }

        // 6. Contar stores por cada brand
        const brandsWithCounts = await Promise.all(
          (brands || []).map(async (brand) => {
            const { count, error: countError } = await supabase
              .from('stores')
              .select('*', { count: 'exact', head: true })
              .eq('brand_id', brand.id);

            if (countError) {
              logger.warn('[useEnterpriseHierarchy] Error counting stores', countError);
            }

            return {
              ...brand,
              store_count: count || 0
            };
          })
        );

        hierarchyData.legalEntities.push({
          ...legalEntity,
          brands: brandsWithCounts
        });
      }

      logger.info('[useEnterpriseHierarchy] Hierarchy loaded', {
        corporate: corporate.name,
        legalEntities: hierarchyData.legalEntities.length,
        totalBrands: hierarchyData.legalEntities.reduce((sum, le) => sum + le.brands.length, 0)
      });

      return hierarchyData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2
  });
}

/**
 * Hook simplificado para obtener solo el corporate del usuario
 */
export function useCorporate() {
  const { data: hierarchy, ...rest } = useEnterpriseHierarchy();
  
  return {
    data: hierarchy?.corporate,
    ...rest
  };
}

/**
 * Hook simplificado para obtener todas las brands del corporate
 */
export function useAllBrands() {
  const { data: hierarchy, ...rest } = useEnterpriseHierarchy();
  
  const allBrands = hierarchy?.legalEntities.flatMap(le => 
    le.brands.map(brand => ({
      ...brand,
      legal_entity_id: le.id,
      legal_entity_name: le.name,
      rfc: le.rfc
    }))
  ) || [];

  return {
    data: allBrands,
    ...rest
  };
}
