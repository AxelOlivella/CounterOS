# Parsers de CounterOS

Sistema completo de parsing para facturas XML (CFDI) y archivos CSV de ventas.

## 📋 Descripción

Parsers robustos para:
- **XML**: Facturas CFDI 4.0 del SAT (Sistema de Administración Tributaria de México)
- **CSV**: Archivos de ventas con formatos flexibles

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

---

# Parser de CSV de Ventas

## 📊 Características

- ✅ **Parsing flexible** con múltiples formatos de columnas
- ✅ **Validación** de estructura antes de parsear
- ✅ **Agrupación** por día y por tienda
- ✅ **Resúmenes automáticos** con estadísticas
- ✅ **Detección de formato** (delimitadores, headers)
- ✅ **Manejo robusto de errores**

## 🚀 Uso del CSV Parser

### Parsear archivo de ventas

```typescript
import { parseCSVVentas } from '@/lib/parsers/csvParser';

const csvContent = await fetch('/samples/ventas_septiembre.csv').then(r => r.text());
const ventas = await parseCSVVentas(csvContent);

console.log(ventas.length);         // 90 registros
console.log(ventas[0].montoTotal);  // 12450.50
console.log(ventas[0].tienda);      // "Portal Centro"
```

### Validar antes de parsear

```typescript
import { validateCSVVentas } from '@/lib/parsers/csvParser';

const validacion = validateCSVVentas(csvContent);

if (!validacion.valid) {
  console.error('Errores:', validacion.errors);
  // ["Falta columna 'fecha'", "Falta columna 'monto'"]
}

if (validacion.warnings.length > 0) {
  console.warn('Warnings:', validacion.warnings);
}
```

### Agrupar ventas por día

```typescript
import { agruparVentasPorDia } from '@/lib/parsers/csvParser';

const ventasPorDia = agruparVentasPorDia(ventas);

ventasPorDia.forEach((datos, fecha) => {
  console.log(`${fecha}: $${datos.totalVentas.toFixed(2)}`);
  console.log(`  Transacciones: ${datos.numTransacciones}`);
  console.log(`  Tiendas: ${datos.tiendas.size}`);
});
```

### Agrupar ventas por tienda

```typescript
import { agruparVentasPorTienda } from '@/lib/parsers/csvParser';

const ventasPorTienda = agruparVentasPorTienda(ventas);

ventasPorTienda.forEach((datos, tienda) => {
  console.log(`${tienda}:`);
  console.log(`  Total: $${datos.totalVentas.toFixed(2)}`);
  console.log(`  Promedio diario: $${datos.promedioVentasDiario.toFixed(2)}`);
  console.log(`  Días operados: ${datos.dias}`);
});
```

### Calcular resumen

```typescript
import { calcularResumenVentas } from '@/lib/parsers/csvParser';

const resumen = calcularResumenVentas(ventas);

console.log(`Total ventas: $${resumen.totalVentas.toLocaleString()}`);
console.log(`Período: ${resumen.fechaInicio} → ${resumen.fechaFin}`);
console.log(`Tiendas: ${resumen.tiendas.join(', ')}`);
console.log(`Promedio diario: $${resumen.ventaPromedioDiaria.toFixed(2)}`);
```

### Detectar formato automáticamente

```typescript
import { detectarFormatoCSV } from '@/lib/parsers/csvParser';

const formato = detectarFormatoCSV(csvContent);

console.log(formato.delimiter);     // ","
console.log(formato.hasHeader);     // true
console.log(formato.columnas);      // ["fecha", "monto_total", "tienda", ...]
```

## 🧪 Testing del CSV Parser

```typescript
import { testCSVParser, testValidacionRapida } from '@/lib/parsers/csvParserTest';

// Test completo con archivo de ejemplo
await testCSVParser();

// Test rápido de validación
testValidacionRapida();
```

## 📁 Archivo de Ejemplo

`/public/samples/ventas_septiembre.csv` - 90 registros de ventas de 3 tiendas durante septiembre 2024:
- **Portal Centro**: ~$390K
- **Plaza Norte**: ~$285K  
- **Crepas OS**: ~$220K
- **Total**: ~$1.2M en el mes

## 📊 Estructura de Datos CSV

### VentaParsed

```typescript
{
  fecha: Date;              // Fecha de la venta
  montoTotal: number;       // Monto total en MXN
  tienda: string;           // Nombre de la tienda
  numTransacciones?: number; // Número de transacciones (opcional)
}
```

### Formatos de CSV Soportados

El parser es flexible y soporta múltiples formatos:

```csv
# Formato 1: Completo
fecha,monto_total,tienda,transacciones
2024-09-01,12450.50,Portal Centro,45

# Formato 2: Sin transacciones
fecha,monto,tienda
2024-09-01,12450.50,Portal Centro

# Formato 3: Con espacios en headers
Fecha, Monto Total, Tienda
2024-09-01, 12450.50, Portal Centro
```

## 🔧 Validaciones

### Columnas Requeridas
- `fecha` (o variantes: Fecha, FECHA)
- `monto` o `monto_total` (o variantes)

### Columnas Opcionales
- `tienda` (default: 'N/A')
- `transacciones` (default: 1)

### Validaciones de Datos
- Fechas válidas (formato ISO o estándar)
- Montos numéricos positivos
- Sin registros vacíos

## 📦 Dependencias

- `fast-xml-parser` ^5.x - Parser XML rápido y confiable
- `papaparse` ^5.x - Parser CSV potente y flexible

## 🤝 Contribuir

**XML Parser**: Para agregar nuevas categorías, edita el objeto `keywords` en la función `autoCategorizarCompra()`.

**CSV Parser**: El parser detecta automáticamente formatos y es muy flexible con columnas.
