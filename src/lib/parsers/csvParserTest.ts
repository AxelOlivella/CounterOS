/**
 * Test suite para el parser de CSV de ventas
 * Ejecuta tests automáticos con archivos de ejemplo
 */

import {
  parseCSVVentas,
  validateCSVVentas,
  agruparVentasPorDia,
  agruparVentasPorTienda,
  calcularResumenVentas,
  detectarFormatoCSV,
} from './csvParser';

export async function testCSVParser() {
  console.log('🧪 Iniciando tests del CSV Parser...\n');

  const results = {
    passed: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    // Test 1: Cargar archivo CSV
    console.log('📄 Test 1: Cargando ventas_septiembre.csv...');
    const response = await fetch('/samples/ventas_septiembre.csv');
    
    if (!response.ok) {
      throw new Error('No se pudo cargar el archivo CSV');
    }
    
    const csvContent = await response.text();
    console.log(`  ✓ Archivo cargado (${csvContent.length} bytes)\n`);

    // Test 2: Detectar formato
    console.log('📊 Test 2: Detectando formato del CSV...');
    const formato = detectarFormatoCSV(csvContent);
    console.log(`  ✓ Delimiter: "${formato.delimiter}"`);
    console.log(`  ✓ Headers: ${formato.hasHeader ? 'Sí' : 'No'}`);
    console.log(`  ✓ Columnas detectadas: ${formato.columnas.join(', ')}\n`);

    // Test 3: Validación
    console.log('✅ Test 3: Validando estructura del CSV...');
    const validacion = validateCSVVentas(csvContent);
    
    if (!validacion.valid) {
      console.error('  ❌ CSV inválido:');
      validacion.errors.forEach(err => console.error(`    - ${err}`));
      throw new Error('Validación falló');
    }
    
    console.log('  ✓ CSV válido');
    if (validacion.warnings.length > 0) {
      console.log('  ⚠️  Warnings:');
      validacion.warnings.forEach(warn => console.log(`    - ${warn}`));
    }
    console.log('');

    // Test 4: Parsing completo
    console.log('📈 Test 4: Parseando ventas...');
    const ventas = await parseCSVVentas(csvContent);
    console.log(`  ✓ Total registros parseados: ${ventas.length}`);
    
    if (ventas.length === 0) {
      throw new Error('No se parsearon ventas');
    }
    
    // Mostrar primeras 3 ventas
    console.log('  Muestra de datos:');
    ventas.slice(0, 3).forEach((venta, idx) => {
      console.log(`    [${idx + 1}] ${venta.fecha.toLocaleDateString('es-MX')} - ${venta.tienda}`);
      console.log(`        Monto: $${venta.montoTotal.toFixed(2)}, Transacciones: ${venta.numTransacciones}`);
    });
    console.log('');

    // Test 5: Resumen
    console.log('📊 Test 5: Calculando resumen...');
    const resumen = calcularResumenVentas(ventas);
    console.log(`  ✓ Total ventas: $${resumen.totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`);
    console.log(`  ✓ Registros: ${resumen.numRegistros}`);
    console.log(`  ✓ Período: ${resumen.fechaInicio.toLocaleDateString('es-MX')} → ${resumen.fechaFin.toLocaleDateString('es-MX')}`);
    console.log(`  ✓ Tiendas: ${resumen.tiendas.join(', ')}`);
    console.log(`  ✓ Promedio diario: $${resumen.ventaPromedioDiaria.toLocaleString('es-MX', { minimumFractionDigits: 2 })}\n`);

    // Test 6: Agrupación por día
    console.log('📅 Test 6: Agrupando ventas por día...');
    const ventasPorDia = agruparVentasPorDia(ventas);
    console.log(`  ✓ Total días: ${ventasPorDia.size}`);
    
    // Mostrar primeros 3 días
    const dias = Array.from(ventasPorDia.entries()).slice(0, 3);
    console.log('  Muestra:');
    dias.forEach(([fecha, datos]) => {
      console.log(`    ${fecha}: $${datos.totalVentas.toFixed(2)} (${datos.numTransacciones} trans, ${datos.tiendas.size} tiendas)`);
    });
    console.log('');

    // Test 7: Agrupación por tienda
    console.log('🏪 Test 7: Agrupando ventas por tienda...');
    const ventasPorTienda = agruparVentasPorTienda(ventas);
    console.log(`  ✓ Total tiendas: ${ventasPorTienda.size}\n`);
    
    ventasPorTienda.forEach((datos, tienda) => {
      console.log(`  ${datos.tienda}:`);
      console.log(`    Total: $${datos.totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`);
      console.log(`    Transacciones: ${datos.numTransacciones}`);
      console.log(`    Días operados: ${datos.dias}`);
      console.log(`    Promedio diario: $${datos.promedioVentasDiario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}\n`);
    });

    console.log('✅ Todos los tests PASSED\n');
    results.passed = 7;

  } catch (error) {
    console.error('❌ Tests FAILED');
    console.error(`   Error: ${error instanceof Error ? error.message : 'Error desconocido'}\n`);
    results.failed = 1;
    results.errors.push(error instanceof Error ? error.message : 'Error desconocido');
  }

  // Resumen final
  console.log('📊 Resumen de Tests:');
  console.log(`   ✅ Passed: ${results.passed}/7`);
  console.log(`   ❌ Failed: ${results.failed}/7`);
  
  if (results.errors.length > 0) {
    console.log('\n⚠️  Errores encontrados:');
    results.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  return results;
}

// Test rápido de validación
export function testValidacionRapida() {
  console.log('🔍 Test de Validación Rápida:\n');
  
  const testCases = [
    {
      name: 'CSV válido',
      csv: 'fecha,monto_total,tienda\n2024-09-01,1000.50,Portal Centro',
      expectedValid: true,
    },
    {
      name: 'CSV sin fecha',
      csv: 'monto_total,tienda\n1000.50,Portal Centro',
      expectedValid: false,
    },
    {
      name: 'CSV sin monto',
      csv: 'fecha,tienda\n2024-09-01,Portal Centro',
      expectedValid: false,
    },
    {
      name: 'CSV vacío',
      csv: '',
      expectedValid: false,
    },
  ];
  
  testCases.forEach(({ name, csv, expectedValid }) => {
    const result = validateCSVVentas(csv);
    const passed = result.valid === expectedValid;
    
    console.log(`${passed ? '✅' : '❌'} ${name}`);
    console.log(`   Valid: ${result.valid} (esperado: ${expectedValid})`);
    
    if (result.errors.length > 0) {
      console.log(`   Errores: ${result.errors.join(', ')}`);
    }
    if (result.warnings.length > 0) {
      console.log(`   Warnings: ${result.warnings.join(', ')}`);
    }
    console.log('');
  });
}
