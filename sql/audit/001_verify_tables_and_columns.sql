-- ═══════════════════════════════════════════════════════════════════
-- AUDITORÍA POST-MIGRACIÓN ENTERPRISE - PARTE 1
-- Verificación de Tablas, Columnas y Estructura
-- ═══════════════════════════════════════════════════════════════════

-- CHECK 1.1: Verificar que tablas existen
SELECT 
  '1.1 - Tablas Enterprise' as check_group,
  table_name,
  CASE 
    WHEN table_name IN ('corporates', 'legal_entities', 'brands', 'corporate_users')
    THEN '✅ Nueva tabla enterprise'
    ELSE '📋 Tabla existente'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN ('corporates', 'legal_entities', 'brands', 'corporate_users', 'stores', 'compras', 'ventas')
ORDER BY 
  CASE WHEN table_name IN ('corporates', 'legal_entities', 'brands', 'corporate_users') 
  THEN 0 ELSE 1 END,
  table_name;

-- CHECK 1.2: Verificar columnas agregadas en stores
SELECT 
  '1.2 - stores.brand_id' as check_group,
  column_name,
  data_type,
  is_nullable,
  CASE 
    WHEN column_name = 'brand_id' AND data_type = 'uuid' AND is_nullable = 'NO' 
    THEN '✅ PASS'
    ELSE '🔴 FAIL'
  END as status
FROM information_schema.columns
WHERE table_name = 'stores' 
  AND column_name = 'brand_id';

-- CHECK 1.3: Verificar columnas agregadas en compras
SELECT 
  '1.3 - compras.legal_entity_id' as check_group,
  column_name,
  data_type,
  is_nullable,
  CASE 
    WHEN column_name = 'legal_entity_id' AND data_type = 'uuid' AND is_nullable = 'NO' 
    THEN '✅ PASS'
    ELSE '🔴 FAIL'
  END as status
FROM information_schema.columns
WHERE table_name = 'compras' 
  AND column_name = 'legal_entity_id';

-- CHECK 1.4: Conteo de registros en tablas enterprise
SELECT 
  '1.4 - Conteo de Registros' as check_group,
  'corporates' as tabla,
  COUNT(*) as total_registros,
  CASE WHEN COUNT(*) > 0 THEN '✅ Tiene datos' ELSE '⚠️ Vacía' END as status
FROM corporates
UNION ALL
SELECT 
  '1.4 - Conteo de Registros',
  'legal_entities',
  COUNT(*),
  CASE WHEN COUNT(*) > 0 THEN '✅ Tiene datos' ELSE '⚠️ Vacía' END
FROM legal_entities
UNION ALL
SELECT 
  '1.4 - Conteo de Registros',
  'brands',
  COUNT(*),
  CASE WHEN COUNT(*) > 0 THEN '✅ Tiene datos' ELSE '⚠️ Vacía' END
FROM brands
UNION ALL
SELECT 
  '1.4 - Conteo de Registros',
  'corporate_users',
  COUNT(*),
  CASE WHEN COUNT(*) > 0 THEN '✅ Tiene datos' ELSE '⚠️ Vacía' END
FROM corporate_users
UNION ALL
SELECT 
  '1.4 - Conteo de Registros',
  'stores',
  COUNT(*),
  CASE WHEN COUNT(*) > 0 THEN '✅ Tiene datos' ELSE '⚠️ Vacía' END
FROM stores;
