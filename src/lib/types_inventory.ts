// Type definitions for Inventory Count System

export type InventoryCount = {
  count_id: string;
  tenant_id: string;
  store_id: string;
  ingredient_id: string;
  count_date: string;
  physical_qty: number;
  unit: string;
  counted_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type RealVarianceRow = {
  day: string;
  store_id: string;
  ingredient_id: string;
  ingredient_name: string;
  ingredient_code: string;
  unit: string;
  cost_per_unit: number;
  theoretical_qty: number;
  actual_qty: number;
  variance_qty: number;
  variance_pct: number;
  cost_impact_mxn: number;
  counted_by: string | null;
  notes: string | null;
};

export type InventoryCountInput = {
  ingredient_id: string;
  physical_qty: number;
  notes?: string;
};
