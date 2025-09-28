// Standard CounterOS Calculations - Consistent across all UI

export interface PeriodData {
  storeSlug: string;
  period: string;
  sales_mxn: number;
  cogs_mxn: number;
  fixed_costs: {
    rent: number;
    energy: number;
    payroll: number;
    other: number;
  };
  auto_costs: {
    royalties_pct: number;
    marketing_pct: number;
    supervision_mxn: number;
  };
  meta_food_cost_target_pp: number;
}

export interface CalculatedMetrics {
  food_cost_pct: number;
  delta_vs_target_pp: number;
  savings_or_loss_mxn: number;
  gross_profit_mxn: number;
  total_expenses_mxn: number;
  ebitda_mxn: number;
  ebitda_pct: number;
}

// Core food cost calculation
export function calculateFoodCostPct(cogs_mxn: number, sales_mxn: number): number {
  if (sales_mxn <= 0) return 0;
  return (cogs_mxn / sales_mxn) * 100;
}

// Delta vs target in percentage points
export function calculateDeltaVsTarget(food_cost_pct: number, target_pct: number): number {
  return food_cost_pct - target_pct;
}

// Savings or loss in MXN
export function calculateSavingsOrLoss(delta_pp: number, sales_mxn: number): number {
  return (delta_pp * sales_mxn) / 100;
}

// Auto-calculated costs
export function calculateAutoCosts(sales_mxn: number, auto_costs: PeriodData['auto_costs']) {
  return {
    royalties_mxn: (sales_mxn * auto_costs.royalties_pct) / 100,
    marketing_mxn: (sales_mxn * auto_costs.marketing_pct) / 100,
    supervision_mxn: auto_costs.supervision_mxn
  };
}

// Complete P&L calculation
export function calculatePnL(data: PeriodData): CalculatedMetrics {
  const food_cost_pct = calculateFoodCostPct(data.cogs_mxn, data.sales_mxn);
  const delta_vs_target_pp = calculateDeltaVsTarget(food_cost_pct, data.meta_food_cost_target_pp);
  const savings_or_loss_mxn = calculateSavingsOrLoss(delta_vs_target_pp, data.sales_mxn);
  
  const gross_profit_mxn = data.sales_mxn - data.cogs_mxn;
  
  const auto_costs = calculateAutoCosts(data.sales_mxn, data.auto_costs);
  const total_fixed_costs = Object.values(data.fixed_costs).reduce((sum, cost) => sum + cost, 0);
  const total_auto_costs = Object.values(auto_costs).reduce((sum, cost) => sum + cost, 0);
  const total_expenses_mxn = total_fixed_costs + total_auto_costs;
  
  const ebitda_mxn = gross_profit_mxn - total_expenses_mxn;
  const ebitda_pct = data.sales_mxn > 0 ? (ebitda_mxn / data.sales_mxn) * 100 : 0;

  return {
    food_cost_pct,
    delta_vs_target_pp,
    savings_or_loss_mxn,
    gross_profit_mxn,
    total_expenses_mxn,
    ebitda_mxn,
    ebitda_pct
  };
}

// Percentage over sales for any expense
export function calculatePctOverSales(amount_mxn: number, sales_mxn: number): number {
  if (sales_mxn <= 0) return 0;
  return (amount_mxn / sales_mxn) * 100;
}

// Format currency for Mexican market
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format percentage with specified decimals
export function formatPercentage(pct: number, decimals: number = 1): string {
  return `${pct.toFixed(decimals)}%`;
}

// Format percentage points for deltas
export function formatPP(pp: number): string {
  const sign = pp > 0 ? '+' : '';
  return `${sign}${pp.toFixed(1)} pp`;
}

// Generate insights based on metrics
export function generateInsight(metrics: CalculatedMetrics, category?: string): string {
  const { delta_vs_target_pp, savings_or_loss_mxn } = metrics;
  
  if (delta_vs_target_pp > 2) {
    return `${formatPP(delta_vs_target_pp)} sobre la meta → impacto ${formatCurrency(savings_or_loss_mxn)}/mes. ${category ? `Ajusta ${category.toLowerCase()}.` : 'Revisar porciones y desperdicio.'}`;
  } else if (delta_vs_target_pp < -1) {
    return `${formatPP(delta_vs_target_pp)} bajo la meta → ahorro ${formatCurrency(Math.abs(savings_or_loss_mxn))}/mes. ¡Excelente control!`;
  } else {
    return `${formatPP(delta_vs_target_pp)} vs meta → impacto ${formatCurrency(Math.abs(savings_or_loss_mxn))}/mes. Dentro del rango.`;
  }
}