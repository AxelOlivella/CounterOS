import Papa from 'papaparse';

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
export async function parseCSVVentas(
  fileContent: string
): Promise<VentaParsed[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }

          const ventas = results.data
            .filter(row => row.fecha && (row.monto_total || row.monto))
            .map(row => {
              const monto = parseFloat(String(row.monto_total || row.monto || '0'));
              const fecha = new Date(row.fecha!);

              // Validar fecha
              if (isNaN(fecha.getTime())) {
                throw new Error(`Fecha inválida: ${row.fecha}`);
              }

              // Validar monto
              if (isNaN(monto) || monto < 0) {
                throw new Error(`Monto inválido: ${monto}`);
              }

              return {
                fecha,
                montoTotal: monto,
                tienda: row.tienda || 'N/A',
                numTransacciones: row.transacciones || 1,
              };
            });

          resolve(ventas);
        } catch (error) {
          reject(error);
        }
      },
      error: reject,
    });
  });
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
