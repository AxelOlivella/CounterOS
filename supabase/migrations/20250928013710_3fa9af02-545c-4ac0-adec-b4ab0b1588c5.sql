-- Drop all dependent views with CASCADE to handle dependencies
DROP VIEW IF EXISTS public.pnl_monthly_view CASCADE;
DROP VIEW IF EXISTS public.daily_food_cost_view CASCADE;
DROP VIEW IF EXISTS public.v_theoretical_consumption_daily CASCADE;
DROP VIEW IF EXISTS public.v_sales_daily CASCADE;

-- Recreate v_sales_daily with tenant security (no dependencies)
CREATE OR REPLACE VIEW public.v_sales_daily
WITH (security_barrier = true) AS
SELECT 
    s.tenant_id,
    s.store_id,
    s.sold_at::date as day,
    s.sku,
    p.product_id,
    SUM(s.qty) as qty_sold,
    SUM(s.qty * s.unit_price) as revenue
FROM sales s
JOIN products p ON s.sku = p.sku AND s.tenant_id = p.tenant_id
WHERE EXISTS (
    SELECT 1 FROM users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = s.tenant_id
)
GROUP BY s.tenant_id, s.store_id, s.sold_at::date, s.sku, p.product_id;

-- Recreate v_theoretical_consumption_daily with tenant security (depends on v_sales_daily)
CREATE OR REPLACE VIEW public.v_theoretical_consumption_daily
WITH (security_barrier = true) AS
SELECT 
    vsd.tenant_id,
    vsd.store_id,
    vsd.day,
    rc.ingredient_id,
    SUM(vsd.qty_sold * rc.qty) as qty_needed
FROM v_sales_daily vsd
JOIN recipe_components rc ON vsd.product_id = rc.product_id AND vsd.tenant_id = rc.tenant_id
WHERE EXISTS (
    SELECT 1 FROM users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = vsd.tenant_id
)
GROUP BY vsd.tenant_id, vsd.store_id, vsd.day, rc.ingredient_id;

-- Recreate daily_food_cost_view with tenant security (depends on v_theoretical_consumption_daily)
CREATE OR REPLACE VIEW public.daily_food_cost_view
WITH (security_barrier = true) AS
SELECT 
    s.tenant_id,
    s.store_id,
    s.day,
    s.revenue,
    COALESCE(tc.cogs, 0) as cogs,
    CASE 
        WHEN s.revenue > 0 THEN (COALESCE(tc.cogs, 0) / s.revenue) * 100
        ELSE 0
    END as food_cost_pct
FROM (
    SELECT 
        s.tenant_id,
        s.store_id,
        s.sold_at::date as day,
        SUM(s.qty * s.unit_price) as revenue
    FROM sales s
    WHERE EXISTS (
        SELECT 1 FROM users u 
        WHERE u.auth_user_id = auth.uid() 
        AND u.tenant_id = s.tenant_id
    )
    GROUP BY s.tenant_id, s.store_id, s.sold_at::date
) s
LEFT JOIN (
    SELECT 
        vtcd.tenant_id,
        vtcd.store_id,
        vtcd.day,
        SUM(vtcd.qty_needed * i.cost_per_unit) as cogs
    FROM v_theoretical_consumption_daily vtcd
    JOIN ingredients i ON vtcd.ingredient_id = i.ingredient_id AND vtcd.tenant_id = i.tenant_id
    GROUP BY vtcd.tenant_id, vtcd.store_id, vtcd.day
) tc ON s.tenant_id = tc.tenant_id AND s.store_id = tc.store_id AND s.day = tc.day;

-- Recreate pnl_monthly_view with tenant security (depends on daily_food_cost_view)
CREATE OR REPLACE VIEW public.pnl_monthly_view  
WITH (security_barrier = true) AS
SELECT 
    dfc.tenant_id,
    dfc.store_id,
    DATE_TRUNC('month', dfc.day) as period,
    SUM(dfc.revenue) as revenue,
    SUM(dfc.cogs) as cogs,
    COALESCE(e.rent, 0) as rent,
    COALESCE(e.payroll, 0) as payroll,
    COALESCE(e.energy, 0) as energy,
    COALESCE(e.other, 0) as other,
    COALESCE(SUM(dfc.revenue) * e.marketing_pct / 100, 0) as marketing,
    COALESCE(SUM(dfc.revenue) * e.royalty_pct / 100, 0) as royalties,
    SUM(dfc.revenue) - SUM(dfc.cogs) - COALESCE(e.rent, 0) - COALESCE(e.payroll, 0) - COALESCE(e.energy, 0) - COALESCE(e.other, 0) - COALESCE(SUM(dfc.revenue) * e.marketing_pct / 100, 0) - COALESCE(SUM(dfc.revenue) * e.royalty_pct / 100, 0) as ebitda
FROM daily_food_cost_view dfc
LEFT JOIN expenses e ON dfc.tenant_id = e.tenant_id AND dfc.store_id = e.store_id AND DATE_TRUNC('month', dfc.day) = e.period
WHERE EXISTS (
    SELECT 1 FROM users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = dfc.tenant_id
)
GROUP BY dfc.tenant_id, dfc.store_id, DATE_TRUNC('month', dfc.day), e.rent, e.payroll, e.energy, e.other, e.marketing_pct, e.royalty_pct;