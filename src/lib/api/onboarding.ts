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

// ═══════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════

type OnboardingStep = 'stores' | 'compras' | 'ventas' | 'food_cost';

export class OnboardingError extends Error {
  constructor(
    message: string,
    public step: OnboardingStep,
    public context: Record<string, any>,
    public originalError?: any
  ) {
    super(message);
    this.name = 'OnboardingError';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      step: this.step,
      context: this.context,
      originalError: this.originalError?.message
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// RETRY LOGIC
// ═══════════════════════════════════════════════════════════════════════

const TRANSIENT_ERROR_CODES = [
  'PGRST301', // Network error
  '08006',    // Connection failure
  '08003',    // Connection does not exist
  '08000',    // Connection exception
  '57P03',    // Cannot connect now
];

function isTransientError(error: any): boolean {
  if (!error) return false;
  const code = error.code || error.error_code || '';
  return TRANSIENT_ERROR_CODES.includes(code) || 
         error.message?.includes('timeout') ||
         error.message?.includes('network');
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries = 3
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry non-transient errors
      if (!isTransientError(error)) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        logger.warn(`${operationName} failed (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`, {
          error: error?.message,
          attempt
        });
        await sleep(delayMs);
      }
    }
  }
  
  throw lastError;
}

// Helper: Find best store match using fuzzy matching
function findBestStoreMatch(
  searchName: string,
  stores: Array<{ store_id: string; name: string }>
): string {
  if (stores.length === 0) throw new Error('No stores available');
  if (stores.length === 1) return stores[0].store_id;
  
  // Normalizar búsqueda
  const normalized = searchName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  
  // Buscar match exacto
  const exactMatch = stores.find(s => 
    s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === normalized
  );
  
  if (exactMatch) return exactMatch.store_id;
  
  // Buscar match parcial (contiene)
  const partialMatch = stores.find(s =>
    s.name.toLowerCase().includes(normalized) ||
    normalized.includes(s.name.toLowerCase())
  );
  
  if (partialMatch) return partialMatch.store_id;
  
  // Fallback: primera tienda
  logger.warn('No store match found, using first store', {
    searchName,
    availableStores: stores.map(s => s.name)
  });
  
  return stores[0].store_id;
}

export async function saveOnboardingData(data: OnboardingData) {
  const tenantId = await getCurrentTenant();
  
  if (!tenantId) {
    throw new OnboardingError(
      'No tenant found for user',
      'stores',
      { userId: 'unknown' }
    );
  }
  
  logger.info('Starting onboarding save with explicit rollback support', { 
    numStores: data.stores.length,
    numFacturas: data.facturas.length,
    numVentas: data.ventas.length
  });
  
  // IDs para rollback explícito
  const createdStoreIds: string[] = [];
  const createdCompraIds: string[] = [];
  const createdVentaIds: string[] = [];
  const createdFoodCostIds: string[] = [];
  
  try {
    // ═══ PASO 1: CREAR STORES ═══
    const storesInserted = [];
    
    try {
      for (const store of data.stores) {
        const code = store.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        const slug = code;
        
        const inserted = await retryOperation(
          async () => {
            const { data: inserted, error } = await supabase
              .from('stores')
              .insert({
                tenant_id: tenantId,
                name: store.name,
                code: code,
                slug: slug,
                city: store.location,
                location: store.location,
                concept: store.concept || 'fast_casual',
                target_food_cost_pct: store.targetFoodCost,
                active: true
              })
              .select()
              .single();
            
            if (error) throw error;
            return inserted;
          },
          `Insert store: ${store.name}`
        );
        
        storesInserted.push(inserted);
        createdStoreIds.push(inserted.store_id);
        logger.debug('Store created', { storeId: inserted.store_id, name: store.name });
      }
    } catch (error) {
      throw new OnboardingError(
        'Failed to create stores',
        'stores',
        { 
          numStores: data.stores.length,
          storeNames: data.stores.map(s => s.name),
          createdSoFar: createdStoreIds.length
        },
        error
      );
    }
    
    // ═══ PASO 2: GUARDAR COMPRAS (de XMLs) ═══
    const comprasToInsert = [];
    
    try {
      for (const factura of data.facturas) {
        const storeId = findBestStoreMatch(
          factura.proveedor.nombre,
          storesInserted
        );
        
        for (const concepto of factura.conceptos) {
          comprasToInsert.push({
            tenant_id: tenantId,
            store_id: storeId,
            fecha: factura.fecha.toISOString().split('T')[0],
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
      
      if (comprasToInsert.length > 0) {
        logger.debug('Inserting compras', { count: comprasToInsert.length });
        
        const insertedCompras = await retryOperation(
          async () => {
            const { data, error } = await supabase
              .from('compras')
              .insert(comprasToInsert)
              .select('compra_id');
            
            if (error) throw error;
            return data;
          },
          'Insert compras'
        );
        
        if (insertedCompras) {
          createdCompraIds.push(...insertedCompras.map(c => c.compra_id));
        }
      }
    } catch (error) {
      throw new OnboardingError(
        'Failed to save purchases',
        'compras',
        {
          numFacturas: data.facturas.length,
          numConceptos: comprasToInsert.length,
          proveedores: [...new Set(data.facturas.map(f => f.proveedor.nombre))]
        },
        error
      );
    }
    
    // ═══ PASO 3: GUARDAR VENTAS (de CSV) ═══
    const ventasToInsert = data.ventas.map(venta => {
      const storeId = findBestStoreMatch(venta.tienda, storesInserted);
      
      return {
        tenant_id: tenantId,
        store_id: storeId,
        fecha: venta.fecha.toISOString().split('T')[0],
        monto_total: venta.montoTotal,
        num_transacciones: venta.numTransacciones || null
      };
    });
    
    try {
      if (ventasToInsert.length > 0) {
        logger.debug('Inserting ventas', { count: ventasToInsert.length });
        
        const insertedVentas = await retryOperation(
          async () => {
            const { data, error } = await supabase
              .from('ventas')
              .insert(ventasToInsert)
              .select('venta_id');
            
            if (error) throw error;
            return data;
          },
          'Insert ventas'
        );
        
        if (insertedVentas) {
          createdVentaIds.push(...insertedVentas.map(v => v.venta_id));
        }
      }
    } catch (error) {
      throw new OnboardingError(
        'Failed to save sales',
        'ventas',
        {
          numVentas: data.ventas.length,
          tiendas: [...new Set(data.ventas.map(v => v.tienda))]
        },
        error
      );
    }
    
    // ═══ PASO 4: CALCULAR FOOD_COST_DAILY ═══
    try {
      const fechas = data.ventas.map(v => v.fecha);
      const fechaInicio = new Date(Math.min(...fechas.map(f => f.getTime())));
      const fechaFin = new Date(Math.max(...fechas.map(f => f.getTime())));
      
      logger.info('Triggering food cost calculation', {
        fechaInicio: fechaInicio.toISOString().split('T')[0],
        fechaFin: fechaFin.toISOString().split('T')[0]
      });
      
      for (const store of storesInserted) {
        await retryOperation(
          async () => {
            const { error } = await supabase.rpc('recalculate_food_cost_daily', {
              p_tenant_id: tenantId,
              p_store_id: store.store_id,
              p_fecha_inicio: fechaInicio.toISOString().split('T')[0],
              p_fecha_fin: fechaFin.toISOString().split('T')[0]
            });
            
            if (error) throw error;
          },
          `Calculate food cost for store: ${store.name}`
        );
      }
      
      // Track food_cost_daily IDs for rollback
      const { data: foodCostRecords } = await supabase
        .from('food_cost_daily')
        .select('id')
        .eq('tenant_id', tenantId)
        .in('store_id', createdStoreIds);
      
      if (foodCostRecords) {
        createdFoodCostIds.push(...foodCostRecords.map(fc => fc.id));
      }
      
    } catch (error) {
      // Food cost calculation errors are logged but don't fail the entire operation
      logger.warn('Food cost calculation failed', error);
      throw new OnboardingError(
        'Failed to calculate food cost metrics',
        'food_cost',
        {
          numStores: storesInserted.length,
          storeIds: createdStoreIds
        },
        error
      );
    }
    
    // ═══ SUCCESS ═══
    logger.info('Onboarding save completed successfully', {
      stores: storesInserted.length,
      compras: comprasToInsert.length,
      ventas: ventasToInsert.length,
      foodCostRecords: createdFoodCostIds.length
    });
    
    const fechas = data.ventas.map(v => v.fecha);
    const fechaInicio = new Date(Math.min(...fechas.map(f => f.getTime())));
    const fechaFin = new Date(Math.max(...fechas.map(f => f.getTime())));
    
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
    
  } catch (error) {
    // ═══ ROLLBACK EXPLÍCITO ═══
    logger.error('Onboarding save failed, initiating explicit rollback', {
      error: error instanceof OnboardingError ? error.toJSON() : error,
      recordsToCleanup: {
        stores: createdStoreIds.length,
        compras: createdCompraIds.length,
        ventas: createdVentaIds.length,
        foodCost: createdFoodCostIds.length
      }
    });
    
    // Rollback en orden inverso
    try {
      // 1. Food cost records
      if (createdFoodCostIds.length > 0) {
        logger.info('Rolling back food_cost_daily records', { count: createdFoodCostIds.length });
        await supabase
          .from('food_cost_daily')
          .delete()
          .in('id', createdFoodCostIds);
      }
      
      // 2. Ventas
      if (createdVentaIds.length > 0) {
        logger.info('Rolling back ventas records', { count: createdVentaIds.length });
        await supabase
          .from('ventas')
          .delete()
          .in('venta_id', createdVentaIds);
      }
      
      // 3. Compras
      if (createdCompraIds.length > 0) {
        logger.info('Rolling back compras records', { count: createdCompraIds.length });
        await supabase
          .from('compras')
          .delete()
          .in('compra_id', createdCompraIds);
      }
      
      // 4. Stores (debe ser último)
      if (createdStoreIds.length > 0) {
        logger.info('Rolling back stores', { count: createdStoreIds.length });
        await supabase
          .from('stores')
          .delete()
          .in('store_id', createdStoreIds);
      }
      
      logger.info('Rollback completed successfully');
    } catch (rollbackError) {
      logger.error('Rollback failed - manual cleanup required', {
        rollbackError,
        recordsNeedingCleanup: {
          storeIds: createdStoreIds,
          compraIds: createdCompraIds,
          ventaIds: createdVentaIds,
          foodCostIds: createdFoodCostIds
        }
      });
    }
    
    // Re-throw original error
    throw error;
  }
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
