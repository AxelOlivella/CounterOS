-- ============================================
-- HABILITAR RLS EN NUEVAS TABLAS
-- ============================================

ALTER TABLE corporates ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: corporates
-- ============================================

DO $$ BEGIN
  CREATE POLICY policy_corporates_select ON corporates
  FOR SELECT USING (
    id IN (
      SELECT corporate_id FROM corporate_users 
      WHERE user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

DO $$ BEGIN
  CREATE POLICY policy_corporates_insert ON corporates
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

DO $$ BEGIN
  CREATE POLICY policy_corporates_update ON corporates
  FOR UPDATE USING (
    auth.role() = 'service_role'
  ) WITH CHECK (
    auth.role() = 'service_role'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

-- ============================================
-- POLICIES: legal_entities
-- ============================================

DO $$ BEGIN
  CREATE POLICY policy_legal_entities_select ON legal_entities
  FOR SELECT USING (
    corporate_id IN (
      SELECT corporate_id FROM corporate_users 
      WHERE user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

DO $$ BEGIN
  CREATE POLICY policy_legal_entities_insert ON legal_entities
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

DO $$ BEGIN
  CREATE POLICY policy_legal_entities_update ON legal_entities
  FOR UPDATE USING (
    auth.role() = 'service_role'
  ) WITH CHECK (
    auth.role() = 'service_role'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

-- ============================================
-- POLICIES: brands
-- ============================================

DO $$ BEGIN
  CREATE POLICY policy_brands_select ON brands
  FOR SELECT USING (
    legal_entity_id IN (
      SELECT le.id FROM legal_entities le
      WHERE le.corporate_id IN (
        SELECT corporate_id FROM corporate_users 
        WHERE user_id = auth.uid()
      )
    )
    OR auth.role() = 'service_role'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

DO $$ BEGIN
  CREATE POLICY policy_brands_insert ON brands
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

DO $$ BEGIN
  CREATE POLICY policy_brands_update ON brands
  FOR UPDATE USING (
    auth.role() = 'service_role'
  ) WITH CHECK (
    auth.role() = 'service_role'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

-- ============================================
-- POLICIES: corporate_users
-- ============================================

DO $$ BEGIN
  CREATE POLICY policy_corporate_users_select ON corporate_users
  FOR SELECT USING (
    user_id = auth.uid() 
    OR auth.role() = 'service_role'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

DO $$ BEGIN
  CREATE POLICY policy_corporate_users_insert ON corporate_users
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

DO $$ BEGIN
  CREATE POLICY policy_corporate_users_update ON corporate_users
  FOR UPDATE USING (
    auth.role() = 'service_role'
  ) WITH CHECK (
    auth.role() = 'service_role'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;