-- Auditoría y corrección de políticas RLS para food_cost_daily

-- Eliminar políticas existentes que pueden estar mal configuradas
DROP POLICY IF EXISTS "tenant_food_cost_daily_select" ON food_cost_daily;
DROP POLICY IF EXISTS "tenant_food_cost_daily_insert" ON food_cost_daily;
DROP POLICY IF EXISTS "tenant_food_cost_daily_update" ON food_cost_daily;
DROP POLICY IF EXISTS "tenant_food_cost_daily_delete" ON food_cost_daily;

-- Recrear políticas RLS correctamente
CREATE POLICY "Users can view food_cost_daily from their tenant"
ON food_cost_daily
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = food_cost_daily.tenant_id
  )
);

CREATE POLICY "Users can insert food_cost_daily for their tenant"
ON food_cost_daily
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = food_cost_daily.tenant_id
  )
);

CREATE POLICY "Users can update food_cost_daily from their tenant"
ON food_cost_daily
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = food_cost_daily.tenant_id
  )
);

CREATE POLICY "Users can delete food_cost_daily from their tenant"
ON food_cost_daily
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
    AND u.tenant_id = food_cost_daily.tenant_id
  )
);

-- Verificar que RLS está habilitado
ALTER TABLE food_cost_daily ENABLE ROW LEVEL SECURITY;