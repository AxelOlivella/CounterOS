import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentTenant } from '@/lib/db_new';
import { useStores, Store } from './useStores';

export interface DashboardSummary {
  bestStore: {
    name: string;
    foodCost: number;
    revenue: number;
    improvement: string;
  };
  worstStore: {
    name: string;
    foodCost: number;
    revenue: number;
    decline: string;
  };
  totalSavings: number;
  avgFoodCost: number;
  target: number;
  alertsCount: number;
  totalStores: number;
}

export function useDashboardSummary() {
  const { data: stores, isLoading: storesLoading } = useStores();
  
  return useQuery({
    queryKey: ['dashboard-summary', stores?.length],
    queryFn: async (): Promise<DashboardSummary> => {
      const tenantId = await getCurrentTenant();

      // Use stores from cache (already loaded by useStores)
      if (!stores || stores.length === 0) {
        return {
          bestStore: { name: 'N/A', foodCost: 0, revenue: 0, improvement: '0%' },
          worstStore: { name: 'N/A', foodCost: 0, revenue: 0, decline: '0%' },
          totalSavings: 0,
          avgFoodCost: 0,
          target: 28.5,
          alertsCount: 0,
          totalStores: 0
        };
      }

      // 2. Get food cost data for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: foodCostData, error: fcError } = await supabase
        .from('food_cost_daily')
        .select('store_id, fecha, food_cost_pct, total_ventas, total_compras')
        .eq('tenant_id', tenantId)
        .gte('fecha', thirtyDaysAgo.toISOString().split('T')[0])
        .order('fecha', { ascending: false });

      if (fcError) throw fcError;

      // Calculate metrics per store
      const storeMetrics = stores.map(store => {
        const storeData = foodCostData?.filter(fc => fc.store_id === store.id) || [];
        
        const avgFoodCost = storeData.length > 0
          ? storeData.reduce((sum, d) => sum + (d.food_cost_pct || 0), 0) / storeData.length
          : 0;

        const totalRevenue = storeData.reduce((sum, d) => sum + (d.total_ventas || 0), 0);

        // Calculate trend (last 7 days vs previous 7 days)
        const last7Days = storeData.slice(0, 7);
        const prev7Days = storeData.slice(7, 14);

        const avgLast7 = last7Days.length > 0
          ? last7Days.reduce((sum, d) => sum + (d.food_cost_pct || 0), 0) / last7Days.length
          : 0;

        const avgPrev7 = prev7Days.length > 0
          ? prev7Days.reduce((sum, d) => sum + (d.food_cost_pct || 0), 0) / prev7Days.length
          : 0;

        const trend = avgPrev7 > 0 ? ((avgLast7 - avgPrev7) / avgPrev7) * 100 : 0;

        return {
          id: store.id,
          name: store.name,
          target_food_cost: store.target_food_cost,
          avgFoodCost,
          totalRevenue,
          trend
        };
      });

      // Sort by food cost (best = lowest)
      const sortedByFC = [...storeMetrics].sort((a, b) => a.avgFoodCost - b.avgFoodCost);

      const bestStore = sortedByFC[0];
      const worstStore = sortedByFC[sortedByFC.length - 1];

      // Calculate overall metrics
      const avgFoodCost = storeMetrics.length > 0
        ? storeMetrics.reduce((sum, s) => sum + s.avgFoodCost, 0) / storeMetrics.length
        : 0;

      const target = stores[0]?.target_food_cost || 28.5;

      // Calculate alerts (stores over target)
      const alertsCount = storeMetrics.filter(s => s.avgFoodCost > target).length;

      // Calculate potential savings
      const totalSavings = storeMetrics.reduce((sum, store) => {
        if (store.avgFoodCost > target) {
          const excessFC = (store.avgFoodCost - target) / 100;
          const potentialSaving = store.totalRevenue * excessFC;
          return sum + potentialSaving;
        }
        return sum;
      }, 0);

      return {
        bestStore: {
          name: bestStore?.name || 'N/A',
          foodCost: parseFloat(bestStore?.avgFoodCost.toFixed(1)) || 0,
          revenue: Math.round(bestStore?.totalRevenue || 0),
          improvement: bestStore?.trend >= 0 
            ? `+${bestStore.trend.toFixed(1)}%` 
            : `${bestStore.trend.toFixed(1)}%`
        },
        worstStore: {
          name: worstStore?.name || 'N/A',
          foodCost: parseFloat(worstStore?.avgFoodCost.toFixed(1)) || 0,
          revenue: Math.round(worstStore?.totalRevenue || 0),
          decline: worstStore?.trend >= 0 
            ? `+${worstStore.trend.toFixed(1)}%` 
            : `${worstStore.trend.toFixed(1)}%`
        },
        totalSavings: Math.round(totalSavings),
        avgFoodCost: parseFloat(avgFoodCost.toFixed(1)),
        target,
        alertsCount,
        totalStores: stores.length
      };
    },
    enabled: !storesLoading && !!stores && stores.length > 0
  });
}
