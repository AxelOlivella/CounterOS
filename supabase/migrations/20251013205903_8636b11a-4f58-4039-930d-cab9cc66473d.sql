-- Crear datos de prueba para demostración
DO $$
DECLARE
  v_tenant_id uuid;
  v_store_id uuid;
  v_store_exists boolean;
BEGIN
  -- Obtener el primer tenant disponible o usar el demo tenant
  SELECT tenant_id INTO v_tenant_id 
  FROM tenants 
  LIMIT 1;
  
  -- Si no hay tenants, crear uno demo
  IF v_tenant_id IS NULL THEN
    INSERT INTO tenants (tenant_id, name)
    VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Tenant')
    RETURNING tenant_id INTO v_tenant_id;
  END IF;

  -- Verificar si la tienda ya existe
  SELECT EXISTS(
    SELECT 1 FROM stores 
    WHERE tenant_id = v_tenant_id AND slug = 'portal-centro'
  ) INTO v_store_exists;

  -- Crear tienda Portal Centro si no existe
  IF NOT v_store_exists THEN
    INSERT INTO stores (
      tenant_id, 
      name, 
      code, 
      slug, 
      location, 
      city, 
      concept, 
      target_food_cost_pct,
      active
    )
    VALUES (
      v_tenant_id,
      'Portal Centro',
      'PTL-001',
      'portal-centro',
      'Hermosillo, Sonora',
      'Hermosillo',
      'fast_casual',
      28.5,
      true
    )
    RETURNING store_id INTO v_store_id;
  ELSE
    -- Obtener el ID de la tienda existente
    SELECT store_id INTO v_store_id
    FROM stores
    WHERE tenant_id = v_tenant_id AND slug = 'portal-centro';
  END IF;

  -- Limpiar datos antiguos de prueba
  DELETE FROM food_cost_daily WHERE tenant_id = v_tenant_id AND store_id = v_store_id;
  DELETE FROM compras WHERE tenant_id = v_tenant_id AND store_id = v_store_id AND proveedor = 'Proveedor Test';
  DELETE FROM ventas WHERE tenant_id = v_tenant_id AND store_id = v_store_id;

  -- Insertar compras de prueba (últimos 30 días)
  INSERT INTO compras (tenant_id, store_id, fecha, proveedor, concepto, categoria, monto, uuid_fiscal)
  SELECT 
    v_tenant_id,
    v_store_id,
    (CURRENT_DATE - 29 + n)::date,
    'Proveedor Test',
    'Queso manchego',
    'lacteos',
    (500 + random() * 1000)::numeric(10,2),
    'TEST-' || gen_random_uuid()::text
  FROM generate_series(0, 29) n;

  -- Insertar ventas de prueba (últimos 30 días)
  INSERT INTO ventas (tenant_id, store_id, fecha, monto_total, num_transacciones)
  SELECT 
    v_tenant_id,
    v_store_id,
    (CURRENT_DATE - 29 + n)::date,
    (15000 + random() * 5000)::numeric(10,2),
    (30 + floor(random() * 20))::integer
  FROM generate_series(0, 29) n;

  -- Calcular food_cost_daily
  PERFORM recalculate_food_cost_daily(
    v_tenant_id,
    v_store_id,
    CURRENT_DATE - 29,
    CURRENT_DATE
  );

  RAISE NOTICE 'Datos de prueba creados exitosamente para tenant % y tienda %', v_tenant_id, v_store_id;
END $$;