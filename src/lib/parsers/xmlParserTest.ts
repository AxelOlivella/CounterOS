/**
 * Test suite para el parser de facturas XML
 * Ejecuta automáticamente tests con los archivos de ejemplo
 */

import { parseXMLFactura, autoCategorizarCompra, validarXMLCFDI, extractResumenFactura } from './xmlParser';

export async function testXMLParser() {
  console.log('🧪 Iniciando tests del XML Parser...\n');

  const testFiles = [
    '/samples/factura_lacteos.xml',
    '/samples/factura_proteinas.xml',
    '/samples/factura_vegetales.xml',
  ];

  const results = {
    passed: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const file of testFiles) {
    try {
      console.log(`📄 Testing: ${file}`);
      
      // Fetch el archivo
      const response = await fetch(file);
      if (!response.ok) {
        throw new Error(`No se pudo cargar ${file}`);
      }
      
      const xmlContent = await response.text();
      
      // Test 1: Validación
      console.log('  ✓ Test 1: Validando XML...');
      const isValid = validarXMLCFDI(xmlContent);
      if (!isValid) {
        throw new Error('XML no válido');
      }
      
      // Test 2: Extracción de resumen
      console.log('  ✓ Test 2: Extrayendo resumen...');
      const resumen = extractResumenFactura(xmlContent);
      if (!resumen) {
        throw new Error('No se pudo extraer resumen');
      }
      console.log(`    Proveedor: ${resumen.proveedor}`);
      console.log(`    Total: $${resumen.total.toFixed(2)}`);
      
      // Test 3: Parsing completo
      console.log('  ✓ Test 3: Parseando factura completa...');
      const factura = await parseXMLFactura(xmlContent);
      
      // Verificar estructura
      if (!factura.uuid || !factura.proveedor.nombre || !factura.conceptos.length) {
        throw new Error('Estructura de factura incompleta');
      }
      
      console.log(`    UUID: ${factura.uuid}`);
      console.log(`    Folio: ${factura.folio}`);
      console.log(`    Proveedor: ${factura.proveedor.nombre} (${factura.proveedor.rfc})`);
      console.log(`    Total: $${factura.total.toFixed(2)} ${factura.moneda}`);
      console.log(`    Conceptos: ${factura.conceptos.length}`);
      
      // Test 4: Categorización automática
      console.log('  ✓ Test 4: Categorizando conceptos...');
      factura.conceptos.forEach((concepto, idx) => {
        const categoria = autoCategorizarCompra(concepto.descripcion);
        console.log(`    [${idx + 1}] ${concepto.descripcion}`);
        console.log(`        → Categoría: ${categoria}`);
        console.log(`        → Cantidad: ${concepto.cantidad} ${concepto.unidad}`);
        console.log(`        → Importe: $${concepto.importe.toFixed(2)}`);
      });
      
      console.log(`✅ ${file} - PASSED\n`);
      results.passed++;
      
    } catch (error) {
      console.error(`❌ ${file} - FAILED`);
      console.error(`   Error: ${error instanceof Error ? error.message : 'Error desconocido'}\n`);
      results.failed++;
      results.errors.push(`${file}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Resumen final
  console.log('📊 Resumen de Tests:');
  console.log(`   ✅ Passed: ${results.passed}/${testFiles.length}`);
  console.log(`   ❌ Failed: ${results.failed}/${testFiles.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n⚠️  Errores encontrados:');
    results.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  return results;
}

// Test rápido de categorización
export function testCategorizacion() {
  console.log('🏷️  Test de Categorización:\n');
  
  const testCases = [
    'QUESO MANCHEGO PREMIUM',
    'PECHUGA DE POLLO SIN HUESO',
    'TOMATE BOLA FRESCO',
    'ACEITE DE OLIVA EXTRA VIRGEN',
    'DETERGENTE PARA TRASTES',
    'PLATOS DESECHABLES BIODEGRADABLES',
    'ALGO QUE NO EXISTE EN KEYWORDS',
  ];
  
  testCases.forEach(descripcion => {
    const categoria = autoCategorizarCompra(descripcion);
    console.log(`"${descripcion}"`);
    console.log(`  → ${categoria}\n`);
  });
}
