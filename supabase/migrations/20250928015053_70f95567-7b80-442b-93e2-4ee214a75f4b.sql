-- Create security definer functions to replace problematic views with tenant-based access control

-- Function to get daily food cost data with tenant filtering
CREATE OR REPLACE FUNCTION get_daily_food_cost_data(user_tenant_id uuid DEFAULT NULL)
RETURNS TABLE (
  day date,
  store_id uuid,
  tenant_id uuid,
  revenue numeric,
  cogs numeric,
  food_cost_pct numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH user_tenant AS (
    SELECT u.tenant_id 
    FROM users u 
    WHERE u.auth_user_id = auth.uid()
    LIMIT 1
  )
  SELECT 
    fcv.day,
    fcv.store_id,
    fcv.tenant_id,
    fcv.revenue,
    fcv.cogs,
    fcv.food_cost_pct
  FROM daily_food_cost_view fcv
  CROSS JOIN user_tenant ut
  WHERE fcv.tenant_id = ut.tenant_id;
$$;

-- Function to get P&L monthly data with tenant filtering  
CREATE OR REPLACE FUNCTION get_pnl_monthly_data(user_tenant_id uuid DEFAULT NULL)
RETURNS TABLE (
  period timestamp with time zone,
  store_id uuid,
  tenant_id uuid,
  revenue numeric,
  cogs numeric,
  rent numeric,
  payroll numeric,
  energy numeric,
  other numeric,
  marketing numeric,
  royalties numeric,
  ebitda numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH user_tenant AS (
    SELECT u.tenant_id 
    FROM users u 
    WHERE u.auth_user_id = auth.uid()
    LIMIT 1
  )
  SELECT 
    pnl.period,
    pnl.store_id,
    pnl.tenant_id,
    pnl.revenue,
    pnl.cogs,
    pnl.rent,
    pnl.payroll,
    pnl.energy,
    pnl.other,
    pnl.marketing,
    pnl.royalties,
    pnl.ebitda
  FROM pnl_monthly_view pnl
  CROSS JOIN user_tenant ut
  WHERE pnl.tenant_id = ut.tenant_id;
$$;

-- Function to get daily sales data with tenant filtering
CREATE OR REPLACE FUNCTION get_daily_sales_data(user_tenant_id uuid DEFAULT NULL)
RETURNS TABLE (
  day date,
  store_id uuid,
  tenant_id uuid,
  product_id uuid,
  sku text,
  qty_sold numeric,
  revenue numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH user_tenant AS (
    SELECT u.tenant_id 
    FROM users u 
    WHERE u.auth_user_id = auth.uid()
    LIMIT 1
  )
  SELECT 
    vsd.day,
    vsd.store_id,
    vsd.tenant_id,
    vsd.product_id,
    vsd.sku,
    vsd.qty_sold,
    vsd.revenue
  FROM v_sales_daily vsd
  CROSS JOIN user_tenant ut
  WHERE vsd.tenant_id = ut.tenant_id;
$$;