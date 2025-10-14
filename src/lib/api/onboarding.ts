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

/**
 * @deprecated Esta función ya NO se usa. Ahora el onboarding usa la edge function 
 * `save-onboarding-transactional` que maneja todo en una transacción atómica de PostgreSQL.
 * 
 * Ver implementación actual en:
 * - ProcessingPage.tsx (frontend llama a edge function)
 * - supabase/functions/save-onboarding-transactional/index.ts (edge function)
 * - Stored procedure: save_onboarding_transaction() en PostgreSQL
 * 
 * Esta función tenía rollback manual y múltiples llamadas a Supabase.
 * La nueva arquitectura usa transacción atómica con rollback automático de PostgreSQL.
 * 
 * Comentada completamente para evitar errores de TypeScript con el nuevo schema que incluye brand_id.
 */

/*
export async function saveOnboardingData_DEPRECATED(data: OnboardingData) {
  // ... código deprecado comentado ...
  // Ver commit history o git blame para recuperar código si es necesario
}
*/

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
