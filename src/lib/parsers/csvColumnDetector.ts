// Detecta automáticamente qué columnas del CSV corresponden a nuestros campos esperados usando fuzzy matching

export interface ColumnMapping {
  fecha?: string;
  tienda?: string;
  monto?: string; // admite "monto" o "monto_total"
  transacciones?: string;
}

export interface DetectionResult {
  mapping: ColumnMapping;
  confidence: 'high' | 'medium' | 'low';
  unmapped: string[];
}

const COLUMN_PATTERNS: Record<keyof ColumnMapping, string[]> = {
  fecha: [
    'fecha',
    'date',
    'dia',
    'day',
    'fecha_venta',
    'fecha venta',
    'fecha de venta',
    'timestamp',
    'periodo',
  ],
  tienda: [
    'tienda',
    'store',
    'sucursal',
    'branch',
    'plaza',
    'local',
    'punto_venta',
    'punto de venta',
    'pdv',
    'location',
    'ubicacion',
    'site',
  ],
  monto: [
    'monto',
    'total',
    'amount',
    'venta',
    'ventas',
    'sales',
    'monto_total',
    'monto total',
    'total_venta',
    'total venta',
    'importe',
    'ingreso',
    'revenue',
  ],
  transacciones: [
    'transacciones',
    'transactions',
    'tickets',
    'ordenes',
    'orders',
    'num_transacciones',
    'cantidad',
    'qty',
  ],
};

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // sin acentos
    .replace(/[_\-\s]+/g, '_'); // normalizar separadores
}

export function detectColumns(headers: string[]): DetectionResult {
  const mapping: ColumnMapping = {};
  const normalizedHeaders = headers
    .filter(Boolean)
    .map((h) => ({ original: h, normalized: normalizeHeader(h) }));

  let matchCount = 0;

  // Buscar match para cada campo requerido/opcional
  (Object.keys(COLUMN_PATTERNS) as (keyof ColumnMapping)[]).forEach((field) => {
    const patterns = COLUMN_PATTERNS[field];

    for (const header of normalizedHeaders) {
      // Exact match
      if (patterns.includes(header.normalized)) {
        mapping[field] = header.original;
        matchCount++;
        return; // siguiente field
      }

      // Partial match (contiene)
      const partialMatch = patterns.some(
        (pattern) =>
          header.normalized.includes(pattern) || pattern.includes(header.normalized)
      );

      if (partialMatch) {
        mapping[field] = header.original;
        matchCount++;
        return; // siguiente field
      }
    }
  });

  // Calcular confidence: requeridos mínimos
  const requiredFields: (keyof ColumnMapping)[] = ['fecha', 'monto'];
  const hasRequired = requiredFields.every((f) => Boolean(mapping[f]));

  let confidence: DetectionResult['confidence'];
  if (matchCount >= 3 && hasRequired) confidence = 'high';
  else if (matchCount >= 2 && hasRequired) confidence = 'medium';
  else confidence = 'low';

  // Columnas no mapeadas
  const mapped = Object.values(mapping).filter(Boolean) as string[];
  const unmapped = headers.filter((h) => !mapped.includes(h));

  return {
    mapping,
    confidence,
    unmapped,
  };
}
