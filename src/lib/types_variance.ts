// Type definitions for Variance Analysis
// Complementa types_new.ts con tipos específicos de variancia

export type VarianceRow = {
  day: string; // date as string
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
};

export type TopVarianceIngredient = {
  ingredient_id: string;
  ingredient_name: string;
  total_cost_impact: number;
  avg_variance_pct: number;
  days_with_variance: number;
};

export type PurchaseRow = {
  purchase_id: string;
  tenant_id: string;
  store_id: string | null;
  cfdi_uuid: string;
  issue_date: string;
  supplier_name: string | null;
  total_amount: number;
  created_at: string;
};

export type PurchaseItemRow = {
  item_id: string;
  purchase_id: string;
  tenant_id: string;
  cfdi_sku: string;
  cfdi_description: string | null;
  ingredient_id: string | null;
  qty: number;
  unit: string;
  unit_price: number;
  amount: number;
  created_at: string;
};

export type CFDIMappingRow = {
  mapping_id: string;
  tenant_id: string;
  cfdi_sku: string;
  cfdi_description: string | null;
  ingredient_id: string;
  confidence_score: number;
  created_at: string;
  updated_at: string;
};
