import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export interface DashboardStats {
  totalRevenue: number;
  avgFoodCost: number;
  criticalStores: number;
  totalStores: number;
}

export function useOperationsDashboard() {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ["operations-dashboard", tenant?.tenant_id],
    queryFn: async () => {
      if (!tenant?.tenant_id) {
        throw new Error("No tenant selected");
      }

      // Fetch store performance data
      const { data: stores, error } = await supabase
        .from("store_performance_view")
        .select("*")
        .eq("tenant_id", tenant.tenant_id);

      if (error) throw error;

      // Calculate aggregated stats
      const totalStores = stores?.length || 0;
      const criticalStores = stores?.filter((s: any) => s.status === "critical").length || 0;
      const totalRevenue = stores?.reduce((sum: number, s: any) => sum + parseFloat(s.revenue_30d || 0), 0) || 0;
      const avgFoodCost = totalStores > 0
        ? stores.reduce((sum: number, s: any) => sum + parseFloat(s.current_food_cost_pct || 0), 0) / totalStores
        : 28.5;

      const stats: DashboardStats = {
        totalRevenue: Math.round(totalRevenue),
        avgFoodCost: Math.round(avgFoodCost * 10) / 10,
        criticalStores,
        totalStores
      };

      return stats;
    },
    enabled: !!tenant?.tenant_id,
  });
}
