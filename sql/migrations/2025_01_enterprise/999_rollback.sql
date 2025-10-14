-- ============================================
-- ROLLBACK SCRIPT (SOLO EN EMERGENCIA)
-- ============================================

-- WARNING: Este script revierte TODA la migración enterprise.
-- Solo ejecutar si hay problemas críticos.

BEGIN;

-- 1. Remover FKs de tablas extendidas
ALTER TABLE IF EXISTS compras 
  DROP CONSTRAINT IF EXISTS fk_compras_legal_entity;

ALTER TABLE IF EXISTS stores 
  DROP CONSTRAINT IF EXISTS fk_stores_brand;

-- 2. Remover columnas agregadas
ALTER TABLE IF EXISTS compras 
  DROP COLUMN IF EXISTS legal_entity_id;

ALTER TABLE IF EXISTS stores 
  DROP COLUMN IF EXISTS brand_id;

-- 3. Deshabilitar RLS (opcional, solo en dev)
ALTER TABLE IF EXISTS brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS legal_entities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS corporates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS corporate_users DISABLE ROW LEVEL SECURITY;

-- 4. Drop tablas nuevas (SOLO EN DEV, comentado por seguridad)
/*
DROP TABLE IF EXISTS corporate_users CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS legal_entities CASCADE;
DROP TABLE IF EXISTS corporates CASCADE;
*/

-- 5. Remover función updated_at (opcional)
-- DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

-- 6. Verificar rollback
SELECT 
  'Rollback executed. Verify manually:' as message
UNION ALL
SELECT '- stores.brand_id should not exist'
UNION ALL
SELECT '- compras.legal_entity_id should not exist'
UNION ALL
SELECT '- New tables may still exist (commented in script)';

-- COMMIT solo si verificaste que todo está OK
COMMIT;
-- Si algo falló: ROLLBACK;
