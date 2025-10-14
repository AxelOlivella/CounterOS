
-- ================================================
-- CORRECCIÓN CRÍTICA: Foreign Keys Enterprise
-- ================================================

-- 1. Corregir FK de corporate_users (debe apuntar a users, no profiles)
ALTER TABLE corporate_users 
  DROP CONSTRAINT IF EXISTS corporate_users_user_id_fkey;

ALTER TABLE corporate_users
  ADD CONSTRAINT corporate_users_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) 
  ON DELETE CASCADE;

-- 2. Verificar y agregar FKs faltantes en tablas enterprise
ALTER TABLE legal_entities 
  DROP CONSTRAINT IF EXISTS legal_entities_corporate_id_fkey;

ALTER TABLE legal_entities
  ADD CONSTRAINT legal_entities_corporate_id_fkey 
  FOREIGN KEY (corporate_id) REFERENCES corporates(id) 
  ON DELETE CASCADE;

ALTER TABLE brands 
  DROP CONSTRAINT IF EXISTS brands_legal_entity_id_fkey;

ALTER TABLE brands
  ADD CONSTRAINT brands_legal_entity_id_fkey 
  FOREIGN KEY (legal_entity_id) REFERENCES legal_entities(id) 
  ON DELETE CASCADE;

ALTER TABLE corporate_users 
  DROP CONSTRAINT IF EXISTS corporate_users_corporate_id_fkey;

ALTER TABLE corporate_users
  ADD CONSTRAINT corporate_users_corporate_id_fkey 
  FOREIGN KEY (corporate_id) REFERENCES corporates(id) 
  ON DELETE CASCADE;

-- 3. Verificar FKs en stores y compras (deben existir del script 003)
ALTER TABLE stores 
  DROP CONSTRAINT IF EXISTS fk_stores_brand;

ALTER TABLE stores
  ADD CONSTRAINT fk_stores_brand 
  FOREIGN KEY (brand_id) REFERENCES brands(id) 
  ON DELETE RESTRICT;

ALTER TABLE compras 
  DROP CONSTRAINT IF EXISTS fk_compras_legal_entity;

ALTER TABLE compras
  ADD CONSTRAINT fk_compras_legal_entity 
  FOREIGN KEY (legal_entity_id) REFERENCES legal_entities(id) 
  ON DELETE RESTRICT;

-- 4. Crear índices para mejorar performance de queries
CREATE INDEX IF NOT EXISTS idx_corporate_users_user_id 
  ON corporate_users(user_id);

CREATE INDEX IF NOT EXISTS idx_corporate_users_corporate_id 
  ON corporate_users(corporate_id);

CREATE INDEX IF NOT EXISTS idx_legal_entities_corporate_id 
  ON legal_entities(corporate_id);

CREATE INDEX IF NOT EXISTS idx_brands_legal_entity_id 
  ON brands(legal_entity_id);

CREATE INDEX IF NOT EXISTS idx_stores_brand_id 
  ON stores(brand_id);

CREATE INDEX IF NOT EXISTS idx_compras_legal_entity_id 
  ON compras(legal_entity_id);
