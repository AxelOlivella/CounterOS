import { useEffect, useState } from "react";
import { supabase } from "@/lib/db";
import type { DailyFoodCostRow, MonthlyPnLRow, Store, Ingredient, Product } from "@/lib/types";

const TENANT = "00000000-0000-0000-0000-000000000001";

export function useStores() {
  const [data, setData] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    supabase.from("stores")
      .select("store_id,code,name,city")
      .eq("tenant_id", TENANT)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setData((data ?? []) as Store[]);
        setLoading(false);
      });
  }, []);
  
  return { data, loading, error };
}

export function useDailyFoodCost(storeId?: string) {
  const [rows, setRows] = useState<DailyFoodCostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let q = supabase.from("daily_food_cost_view").select("*").eq("tenant_id", TENANT).order("day");
    if (storeId) q = q.eq("store_id", storeId);
    q.then(({ data, error }) => {
      if (error) setError(error.message);
      setRows((data ?? []) as DailyFoodCostRow[]);
      setLoading(false);
    });
  }, [storeId]);
  
  return { rows, loading, error };
}

export function useMonthlyPnL(storeId?: string) {
  const [rows, setRows] = useState<MonthlyPnLRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let q = supabase.from("pnl_monthly_view").select("*").eq("tenant_id", TENANT).order("period");
    if (storeId) q = q.eq("store_id", storeId);
    q.then(({ data, error }) => {
      if (error) setError(error.message);
      setRows((data ?? []) as MonthlyPnLRow[]);
      setLoading(false);
    });
  }, [storeId]);
  
  return { rows, loading, error };
}

export function useIngredients() {
  const [data, setData] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    supabase.from("ingredients")
      .select("ingredient_id,code,name,unit,cost_per_unit")
      .eq("tenant_id", TENANT)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setData((data ?? []) as Ingredient[]);
        setLoading(false);
      });
  }, []);
  
  return { data, loading, error, refetch: () => {
    setLoading(true);
    supabase.from("ingredients")
      .select("ingredient_id,code,name,unit,cost_per_unit")
      .eq("tenant_id", TENANT)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setData((data ?? []) as Ingredient[]);
        setLoading(false);
      });
  }};
}

export function useProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    supabase.from("products")
      .select("product_id,sku,name")
      .eq("tenant_id", TENANT)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setData((data ?? []) as Product[]);
        setLoading(false);
      });
  }, []);
  
  return { data, loading, error };
}