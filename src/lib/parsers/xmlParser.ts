import { XMLParser } from 'fast-xml-parser';

export interface FacturaParsed {
  uuid: string;           // UUID del CFDI
  fecha: Date;
  folio: string;
  proveedor: {
    nombre: string;
    rfc: string;
  };
  total: number;
  moneda: string;
  conceptos: Array<{
    descripcion: string;
    cantidad: number;
    unidad: string;
    precioUnitario: number;
    importe: number;
    categoria: string;
  }>;
}

interface Concepto {
  '@_Descripcion': string;
  '@_Cantidad': string;
  '@_Unidad': string;
  '@_ValorUnitario': string;
  '@_Importe': string;
}

function parseConcepto(concepto: Concepto) {
  const descripcion = concepto['@_Descripcion'] || '';
  return {
    descripcion,
    cantidad: parseFloat(concepto['@_Cantidad'] || '0'),
    unidad: concepto['@_Unidad'] || '',
    precioUnitario: parseFloat(concepto['@_ValorUnitario'] || '0'),
    importe: parseFloat(concepto['@_Importe'] || '0'),
    categoria: autoCategorizarCompra(descripcion),
  };
}

/**
 * Parsea un archivo XML de CFDI (Comprobante Fiscal Digital por Internet)
 * Soporta CFDI 4.0 del SAT
 */
export async function parseXMLFactura(
  fileContent: string
): Promise<FacturaParsed> {
  try {
    const parser = new XMLParser({ 
      ignoreAttributes: false,
      parseAttributeValue: false, // Keep as strings to avoid precision loss
    });
    
    const cfdi = parser.parse(fileContent);
    
    // Navegar estructura CFDI 4.0
    const comprobante = cfdi['cfdi:Comprobante'] || cfdi['Comprobante'];
    
    if (!comprobante) {
      throw new Error('No se encontró el nodo Comprobante en el XML');
    }
    
    const emisor = comprobante['cfdi:Emisor'] || comprobante['Emisor'];
    const conceptosNode = comprobante['cfdi:Conceptos'] || comprobante['Conceptos'];
    const complemento = comprobante['cfdi:Complemento'] || comprobante['Complemento'];
    
    if (!emisor || !conceptosNode) {
      throw new Error('Estructura de CFDI inválida');
    }
    
    const conceptos = conceptosNode['cfdi:Concepto'] || conceptosNode['Concepto'];
    
    // Extraer UUID del TimbreFiscalDigital
    let uuid = 'N/A';
    try {
      const timbre = complemento?.['tfd:TimbreFiscalDigital'] || 
                     complemento?.['TimbreFiscalDigital'];
      uuid = timbre?.['@_UUID'] || 'N/A';
    } catch (error) {
      console.warn('No se pudo extraer UUID:', error);
    }
    
    return {
      uuid,
      fecha: new Date(comprobante['@_Fecha'] || new Date()),
      folio: comprobante['@_Folio'] || comprobante['@_Serie'] || 'N/A',
      proveedor: {
        nombre: emisor['@_Nombre'] || 'N/A',
        rfc: emisor['@_Rfc'] || emisor['@_RFC'] || 'N/A',
      },
      total: parseFloat(comprobante['@_Total'] || '0'),
      moneda: comprobante['@_Moneda'] || 'MXN',
      conceptos: Array.isArray(conceptos) 
        ? conceptos.map(parseConcepto)
        : [parseConcepto(conceptos)],
    };
  } catch (error) {
    console.error('Error parsing XML:', error);
    throw new Error(`Error al parsear factura XML: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Categoriza automáticamente compras basándose en keywords en la descripción
 * Útil para auto-clasificar facturas sin intervención manual
 */
export function autoCategorizarCompra(descripcion: string): string {
  const keywords = {
    lacteos: ['leche', 'queso', 'crema', 'mantequilla', 'yogurt', 'nata', 'cottage', 'philadelphia', 'manchego', 'oaxaca'],
    proteinas: ['carne', 'pollo', 'res', 'pescado', 'camarón', 'camaron', 'atún', 'atun', 'cerdo', 'puerco', 'jamón', 'jamon', 'salchicha', 'tocino', 'chorizo'],
    vegetales: ['tomate', 'lechuga', 'cebolla', 'papa', 'zanahoria', 'chile', 'pimiento', 'aguacate', 'calabaza', 'espinaca', 'brócoli', 'brocoli'],
    frutas: ['manzana', 'naranja', 'plátano', 'platano', 'fresa', 'piña', 'pina', 'mango', 'sandía', 'sandia', 'melón', 'melon', 'uva', 'limón', 'limon'],
    granos: ['arroz', 'frijol', 'lenteja', 'garbanzo', 'avena', 'trigo', 'maíz', 'maiz', 'quinoa'],
    panaderia: ['pan', 'tortilla', 'bolillo', 'baguette', 'croissant', 'galleta', 'pastel', 'masa', 'harina'],
    bebidas: ['refresco', 'agua', 'jugo', 'café', 'cafe', 'té', 'te', 'cerveza', 'vino', 'licor', 'ron', 'tequila', 'mezcal'],
    condimentos: ['sal', 'pimienta', 'aceite', 'vinagre', 'salsa', 'mayonesa', 'mostaza', 'ketchup', 'soya', 'ajo', 'especias'],
    desechables: ['plato', 'vaso', 'tenedor', 'cuchara', 'servilleta', 'popote', 'desechable', 'papel', 'bolsa'],
    limpieza: ['cloro', 'jabón', 'jabon', 'detergente', 'desinfectante', 'escoba', 'trapeador', 'limpiador'],
    aceites: ['aceite', 'manteca', 'margarina', 'spray'],
    congelados: ['helado', 'congelado', 'frozen', 'hielo'],
    enlatados: ['lata', 'enlatado', 'conserva'],
  };
  
  const desc = descripcion.toLowerCase().trim();
  
  // Buscar categoría por keywords
  for (const [categoria, words] of Object.entries(keywords)) {
    if (words.some(word => desc.includes(word))) {
      return categoria;
    }
  }
  
  return 'sin_categorizar';
}

/**
 * Valida que un archivo sea un XML válido de CFDI
 */
export function validarXMLCFDI(fileContent: string): boolean {
  try {
    const parser = new XMLParser({ ignoreAttributes: false });
    const cfdi = parser.parse(fileContent);
    
    const comprobante = cfdi['cfdi:Comprobante'] || cfdi['Comprobante'];
    return !!comprobante;
  } catch (error) {
    return false;
  }
}

/**
 * Extrae el resumen de una factura sin parsear todos los detalles
 */
export function extractResumenFactura(fileContent: string): {
  proveedor: string;
  total: number;
  fecha: string;
} | null {
  try {
    const parser = new XMLParser({ ignoreAttributes: false });
    const cfdi = parser.parse(fileContent);
    const comprobante = cfdi['cfdi:Comprobante'] || cfdi['Comprobante'];
    const emisor = comprobante?.['cfdi:Emisor'] || comprobante?.['Emisor'];
    
    if (!comprobante || !emisor) return null;
    
    return {
      proveedor: emisor['@_Nombre'] || 'N/A',
      total: parseFloat(comprobante['@_Total'] || '0'),
      fecha: comprobante['@_Fecha'] || 'N/A',
    };
  } catch (error) {
    return null;
  }
}
