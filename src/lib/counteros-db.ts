import { supabase } from "@/integrations/supabase/client";

// DEPRECATED: fetchDashboardKPIs removed - use useDashboardSummary hook instead
// This eliminates redundant queries to the stores table

export async function fetchTenant(identifier: string) {
  try {
    // First try by tenant_id, then by name (for demo-counteros)
    let { data: tenant } = await supabase
      .from("tenants")
      .select("*")
      .eq("tenant_id", identifier)
      .single();

    if (!tenant) {
      // Try by name for demo tenant
      const { data: tenantByName } = await supabase
        .from("tenants")
        .select("*")
        .ilike("name", `%${identifier}%`)
        .single();
      
      tenant = tenantByName;
    }

    return tenant;
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return null;
  }
}