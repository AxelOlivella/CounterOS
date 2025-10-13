import { supabase } from '@/integrations/supabase/client';
import { getCurrentTenant } from '@/lib/db_new';
import { logger } from '@/lib/logger';
import type { FacturaParsed, VentaParsed } from '@/lib/parsers/types';

interface OnboardingData {
  stores: Array<{
    name: string;
    location: string;
    concept: string;
    targetFoodCost: number;
  }>;
  facturas: FacturaParsed[];
  ventas: VentaParsed[];
}

export async function saveOnboardingData(data: OnboardingData) {
  const tenantId = await getCurrentTenant();
  
  if (!tenantId) {
    throw new Error('No tenant found for user');
  }
  
  logger.info('Saving onboarding data', { 
    numStores: data.stores.length,
    numFacturas: data.facturas.length,
    numVentas: data.ventas.length
  });
  
  // 1. CREAR STORES
  const storesInserted = [];
  
  for (const store of data.stores) {
    const code = store.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const { data: inserted, error } = await supabase
      .from('stores')
      .insert({
        tenant_id: tenantId,
        name: store.name,
        code: code,
        city: store.location,
        target_food_cost_pct: store.targetFoodCost,
        active: true
      })
      .select()
      .single();
    
    if (error) {
      logger.error('Failed to insert store', error);
      throw error;
    }
    
    storesInserted.push(inserted);
    logger.debug('Store created', { storeId: inserted.store_id, name: store.name });
  }
  
  // 2. GUARDAR COMPRAS (de XMLs)
  const comprasToInsert = [];
  
  for (const factura of data.facturas) {
    // Encontrar store por nombre (o usar primera si solo hay 1)
    const storeId = storesInserted[0].store_id; // TODO: mapear por nombre si múltiples
    
    for (const concepto of factura.conceptos) {
      comprasToInsert.push({
        tenant_id: tenantId,
        store_id: storeId,
        fecha: factura.fecha.toISOString().split('T')[0], // YYYY-MM-DD
        folio: factura.folio || null,
        proveedor: factura.proveedor.nombre,
        rfc_proveedor: factura.proveedor.rfc || null,
        concepto: concepto.descripcion,
        categoria: concepto.categoria,
        monto: concepto.importe,
        moneda: factura.moneda || 'MXN',
        uuid_fiscal: factura.uuid
      });
    }
  }
  
  logger.debug('Inserting compras', { count: comprasToInsert.length });
  
  const { error: comprasError } = await supabase
    .from('compras')
    .insert(comprasToInsert);
  
  if (comprasError) {
    logger.error('Failed to insert compras', comprasError);
    throw comprasError;
  }
  
  // 3. GUARDAR VENTAS (de CSV)
  const ventasToInsert = data.ventas.map(venta => {
    // Encontrar store por nombre
    const store = storesInserted.find(s => 
      s.name.toLowerCase() === venta.tienda.toLowerCase()
    ) || storesInserted[0]; // fallback a primera tienda
    
    return {
      tenant_id: tenantId,
      store_id: store.store_id,
      fecha: venta.fecha.toISOString().split('T')[0],
      monto_total: venta.montoTotal,
      num_transacciones: venta.numTransacciones || null
    };
  });
  
  logger.debug('Inserting ventas', { count: ventasToInsert.length });
  
  const { error: ventasError } = await supabase
    .from('ventas')
    .insert(ventasToInsert);
  
  if (ventasError) {
    logger.error('Failed to insert ventas', ventasError);
    throw ventasError;
  }
  
  // 4. CALCULAR FOOD_COST_DAILY
  // Encontrar rango de fechas
  const fechas = data.ventas.map(v => v.fecha);
  const fechaInicio = new Date(Math.min(...fechas.map(f => f.getTime())));
  const fechaFin = new Date(Math.max(...fechas.map(f => f.getTime())));
  
  logger.info('Triggering food cost calculation', {
    fechaInicio: fechaInicio.toISOString().split('T')[0],
    fechaFin: fechaFin.toISOString().split('T')[0]
  });
  
  for (const store of storesInserted) {
    const { error: calcError } = await supabase.rpc('recalculate_food_cost_daily', {
      p_tenant_id: tenantId,
      p_store_id: store.store_id,
      p_fecha_inicio: fechaInicio.toISOString().split('T')[0],
      p_fecha_fin: fechaFin.toISOString().split('T')[0]
    });
    
    if (calcError) {
      logger.error('Failed to calculate food cost', calcError);
      // No throw - continuamos aunque falle cálculo
    }
  }
  
  logger.info('Onboarding data saved successfully', {
    storesCreated: storesInserted.length,
    comprasSaved: comprasToInsert.length,
    ventasSaved: ventasToInsert.length
  });
  
  return {
    stores: storesInserted,
    summary: {
      totalCompras: comprasToInsert.reduce((sum, c) => sum + c.monto, 0),
      totalVentas: ventasToInsert.reduce((sum, v) => sum + v.monto_total, 0),
      periodo: {
        inicio: fechaInicio,
        fin: fechaFin
      }
    }
  };
}

// Helper para calcular food cost de los datos parseados
export function calculateFoodCostSummary(
  facturas: FacturaParsed[],
  ventas: VentaParsed[]
) {
  const totalCompras = facturas.reduce((sum, f) => {
    const facturaTotal = f.conceptos.reduce((s, c) => s + c.importe, 0);
    return sum + facturaTotal;
  }, 0);
  
  const totalVentas = ventas.reduce((sum, v) => sum + v.montoTotal, 0);
  
  const foodCost = totalVentas > 0 ? (totalCompras / totalVentas) * 100 : 0;
  
  return {
    foodCost,
    compras: totalCompras,
    ventas: totalVentas
  };
}
