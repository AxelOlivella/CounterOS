// Menu Engineering types
export type MenuCategory = 'star' | 'plow_horse' | 'puzzle' | 'dog';

export interface MenuItemPerformance {
  product_id: string;
  sku: string;
  product_name: string;
  times_sold: number;
  total_qty_sold: number;
  total_revenue: number;
  food_cost_per_unit: number;
  avg_price: number;
  contribution_margin: number;
  contribution_margin_pct: number;
  popularity_pct: number;
  popularity_threshold: number;
  is_popular: boolean;
  is_high_margin: boolean;
  menu_category: MenuCategory;
}

// Supplier Management types
export interface Supplier {
  supplier_id: string;
  tenant_id: string;
  name: string;
  rfc?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  payment_terms: string;
  payment_terms_days: number;
  discount_early_payment: number;
  active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierPerformance {
  supplier_id: string;
  name: string;
  rfc?: string;
  payment_terms: string;
  payment_terms_days: number;
  active: boolean;
  total_purchases: number;
  total_spent: number;
  avg_purchase_amount: number;
  last_purchase_date?: string;
  purchases_last_30d: number;
  price_score?: number;
  quality_score?: number;
  delivery_score?: number;
  service_score?: number;
  payment_terms_score?: number;
  weighted_score: number;
  last_evaluation_date?: string;
}

export interface SupplierScorecard {
  scorecard_id: string;
  tenant_id: string;
  supplier_id: string;
  evaluation_date: string;
  price_score: number;
  quality_score: number;
  delivery_score: number;
  service_score: number;
  payment_terms_score: number;
  notes?: string;
  evaluated_by?: string;
  created_at: string;
}

// Product Mix types
export interface ProductMixImpact {
  product_id: string;
  sku: string;
  product_name: string;
  sales_pct: number;
  food_cost_pct: number;
  contribution_margin_dollars: number;
  revenue: number;
  food_cost: number;
  impact_on_aggregate_food_cost: number;
}
