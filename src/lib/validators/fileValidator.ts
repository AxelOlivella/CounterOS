import { validateCSVVentas, calcularResumenVentas, parseCSVVentas } from '@/lib/parsers/csvParser';
import { extractResumenFactura, validarXMLCFDI } from '@/lib/parsers/xmlParser';

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  preview?: any;
}

export interface XMLValidationResult {
  fileName: string;
  valid: boolean;
  error?: string;
  preview?: {
    proveedor: string;
    total: number;
    fecha: string;
  };
}

export interface CSVValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  preview?: {
    totalVentas: number;
    numRegistros: number;
    fechaInicio: Date;
    fechaFin: Date;
    tiendas: string[];
    ventaPromedioDiaria: number;
    primeras5Filas: any[];
  };
}

/**
 * Valida múltiples archivos XML de facturas
 * Retorna array con resultados por archivo
 */
export async function validateXMLFacturas(
  facturaFiles: Array<{ name: string; content: string }>
): Promise<{
  allValid: boolean;
  results: XMLValidationResult[];
  totalFacturas: number;
  totalMonto: number;
}> {
  const results: XMLValidationResult[] = [];
  let totalMonto = 0;

  for (const file of facturaFiles) {
    try {
      // Validar estructura XML
      const isValid = validarXMLCFDI(file.content);
      
      if (!isValid) {
        results.push({
          fileName: file.name,
          valid: false,
          error: 'No es un CFDI válido (falta nodo Comprobante)',
        });
        continue;
      }

      // Extraer resumen
      const resumen = extractResumenFactura(file.content);
      
      if (!resumen) {
        results.push({
          fileName: file.name,
          valid: false,
          error: 'No se pudo extraer información del CFDI',
        });
        continue;
      }

      // Validar que tenga UUID
      if (!file.content.includes('UUID') && !file.content.includes('uuid')) {
        results.push({
          fileName: file.name,
          valid: false,
          error: 'Falta UUID fiscal (TimbreFiscalDigital)',
        });
        continue;
      }

      // Validar monto razonable
      if (resumen.total <= 0) {
        results.push({
          fileName: file.name,
          valid: false,
          error: `Total inválido: $${resumen.total}`,
        });
        continue;
      }

      if (resumen.total > 1_000_000) {
        results.push({
          fileName: file.name,
          valid: true,
          preview: resumen,
        });
        // Warning but still valid
        console.warn(`Factura ${file.name} tiene monto muy alto: $${resumen.total}`);
      } else {
        results.push({
          fileName: file.name,
          valid: true,
          preview: resumen,
        });
      }

      totalMonto += resumen.total;

    } catch (error: any) {
      results.push({
        fileName: file.name,
        valid: false,
        error: error.message || 'Error al parsear XML',
      });
    }
  }

  const allValid = results.every(r => r.valid);

  return {
    allValid,
    results,
    totalFacturas: results.length,
    totalMonto,
  };
}

/**
 * Valida archivo CSV de ventas con preview detallado
 */
export async function validateCSVVentasWithPreview(
  csvContent: string
): Promise<CSVValidationResult> {
  try {
    // Validación básica de estructura
    const structureValidation = validateCSVVentas(csvContent);
    
    if (!structureValidation.valid) {
      return {
        valid: false,
        errors: structureValidation.errors,
        warnings: structureValidation.warnings,
      };
    }

    // Parse completo para obtener preview
    const ventas = await parseCSVVentas(csvContent);
    
    if (ventas.length === 0) {
      return {
        valid: false,
        errors: ['CSV no contiene ventas válidas'],
        warnings: structureValidation.warnings,
      };
    }

    // Calcular resumen
    const resumen = calcularResumenVentas(ventas);

    // Validaciones de negocio
    const errors: string[] = [];
    const warnings: string[] = [...structureValidation.warnings];

    // Validar fechas razonables
    const now = new Date();
    const unAñoAtras = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    if (resumen.fechaInicio < unAñoAtras) {
      warnings.push(`Ventas incluyen fechas antiguas (${resumen.fechaInicio.toLocaleDateString()})`);
    }

    if (resumen.fechaFin > now) {
      errors.push(`Ventas incluyen fechas futuras (${resumen.fechaFin.toLocaleDateString()})`);
    }

    // Validar montos razonables
    if (resumen.totalVentas <= 0) {
      errors.push('Total de ventas debe ser mayor a $0');
    }

    if (resumen.ventaPromedioDiaria < 100) {
      warnings.push(`Promedio diario muy bajo: $${resumen.ventaPromedioDiaria.toFixed(2)}`);
    }

    // Preview de primeras 5 filas
    const primeras5Filas = ventas.slice(0, 5).map(v => ({
      fecha: v.fecha.toLocaleDateString(),
      monto: v.montoTotal,
      tienda: v.tienda,
    }));

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      preview: {
        ...resumen,
        primeras5Filas,
      },
    };

  } catch (error: any) {
    return {
      valid: false,
      errors: [error.message || 'Error al validar CSV'],
      warnings: [],
    };
  }
}

/**
 * Validación combinada: Verifica consistencia entre facturas y ventas
 */
export function validateConsistencia(
  facturasTotal: number,
  facturasInicio: Date,
  facturasFin: Date,
  ventasTotal: number,
  ventasInicio: Date,
  ventasFin: Date
): {
  warnings: string[];
  foodCostEstimado: number;
} {
  const warnings: string[] = [];

  // Validar que periodos se traslapen
  if (facturasInicio > ventasFin || facturasFin < ventasInicio) {
    warnings.push('⚠️ Periodos de facturas y ventas no coinciden');
  }

  // Calcular food cost estimado
  const foodCostEstimado = (facturasTotal / ventasTotal) * 100;

  // Validar food cost razonable
  if (foodCostEstimado > 60) {
    warnings.push(`⚠️ Food cost estimado muy alto: ${foodCostEstimado.toFixed(1)}%`);
  }

  if (foodCostEstimado < 15) {
    warnings.push(`⚠️ Food cost estimado muy bajo: ${foodCostEstimado.toFixed(1)}% (verifica datos)`);
  }

  // Validar que haya suficientes datos
  const diasFacturas = Math.ceil((facturasFin.getTime() - facturasInicio.getTime()) / (1000 * 60 * 60 * 24));
  const diasVentas = Math.ceil((ventasFin.getTime() - ventasInicio.getTime()) / (1000 * 60 * 60 * 24));

  if (diasFacturas < 7 || diasVentas < 7) {
    warnings.push('⚠️ Periodo corto (menos de 7 días). Resultados pueden no ser representativos.');
  }

  return {
    warnings,
    foodCostEstimado,
  };
}
