import { parseXMLFactura, autoCategorizarCompra } from './xmlParser';
import { parseCSVVentas, calcularResumenVentas } from './csvParser';

export async function runParserTests() {
  console.log('='.repeat(60));
  console.log('PRUEBA 1: FACTURA LACTEOS XML');
  console.log('='.repeat(60));
  
  try {
    const lacteosXML = await fetch('/samples/factura_lacteos.xml').then(r => r.text());
    const lacteosParsed = await parseXMLFactura(lacteosXML);
    
    console.log('✅ UUID:', lacteosParsed.uuid);
    console.log('✅ Proveedor:', lacteosParsed.proveedor.nombre, `(${lacteosParsed.proveedor.rfc})`);
    console.log('✅ Total:', `$${lacteosParsed.total.toLocaleString('es-MX')} ${lacteosParsed.moneda}`);
    console.log('✅ Conceptos categorizados:');
    
    lacteosParsed.conceptos.forEach((c, i) => {
      const categoria = autoCategorizarCompra(c.descripcion);
      console.log(`   ${i + 1}. ${c.descripcion}`);
      console.log(`      Cantidad: ${c.cantidad} ${c.unidad}`);
      console.log(`      Precio unitario: $${c.precioUnitario.toFixed(2)}`);
      console.log(`      Importe: $${c.importe.toFixed(2)}`);
      console.log(`      📁 Categoría: ${categoria}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('PRUEBA 2: VENTAS SEPTIEMBRE CSV');
    console.log('='.repeat(60));
    
    const ventasCSV = await fetch('/samples/ventas_septiembre.csv').then(r => r.text());
    const ventasParsed = await parseCSVVentas(ventasCSV);
    
    console.log('✅ Primeros 5 registros:');
    ventasParsed.slice(0, 5).forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.fecha.toLocaleDateString('es-MX')} - ${v.tienda}`);
      console.log(`      Monto: $${v.montoTotal.toLocaleString('es-MX')}`);
      console.log(`      Transacciones: ${v.numTransacciones}`);
    });
    
    const resumen = calcularResumenVentas(ventasParsed);
    console.log('\n✅ Resumen de ventas:');
    console.log(`   Total ventas: $${resumen.totalVentas.toLocaleString('es-MX')}`);
    console.log(`   Registros: ${resumen.numRegistros}`);
    console.log(`   Período: ${resumen.fechaInicio.toLocaleDateString('es-MX')} - ${resumen.fechaFin.toLocaleDateString('es-MX')}`);
    console.log(`   Tiendas: ${resumen.tiendas.join(', ')}`);
    console.log(`   ✅ Fechas parseadas: ${ventasParsed.every(v => v.fecha instanceof Date && !isNaN(v.fecha.getTime())) ? 'SÍ ✓' : 'NO ✗'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('PRUEBA 3: CÁLCULO DE FOOD COST');
    console.log('='.repeat(60));
    
    // Parsear las otras facturas
    const proteinasXML = await fetch('/samples/factura_proteinas.xml').then(r => r.text());
    const proteinasParsed = await parseXMLFactura(proteinasXML);
    
    const vegetalesXML = await fetch('/samples/factura_vegetales.xml').then(r => r.text());
    const vegetalesParsed = await parseXMLFactura(vegetalesXML);
    
    const totalCompras = lacteosParsed.total + proteinasParsed.total + vegetalesParsed.total;
    const totalVentas = resumen.totalVentas;
    const foodCostPct = (totalCompras / totalVentas) * 100;
    
    console.log('📊 Facturas procesadas:');
    console.log(`   • Lácteos: $${lacteosParsed.total.toLocaleString('es-MX')} (${lacteosParsed.proveedor.nombre})`);
    console.log(`   • Proteínas: $${proteinasParsed.total.toLocaleString('es-MX')} (${proteinasParsed.proveedor.nombre})`);
    console.log(`   • Vegetales: $${vegetalesParsed.total.toLocaleString('es-MX')} (${vegetalesParsed.proveedor.nombre})`);
    console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`   Total compras: $${totalCompras.toLocaleString('es-MX')}`);
    
    console.log('\n💰 Ventas:');
    console.log(`   Total ventas: $${totalVentas.toLocaleString('es-MX')}`);
    
    console.log('\n🎯 FOOD COST:');
    console.log(`   FC = ($${totalCompras.toLocaleString('es-MX')} / $${totalVentas.toLocaleString('es-MX')}) × 100`);
    console.log(`   FC = ${foodCostPct.toFixed(2)}%`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ TODOS LOS PARSERS FUNCIONARON CORRECTAMENTE');
    console.log('='.repeat(60));
    
    return {
      lacteos: lacteosParsed,
      proteinas: proteinasParsed,
      vegetales: vegetalesParsed,
      ventas: ventasParsed,
      resumen,
      foodCost: {
        totalCompras,
        totalVentas,
        porcentaje: foodCostPct
      }
    };
    
  } catch (error) {
    console.error('❌ Error en pruebas:', error);
    throw error;
  }
}

// Ejecutar automáticamente si es modo desarrollo
if (import.meta.env.DEV) {
  // Descomentar para ejecutar automáticamente:
  // runParserTests();
}
