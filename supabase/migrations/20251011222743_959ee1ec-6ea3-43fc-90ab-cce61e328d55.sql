-- =====================================================
-- VARIANCE ANALYSIS SYSTEM
-- Compara consumo teórico (recetas) vs real (CFDI)
-- =====================================================

-- 1. Tabla para almacenar compras de CFDI
CREATE TABLE IF NOT EXISTS public.purchases (
  purchase_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(tenant_id),
  store_id uuid REFERENCES stores(store_id),
  cfdi_uuid text NOT NULL,
  issue_date timestamptz NOT NULL,
  supplier_name text,
  total_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, cfdi_uuid)
);

-- 2. Tabla para items de compra (line items del CFDI)
CREATE TABLE IF NOT EXISTS public.purchase_items (
  item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL REFERENCES purchases(purchase_id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(tenant_id),
  cfdi_sku text NOT NULL,
  cfdi_description text,
  ingredient_id uuid REFERENCES ingredients(ingredient_id),
  qty numeric NOT NULL,
  unit text,
  unit_price numeric NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. Tabla de mapeo CFDI SKU → ingredient_id
CREATE TABLE IF NOT EXISTS public.cfdi_ingredient_mapping (
  mapping_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(tenant_id),
  cfdi_sku text NOT NULL,
  cfdi_description text,
  ingredient_id uuid NOT NULL REFERENCES ingredients(ingredient_id),
  confidence_score numeric DEFAULT 1.0, -- 1.0 = manual mapping, <1.0 = auto-matched
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, cfdi_sku)
);

-- 4. Vista de análisis de variancia
CREATE OR REPLACE VIEW public.v_variance_analysis AS
SELECT 
  tc.tenant_id,
  tc.store_id,
  tc.day,
  tc.ingredient_id,
  i.name as ingredient_name,
  i.code as ingredient_code,
  i.unit,
  i.cost_per_unit,
  tc.qty_needed as theoretical_qty,
  COALESCE(pi.actual_qty, 0) as actual_qty,
  (COALESCE(pi.actual_qty, 0) - tc.qty_needed) as variance_qty,
  CASE 
    WHEN tc.qty_needed > 0 
    THEN ((COALESCE(pi.actual_qty, 0) - tc.qty_needed) / tc.qty_needed * 100)
    ELSE 0 
  END as variance_pct,
  (COALESCE(pi.actual_qty, 0) - tc.qty_needed) * i.cost_per_unit as cost_impact_mxn
FROM v_theoretical_consumption_daily tc
JOIN ingredients i USING (tenant_id, ingredient_id)
LEFT JOIN (
  SELECT 
    pi.tenant_id,
    DATE(p.issue_date) as day,
    COALESCE(m.ingredient_id, pi.ingredient_id) as ingredient_id,
    SUM(pi.qty) as actual_qty
  FROM purchases p
  JOIN purchase_items pi ON p.purchase_id = pi.purchase_id
  LEFT JOIN cfdi_ingredient_mapping m 
    ON m.tenant_id = pi.tenant_id 
    AND m.cfdi_sku = pi.cfdi_sku
  WHERE pi.ingredient_id IS NOT NULL OR m.ingredient_id IS NOT NULL
  GROUP BY pi.tenant_id, DATE(p.issue_date), COALESCE(m.ingredient_id, pi.ingredient_id)
) pi ON pi.tenant_id = tc.tenant_id 
  AND pi.day = tc.day 
  AND pi.ingredient_id = tc.ingredient_id;

-- 5. Función RPC para obtener datos de variancia (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_variance_data(
  p_store_id uuid DEFAULT NULL,
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL,
  p_limit int DEFAULT 50
)
RETURNS TABLE (
  day date,
  store_id uuid,
  ingredient_id uuid,
  ingredient_name text,
  ingredient_code text,
  unit text,
  cost_per_unit numeric,
  theoretical_qty numeric,
  actual_qty numeric,
  variance_qty numeric,
  variance_pct numeric,
  cost_impact_mxn numeric
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_tenant_id uuid;
BEGIN
  -- Get tenant_id from current user
  SELECT u.tenant_id INTO v_tenant_id
  FROM users u
  WHERE u.auth_user_id = auth.uid()
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'User not found or not associated with a tenant';
  END IF;

  RETURN QUERY
  SELECT 
    v.day,
    v.store_id,
    v.ingredient_id,
    v.ingredient_name,
    v.ingredient_code,
    v.unit,
    v.cost_per_unit,
    v.theoretical_qty,
    v.actual_qty,
    v.variance_qty,
    v.variance_pct,
    v.cost_impact_mxn
  FROM v_variance_analysis v
  WHERE v.tenant_id = v_tenant_id
    AND (p_store_id IS NULL OR v.store_id = p_store_id)
    AND (p_start_date IS NULL OR v.day >= p_start_date)
    AND (p_end_date IS NULL OR v.day <= p_end_date)
    AND v.variance_pct IS NOT NULL
    AND ABS(v.variance_pct) > 0.1  -- Only significant variances
  ORDER BY ABS(v.cost_impact_mxn) DESC
  LIMIT p_limit;
END;
$$;

-- 6. Función para obtener top ingredientes con mayor variancia
CREATE OR REPLACE FUNCTION public.get_top_variance_ingredients(
  p_store_id uuid DEFAULT NULL,
  p_days int DEFAULT 30,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  ingredient_id uuid,
  ingredient_name text,
  total_cost_impact numeric,
  avg_variance_pct numeric,
  days_with_variance bigint
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_tenant_id uuid;
  v_start_date date;
BEGIN
  SELECT u.tenant_id INTO v_tenant_id
  FROM users u
  WHERE u.auth_user_id = auth.uid()
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'User not found or not associated with a tenant';
  END IF;

  v_start_date := CURRENT_DATE - p_days;

  RETURN QUERY
  SELECT 
    v.ingredient_id,
    v.ingredient_name,
    SUM(v.cost_impact_mxn) as total_cost_impact,
    AVG(v.variance_pct) as avg_variance_pct,
    COUNT(DISTINCT v.day) as days_with_variance
  FROM v_variance_analysis v
  WHERE v.tenant_id = v_tenant_id
    AND (p_store_id IS NULL OR v.store_id = p_store_id)
    AND v.day >= v_start_date
    AND v.variance_pct IS NOT NULL
  GROUP BY v.ingredient_id, v.ingredient_name
  ORDER BY ABS(SUM(v.cost_impact_mxn)) DESC
  LIMIT p_limit;
END;
$$;

-- Enable RLS on new tables
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cfdi_ingredient_mapping ENABLE ROW LEVEL SECURITY;

-- RLS Policies for purchases
CREATE POLICY "Users can view purchases from their tenant"
  ON public.purchases FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = purchases.tenant_id
  ));

CREATE POLICY "Users can insert purchases for their tenant"
  ON public.purchases FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = purchases.tenant_id
  ));

-- RLS Policies for purchase_items
CREATE POLICY "Users can view purchase_items from their tenant"
  ON public.purchase_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = purchase_items.tenant_id
  ));

CREATE POLICY "Users can insert purchase_items for their tenant"
  ON public.purchase_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = purchase_items.tenant_id
  ));

-- RLS Policies for cfdi_ingredient_mapping
CREATE POLICY "Users can view mappings from their tenant"
  ON public.cfdi_ingredient_mapping FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = cfdi_ingredient_mapping.tenant_id
  ));

CREATE POLICY "Users can manage mappings for their tenant"
  ON public.cfdi_ingredient_mapping FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = cfdi_ingredient_mapping.tenant_id
  ));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchases_tenant_date ON purchases(tenant_id, issue_date);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_ingredient ON purchase_items(tenant_id, ingredient_id);
CREATE INDEX IF NOT EXISTS idx_cfdi_mapping_tenant_sku ON cfdi_ingredient_mapping(tenant_id, cfdi_sku);

-- Trigger para updated_at en cfdi_ingredient_mapping
CREATE TRIGGER update_cfdi_mapping_updated_at
  BEFORE UPDATE ON cfdi_ingredient_mapping
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();