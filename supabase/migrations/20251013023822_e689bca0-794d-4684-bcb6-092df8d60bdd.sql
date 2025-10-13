-- Create inventory_counts table for physical inventory tracking
CREATE TABLE public.inventory_counts (
  count_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  store_id UUID NOT NULL,
  ingredient_id UUID NOT NULL,
  count_date DATE NOT NULL,
  physical_qty NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  counted_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory_counts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view inventory counts from their tenant"
ON public.inventory_counts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = inventory_counts.tenant_id
  )
);

CREATE POLICY "Users can insert inventory counts for their tenant"
ON public.inventory_counts
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = inventory_counts.tenant_id
  )
);

CREATE POLICY "Users can update inventory counts from their tenant"
ON public.inventory_counts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = inventory_counts.tenant_id
  )
);

CREATE POLICY "Users can delete inventory counts from their tenant"
ON public.inventory_counts
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = inventory_counts.tenant_id
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_inventory_counts_updated_at
BEFORE UPDATE ON public.inventory_counts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create view for real variance analysis
CREATE OR REPLACE VIEW public.v_real_variance_analysis AS
SELECT
  ic.count_date as day,
  ic.store_id,
  ic.tenant_id,
  ic.ingredient_id,
  i.name as ingredient_name,
  i.code as ingredient_code,
  ic.unit,
  i.cost_per_unit,
  COALESCE(tc.qty_needed, 0) as theoretical_qty,
  ic.physical_qty as actual_qty,
  (ic.physical_qty - COALESCE(tc.qty_needed, 0)) as variance_qty,
  CASE 
    WHEN COALESCE(tc.qty_needed, 0) > 0 
    THEN ((ic.physical_qty - tc.qty_needed) / tc.qty_needed) * 100
    ELSE NULL
  END as variance_pct,
  ((ic.physical_qty - COALESCE(tc.qty_needed, 0)) * i.cost_per_unit) as cost_impact_mxn,
  ic.counted_by,
  ic.notes
FROM public.inventory_counts ic
JOIN public.ingredients i ON i.ingredient_id = ic.ingredient_id
LEFT JOIN public.v_theoretical_consumption_daily tc ON 
  tc.ingredient_id = ic.ingredient_id 
  AND tc.store_id = ic.store_id 
  AND tc.day = ic.count_date;

-- Create function to get real variance data
CREATE OR REPLACE FUNCTION public.get_real_variance_data(
  p_store_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  day DATE,
  store_id UUID,
  ingredient_id UUID,
  ingredient_name TEXT,
  ingredient_code TEXT,
  unit TEXT,
  cost_per_unit NUMERIC,
  theoretical_qty NUMERIC,
  actual_qty NUMERIC,
  variance_qty NUMERIC,
  variance_pct NUMERIC,
  cost_impact_mxn NUMERIC,
  counted_by UUID,
  notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
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
    v.cost_impact_mxn,
    v.counted_by,
    v.notes
  FROM v_real_variance_analysis v
  WHERE v.tenant_id = v_tenant_id
    AND (p_store_id IS NULL OR v.store_id = p_store_id)
    AND (p_start_date IS NULL OR v.day >= p_start_date)
    AND (p_end_date IS NULL OR v.day <= p_end_date)
  ORDER BY v.day DESC, ABS(v.cost_impact_mxn) DESC
  LIMIT p_limit;
END;
$$;