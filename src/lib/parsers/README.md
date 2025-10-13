# Parser de Facturas XML (CFDI)

## 📋 Descripción

Parser robusto para archivos XML de facturas CFDI 4.0 del SAT (Sistema de Administración Tributaria de México).

## ✨ Características

- ✅ **Parsing completo** de estructura CFDI 4.0
- ✅ **Categorización automática** de productos por keywords
- ✅ **Validación** de estructura XML
- ✅ **Extracción rápida** de resúmenes sin parsing completo
- ✅ **Manejo robusto de errores**
- ✅ **TypeScript** con tipos completos

## 🚀 Uso

### Parsear una factura completa

```typescript
import { parseXMLFactura } from '@/lib/parsers/xmlParser';

const xmlContent = await fetch('/samples/factura_lacteos.xml').then(r => r.text());
const factura = await parseXMLFactura(xmlContent);

console.log(factura.uuid);           // A1B2C3D4-E5F6-47A8-B9C0-D1E2F3A4B5C6
console.log(factura.proveedor.nombre); // LACTEOS Y DERIVADOS SA DE CV
console.log(factura.total);          // 9860.00
console.log(factura.conceptos.length); // 3
```

### Categorizar automáticamente

```typescript
import { autoCategorizarCompra } from '@/lib/parsers/xmlParser';

const categoria = autoCategorizarCompra('QUESO MANCHEGO PREMIUM');
// → 'lacteos'

const categoria2 = autoCategorizarCompra('PECHUGA DE POLLO');
// → 'proteinas'
```

### Validar XML rápidamente

```typescript
import { validarXMLCFDI } from '@/lib/parsers/xmlParser';

const isValid = validarXMLCFDI(xmlContent);
if (!isValid) {
  console.error('XML inválido');
}
```

### Extraer solo resumen (más rápido)

```typescript
import { extractResumenFactura } from '@/lib/parsers/xmlParser';

const resumen = extractResumenFactura(xmlContent);
// { proveedor: "...", total: 9860.00, fecha: "2024-09-15T10:30:00" }
```

## 🧪 Testing

```typescript
import { testXMLParser, testCategorizacion } from '@/lib/parsers/xmlParserTest';

// Test completo con archivos de ejemplo
await testXMLParser();

// Test solo de categorización
testCategorizacion();
```

## 📁 Archivos de Ejemplo

Incluye 3 XMLs de ejemplo en `/public/samples/`:

1. **factura_lacteos.xml** - Quesos, crema ($9,860)
2. **factura_proteinas.xml** - Pollo, carne, salmón ($14,384)
3. **factura_vegetales.xml** - Tomate, cebolla, lechuga ($3,712)

## 📊 Categorías Soportadas

- 🥛 **lacteos**: leche, queso, crema, mantequilla, yogurt
- 🍗 **proteinas**: carne, pollo, pescado, camarón
- 🥬 **vegetales**: tomate, lechuga, cebolla, papa
- 🍎 **frutas**: manzana, naranja, plátano, fresa
- 🌾 **granos**: arroz, frijol, lenteja, garbanzo
- 🍞 **panaderia**: pan, tortilla, bolillo, masa
- 🥤 **bebidas**: refresco, agua, jugo, café, cerveza
- 🧂 **condimentos**: sal, pimienta, aceite, salsa
- 🍽️ **desechables**: platos, vasos, cubiertos
- 🧹 **limpieza**: cloro, jabón, detergente
- 🛢️ **aceites**: aceite, manteca, margarina
- ❄️ **congelados**: helado, congelado
- 🥫 **enlatados**: latas, conservas

## ⚙️ Estructura de Datos

### FacturaParsed

```typescript
{
  uuid: string;              // UUID del timbre fiscal
  fecha: Date;               // Fecha de emisión
  folio: string;             // Número de folio
  proveedor: {
    nombre: string;
    rfc: string;
  };
  total: number;             // Total con impuestos
  moneda: string;            // 'MXN', 'USD', etc.
  conceptos: Array<{
    descripcion: string;
    cantidad: number;
    unidad: string;
    precioUnitario: number;
    importe: number;
  }>;
}
```

## 🔧 Manejo de Errores

```typescript
try {
  const factura = await parseXMLFactura(xmlContent);
} catch (error) {
  console.error('Error al parsear:', error.message);
  // Error messages incluyen contexto útil:
  // - "No se encontró el nodo Comprobante en el XML"
  // - "Estructura de CFDI inválida"
  // - "Error al parsear factura XML: [detalle]"
}
```

## 📝 Notas Técnicas

### Compatibilidad CFDI

- ✅ CFDI 4.0 (actual)
- ✅ Namespaces con/sin prefijo (`cfdi:` o sin él)
- ✅ Facturas con 1 o múltiples conceptos
- ✅ Extracción de UUID del complemento TimbreFiscalDigital

### Precisión Numérica

El parser usa `parseAttributeValue: false` para mantener valores como strings y convertirlos manualmente, evitando pérdida de precisión en decimales.

### Categorización

La categorización es **case-insensitive** y busca keywords en cualquier parte de la descripción. Si no encuentra match, retorna `'sin_categorizar'`.

## 🎯 Próximos Pasos (Fase 2)

- [ ] Integrar con edge function para parsing en backend
- [ ] Guardar facturas parseadas en Supabase
- [ ] Dashboard para ver facturas por categoría
- [ ] Mapeo manual de productos sin categoría
- [ ] Exportar reportes de compras por proveedor

## 📦 Dependencias

- `fast-xml-parser` ^4.x - Parser XML rápido y confiable

## 🤝 Contribuir

Para agregar nuevas categorías, edita el objeto `keywords` en la función `autoCategorizarCompra()`.
