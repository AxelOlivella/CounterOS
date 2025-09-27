// src/lib/db.ts
import { supabase } from "@/integrations/supabase/client";

// Ejemplos de queries útiles
export async function fetchDailyFoodCost(tenantId: string, storeId?: string) {
  let q = supabase.from("daily_food_cost_view").select("*").eq("tenant_id", tenantId).order("day");
  if (storeId) q = q.eq("store_id", storeId);
  return q;
}

export async function fetchMonthlyPnL(tenantId: string, storeId?: string) {
  let q = supabase.from("pnl_monthly_view").select("*").eq("tenant_id", tenantId).order("period");
  if (storeId) q = q.eq("store_id", storeId);
  return q;
}

export async function fetchTenants() {
  return supabase.from("tenants").select("*");
}

export async function fetchStores(tenantId: string) {
  return supabase.from("stores").select("*").eq("tenant_id", tenantId);
}

export async function fetchIngredients(tenantId: string) {
  return supabase.from("ingredients").select("*").eq("tenant_id", tenantId);
}

export async function fetchProducts(tenantId: string) {
  return supabase.from("products").select("*").eq("tenant_id", tenantId);
}

export async function fetchSales(tenantId: string, storeId?: string) {
  let q = supabase.from("sales").select("*").eq("tenant_id", tenantId).order("sold_at", { ascending: false });
  if (storeId) q = q.eq("store_id", storeId);
  return q;
}