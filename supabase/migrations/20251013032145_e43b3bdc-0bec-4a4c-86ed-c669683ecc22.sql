-- Security Fix: Add tenant_id to financial history tables and restrict access
-- These tables contain sensitive financial data and need proper tenant isolation

-- 1. Add tenant_id column to finance_portal_centro_history
ALTER TABLE finance_portal_centro_history 
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- 2. Add tenant_id column to finance_portal_centro_opx_detail
ALTER TABLE finance_portal_centro_opx_detail 
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- 3. Try to populate tenant_id based on site_id mapping to stores
-- This assumes site_id or site_name can be mapped to stores.code or stores.name
UPDATE finance_portal_centro_history fh
SET tenant_id = s.tenant_id
FROM stores s
WHERE fh.tenant_id IS NULL 
  AND (fh.site_id = s.code OR fh.site_name = s.name);

UPDATE finance_portal_centro_opx_detail fo
SET tenant_id = s.tenant_id
FROM stores s
WHERE fo.tenant_id IS NULL 
  AND (fo.site_id = s.code OR fo.site_name = s.name);

-- 4. Add foreign key constraints (after data is populated)
-- Note: This will fail if there are orphaned records without tenant_id
-- Consider making it nullable initially if you have legacy data
ALTER TABLE finance_portal_centro_history
ADD CONSTRAINT fk_finance_history_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE;

ALTER TABLE finance_portal_centro_opx_detail
ADD CONSTRAINT fk_finance_opx_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE;

-- 5. Drop the old weak policy
DROP POLICY IF EXISTS "Only authenticated users can view financial history" 
ON finance_portal_centro_history;

DROP POLICY IF EXISTS "Only authenticated users can view opx detail" 
ON finance_portal_centro_opx_detail;

-- 6. Create proper tenant-based RLS policies
CREATE POLICY "Users can only view financial history from their tenant"
  ON finance_portal_centro_history
  FOR SELECT
  USING (
    tenant_id IS NOT NULL 
    AND EXISTS (
      SELECT 1
      FROM users u
      WHERE u.auth_user_id = auth.uid()
        AND u.tenant_id = finance_portal_centro_history.tenant_id
    )
  );

CREATE POLICY "Users can only view opx detail from their tenant"
  ON finance_portal_centro_opx_detail
  FOR SELECT
  USING (
    tenant_id IS NOT NULL 
    AND EXISTS (
      SELECT 1
      FROM users u
      WHERE u.auth_user_id = auth.uid()
        AND u.tenant_id = finance_portal_centro_opx_detail.tenant_id
    )
  );

-- 7. Create policies for INSERT operations (if needed for data imports)
CREATE POLICY "Users can insert financial history for their tenant"
  ON finance_portal_centro_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.auth_user_id = auth.uid()
        AND u.tenant_id = finance_portal_centro_history.tenant_id
    )
  );

CREATE POLICY "Users can insert opx detail for their tenant"
  ON finance_portal_centro_opx_detail
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.auth_user_id = auth.uid()
        AND u.tenant_id = finance_portal_centro_opx_detail.tenant_id
    )
  );

-- 8. Create index for better performance on tenant_id filtering
CREATE INDEX IF NOT EXISTS idx_finance_history_tenant 
ON finance_portal_centro_history(tenant_id);

CREATE INDEX IF NOT EXISTS idx_finance_opx_tenant 
ON finance_portal_centro_opx_detail(tenant_id);

-- 9. IMPORTANT: If you have legacy data without tenant_id, you need to:
--    a) Make tenant_id nullable temporarily
--    b) Create a data migration script to map site_id to tenant_id
--    c) Then make tenant_id NOT NULL after data is clean
-- 
-- For now, we're keeping it nullable to avoid breaking existing data
-- but the RLS policy ensures NULL tenant_id records are not visible