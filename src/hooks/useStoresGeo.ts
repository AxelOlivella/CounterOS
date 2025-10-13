import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export interface StoreGeo {
  id: string;
  name: string;
  code: string;
  location: string;
  lat: number;
  lng: number;
  fc: number;
  status: "ok" | "warning" | "critical";
  manager?: string;
  managerTenure?: number;
}

export function useStoresGeo() {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ["stores-geo", tenant?.tenant_id],
    queryFn: async () => {
      if (!tenant?.tenant_id) {
        throw new Error("No tenant selected");
      }

      const { data, error } = await supabase
        .from("store_performance_view")
        .select("*")
        .eq("tenant_id", tenant.tenant_id);

      if (error) throw error;

      // Transform to StoreGeo format
      const stores: StoreGeo[] = (data || []).map((store: any) => ({
        id: store.store_id,
        name: store.name,
        code: store.code,
        location: store.city || "Unknown",
        lat: parseFloat(store.latitude) || 19.4 + (Math.random() - 0.5) * 0.8,
        lng: parseFloat(store.longitude) || -99.15 + (Math.random() - 0.5) * 0.6,
        fc: parseFloat(store.current_food_cost_pct) || 28.5,
        status: store.status || "ok",
        manager: store.manager_name,
        managerTenure: store.manager_tenure_months
      }));

      return stores;
    },
    enabled: !!tenant?.tenant_id,
  });
}
