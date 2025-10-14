-- ═══════════════════════════════════════════════════════════════════════
-- STORED PROCEDURE: save_onboarding_transaction
-- Maneja todo el onboarding en una transacción atómica
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.save_onboarding_transaction(
  p_tenant_id UUID,
  p_stores JSONB,
  p_facturas JSONB,
  p_ventas JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store JSONB;
  v_store_id UUID;
  v_store_map JSONB := '{}';
  v_factura JSONB;
  v_concepto JSONB;
  v_venta JSONB;
  v_matched_store_id UUID;
  v_fecha_min DATE;
  v_fecha_max DATE;
  v_total_compras NUMERIC := 0;
  v_total_ventas NUMERIC := 0;
  v_result JSONB;
BEGIN
  -- ═══════════════════════════════════════════════════════════════════════
  -- PASO 1: Insertar stores y crear mapa de nombres
  -- ═══════════════════════════════════════════════════════════════════════
  
  FOR v_store IN SELECT * FROM jsonb_array_elements(p_stores)
  LOOP
    INSERT INTO public.stores (
      tenant_id,
      name,
      code,
      location,
      concept,
      target_food_cost_pct,
      active
    )
    VALUES (
      p_tenant_id,
      v_store->>'name',
      COALESCE(v_store->>'code', UPPER(SUBSTRING(v_store->>'name', 1, 3))),
      v_store->>'location',
      v_store->>'concept',
      COALESCE((v_store->>'targetFoodCost')::NUMERIC, 28.5),
      true
    )
    RETURNING store_id INTO v_store_id;
    
    -- Guardar mapeo: nombre → store_id
    v_store_map := v_store_map || jsonb_build_object(
      LOWER(TRIM(v_store->>'name')),
      v_store_id
    );
  END LOOP;

  -- ═══════════════════════════════════════════════════════════════════════
  -- PASO 2: Insertar compras desde facturas
  -- ═══════════════════════════════════════════════════════════════════════
  
  FOR v_factura IN SELECT * FROM jsonb_array_elements(p_facturas)
  LOOP
    -- Buscar store_id por nombre (simple matching por ahora)
    v_matched_store_id := NULL;
    
    -- Intentar match exacto primero
    IF v_store_map ? LOWER(TRIM(v_factura->>'tienda')) THEN
      v_matched_store_id := (v_store_map->>LOWER(TRIM(v_factura->>'tienda')))::UUID;
    ELSE
      -- Tomar el primer store si no hay match (fallback)
      v_matched_store_id := (SELECT store_id FROM public.stores WHERE tenant_id = p_tenant_id LIMIT 1);
    END IF;
    
    -- Insertar cada concepto como una compra
    FOR v_concepto IN SELECT * FROM jsonb_array_elements(v_factura->'conceptos')
    LOOP
      INSERT INTO public.compras (
        tenant_id,
        store_id,
        fecha,
        proveedor,
        rfc_proveedor,
        uuid_fiscal,
        folio,
        concepto,
        categoria,
        monto,
        moneda
      )
      VALUES (
        p_tenant_id,
        v_matched_store_id,
        (v_factura->>'fecha')::DATE,
        v_factura->'proveedor'->>'nombre',
        v_factura->'proveedor'->>'rfc',
        v_factura->>'uuid',
        v_factura->>'folio',
        v_concepto->>'descripcion',
        v_concepto->>'categoria',
        (v_concepto->>'importe')::NUMERIC,
        COALESCE(v_factura->>'moneda', 'MXN')
      );
      
      v_total_compras := v_total_compras + (v_concepto->>'importe')::NUMERIC;
    END LOOP;
  END LOOP;

  -- ═══════════════════════════════════════════════════════════════════════
  -- PASO 3: Insertar ventas
  -- ═══════════════════════════════════════════════════════════════════════
  
  FOR v_venta IN SELECT * FROM jsonb_array_elements(p_ventas)
  LOOP
    -- Buscar store_id por nombre
    v_matched_store_id := NULL;
    
    IF v_store_map ? LOWER(TRIM(v_venta->>'tienda')) THEN
      v_matched_store_id := (v_store_map->>LOWER(TRIM(v_venta->>'tienda')))::UUID;
    ELSE
      v_matched_store_id := (SELECT store_id FROM public.stores WHERE tenant_id = p_tenant_id LIMIT 1);
    END IF;
    
    INSERT INTO public.ventas (
      tenant_id,
      store_id,
      fecha,
      monto_total,
      num_transacciones
    )
    VALUES (
      p_tenant_id,
      v_matched_store_id,
      (v_venta->>'fecha')::DATE,
      (v_venta->>'montoTotal')::NUMERIC,
      (v_venta->>'numTransacciones')::INTEGER
    );
    
    v_total_ventas := v_total_ventas + (v_venta->>'montoTotal')::NUMERIC;
  END LOOP;

  -- ═══════════════════════════════════════════════════════════════════════
  -- PASO 4: Calcular food_cost_daily para el rango completo
  -- ═══════════════════════════════════════════════════════════════════════
  
  -- Obtener rango de fechas
  SELECT 
    MIN(fecha),
    MAX(fecha)
  INTO v_fecha_min, v_fecha_max
  FROM (
    SELECT (f->>'fecha')::DATE as fecha FROM jsonb_array_elements(p_facturas) f
    UNION
    SELECT (v->>'fecha')::DATE as fecha FROM jsonb_array_elements(p_ventas) v
  ) fechas;
  
  -- Recalcular para cada tienda
  FOR v_store_id IN 
    SELECT store_id FROM public.stores WHERE tenant_id = p_tenant_id
  LOOP
    PERFORM public.recalculate_food_cost_daily(
      p_tenant_id,
      v_store_id,
      v_fecha_min,
      v_fecha_max
    );
  END LOOP;

  -- ═══════════════════════════════════════════════════════════════════════
  -- PASO 5: Retornar resultado
  -- ═══════════════════════════════════════════════════════════════════════
  
  v_result := jsonb_build_object(
    'success', true,
    'stores', (SELECT jsonb_agg(jsonb_build_object(
      'store_id', store_id,
      'name', name,
      'code', code
    )) FROM public.stores WHERE tenant_id = p_tenant_id),
    'summary', jsonb_build_object(
      'totalCompras', v_total_compras,
      'totalVentas', v_total_ventas,
      'foodCostPct', CASE 
        WHEN v_total_ventas > 0 THEN ROUND((v_total_compras / v_total_ventas * 100)::NUMERIC, 2)
        ELSE 0
      END,
      'fechaInicio', v_fecha_min,
      'fechaFin', v_fecha_max
    )
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Si hay error, PostgreSQL hace rollback automáticamente
    RAISE EXCEPTION 'Error en save_onboarding_transaction: %', SQLERRM;
END;
$$;