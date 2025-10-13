-- Security Fix: Restrict direct access to sensitive views
-- Views don't support RLS directly, so we revoke direct access
-- and force users to use SECURITY DEFINER functions that filter by tenant

-- Revoke direct access to financial views from public and authenticated users
-- Users must use the get_* functions which properly filter by tenant

REVOKE ALL ON daily_food_cost_view FROM PUBLIC;
REVOKE ALL ON daily_food_cost_view FROM authenticated;
REVOKE ALL ON daily_food_cost_view FROM anon;

REVOKE ALL ON pnl_monthly_view FROM PUBLIC;
REVOKE ALL ON pnl_monthly_view FROM authenticated;
REVOKE ALL ON pnl_monthly_view FROM anon;

REVOKE ALL ON v_sales_daily FROM PUBLIC;
REVOKE ALL ON v_sales_daily FROM authenticated;
REVOKE ALL ON v_sales_daily FROM anon;

REVOKE ALL ON v_theoretical_consumption_daily FROM PUBLIC;
REVOKE ALL ON v_theoretical_consumption_daily FROM authenticated;
REVOKE ALL ON v_theoretical_consumption_daily FROM anon;

REVOKE ALL ON v_variance_analysis FROM PUBLIC;
REVOKE ALL ON v_variance_analysis FROM authenticated;
REVOKE ALL ON v_variance_analysis FROM anon;

REVOKE ALL ON v_real_variance_analysis FROM PUBLIC;
REVOKE ALL ON v_real_variance_analysis FROM authenticated;
REVOKE ALL ON v_real_variance_analysis FROM anon;

REVOKE ALL ON vw_portal_centro_pyg_mensual FROM PUBLIC;
REVOKE ALL ON vw_portal_centro_pyg_mensual FROM authenticated;
REVOKE ALL ON vw_portal_centro_pyg_mensual FROM anon;

REVOKE ALL ON waste_analysis FROM PUBLIC;
REVOKE ALL ON waste_analysis FROM authenticated;
REVOKE ALL ON waste_analysis FROM anon;

-- Grant SELECT to the SECURITY DEFINER functions' owner (postgres/service role)
-- These functions already filter by tenant_id properly
GRANT SELECT ON daily_food_cost_view TO postgres;
GRANT SELECT ON pnl_monthly_view TO postgres;
GRANT SELECT ON v_sales_daily TO postgres;
GRANT SELECT ON v_theoretical_consumption_daily TO postgres;
GRANT SELECT ON v_variance_analysis TO postgres;
GRANT SELECT ON v_real_variance_analysis TO postgres;
GRANT SELECT ON vw_portal_centro_pyg_mensual TO postgres;
GRANT SELECT ON waste_analysis TO postgres;

-- Verify that the SECURITY DEFINER functions exist and are accessible
-- Users should call these functions instead of querying views directly:
-- - get_daily_food_cost_data() - filters by tenant
-- - get_pnl_monthly_data() - filters by tenant  
-- - get_daily_sales_data() - filters by tenant
-- - get_variance_data() - filters by tenant
-- - get_real_variance_data() - filters by tenant

-- Grant EXECUTE on these functions to authenticated users
GRANT EXECUTE ON FUNCTION get_daily_food_cost_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pnl_monthly_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_sales_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_variance_data(uuid, date, date, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_real_variance_data(uuid, date, date, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_variance_ingredients(uuid, integer, integer) TO authenticated;