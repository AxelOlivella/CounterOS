import { supabase } from "@/integrations/supabase/client";

export interface DashboardKPIs {
  totalSales: number;
  foodCostPercentage: number;
  totalTransactions: number;
  avgTicket: number;
  stores: number;
  salesData?: any[];
  purchases?: any[];
}

// Helper functions to fetch CounterOS data from the database
export async function fetchDashboardKPIs(tenantId: string): Promise<DashboardKPIs | null> {
  try {
    // Get all stores for the tenant
    const { data: stores } = await supabase
      .from("stores")
      .select("*")
      .eq("tenant_id", tenantId);

    if (!stores || stores.length === 0) {
      return {
        totalSales: 1250000,
        foodCostPercentage: 28.5,
        totalTransactions: 8450,
        avgTicket: 235,
        stores: 1,
        salesData: [],
        purchases: []
      };
    }

    // Use v_sales_daily view for sales data
    const { data: salesData } = await supabase
      .from("v_sales_daily")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("day", { ascending: false });

    // Use daily_food_cost_view for food cost data
    const { data: foodCostData } = await supabase
      .from("daily_food_cost_view")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("day", { ascending: false });

    // Calculate KPIs from available data
    const totalSales = salesData?.reduce((sum, record) => sum + (Number(record.revenue) || 0), 0) || 1250000;
    const avgFoodCost = foodCostData?.reduce((sum, record) => sum + (Number(record.food_cost_pct) || 0), 0) / (foodCostData?.length || 1) || 28.5;
    const totalTransactions = salesData?.reduce((sum, record) => sum + (Number(record.qty_sold) || 0), 0) || 8450;
    const avgTicket = totalTransactions > 0 ? totalSales / totalTransactions : 235;

    return {
      totalSales: Math.round(totalSales),
      foodCostPercentage: Math.round(avgFoodCost * 10) / 10,
      totalTransactions,
      avgTicket: Math.round(avgTicket),
      stores: stores.length,
      salesData,
      purchases: foodCostData
    };

  } catch (error) {
    console.error("Error fetching dashboard KPIs:", error);
    // Return demo data on error
    return {
      totalSales: 1250000,
      foodCostPercentage: 28.5,
      totalTransactions: 8450,
      avgTicket: 235,
      stores: 1,
      salesData: [],
      purchases: []
    };
  }
}

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