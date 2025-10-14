import Papa from 'papaparse';
import { detectColumns, ColumnMapping } from './csvColumnDetector';

export interface VentaParsed {
  fecha: Date;
  montoTotal: number;
  tienda: string;
  numTransacciones?: number;
}

interface CSVRow {
  fecha?: string;
  monto_total?: number;
  monto?: number;
  tienda?: string;
  transacciones?: number;
  [key: string]: any;
}

/**
 * Parsea un archivo CSV de ventas
 * Soporta formatos flexibles con headers variables
 * @param fileContent - Contenido del archivo CSV como string
 * @returns Promise con array de ventas parseadas
 */
export interface CSVParseResult {
  data: VentaParsed[];
  mapping: ColumnMapping;
  confidence: 'high' | 'medium' | 'low';
  errors: string[];
}

/**
 * Parser inteligente con mapeo automático/manual de columnas
 */
export async function parseCSVVentasWithMapping(
  fileContent: string,
  manualMapping?: ColumnMapping
): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<any>(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        try {
          const headers: string[] = results?.meta?.fields || [];
          const detection = manualMapping
            ? { mapping: manualMapping, confidence: 'high' as const }
            : detectColumns(headers);

          const mapping = detection.mapping;
          const ventas: VentaParsed[] = [];
          const errors: string[] = [];

          results.data.forEach((row: any, index: number) => {
            try {
              const fechaValue = mapping.fecha ? row[mapping.fecha] ?? row['fecha'] : row['fecha'];
              const montoRaw = mapping.monto
                ? row[mapping.monto] ?? row['monto_total'] ?? row['monto']
                : row['monto_total'] ?? row['monto'];
              const tiendaValue = mapping.tienda ? row[mapping.tienda] : (row['tienda'] ?? 'N/A');
              const transValue = mapping.transacciones
                ? row[mapping.transacciones]
                : (row['transacciones'] ?? undefined);

              if (fechaValue == null || montoRaw == null || montoRaw === '') {
                errors.push(`Fila ${index + 2}: Falta fecha o monto`);
                return;
              }

              // Parse fecha de manera flexible
              let fecha: Date;
              if (fechaValue instanceof Date) {
                fecha = fechaValue;
              } else {
                const fv = String(fechaValue).trim();
                const native = new Date(fv);
                if (!isNaN(native.getTime())) {
                  fecha = native;
                } else {
                  const parts = fv.split(/[\/-]/).map((p) => p.trim());
                  if (parts.length === 3) {
                    // Asumir DD/MM/YYYY
                    let d = parseInt(parts[0], 10);
                    let m = parseInt(parts[1], 10);
                    let y = parseInt(parts[2], 10);
                    if (String(y).length === 2) y = 2000 + y;
                    fecha = new Date(y, m - 1, d);
                  } else {
                    throw new Error(`Fecha inválida "${fv}"`);
                  }
                }
              }

              // Parse monto tolerante (quita símbolos y comas)
              const monto = typeof montoRaw === 'number'
                ? montoRaw
                : parseFloat(String(montoRaw).replace(/[^0-9.,-]/g, '').replace(',', '.'));
              if (isNaN(monto)) {
                errors.push(`Fila ${index + 2}: Monto inválido "${montoRaw}"`);
                return;
              }

              ventas.push({
                fecha,
                montoTotal: monto,
                tienda: String(tiendaValue ?? 'N/A'),
                numTransacciones: transValue != null ? Number(transValue) : undefined,
              });
            } catch (err: any) {
              errors.push(`Fila ${index + 2}: ${err?.message ?? 'Error desconocido'}`);
            }
          });

          resolve({
            data: ventas,
            mapping,
            confidence: (detection as any).confidence ?? 'high',
            errors,
          });
        } catch (error) {
          reject(error);
        }
      },
      error: reject,
    });
  });
}

// Compatibilidad hacia atrás: función original sigue retornando solo los datos
export async function parseCSVVentas(
  fileContent: string
): Promise<VentaParsed[]> {
  const result = await parseCSVVentasWithMapping(fileContent);
  return result.data;
}

/**
 * Valida la estructura del CSV antes de parsear
 * Verifica que existan las columnas requeridas
 */
export function validateCSVVentas(content: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const lines = content.trim().split('\n');
  const errors: string[] = [];
  const warnings: string[] = [];

  if (lines.length === 0) {
    errors.push('Archivo CSV vacío');
    return { valid: false, errors, warnings };
  }

  const header = lines[0].toLowerCase().trim();
  const columns = header.split(',').map(c => c.trim());

  // Validar columnas requeridas
  const hasFecha = columns.some(c => c.includes('fecha'));
  const hasMonto = columns.some(c => c.includes('monto'));

  if (!hasFecha) {
    errors.push('Falta columna "fecha"');
  }

  if (!hasMonto) {
    errors.push('Falta columna "monto" o "monto_total"');
  }

  // Validar que haya datos
  if (lines.length < 2) {
    warnings.push('CSV solo tiene headers, sin datos');
  }

  // Validar encoding
  if (header.includes('�')) {
    warnings.push('Posible problema de encoding (caracteres raros detectados)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Agrupa ventas por día
 * Útil para análisis de tendencias
 */
export function agruparVentasPorDia(ventas: VentaParsed[]): Map<string, {
  fecha: Date;
  totalVentas: number;
  numTransacciones: number;
  tiendas: Set<string>;
}> {
  const agrupado = new Map();

  ventas.forEach(venta => {
    const fechaKey = venta.fecha.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!agrupado.has(fechaKey)) {
      agrupado.set(fechaKey, {
        fecha: venta.fecha,
        totalVentas: 0,
        numTransacciones: 0,
        tiendas: new Set<string>(),
      });
    }

    const grupo = agrupado.get(fechaKey);
    grupo.totalVentas += venta.montoTotal;
    grupo.numTransacciones += venta.numTransacciones || 0;
    grupo.tiendas.add(venta.tienda);
  });

  return agrupado;
}

/**
 * Agrupa ventas por tienda
 * Útil para comparación entre locaciones
 */
export function agruparVentasPorTienda(ventas: VentaParsed[]): Map<string, {
  tienda: string;
  totalVentas: number;
  numTransacciones: number;
  dias: number;
  promedioVentasDiario: number;
}> {
  const agrupado = new Map();

  ventas.forEach(venta => {
    if (!agrupado.has(venta.tienda)) {
      agrupado.set(venta.tienda, {
        tienda: venta.tienda,
        totalVentas: 0,
        numTransacciones: 0,
        fechas: new Set<string>(),
      });
    }

    const grupo = agrupado.get(venta.tienda);
    grupo.totalVentas += venta.montoTotal;
    grupo.numTransacciones += venta.numTransacciones || 0;
    grupo.fechas.add(venta.fecha.toISOString().split('T')[0]);
  });

  // Calcular promedios
  const resultado = new Map();
  agrupado.forEach((grupo, tienda) => {
    const dias = grupo.fechas.size;
    resultado.set(tienda, {
      tienda: grupo.tienda,
      totalVentas: grupo.totalVentas,
      numTransacciones: grupo.numTransacciones,
      dias,
      promedioVentasDiario: grupo.totalVentas / dias,
    });
  });

  return resultado;
}

/**
 * Calcula resumen rápido del CSV
 */
export function calcularResumenVentas(ventas: VentaParsed[]): {
  totalVentas: number;
  numRegistros: number;
  fechaInicio: Date;
  fechaFin: Date;
  tiendas: string[];
  ventaPromedioDiaria: number;
} {
  if (ventas.length === 0) {
    throw new Error('No hay ventas para calcular resumen');
  }

  const totalVentas = ventas.reduce((sum, v) => sum + v.montoTotal, 0);
  const fechas = ventas.map(v => v.fecha.getTime());
  const tiendasSet = new Set(ventas.map(v => v.tienda));

  const fechaInicio = new Date(Math.min(...fechas));
  const fechaFin = new Date(Math.max(...fechas));

  // Calcular días entre inicio y fin
  const dias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return {
    totalVentas,
    numRegistros: ventas.length,
    fechaInicio,
    fechaFin,
    tiendas: Array.from(tiendasSet),
    ventaPromedioDiaria: totalVentas / dias,
  };
}

/**
 * Detecta automáticamente el formato del CSV
 * Útil para soportar múltiples formatos de entrada
 */
export function detectarFormatoCSV(content: string): {
  delimiter: string;
  hasHeader: boolean;
  columnas: string[];
} {
  const firstLine = content.split('\n')[0];
  
  // Detectar delimitador
  const delimiters = [',', ';', '\t', '|'];
  const counts = delimiters.map(d => ({
    delimiter: d,
    count: (firstLine.match(new RegExp(`\\${d}`, 'g')) || []).length,
  }));
  
  const delimiter = counts.sort((a, b) => b.count - a.count)[0].delimiter;
  
  // Detectar headers
  const columnas = firstLine.split(delimiter).map(c => c.trim());
  const hasHeader = columnas.some(c => isNaN(Number(c)));
  
  return {
    delimiter,
    hasHeader,
    columnas,
  };
}
