// Financial calculations and utilities for CounterOS
// Consistent formulas across the application

/**
 * Calculate percentage with safe division
 * @param numerator - The numerator
 * @param denominator - The denominator
 * @returns Percentage (0-100 scale)
 */
export const pct = (numerator: number, denominator: number): number => {
  if (!denominator || denominator === 0) return 0;
  return (numerator / denominator) * 100;
};

/**
 * Calculate percentage points delta with 1 decimal precision
 * @param actualPct - Actual percentage
 * @param metaPct - Target/meta percentage
 * @returns Delta in percentage points (pp)
 */
export const ppDelta = (actualPct: number, metaPct: number): number => {
  return +(actualPct - metaPct).toFixed(1);
};

/**
 * Calculate monetary impact from percentage points
 * @param pp - Percentage points (can be negative)
 * @param ventas - Total sales amount
 * @returns Monetary impact (positive = savings, negative = extra cost)
 */
export const moneyImpact = (pp: number, ventas: number): number => {
  return +(ventas * (pp / 100)).toFixed(2);
};

/**
 * Calculate Food Cost percentage
 * Standard formula: COGS / Sales * 100
 */
export const foodCostPct = (cogs: number, sales: number): number => {
  return pct(cogs, sales);
};

/**
 * Calculate EBITDA
 * Formula: Sales - COGS - OPEX
 */
export const ebitda = (sales: number, cogs: number, opex: number): number => {
  return sales - cogs - opex;
};

/**
 * Calculate total OPEX from individual components
 */
export const totalOpex = (
  rent: number,
  payroll: number,
  energy: number,
  marketing: number,
  royalties: number,
  other: number
): number => {
  return rent + payroll + energy + marketing + royalties + other;
};

/**
 * Calculate automatic percentages (blocked fields)
 */
export const calculateAutoPercentages = (sales: number) => {
  const ROYALTY_PCT = 6; // 6% standard
  const MARKETING_PCT = 3; // 3% standard
  
  return {
    royalties: +(sales * (ROYALTY_PCT / 100)).toFixed(2),
    marketing: +(sales * (MARKETING_PCT / 100)).toFixed(2),
    royaltyPct: ROYALTY_PCT,
    marketingPct: MARKETING_PCT,
  };
};

/**
 * Format currency for display (Mexican Peso)
 */
export const formatMXN = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format percentage with 1 decimal place
 */
export const formatPct = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};

/**
 * Format percentage points (pp) with explicit unit
 */
export const formatPP = (pp: number): string => {
  const sign = pp > 0 ? '+' : '';
  return `${sign}${pp.toFixed(1)}pp`;
};

/**
 * Get impact color class based on pp delta
 */
export const getImpactColor = (pp: number): string => {
  if (pp < -1) return 'text-warn-500'; // High negative impact
  if (pp < 0) return 'text-warn-400'; // Negative impact
  if (pp > 1) return 'text-accent-500'; // High positive impact
  if (pp > 0) return 'text-accent-400'; // Positive impact
  return 'text-gray-500'; // Neutral
};

/**
 * Get badge variant based on pp delta
 */
export const getImpactBadge = (pp: number): 'success' | 'warning' | 'destructive' | 'secondary' => {
  if (pp < -1) return 'destructive';
  if (pp < 0) return 'warning';
  if (pp > 0) return 'success';
  return 'secondary';
};

/**
 * Validate financial inputs
 */
export const validateFinancialInput = (value: number, fieldName: string): string | null => {
  if (value < 0) return `${fieldName} no puede ser negativo`;
  if (!isFinite(value)) return `${fieldName} debe ser un número válido`;
  if (value > 999999999) return `${fieldName} excede el límite máximo`;
  return null;
};

/**
 * Calculate P&L summary from inputs
 */
export interface PnLData {
  sales: number;
  cogs: number;
  rent: number;
  payroll: number;
  energy: number;
  other: number;
  // Auto-calculated fields
  marketing: number;
  royalties: number;
  grossProfit: number;
  totalOpex: number;
  ebitda: number;
  foodCostPct: number;
  ebitdaPct: number;
}

export const calculatePnL = (inputs: {
  sales: number;
  cogs: number;
  rent: number;
  payroll: number;
  energy: number;
  other: number;
}): PnLData => {
  const { sales, cogs, rent, payroll, energy, other } = inputs;
  const auto = calculateAutoPercentages(sales);
  
  const grossProfit = sales - cogs;
  const opex = totalOpex(rent, payroll, energy, auto.marketing, auto.royalties, other);
  const finalEbitda = ebitda(sales, cogs, opex);
  
  return {
    ...inputs,
    marketing: auto.marketing,
    royalties: auto.royalties,
    grossProfit,
    totalOpex: opex,
    ebitda: finalEbitda,
    foodCostPct: foodCostPct(cogs, sales),
    ebitdaPct: pct(finalEbitda, sales),
  };
};