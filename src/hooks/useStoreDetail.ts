import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export interface StoreDetail {
  id: string;
  name: string;
  code: string;
  location: string;
  manager: string;
  managerTenure: string;
  foodCost: {
    current: number;
    target: number;
    delta: number;
    deltaVsTop10: number;
  };
  trending: {
    weeks: number;
    data: Array<{ week: number; fc: number }>;
    status: string;
    message: string;
  };
  breakdown: {
    categories: Array<{
      name: string;
      actual: number;
      target: number;
      delta: number;
      impact: number;
      status: string;
    }>;
    primaryIssue: string;
  };
}

export function useStoreDetail(storeId: string) {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ["store-detail", tenant?.tenant_id, storeId],
    queryFn: async () => {
      if (!tenant?.tenant_id) {
        throw new Error("No tenant selected");
      }

      // Fetch store basic info
      const { data: storeData, error: storeError } = await supabase
        .from("store_performance_view")
        .select("*")
        .eq("tenant_id", tenant.tenant_id)
        .eq("store_id", storeId)
        .single();

      if (storeError) throw storeError;

      // Fetch weekly trending data
      const { data: trendingData, error: trendingError } = await supabase
        .from("weekly_food_cost_view")
        .select("*")
        .eq("tenant_id", tenant.tenant_id)
        .eq("store_id", storeId)
        .order("week_start", { ascending: true })
        .limit(12);

      if (trendingError) throw trendingError;

      // Fetch category breakdown
      const { data: categoryData, error: categoryError } = await supabase
        .from("store_categories")
        .select("*")
        .eq("tenant_id", tenant.tenant_id)
        .eq("store_id", storeId)
        .order("period", { ascending: false })
        .limit(10);

      // Transform to StoreDetail format
      const trending = (trendingData || []).map((week: any, idx: number) => ({
        week: idx + 1,
        fc: parseFloat(week.avg_food_cost_pct) || 28.5
      }));

      const categories = (categoryData || []).map((cat: any) => ({
        name: cat.category_name,
        actual: parseFloat(cat.actual_pct),
        target: parseFloat(cat.target_pct),
        delta: parseFloat(cat.actual_pct) - parseFloat(cat.target_pct),
        impact: (parseFloat(cat.actual_pct) - parseFloat(cat.target_pct)) * 12000,
        status: parseFloat(cat.actual_pct) - parseFloat(cat.target_pct) > 2 ? "critical" : 
                parseFloat(cat.actual_pct) - parseFloat(cat.target_pct) > 0.5 ? "warning" : "ok"
      }));

      const currentFC = parseFloat(String(storeData.current_food_cost_pct)) || 28.5;
      const targetFC = parseFloat(String(storeData.target_food_cost_pct)) || 28.5;

      const detail: StoreDetail = {
        id: storeData.store_id,
        name: storeData.name,
        code: storeData.code,
        location: storeData.city || "Unknown",
        manager: storeData.manager_name || "No asignado",
        managerTenure: `${storeData.manager_tenure_months || 0} meses`,
        foodCost: {
          current: currentFC,
          target: targetFC,
          delta: currentFC - targetFC,
          deltaVsTop10: Math.max(0, currentFC - 27.2) // Assume top 10 avg is 27.2%
        },
        trending: {
          weeks: trending.length,
          data: trending,
          status: trending.length > 1 && trending[trending.length - 1].fc > trending[0].fc + 2 ? "up-critical" : "stable",
          message: trending.length > 1 && trending[trending.length - 1].fc > trending[0].fc + 2 
            ? `Empeorando consistentemente ${trending.length} semanas (+${(trending[trending.length - 1].fc - trending[0].fc).toFixed(1)}pts desde inicio)`
            : "Relativamente estable"
        },
        breakdown: {
          categories: categories.length > 0 ? categories : [
            { name: "Sin datos", actual: 0, target: 0, delta: 0, impact: 0, status: "ok" }
          ],
          primaryIssue: categories.length > 0 && categories[0].delta > 1 
            ? `${categories[0].name} (+${categories[0].delta.toFixed(1)}pts = $${(categories[0].impact / 1000).toFixed(0)}K/año)`
            : "No hay problemas críticos detectados"
        }
      };

      return detail;
    },
    enabled: !!tenant?.tenant_id && !!storeId,
  });
}
