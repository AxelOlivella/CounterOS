export type DailyFoodCostRow = {
  tenant_id: string; 
  store_id: string; 
  day: string;
  revenue: number; 
  cogs: number; 
  food_cost_pct: number;
};

export type MonthlyPnLRow = {
  tenant_id: string; 
  store_id: string; 
  period: string;
  revenue: number; 
  cogs: number; 
  rent: number; 
  payroll: number;
  energy: number; 
  marketing: number; 
  royalties: number; 
  other: number;
  ebitda: number;
};

export type Store = { 
  store_id: string; 
  code: string; 
  name: string; 
  city: string | null; 
};

export type Ingredient = { 
  ingredient_id: string; 
  code: string; 
  name: string; 
  unit: string; 
  cost_per_unit: number; 
};

export type Product = { 
  product_id: string; 
  sku: string; 
  name: string; 
};