import { supabase } from "@/integrations/supabase/client";

// Helper functions to fetch CounterOS data from the database
export async function fetchDashboardKPIs(tenantId: string) {
  try {
    // Get all stores for the tenant
    const { data: stores } = await supabase
      .from("stores")
      .select("*")
      .eq("tenant_id", tenantId);

    if (!stores || stores.length === 0) {
      return null;
    }

    // Get last 30 days of sales data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: salesData } = await supabase
      .from("daily_sales")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("date", thirtyDaysAgo.toISOString().split('T')[0])
      .order("date", { ascending: false });

    // Get purchases for food cost calculation
    const { data: purchases } = await supabase
      .from("purchases")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("issue_date", thirtyDaysAgo.toISOString().split('T')[0])
      .order("issue_date", { ascending: false });

    // Calculate KPIs
    if (salesData && salesData.length > 0) {
      const totalSales = salesData.reduce((sum, day) => sum + Number(day.net_sales || day.gross_sales - day.discounts), 0);
      const totalTransactions = salesData.reduce((sum, day) => sum + Number(day.transactions), 0);
      const avgTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

      const totalPurchases = purchases?.reduce((sum, purchase) => sum + Number(purchase.total), 0) || 0;
      const foodCostPercentage = totalSales > 0 ? (totalPurchases / totalSales) * 100 : 0;

      return {
        totalSales: Math.round(totalSales),
        foodCostPercentage: Math.round(foodCostPercentage * 10) / 10,
        totalTransactions,
        avgTicket: Math.round(avgTicket),
        stores: stores.length,
        salesData,
        purchases
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching dashboard KPIs:", error);
    return null;
  }
}

export async function fetchTenant(subdomain: string) {
  try {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("*")
      .eq("subdomain", subdomain)
      .single();

    return tenant;
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return null;
  }
}

export async function fetchFoodCostTrend(tenantId: string, days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: salesData } = await supabase
      .from("daily_sales")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("date", startDate.toISOString().split('T')[0])
      .order("date", { ascending: true });

    const { data: purchases } = await supabase
      .from("purchases")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("issue_date", startDate.toISOString().split('T')[0])
      .order("issue_date", { ascending: true });

    // Group purchases by date for daily food cost calculation
    const purchasesByDate: Record<string, number> = {};
    purchases?.forEach(purchase => {
      const date = purchase.issue_date;
      purchasesByDate[date] = (purchasesByDate[date] || 0) + Number(purchase.total);
    });

    // Calculate daily food cost percentages
    const trendData = salesData?.map(day => {
      const revenue = Number(day.net_sales || day.gross_sales - day.discounts);
      const purchases = purchasesByDate[day.date] || 0;
      const foodCostPct = revenue > 0 ? (purchases / revenue) * 100 : 0;

      return {
        date: day.date,
        revenue,
        purchases,
        foodCostPct: Math.round(foodCostPct * 10) / 10,
        transactions: day.transactions
      };
    });

    return trendData || [];
  } catch (error) {
    console.error("Error fetching food cost trend:", error);
    return [];
  }
}

export async function fetchExpenseBreakdown(tenantId: string, days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: expenses } = await supabase
      .from("expenses")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("date", startDate.toISOString().split('T')[0]);

    // Group by category
    const expensesByCategory: Record<string, number> = {};
    let totalExpenses = 0;

    expenses?.forEach(expense => {
      const amount = Number(expense.amount);
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + amount;
      totalExpenses += amount;
    });

    // Convert to array with percentages
    const breakdownData = Object.entries(expensesByCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100 * 10) / 10 : 0
    }));

    return breakdownData;
  } catch (error) {
    console.error("Error fetching expense breakdown:", error);
    return [];
  }
}