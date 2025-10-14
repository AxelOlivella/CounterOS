import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentTenant } from '@/lib/db_new';
import { logger } from '@/lib/logger';

export interface FoodCostSummary {
  avgFoodCost: number;
  targetFoodCost: number;
  delta: number;
  totalStores: number;
  storesInRange: number;
  storesAboveTarget: number;
  totalSavingsOpportunity: number;
  period: {
    start: string;
    end: string;
  };
}

async function fetchFoodCostSummary(days: number): Promise<FoodCostSummary> {
  const tenantId = await getCurrentTenant();
  
  if (!tenantId) {
    throw new Error('No tenant found');
  }

  // Calcular rango de fechas (últimos N días)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  // Fetch food_cost_daily para el período
  const { data: fcData, error: fcError } = await supabase
    .from('food_cost_daily')
    .select(`
      food_cost_pct,
      total_compras,
      total_ventas,
      store_id,
      stores!inner(target_food_cost_pct)
    `)
    .eq('tenant_id', tenantId)
    .gte('fecha', startStr)
    .lte('fecha', endStr);

  if (fcError) {
    throw fcError;
  }

  if (!fcData || fcData.length === 0) {
    // No hay data todavía
    return {
      avgFoodCost: 0,
      targetFoodCost: 28.5,
      delta: 0,
      totalStores: 0,
      storesInRange: 0,
      storesAboveTarget: 0,
      totalSavingsOpportunity: 0,
      period: { start: startStr, end: endStr }
    };
  }

  // Calcular promedios por tienda
  const storeStats = new Map<string, {
    avgFC: number;
    target: number;
    totalVentas: number;
    count: number;
  }>();

  fcData.forEach((row: any) => {
    const storeId = row.store_id;
    
    if (!storeStats.has(storeId)) {
      storeStats.set(storeId, {
        avgFC: 0,
        target: row.stores?.target_food_cost_pct || 28.5,
        totalVentas: 0,
        count: 0
      });
    }

    const stats = storeStats.get(storeId)!;
    stats.avgFC += row.food_cost_pct || 0;
    stats.totalVentas += row.total_ventas || 0;
    stats.count += 1;
  });

  // Promediar FC por tienda
  const storeArray = Array.from(storeStats.entries()).map(([storeId, stats]) => ({
    storeId,
    avgFC: stats.avgFC / stats.count,
    target: stats.target,
    totalVentas: stats.totalVentas
  }));

  if (storeArray.length === 0) {
    return {
      avgFoodCost: 0,
      targetFoodCost: 28.5,
      delta: 0,
      totalStores: 0,
      storesInRange: 0,
      storesAboveTarget: 0,
      totalSavingsOpportunity: 0,
      period: { start: startStr, end: endStr }
    };
  }

  // Calcular métricas globales
  const avgFoodCost = storeArray.reduce((sum, s) => sum + s.avgFC, 0) / storeArray.length;
  const avgTarget = storeArray.reduce((sum, s) => sum + s.target, 0) / storeArray.length;
  const delta = avgFoodCost - avgTarget;

  const storesInRange = storeArray.filter(s => 
    Math.abs(s.avgFC - s.target) <= 1.5
  ).length;

  const storesAboveTarget = storeArray.filter(s => 
    s.avgFC > s.target
  ).length;

  // Calcular savings opportunity
  const totalSavingsOpportunity = storeArray.reduce((sum, s) => {
    if (s.avgFC > s.target) {
      const deltaFC = (s.avgFC - s.target) / 100;
      const savings = s.totalVentas * deltaFC;
      return sum + savings;
    }
    return sum;
  }, 0);

  const summary: FoodCostSummary = {
    avgFoodCost: Number(avgFoodCost.toFixed(1)),
    targetFoodCost: Number(avgTarget.toFixed(1)),
    delta: Number(delta.toFixed(1)),
    totalStores: storeArray.length,
    storesInRange,
    storesAboveTarget,
    totalSavingsOpportunity: Math.round(totalSavingsOpportunity),
    period: { start: startStr, end: endStr }
  };

  logger.info(`Food cost summary calculated from cache/server: ${summary.totalStores} stores, avg ${summary.avgFoodCost}%`);
  return summary;
}

export function useFoodCostSummary(days: number = 30) {
  return useQuery({
    queryKey: ['foodCostSummary', days],
    queryFn: () => fetchFoodCostSummary(days),
    staleTime: 2 * 60 * 1000, // 2 minutos para food cost (más dinámico)
  });
}
