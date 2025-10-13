-- =========================
-- Operations Dashboard Extensions
-- Add geolocation, manager info, and category tracking
-- =========================

-- Add geolocation and manager info to stores
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS latitude numeric(10,7),
ADD COLUMN IF NOT EXISTS longitude numeric(11,7),
ADD COLUMN IF NOT EXISTS manager_name text,
ADD COLUMN IF NOT EXISTS manager_tenure_months integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_food_cost_pct numeric(6,2) DEFAULT 28.5;

-- Create store_categories table for breakdown analysis
CREATE TABLE IF NOT EXISTS store_categories (
  category_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  category_name text NOT NULL,
  actual_pct numeric(6,2) NOT NULL,
  target_pct numeric(6,2) NOT NULL,
  period date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, store_id, category_name, period)
);

-- Enable RLS on store_categories
ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_categories_tenant_all" ON store_categories
  FOR ALL USING (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')
  WITH CHECK (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id');

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_store_categories_tenant_store ON store_categories(tenant_id, store_id, period);

-- Create view for weekly food cost trends
CREATE OR REPLACE VIEW weekly_food_cost_view AS
SELECT
  tenant_id,
  store_id,
  date_trunc('week', day)::date as week_start,
  EXTRACT(WEEK FROM day)::integer as week_number,
  AVG(food_cost_pct) as avg_food_cost_pct,
  SUM(revenue) as total_revenue,
  SUM(cogs) as total_cogs
FROM daily_food_cost_view
GROUP BY tenant_id, store_id, date_trunc('week', day), EXTRACT(WEEK FROM day)
ORDER BY week_start;

-- Create view for store performance summary
CREATE OR REPLACE VIEW store_performance_view AS
WITH recent_fc AS (
  SELECT 
    tenant_id,
    store_id,
    AVG(food_cost_pct) as avg_food_cost_pct,
    COUNT(*) as days_count
  FROM daily_food_cost_view
  WHERE day >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY tenant_id, store_id
),
recent_revenue AS (
  SELECT
    tenant_id,
    store_id,
    SUM(revenue) as total_revenue
  FROM daily_food_cost_view
  WHERE day >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY tenant_id, store_id
)
SELECT
  s.tenant_id,
  s.store_id,
  s.code,
  s.name,
  s.city,
  s.latitude,
  s.longitude,
  s.manager_name,
  s.manager_tenure_months,
  s.target_food_cost_pct,
  COALESCE(fc.avg_food_cost_pct, 0) as current_food_cost_pct,
  COALESCE(fc.avg_food_cost_pct, 0) - s.target_food_cost_pct as food_cost_variance,
  COALESCE(r.total_revenue, 0) as revenue_30d,
  CASE 
    WHEN COALESCE(fc.avg_food_cost_pct, 0) > s.target_food_cost_pct + 3 THEN 'critical'
    WHEN COALESCE(fc.avg_food_cost_pct, 0) > s.target_food_cost_pct THEN 'warning'
    ELSE 'ok'
  END as status
FROM stores s
LEFT JOIN recent_fc fc ON fc.tenant_id = s.tenant_id AND fc.store_id = s.store_id
LEFT JOIN recent_revenue r ON r.tenant_id = s.tenant_id AND r.store_id = s.store_id
WHERE s.active = true;