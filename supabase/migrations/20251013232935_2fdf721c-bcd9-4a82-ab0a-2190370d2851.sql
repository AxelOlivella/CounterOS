-- Poblar datos de prueba para auditoría completa (CORREGIDO)
-- Tenant: Portal Centro (00000000-0000-0000-0000-000000000001)
-- Store: Portal Centro - Moyo (af5677fa-207b-4e16-83b0-5260579e9786)

DO $$
DECLARE
  v_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
  v_store_id UUID := 'af5677fa-207b-4e16-83b0-5260579e9786';
  v_date DATE;
  v_ventas NUMERIC;
  v_compras NUMERIC;
BEGIN
  -- Generar 30 días de datos (últimos 30 días)
  FOR i IN 0..29 LOOP
    v_date := CURRENT_DATE - (30 - i);
    
    -- Ventas aleatorias entre 15,000 y 25,000 MXN por día
    v_ventas := 15000 + (RANDOM() * 10000);
    
    -- Compras (food cost objetivo ~30%, con variación)
    v_compras := v_ventas * (0.25 + RANDOM() * 0.10); -- 25-35%
    
    -- Insertar venta diaria
    INSERT INTO ventas (tenant_id, store_id, fecha, monto_total, num_transacciones)
    VALUES (v_tenant_id, v_store_id, v_date, v_ventas, 40 + FLOOR(RANDOM() * 30));
    
    -- Insertar compra diaria
    INSERT INTO compras (
      tenant_id, 
      store_id, 
      fecha, 
      proveedor, 
      uuid_fiscal, 
      monto, 
      concepto, 
      categoria
    )
    VALUES (
      v_tenant_id, 
      v_store_id, 
      v_date, 
      'Proveedor Demo ' || (i % 5 + 1), 
      'UUID-DEMO-' || v_date || '-' || i, 
      v_compras, 
      'Compra diaria de insumos', 
      CASE (i % 3) 
        WHEN 0 THEN 'proteinas'
        WHEN 1 THEN 'lacteos'
        ELSE 'vegetales'
      END
    );
    
    -- Insertar food_cost_daily (sin food_cost_pct, se genera automáticamente)
    INSERT INTO food_cost_daily (
      tenant_id, 
      store_id, 
      fecha, 
      total_ventas, 
      total_compras
    )
    VALUES (
      v_tenant_id, 
      v_store_id, 
      v_date, 
      v_ventas, 
      v_compras
    );
  END LOOP;
END $$;