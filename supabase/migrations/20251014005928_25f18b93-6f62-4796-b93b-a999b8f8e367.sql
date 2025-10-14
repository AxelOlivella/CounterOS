-- Create a secure function to access store_performance_view
-- This bypasses RLS on the view and applies tenant filtering
CREATE OR REPLACE FUNCTION public.get_store_performance()
RETURNS TABLE (
  store_id uuid,
  tenant_id uuid,
  code text,
  name text,
  city text,
  latitude numeric,
  longitude numeric,
  manager_name text,
  manager_tenure_months integer,
  target_food_cost_pct numeric,
  current_food_cost_pct numeric,
  food_cost_variance numeric,
  revenue_30d numeric,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Get tenant_id from current user
  WITH user_tenant AS (
    SELECT u.tenant_id 
    FROM users u 
    WHERE u.auth_user_id = auth.uid()
    LIMIT 1
  )
  SELECT 
    spv.store_id,
    spv.tenant_id,
    spv.code,
    spv.name,
    spv.city,
    spv.latitude,
    spv.longitude,
    spv.manager_name,
    spv.manager_tenure_months,
    spv.target_food_cost_pct,
    spv.current_food_cost_pct,
    spv.food_cost_variance,
    spv.revenue_30d,
    spv.status
  FROM store_performance_view spv
  CROSS JOIN user_tenant ut
  WHERE spv.tenant_id = ut.tenant_id;
$$;