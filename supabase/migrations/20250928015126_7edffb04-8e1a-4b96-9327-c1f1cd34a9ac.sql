-- Create security definer function for stores with tenant filtering
CREATE OR REPLACE FUNCTION get_stores_data()
RETURNS TABLE (
  store_id uuid,
  tenant_id uuid,
  code text,
  name text,
  city text,
  active boolean,
  created_at timestamp with time zone
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
    s.store_id,
    s.tenant_id,
    s.code,
    s.name,
    s.city,
    s.active,
    s.created_at
  FROM stores s
  CROSS JOIN user_tenant ut
  WHERE s.tenant_id = ut.tenant_id;
$$;