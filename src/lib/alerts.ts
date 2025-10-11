// =====================================================
// ALERTS ENGINE - Sistema inteligente de alertas
// Genera alertas basadas en food cost y variance analysis
// =====================================================

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertType = 
  | 'food_cost_high' 
  | 'food_cost_trend' 
  | 'variance_critical'
  | 'variance_persistent'
  | 'ingredient_spike'
  | 'mix_shift';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  message: string;
  action: string;
  impact_mxn?: number;
  affected_item?: string;
  created_at: Date;
}

interface FoodCostDataPoint {
  day: string;
  foodCostPct: number;
  revenue: number;
  cogs: number;
}

interface VarianceDataPoint {
  ingredient_name: string;
  variance_pct: number;
  cost_impact_mxn: number;
  theoretical_qty: number;
  actual_qty: number;
}

// =====================================================
// FOOD COST ALERTS
// =====================================================

/**
 * Alerta 1: Food Cost alto persistente (>3 días consecutivos sobre target)
 */
export function checkPersistentHighFoodCost(
  data: FoodCostDataPoint[],
  targetPct: number = 30,
  threshold: number = 5
): Alert | null {
  if (data.length < 3) return null;

  const recentDays = data.slice(0, 3);
  const allAboveTarget = recentDays.every(d => d.foodCostPct > targetPct + threshold);

  if (!allAboveTarget) return null;

  const avgFoodCost = recentDays.reduce((sum, d) => sum + d.foodCostPct, 0) / recentDays.length;
  const avgRevenue = recentDays.reduce((sum, d) => sum + d.revenue, 0) / recentDays.length;
  const excessPct = avgFoodCost - targetPct;
  const dailyImpact = (excessPct / 100) * avgRevenue;

  return {
    id: `fc-persistent-${Date.now()}`,
    severity: 'critical',
    type: 'food_cost_high',
    title: `Food Cost Crítico: ${avgFoodCost.toFixed(1)}% por 3+ días`,
    message: `Tu food cost ha estado ${excessPct.toFixed(1)} puntos por encima del target (${targetPct}%) durante ${recentDays.length} días consecutivos.`,
    action: 'Revisar inmediatamente: porciones, merma, precios de proveedores y product mix.',
    impact_mxn: dailyImpact * 30, // Monthly impact
    created_at: new Date(),
  };
}

/**
 * Alerta 2: Tendencia creciente de Food Cost
 */
export function checkFoodCostTrend(
  data: FoodCostDataPoint[],
  days: number = 7
): Alert | null {
  if (data.length < days) return null;

  const recent = data.slice(0, days);
  
  // Simple linear regression to detect trend
  const avgX = (days - 1) / 2;
  const avgY = recent.reduce((sum, d) => sum + d.foodCostPct, 0) / days;
  
  let numerator = 0;
  let denominator = 0;
  
  recent.forEach((point, i) => {
    const x = i;
    const y = point.foodCostPct;
    numerator += (x - avgX) * (y - avgY);
    denominator += (x - avgX) ** 2;
  });
  
  const slope = numerator / denominator; // Positive = increasing trend
  
  if (slope > 0.3) { // Increasing more than 0.3% per day
    const projectedIncrease = slope * 30; // 30 days projection
    
    return {
      id: `fc-trend-${Date.now()}`,
      severity: 'warning',
      type: 'food_cost_trend',
      title: `Tendencia Creciente en Food Cost`,
      message: `Food cost ha subido ${(slope * days).toFixed(1)}% en los últimos ${days} días. Si continúa, aumentará ${projectedIncrease.toFixed(1)}% en 30 días.`,
      action: 'Analizar causas: inflación de proveedores, cambio en product mix, o aumento en merma.',
      created_at: new Date(),
    };
  }
  
  return null;
}

// =====================================================
// VARIANCE ALERTS
// =====================================================

/**
 * Alerta 3: Variancia crítica en ingrediente específico
 */
export function checkCriticalVariance(
  variances: VarianceDataPoint[],
  criticalThreshold: number = 15
): Alert[] {
  const alerts: Alert[] = [];
  
  const criticalItems = variances.filter(v => Math.abs(v.variance_pct) > criticalThreshold);
  
  criticalItems.slice(0, 3).forEach(item => { // Top 3 most critical
    const isOverage = item.variance_pct > 0;
    const absVariance = Math.abs(item.variance_pct);
    
    alerts.push({
      id: `variance-${item.ingredient_name}-${Date.now()}`,
      severity: absVariance > 25 ? 'critical' : 'warning',
      type: 'variance_critical',
      title: `${isOverage ? 'Exceso' : 'Faltante'} de ${item.ingredient_name}: ${absVariance.toFixed(1)}%`,
      message: `${isOverage ? 'Compraste' : 'Usaste'} ${Math.abs(item.actual_qty - item.theoretical_qty).toFixed(1)} ${item.ingredient_name} ${isOverage ? 'de más' : 'de menos'} vs lo esperado.`,
      action: isOverage 
        ? 'Verificar: ¿Sobre-compra? ¿Merma por vencimiento? ¿Porciones incorrectas?'
        : 'Verificar: ¿Sub-reporte de compras? ¿Robo? ¿Error en recetas?',
      impact_mxn: Math.abs(item.cost_impact_mxn),
      affected_item: item.ingredient_name,
      created_at: new Date(),
    });
  });
  
  return alerts;
}

/**
 * Alerta 4: Variancia persistente (mismo ingrediente >5 días con variancia alta)
 */
export function checkPersistentVariance(
  historicalVariances: Map<string, number[]>, // ingredient_name -> array of variance_pct
  threshold: number = 10
): Alert[] {
  const alerts: Alert[] = [];
  
  historicalVariances.forEach((variances, ingredientName) => {
    const recentDays = variances.slice(0, 5);
    const persistentHigh = recentDays.filter(v => Math.abs(v) > threshold).length >= 4;
    
    if (persistentHigh && recentDays.length >= 5) {
      const avgVariance = recentDays.reduce((sum, v) => sum + Math.abs(v), 0) / recentDays.length;
      
      alerts.push({
        id: `variance-persist-${ingredientName}-${Date.now()}`,
        severity: 'warning',
        type: 'variance_persistent',
        title: `Variancia Persistente: ${ingredientName}`,
        message: `${ingredientName} ha tenido variancia promedio de ${avgVariance.toFixed(1)}% durante 5+ días.`,
        action: 'Problema sistémico detectado. Revisar: proceso de compra, almacenamiento, o porciones de forma estructural.',
        affected_item: ingredientName,
        created_at: new Date(),
      });
    }
  });
  
  return alerts;
}

/**
 * Alerta 5: Spike en precio de ingrediente (costo unitario subió >20%)
 */
export function checkIngredientPriceSpike(
  currentCost: Map<string, number>, // ingredient_name -> current cost_per_unit
  historicalCost: Map<string, number>, // ingredient_name -> historical average
  threshold: number = 20
): Alert[] {
  const alerts: Alert[] = [];
  
  currentCost.forEach((current, ingredientName) => {
    const historical = historicalCost.get(ingredientName);
    if (!historical) return;
    
    const pctChange = ((current - historical) / historical) * 100;
    
    if (pctChange > threshold) {
      alerts.push({
        id: `price-spike-${ingredientName}-${Date.now()}`,
        severity: 'warning',
        type: 'ingredient_spike',
        title: `Precio de ${ingredientName} subió ${pctChange.toFixed(1)}%`,
        message: `Costo pasó de $${historical.toFixed(2)} a $${current.toFixed(2)} por unidad.`,
        action: 'Acciones: Negociar con proveedor, buscar alternativo, o ajustar precios de venta.',
        affected_item: ingredientName,
        created_at: new Date(),
      });
    }
  });
  
  return alerts;
}

// =====================================================
// MASTER ALERT GENERATOR
// =====================================================

export interface AlertsInput {
  foodCostData: FoodCostDataPoint[];
  varianceData: VarianceDataPoint[];
  targetFoodCost?: number;
  historicalVariances?: Map<string, number[]>;
  currentCosts?: Map<string, number>;
  historicalCosts?: Map<string, number>;
}

/**
 * Genera todas las alertas relevantes basadas en los datos disponibles
 */
export function generateAlerts(input: AlertsInput): Alert[] {
  const alerts: Alert[] = [];
  
  // Food Cost Alerts
  const persistentAlert = checkPersistentHighFoodCost(
    input.foodCostData, 
    input.targetFoodCost
  );
  if (persistentAlert) alerts.push(persistentAlert);
  
  const trendAlert = checkFoodCostTrend(input.foodCostData);
  if (trendAlert) alerts.push(trendAlert);
  
  // Variance Alerts
  if (input.varianceData.length > 0) {
    const criticalAlerts = checkCriticalVariance(input.varianceData);
    alerts.push(...criticalAlerts);
  }
  
  if (input.historicalVariances) {
    const persistentAlerts = checkPersistentVariance(input.historicalVariances);
    alerts.push(...persistentAlerts);
  }
  
  if (input.currentCosts && input.historicalCosts) {
    const priceAlerts = checkIngredientPriceSpike(
      input.currentCosts,
      input.historicalCosts
    );
    alerts.push(...priceAlerts);
  }
  
  // Sort by severity: critical > warning > info
  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Formatea el impacto monetario para display
 */
export function formatImpact(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M MXN`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K MXN`;
  }
  return `$${amount.toFixed(0)} MXN`;
}

/**
 * Get alert badge variant for UI
 */
export function getAlertBadgeVariant(severity: AlertSeverity): 'destructive' | 'secondary' | 'default' {
  switch (severity) {
    case 'critical': return 'destructive';
    case 'warning': return 'secondary';
    case 'info': return 'default';
  }
}
