import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentTenant } from '@/lib/db_new';

export interface OperationsDashboardData {
  foodCostAvg: number;
  foodCostTarget: number;
  alerts: {
    critical: number;
    warning: number;
  };
  storesOK: number;
  totalStores: number;
  variability: number;
  criticalStores: Array<{
    id: number;
    name: string;
    location: string;
    foodCost: number;
    delta: number;
    target: number;
    impact: number;
    trending: 'up-critical' | 'up-high' | 'up' | 'stable' | 'down';
    status: 'critical' | 'warning';
  }>;
}

export function useOperationsDashboard() {
  return useQuery({
    queryKey: ['operations-dashboard'],
    queryFn: async (): Promise<OperationsDashboardData> => {
      const tenantId = await getCurrentTenant();

      // 1. Get all stores with performance data
      const { data: storePerf, error: perfError } = await supabase
        .from('store_performance_view')
        .select('*')
        .eq('tenant_id', tenantId);

      if (perfError) throw perfError;

      // If no stores, return empty state
      if (!storePerf || storePerf.length === 0) {
        return {
          foodCostAvg: 0,
          foodCostTarget: 28.5,
          alerts: { critical: 0, warning: 0 },
          storesOK: 0,
          totalStores: 0,
          variability: 0,
          criticalStores: []
        };
      }

      // Calculate metrics
      const totalStores = storePerf.length;
      
      // Average food cost across all stores
      const foodCostAvg = storePerf.reduce((sum, s) => 
        sum + (s.current_food_cost_pct || 0), 0
      ) / totalStores;

      // Average target (most stores should have same target)
      const foodCostTarget = storePerf[0]?.target_food_cost_pct || 28.5;

      // Count alerts by status
      const critical = storePerf.filter(s => s.status === 'critical').length;
      const warning = storePerf.filter(s => s.status === 'warning').length;
      const storesOK = storePerf.filter(s => s.status === 'ok' || s.status === 'success').length;

      // Calculate variability (standard deviation of food cost)
      const mean = foodCostAvg;
      const squaredDiffs = storePerf.map(s => {
        const diff = (s.current_food_cost_pct || 0) - mean;
        return diff * diff;
      });
      const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / totalStores;
      const variability = Math.sqrt(variance);

      // Get critical stores (critical + warning, sorted by impact)
      const criticalStoresData = storePerf
        .filter(s => s.status === 'critical' || s.status === 'warning')
        .map(s => {
          const delta = (s.current_food_cost_pct || 0) - (s.target_food_cost_pct || 28.5);
          const impact = (s.revenue_30d || 0) * (delta / 100); // Savings potential
          
          // Determine trending based on food_cost_variance
          let trending: 'up-critical' | 'up-high' | 'up' | 'stable' | 'down' = 'stable';
          const variance = s.food_cost_variance || 0;
          
          if (variance > 3) {
            trending = 'up-critical';
          } else if (variance > 2) {
            trending = 'up-high';
          } else if (variance > 1) {
            trending = 'up';
          } else if (variance < -1) {
            trending = 'down';
          }

          return {
            id: parseInt(s.code) || Math.floor(Math.random() * 1000),
            name: s.name,
            location: s.city || 'Unknown',
            foodCost: parseFloat((s.current_food_cost_pct || 0).toFixed(1)),
            delta: parseFloat(delta.toFixed(1)),
            target: s.target_food_cost_pct || 28.5,
            impact: Math.round(Math.abs(impact)),
            trending,
            status: s.status as 'critical' | 'warning'
          };
        })
        .sort((a, b) => b.impact - a.impact); // Sort by impact (highest first)

      return {
        foodCostAvg: parseFloat(foodCostAvg.toFixed(1)),
        foodCostTarget,
        alerts: { critical, warning },
        storesOK,
        totalStores,
        variability: parseFloat(variability.toFixed(1)),
        criticalStores: criticalStoresData
      };
    }
  });
}
