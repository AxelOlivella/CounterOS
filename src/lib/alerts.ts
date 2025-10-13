// =====================================================
// ALERTS ENGINE AVANZADO - Sistema de Alertas Quirúrgico
// Diagnósticos precisos con causas probables en lenguaje operativo
// =====================================================

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertType = 
  | 'food_cost_high' 
  | 'food_cost_trend' 
  | 'variance_critical'
  | 'variance_persistent'
  | 'ingredient_spike'
  | 'waste_portioning'
  | 'waste_theft'
  | 'waste_storage'
  | 'recipe_deviation'
  | 'supplier_issue';

// Categorías de merma para diagnóstico granular
export type WasteCategory = 
  | 'portioning'       // Porciones excesivas
  | 'preparation'      // Desperdi en corte/prep
  | 'storage'          // Caducidad, PEPS, temp
  | 'theft'            // Robo hormiga o ventas sin ticket
  | 'quality'          // Producto dañado/rechazado
  | 'supplier'         // Problema de proveedor
  | 'recipe_deviation'; // Receta incorrecta/desactualizada

// Causa raíz con probabilidad y acción
export type RootCause = {
  category: WasteCategory;
  description: string;
  probability: number; // 0-100
  action: string; // Acción específica en lenguaje operativo
};

// Alerta avanzada con diagnóstico
export interface Alert {
  id: string;
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  message: string;
  action: string;
  impact_mxn?: number;
  affected_item?: string;
  root_causes?: RootCause[]; // Causas probables ordenadas por probabilidad
  metric_context?: {
    current: number;
    expected: number;
    variance_pct: number;
  };
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
// FOOD COST ALERTS CON DIAGNÓSTICO
// =====================================================

/**
 * ⚠️ CRÍTICO: Food Cost alto persistente
 * Diagnóstico: ¿Por qué está alto? ¿Proveedor, porciones, merma?
 */
export function checkPersistentHighFoodCost(
  data: FoodCostDataPoint[],
  targetPct: number = 30,
  threshold: number = 2 // pp arriba del target
): Alert | null {
  if (data.length < 3) return null;

  const recentDays = data.slice(0, 3);
  const allAboveTarget = recentDays.every(d => d.foodCostPct > targetPct + threshold);

  if (!allAboveTarget) return null;

  const avgFoodCost = recentDays.reduce((sum, d) => sum + d.foodCostPct, 0) / recentDays.length;
  const avgRevenue = recentDays.reduce((sum, d) => sum + d.revenue, 0) / recentDays.length;
  const excessPct = avgFoodCost - targetPct;
  const dailyImpact = (excessPct / 100) * avgRevenue;

  // DIAGNÓSTICO QUIRÚRGICO de causas probables
  const root_causes: RootCause[] = [];

  if (excessPct > 5) {
    // Problema GRAVE: probablemente precios de proveedor
    root_causes.push({
      category: 'supplier',
      description: 'Aumento generalizado de precios de proveedores',
      probability: 85,
      action: 'URGENTE: Renegociar contratos + buscar proveedores alternos HOY'
    });
  }

  if (excessPct >= 2 && excessPct <= 5) {
    // Problema MEDIO: mix de causas
    root_causes.push({
      category: 'portioning',
      description: 'Porciones más grandes que receta estándar',
      probability: 75,
      action: 'Capacitar equipo en gramaje + usar balanzas en estaciones calientes'
    });
    
    root_causes.push({
      category: 'storage',
      description: 'Merma por caducidad o mal almacenamiento',
      probability: 65,
      action: 'Revisar PEPS diario + checklist de temperaturas en frigoríficos'
    });

    root_causes.push({
      category: 'theft',
      description: 'Robo hormiga o ventas sin registrar',
      probability: 50,
      action: 'Auditoría de inventario + cámara en almacén'
    });
  }

  return {
    id: `fc-persistent-${Date.now()}`,
    severity: 'critical',
    type: 'food_cost_high',
    title: `🚨 PÉRDIDAS: Food Cost ${avgFoodCost.toFixed(1)}% (meta: ${targetPct}%)`,
    message: `Llevas 3 días con FC ${excessPct.toFixed(1)}pp arriba. Estás perdiendo $${(dailyImpact * 30 / 1000).toFixed(1)}K al mes.`,
    action: 'ACCIÓN INMEDIATA: Identifica causa raíz HOY o seguirás perdiendo dinero',
    impact_mxn: dailyImpact * 30,
    root_causes,
    metric_context: {
      current: avgFoodCost,
      expected: targetPct,
      variance_pct: excessPct
    },
    created_at: new Date(),
  };
}

/**
 * 📈 TENDENCIA: Food Cost subiendo día a día
 * Proyección: Si no frenas esto hoy, ¿dónde estarás en 7 días?
 */
export function checkFoodCostTrend(
  data: FoodCostDataPoint[],
  days: number = 7
): Alert | null {
  if (data.length < days) return null;

  const recent = data.slice(0, days);
  
  // Regresión lineal simple
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
  
  const slope = numerator / denominator;
  
  if (slope > 0.3) {
    const projectedIncrease = slope * 7;
    const currentAvg = avgY;
    
    const root_causes: RootCause[] = [];
    
    if (slope > 0.5) {
      // Subida RÁPIDA
      root_causes.push({
        category: 'supplier',
        description: 'Incremento reciente de precios en proveedores clave',
        probability: 85,
        action: 'Comparar facturas de esta semana vs semana pasada POR ITEM'
      });
    }
    
    root_causes.push({
      category: 'portioning',
      description: 'Relajamiento progresivo en control de porciones',
      probability: 70,
      action: 'Supervisar línea durante rush + reentrenar a cocineros HOY'
    });

    root_causes.push({
      category: 'preparation',
      description: 'Aumento en merma de preparación',
      probability: 55,
      action: 'Revisar técnicas de corte + optimizar uso de subproductos'
    });
    
    return {
      id: `fc-trend-${Date.now()}`,
      severity: slope > 0.5 ? 'critical' : 'warning',
      type: 'food_cost_trend',
      title: `⚠️ TENDENCIA: FC subiendo ${slope.toFixed(2)}% diario`,
      message: `En 7 días más tu FC será ${projectedIncrease.toFixed(1)}pp MÁS ALTO. Frena esto HOY.`,
      action: root_causes[0].action,
      root_causes,
      metric_context: {
        current: currentAvg,
        expected: currentAvg - projectedIncrease,
        variance_pct: projectedIncrease
      },
      created_at: new Date(),
    };
  }
  
  return null;
}

// =====================================================
// VARIANCE ALERTS CON DIAGNÓSTICO QUIRÚRGICO
// =====================================================

/**
 * 🎯 PROBLEMA ESPECÍFICO: Variancia crítica por ingrediente
 * Diagnóstico: ¿Sobra o falta? ¿Por qué? ¿Qué hacer?
 */
export function checkCriticalVariance(
  variances: VarianceDataPoint[],
  criticalThreshold: number = 15
): Alert[] {
  const alerts: Alert[] = [];
  
  const criticalItems = variances.filter(v => Math.abs(v.variance_pct) > criticalThreshold);
  
  criticalItems.slice(0, 5).forEach(item => {
    const isOverage = item.variance_pct > 0;
    const absVariance = Math.abs(item.variance_pct);
    
    // DIAGNÓSTICO QUIRÚRGICO
    const root_causes: RootCause[] = [];
    
    if (isOverage) {
      // SOBRA ingrediente = alguien lo está desperdiciando o robando
      if (absVariance > 30) {
        root_causes.push({
          category: 'theft',
          description: 'Posible robo hormiga o ventas sin registrar en sistema',
          probability: 75,
          action: `Instalar cámara en área de ${item.ingredient_name} + auditar inventario DIARIO`
        });
      }
      
      root_causes.push({
        category: 'portioning',
        description: `Porciones ${absVariance.toFixed(0)}% más grandes que receta`,
        probability: 85,
        action: `Pesar ${item.ingredient_name} en CADA preparación durante 3 días + reentrenar`
      });
      
      root_causes.push({
        category: 'preparation',
        description: 'Desperdicio excesivo en corte/preparación',
        probability: 60,
        action: 'Revisar técnica de chef + capacitar en aprovechamiento'
      });
      
      root_causes.push({
        category: 'storage',
        description: 'Producto vencido o dañado por mala refrigeración',
        probability: 45,
        action: 'Revisar temperaturas + PEPS + rotación de producto'
      });
    } else {
      // FALTA ingrediente = robo o ventas sin registrar
      root_causes.push({
        category: 'theft',
        description: 'Robo de producto terminado o venta sin ticket',
        probability: 80,
        action: 'Auditar tickets del día vs inventario + políticas antirrobo'
      });
      
      root_causes.push({
        category: 'recipe_deviation',
        description: 'Receta desactualizada o incorrecta en sistema',
        probability: 55,
        action: 'Actualizar receta en sistema vs preparación REAL de cocina'
      });
      
      root_causes.push({
        category: 'supplier',
        description: 'Compras no registradas correctamente',
        probability: 40,
        action: 'Revisar facturas vs entradas en sistema'
      });
    }
    
    alerts.push({
      id: `variance-${item.ingredient_name}-${Date.now()}`,
      severity: absVariance > 25 ? 'critical' : 'warning',
      type: 'variance_critical',
      title: `🎯 PROBLEMA EN: ${item.ingredient_name.toUpperCase()}`,
      message: `${isOverage ? 'SOBRA' : 'FALTA'} ${absVariance.toFixed(1)}% de ${item.ingredient_name}. ${isOverage ? `Compraste ${Math.abs(item.actual_qty - item.theoretical_qty).toFixed(1)} de más` : `Se usó ${Math.abs(item.actual_qty - item.theoretical_qty).toFixed(1)} de más`}.`,
      action: `ACCIÓN: ${root_causes[0].action}`,
      impact_mxn: Math.abs(item.cost_impact_mxn),
      affected_item: item.ingredient_name,
      root_causes,
      metric_context: {
        current: item.actual_qty,
        expected: item.theoretical_qty,
        variance_pct: item.variance_pct
      },
      created_at: new Date(),
    });
  });
  
  return alerts;
}

/**
 * 🔁 PROBLEMA SISTÉMICO: Variancia persistente
 * Este NO es un problema de 1 día, es estructural
 */
export function checkPersistentVariance(
  historicalVariances: Map<string, number[]>,
  threshold: number = 10
): Alert[] {
  const alerts: Alert[] = [];
  
  historicalVariances.forEach((variances, ingredientName) => {
    const recentDays = variances.slice(0, 5);
    const persistentHigh = recentDays.filter(v => Math.abs(v) > threshold).length >= 4;
    
    if (persistentHigh && recentDays.length >= 5) {
      const avgVariance = recentDays.reduce((sum, v) => sum + Math.abs(v), 0) / recentDays.length;
      const isOverage = variances[0] > 0;
      
      const root_causes: RootCause[] = [{
        category: isOverage ? 'portioning' : 'recipe_deviation',
        description: 'Problema ESTRUCTURAL no de un día',
        probability: 90,
        action: isOverage 
          ? `Rediseñar proceso de porciones para ${ingredientName} + capacitación formal`
          : `Actualizar receta de ${ingredientName} en sistema vs realidad de cocina`
      }];
      
      alerts.push({
        id: `variance-persist-${ingredientName}-${Date.now()}`,
        severity: 'warning',
        type: 'variance_persistent',
        title: `🔁 PROBLEMA SISTÉMICO: ${ingredientName}`,
        message: `${ingredientName} lleva 5+ días con variancia promedio ${avgVariance.toFixed(1)}%. Esto NO es normal.`,
        action: root_causes[0].action,
        affected_item: ingredientName,
        root_causes,
        created_at: new Date(),
      });
    }
  });
  
  return alerts;
}

/**
 * 💰 PROVEEDOR: Spike de precio
 */
export function checkIngredientPriceSpike(
  currentCost: Map<string, number>,
  historicalCost: Map<string, number>,
  threshold: number = 20
): Alert[] {
  const alerts: Alert[] = [];
  
  currentCost.forEach((current, ingredientName) => {
    const historical = historicalCost.get(ingredientName);
    if (!historical) return;
    
    const pctChange = ((current - historical) / historical) * 100;
    
    if (pctChange > threshold) {
      const root_causes: RootCause[] = [{
        category: 'supplier',
        description: `Aumento ${pctChange.toFixed(0)}% en precio de proveedor`,
        probability: 95,
        action: `Negociar con proveedor actual + cotizar 2 alternos + considerar ajustar precio de venta`
      }];
      
      alerts.push({
        id: `price-spike-${ingredientName}-${Date.now()}`,
        severity: pctChange > 30 ? 'critical' : 'warning',
        type: 'ingredient_spike',
        title: `💰 PROVEEDOR: ${ingredientName} subió ${pctChange.toFixed(0)}%`,
        message: `Precio pasó de $${historical.toFixed(2)} → $${current.toFixed(2)}/unidad`,
        action: root_causes[0].action,
        affected_item: ingredientName,
        root_causes,
        metric_context: {
          current,
          expected: historical,
          variance_pct: pctChange
        },
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
 * Genera TODAS las alertas accionables con diagnóstico quirúrgico
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
  
  // Sort: critical > warning > info
  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

// =====================================================
// UTILIDADES
// =====================================================

export function formatImpact(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

export function getAlertBadgeVariant(severity: AlertSeverity): 'destructive' | 'secondary' | 'default' {
  switch (severity) {
    case 'critical': return 'destructive';
    case 'warning': return 'secondary';
    case 'info': return 'default';
  }
}
