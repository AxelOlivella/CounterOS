-- ═══════════════════════════════════════════════════════════════════
-- AUDITORÍA POST-MIGRACIÓN ENTERPRISE - PARTE 4
-- Verificación de RLS Policies y Permisos
-- ═══════════════════════════════════════════════════════════════════

-- CHECK 4.1: Verificar que RLS está habilitado en todas las tablas
SELECT 
  '4.1 - RLS Habilitado' as check_group,
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS Activo'
    ELSE '🔴 RLS Deshabilitado'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('corporates', 'legal_entities', 'brands', 'corporate_users', 'stores', 'compras', 'ventas')
ORDER BY tablename;

-- CHECK 4.2: Listar todas las policies de tablas enterprise
SELECT 
  '4.2 - RLS Policies' as check_group,
  schemaname,
  tablename,
  policyname,
  cmd as command,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ Tiene condiciones'
    ELSE '⚠️ Sin condiciones'
  END as has_conditions,
  CASE 
    WHEN roles::text LIKE '%authenticated%' THEN '✅ Para usuarios'
    WHEN roles::text LIKE '%service_role%' THEN '🔧 Solo service_role'
    ELSE roles::text
  END as target_role
FROM pg_policies
WHERE tablename IN ('corporates', 'legal_entities', 'brands', 'corporate_users', 'stores', 'compras')
ORDER BY tablename, cmd;

-- CHECK 4.3: Contar policies por tabla
SELECT 
  '4.3 - Conteo Policies' as check_group,
  tablename,
  COUNT(*) as num_policies,
  STRING_AGG(DISTINCT cmd::text, ', ') as operations,
  CASE 
    WHEN COUNT(*) >= 1 THEN '✅ Tiene policies'
    ELSE '🔴 Sin policies'
  END as status
FROM pg_policies
WHERE tablename IN ('corporates', 'legal_entities', 'brands', 'corporate_users', 'stores', 'compras')
GROUP BY tablename
ORDER BY tablename;

-- CHECK 4.4: Verificar índices críticos
SELECT 
  '4.4 - Índices' as check_group,
  schemaname,
  tablename,
  indexname,
  CASE 
    WHEN indexname LIKE '%brand%' OR indexname LIKE '%corporate%' OR indexname LIKE '%legal_entity%' 
    THEN '✅ Índice enterprise'
    ELSE '📋 Índice estándar'
  END as tipo
FROM pg_indexes
WHERE tablename IN ('corporates', 'legal_entities', 'brands', 'corporate_users', 'stores', 'compras')
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- CHECK 4.5: Verificar foreign keys
SELECT 
  '4.5 - Foreign Keys' as check_group,
  tc.table_name as tabla_origen,
  kcu.column_name as columna,
  ccu.table_name as tabla_destino,
  ccu.column_name as columna_destino,
  '✅ FK Configurada' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('legal_entities', 'brands', 'corporate_users', 'stores', 'compras')
ORDER BY tc.table_name, kcu.column_name;
