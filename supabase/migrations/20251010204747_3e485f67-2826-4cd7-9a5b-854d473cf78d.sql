-- Poblar datos de ventas de ejemplo para Portal Centro (últimos 30 días)

DO $$
DECLARE
  v_tenant_id uuid := '00000000-0000-0000-0000-000000000001';
  v_store_id uuid;
  v_product_id uuid;
  v_day date;
  v_hour int;
  v_ticket int;
BEGIN
  -- Obtener store_id de Portal Centro
  SELECT store_id INTO v_store_id 
  FROM stores 
  WHERE tenant_id = v_tenant_id 
  LIMIT 1;

  -- Generar ventas para los últimos 30 días
  FOR v_day IN 
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '30 days',
      CURRENT_DATE,
      '1 day'::interval
    )::date
  LOOP
    v_ticket := 1;
    
    -- Generar ~50-100 ventas por día (horario 9am-9pm)
    FOR v_hour IN 9..21 LOOP
      FOR v_ticket IN 1..(3 + floor(random() * 5)::int) LOOP
        -- Seleccionar productos aleatorios
        FOR v_product_id IN 
          SELECT product_id 
          FROM products 
          WHERE tenant_id = v_tenant_id 
          ORDER BY random() 
          LIMIT (1 + floor(random() * 3)::int)
        LOOP
          INSERT INTO sales (
            tenant_id,
            store_id,
            sku,
            sold_at,
            qty,
            unit_price,
            ticket_id
          )
          SELECT
            v_tenant_id,
            v_store_id,
            p.sku,
            v_day + (v_hour || ' hours')::interval + (floor(random() * 60) || ' minutes')::interval,
            1 + floor(random() * 2)::int,
            45 + floor(random() * 30)::numeric,
            'TKT-' || v_day || '-' || lpad(v_ticket::text, 4, '0')
          FROM products p
          WHERE p.product_id = v_product_id;
        END LOOP;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Verificar datos insertados
SELECT 
  COUNT(*) as total_ventas,
  MIN(sold_at::date) as primera_venta,
  MAX(sold_at::date) as ultima_venta,
  SUM(qty * unit_price) as revenue_total
FROM sales
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';