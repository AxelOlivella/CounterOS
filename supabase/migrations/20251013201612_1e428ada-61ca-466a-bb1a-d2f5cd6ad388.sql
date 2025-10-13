-- Tabla de compras (desde facturas CFDI XML)
CREATE TABLE IF NOT EXISTS public.compras (
  compra_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  store_id UUID NOT NULL,
  fecha DATE NOT NULL,
  folio TEXT,
  proveedor TEXT NOT NULL,
  rfc_proveedor TEXT,
  concepto TEXT NOT NULL,
  categoria TEXT NOT NULL,
  monto NUMERIC NOT NULL DEFAULT 0,
  moneda TEXT DEFAULT 'MXN',
  uuid_fiscal TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de ventas diarias (desde CSV POS)
CREATE TABLE IF NOT EXISTS public.ventas (
  venta_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  store_id UUID NOT NULL,
  fecha DATE NOT NULL,
  monto_total NUMERIC NOT NULL DEFAULT 0,
  num_transacciones INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de food cost calculado diariamente
CREATE TABLE IF NOT EXISTS public.food_cost_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  store_id UUID NOT NULL,
  fecha DATE NOT NULL,
  total_compras NUMERIC NOT NULL DEFAULT 0,
  total_ventas NUMERIC NOT NULL DEFAULT 0,
  food_cost_pct NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN total_ventas > 0 THEN (total_compras / total_ventas) * 100
      ELSE 0
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, store_id, fecha)
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_compras_tenant_store_fecha ON public.compras(tenant_id, store_id, fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_tenant_store_fecha ON public.ventas(tenant_id, store_id, fecha);
CREATE INDEX IF NOT EXISTS idx_food_cost_tenant_store_fecha ON public.food_cost_daily(tenant_id, store_id, fecha);

-- RLS policies para compras
ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view compras from their tenant"
  ON public.compras FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.tenant_id = compras.tenant_id
    )
  );

CREATE POLICY "Users can insert compras for their tenant"
  ON public.compras FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.tenant_id = compras.tenant_id
    )
  );

-- RLS policies para ventas
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ventas from their tenant"
  ON public.ventas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.tenant_id = ventas.tenant_id
    )
  );

CREATE POLICY "Users can insert ventas for their tenant"
  ON public.ventas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.tenant_id = ventas.tenant_id
    )
  );

-- RLS policies para food_cost_daily
ALTER TABLE public.food_cost_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view food_cost_daily from their tenant"
  ON public.food_cost_daily FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.tenant_id = food_cost_daily.tenant_id
    )
  );

CREATE POLICY "Users can manage food_cost_daily for their tenant"
  ON public.food_cost_daily FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.tenant_id = food_cost_daily.tenant_id
    )
  );

-- Función para recalcular food cost diario
CREATE OR REPLACE FUNCTION public.recalculate_food_cost_daily(
  p_tenant_id UUID,
  p_store_id UUID,
  p_fecha_inicio DATE,
  p_fecha_fin DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Eliminar registros existentes en el rango
  DELETE FROM public.food_cost_daily
  WHERE tenant_id = p_tenant_id
    AND store_id = p_store_id
    AND fecha BETWEEN p_fecha_inicio AND p_fecha_fin;
  
  -- Calcular y insertar nuevos registros
  INSERT INTO public.food_cost_daily (tenant_id, store_id, fecha, total_compras, total_ventas)
  SELECT 
    p_tenant_id,
    p_store_id,
    d.fecha,
    COALESCE(c.total_compras, 0) as total_compras,
    COALESCE(v.total_ventas, 0) as total_ventas
  FROM (
    SELECT generate_series(p_fecha_inicio, p_fecha_fin, '1 day'::interval)::date as fecha
  ) d
  LEFT JOIN (
    SELECT fecha, SUM(monto) as total_compras
    FROM public.compras
    WHERE tenant_id = p_tenant_id
      AND store_id = p_store_id
      AND fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY fecha
  ) c ON d.fecha = c.fecha
  LEFT JOIN (
    SELECT fecha, SUM(monto_total) as total_ventas
    FROM public.ventas
    WHERE tenant_id = p_tenant_id
      AND store_id = p_store_id
      AND fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY fecha
  ) v ON d.fecha = v.fecha
  WHERE COALESCE(c.total_compras, 0) > 0 OR COALESCE(v.total_ventas, 0) > 0;
END;
$$;