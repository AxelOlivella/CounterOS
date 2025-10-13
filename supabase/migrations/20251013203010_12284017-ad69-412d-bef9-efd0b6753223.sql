-- Fix RLS policies for food_cost_daily table
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can manage food_cost_daily for their tenant" ON food_cost_daily;
DROP POLICY IF EXISTS "Users can view food_cost_daily from their tenant" ON food_cost_daily;

-- Create new permissive policies
CREATE POLICY "tenant_food_cost_daily_select"
ON food_cost_daily
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = food_cost_daily.tenant_id
  )
);

CREATE POLICY "tenant_food_cost_daily_insert"
ON food_cost_daily
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = food_cost_daily.tenant_id
  )
);

CREATE POLICY "tenant_food_cost_daily_update"
ON food_cost_daily
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = food_cost_daily.tenant_id
  )
);

CREATE POLICY "tenant_food_cost_daily_delete"
ON food_cost_daily
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = food_cost_daily.tenant_id
  )
);