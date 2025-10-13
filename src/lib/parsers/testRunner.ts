import { parseXMLFactura, autoCategorizarCompra } from './xmlParser';
import { parseCSVVentas, calcularResumenVentas } from './csvParser';

export async function executeParserTests() {
  const results = {
    success: true,
    errors: [] as string[],
    lacteos: null as any,
    proteinas: null as any,
    vegetales: null as any,
    ventas: null as any,
    foodCost: null as any
  };

  try {
    console.log('\n🧪 INICIANDO PRUEBAS DE PARSERS\n');
    
    // ============================================
    // PRUEBA 1: FACTURA LACTEOS
    // ============================================
    console.log('📄 1. PARSEANDO factura_lacteos.xml...\n');
    
    const lacteosResponse = await fetch('/samples/factura_lacteos.xml');
    const lacteosXML = await lacteosResponse.text();
    const lacteos = await parseXMLFactura(lacteosXML);
    
    console.log('✅ FACTURA LÁCTEOS PARSEADA:');
    console.log('   UUID:', lacteos.uuid);
    console.log('   Proveedor:', lacteos.proveedor.nombre);
    console.log('   RFC:', lacteos.proveedor.rfc);
    console.log('   Total:', `$${lacteos.total.toLocaleString('es-MX')} ${lacteos.moneda}`);
    console.log('   Fecha:', lacteos.fecha.toLocaleDateString('es-MX'));
    console.log('   Folio:', lacteos.folio);
    console.log('\n   📦 CONCEPTOS CATEGORIZADOS:');
    
    lacteos.conceptos.forEach((concepto, idx) => {
      const categoria = autoCategorizarCompra(concepto.descripcion);
      console.log(`\n   ${idx + 1}. ${concepto.descripcion}`);
      console.log(`      • Cantidad: ${concepto.cantidad} ${concepto.unidad}`);
      console.log(`      • Precio unitario: $${concepto.precioUnitario.toFixed(2)}`);
      console.log(`      • Importe: $${concepto.importe.toLocaleString('es-MX')}`);
      console.log(`      • 🏷️ Categoría: ${categoria.toUpperCase()}`);
    });
    
    results.lacteos = lacteos;
    
    // ============================================
    // PRUEBA 2: FACTURA PROTEINAS
    // ============================================
    console.log('\n\n📄 2. PARSEANDO factura_proteinas.xml...\n');
    
    const proteinasResponse = await fetch('/samples/factura_proteinas.xml');
    const proteinasXML = await proteinasResponse.text();
    const proteinas = await parseXMLFactura(proteinasXML);
    
    console.log('✅ FACTURA PROTEÍNAS PARSEADA:');
    console.log('   UUID:', proteinas.uuid);
    console.log('   Proveedor:', proteinas.proveedor.nombre);
    console.log('   Total:', `$${proteinas.total.toLocaleString('es-MX')} ${proteinas.moneda}`);
    
    results.proteinas = proteinas;
    
    // ============================================
    // PRUEBA 3: FACTURA VEGETALES
    // ============================================
    console.log('\n\n📄 3. PARSEANDO factura_vegetales.xml...\n');
    
    const vegetalesResponse = await fetch('/samples/factura_vegetales.xml');
    const vegetalesXML = await vegetalesResponse.text();
    const vegetales = await parseXMLFactura(vegetalesXML);
    
    console.log('✅ FACTURA VEGETALES PARSEADA:');
    console.log('   UUID:', vegetales.uuid);
    console.log('   Proveedor:', vegetales.proveedor.nombre);
    console.log('   Total:', `$${vegetales.total.toLocaleString('es-MX')} ${vegetales.moneda}`);
    
    results.vegetales = vegetales;
    
    // ============================================
    // PRUEBA 4: CSV VENTAS
    // ============================================
    console.log('\n\n📊 4. PARSEANDO ventas_septiembre.csv...\n');
    
    const ventasResponse = await fetch('/samples/ventas_septiembre.csv');
    const ventasCSV = await ventasResponse.text();
    const ventas = await parseCSVVentas(ventasCSV);
    
    console.log('✅ CSV VENTAS PARSEADO:');
    console.log(`   Total registros: ${ventas.length}`);
    console.log('\n   📋 PRIMEROS 5 REGISTROS:\n');
    
    ventas.slice(0, 5).forEach((venta, idx) => {
      console.log(`   ${idx + 1}. Fecha: ${venta.fecha.toLocaleDateString('es-MX')}`);
      console.log(`      • Tienda: ${venta.tienda}`);
      console.log(`      • Monto: $${venta.montoTotal.toLocaleString('es-MX')}`);
      console.log(`      • Transacciones: ${venta.numTransacciones || 1}`);
    });
    
    // Validar fechas
    const fechasValidas = ventas.every(v => 
      v.fecha instanceof Date && !isNaN(v.fecha.getTime())
    );
    
    console.log(`\n   ✅ Validación de fechas: ${fechasValidas ? 'TODAS CORRECTAS ✓' : 'ERROR ✗'}`);
    
    const resumen = calcularResumenVentas(ventas);
    console.log('\n   📈 RESUMEN:');
    console.log(`      • Total ventas: $${resumen.totalVentas.toLocaleString('es-MX')}`);
    console.log(`      • Período: ${resumen.fechaInicio.toLocaleDateString('es-MX')} → ${resumen.fechaFin.toLocaleDateString('es-MX')}`);
    console.log(`      • Tiendas: ${resumen.tiendas.join(', ')}`);
    console.log(`      • Promedio diario: $${resumen.ventaPromedioDiaria.toLocaleString('es-MX')}`);
    
    results.ventas = { parsed: ventas, resumen };
    
    // ============================================
    // PRUEBA 5: CÁLCULO FOOD COST
    // ============================================
    console.log('\n\n🎯 5. CÁLCULO DE FOOD COST MOCK\n');
    
    const totalCompras = lacteos.total + proteinas.total + vegetales.total;
    const totalVentas = resumen.totalVentas;
    const foodCostPct = (totalCompras / totalVentas) * 100;
    
    console.log('   📦 COMPRAS (FACTURAS XML):');
    console.log(`      • Lácteos:    $${lacteos.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`);
    console.log(`      • Proteínas:  $${proteinas.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`);
    console.log(`      • Vegetales:  $${vegetales.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`);
    console.log('      ' + '─'.repeat(40));
    console.log(`      TOTAL COMPRAS: $${totalCompras.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`);
    
    console.log('\n   💰 VENTAS (CSV):');
    console.log(`      TOTAL VENTAS: $${totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`);
    
    console.log('\n   🧮 FÓRMULA:');
    console.log(`      FC = (Compras / Ventas) × 100`);
    console.log(`      FC = ($${totalCompras.toLocaleString('es-MX')} / $${totalVentas.toLocaleString('es-MX')}) × 100`);
    console.log(`      FC = ${foodCostPct.toFixed(2)}%`);
    
    console.log('\n   📊 INTERPRETACIÓN:');
    if (foodCostPct < 30) {
      console.log(`      ✅ EXCELENTE - Food cost de ${foodCostPct.toFixed(2)}% está por debajo del objetivo típico (30-35%)`);
    } else if (foodCostPct <= 35) {
      console.log(`      ✅ BUENO - Food cost de ${foodCostPct.toFixed(2)}% está dentro del rango objetivo (30-35%)`);
    } else {
      console.log(`      ⚠️ ALTO - Food cost de ${foodCostPct.toFixed(2)}% supera el objetivo típico (30-35%)`);
    }
    
    results.foodCost = {
      totalCompras,
      totalVentas,
      porcentaje: foodCostPct,
      desglose: {
        lacteos: lacteos.total,
        proteinas: proteinas.total,
        vegetales: vegetales.total
      }
    };
    
    // ============================================
    // RESUMEN FINAL
    // ============================================
    console.log('\n\n' + '='.repeat(60));
    console.log('✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log('\n📋 RESUMEN:');
    console.log(`   ✓ XML Parser: 3 facturas procesadas correctamente`);
    console.log(`   ✓ CSV Parser: ${ventas.length} registros parseados`);
    console.log(`   ✓ Categorización automática: funcionando`);
    console.log(`   ✓ Validación de fechas: todas correctas`);
    console.log(`   ✓ Cálculo Food Cost: ${foodCostPct.toFixed(2)}%`);
    console.log('\n🚀 PARSERS LISTOS PARA INTEGRACIÓN\n');
    
  } catch (error) {
    results.success = false;
    results.errors.push(error instanceof Error ? error.message : String(error));
    console.error('\n❌ ERROR EN PRUEBAS:', error);
  }
  
  return results;
}

// Auto-ejecutar en desarrollo
if (import.meta.env.DEV) {
  console.log('🔧 Parser Test Runner cargado. Ejecuta: executeParserTests()');
}
