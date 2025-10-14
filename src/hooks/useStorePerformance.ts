import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentTenant } from '@/lib/db_new';
import { logger } from '@/lib/logger';

export interface StorePerformance {
  storeId: string;
  storeName: string;
  avgFoodCost: number;
  target: number;
  delta: number;
  trending: 'up' | 'down' | 'stable';
  totalVentas: number;
  totalCompras: number;
}

async function fetchStorePerformance(days: number): Promise<StorePerformance[]> {
  const tenantId = await getCurrentTenant();
  
  if (!tenantId) {
    throw new Error('No tenant found');
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  const { data: fcData, error: fcError } = await supabase
    .from('food_cost_daily')
    .select(`
      food_cost_pct,
      total_compras,
      total_ventas,
      fecha,
      store_id,
      stores!inner(name, target_food_cost_pct)
    `)
    .eq('tenant_id', tenantId)
    .gte('fecha', startStr)
    .lte('fecha', endStr)
    .order('fecha', { ascending: true });

  if (fcError) {
    throw fcError;
  }

  if (!fcData || fcData.length === 0) {
    return [];
  }

  // Agrupar por tienda
  const storeMap = new Map<string, any[]>();
  
  fcData.forEach((row: any) => {
    if (!storeMap.has(row.store_id)) {
      storeMap.set(row.store_id, []);
    }
    storeMap.get(row.store_id)!.push(row);
  });

  // Calcular performance por tienda
  const performance: StorePerformance[] = Array.from(storeMap.entries()).map(([storeId, records]) => {
    const avgFC = records.reduce((sum, r) => sum + (r.food_cost_pct || 0), 0) / records.length;
    const target = records[0].stores?.target_food_cost_pct || 28.5;
    const delta = avgFC - target;

    // Calcular trending (comparar primera mitad vs segunda mitad del período)
    const midpoint = Math.floor(records.length / 2);
    const firstHalf = records.slice(0, midpoint);
    const secondHalf = records.slice(midpoint);
    
    let trending: 'up' | 'down' | 'stable' = 'stable';
    
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const firstAvg = firstHalf.reduce((s, r) => s + (r.food_cost_pct || 0), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, r) => s + (r.food_cost_pct || 0), 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 0.5) {
        trending = 'up'; // empeorando
      } else if (secondAvg < firstAvg - 0.5) {
        trending = 'down'; // mejorando
      }
    }

    const totalVentas = records.reduce((s, r) => s + (r.total_ventas || 0), 0);
    const totalCompras = records.reduce((s, r) => s + (r.total_compras || 0), 0);

    return {
      storeId,
      storeName: records[0].stores?.name || 'Unknown',
      avgFoodCost: Number(avgFC.toFixed(1)),
      target,
      delta: Number(delta.toFixed(1)),
      trending,
      totalVentas: Math.round(totalVentas),
      totalCompras: Math.round(totalCompras)
    };
  });

  // Ordenar por delta (peores primero)
  performance.sort((a, b) => b.delta - a.delta);

  logger.info(`Store performance calculated from cache/server: ${performance.length} stores analyzed`);
  return performance;
}

export function useStorePerformance(days: number = 30) {
  return useQuery({
    queryKey: ['storePerformance', days],
    queryFn: () => fetchStorePerformance(days),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}
