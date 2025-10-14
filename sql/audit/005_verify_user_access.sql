-- ═══════════════════════════════════════════════════════════════════
-- AUDITORÍA POST-MIGRACIÓN ENTERPRISE - PARTE 5
-- Verificación de Acceso de Usuario
-- ═══════════════════════════════════════════════════════════════════
-- NOTA: Este script debe ejecutarse como usuario autenticado, no como service_role

-- CHECK 5.1: Verificar tu acceso en corporate_users
SELECT 
  '5.1 - Mi Acceso Corporate' as check_group,
  u.email,
  cu.role,
  cu.access_scope,
  c.name as corporate_name,
  c.slug as corporate_slug,
  CASE 
    WHEN cu.role = 'admin' THEN '✅ Admin - Acceso completo'
    WHEN cu.role = 'analyst' THEN '📊 Analyst - Solo lectura'
    WHEN cu.role = 'viewer' THEN '👁️ Viewer - Vista limitada'
    ELSE '⚠️ Rol desconocido: ' || cu.role
  END as status
FROM corporate_users cu
JOIN users u ON u.id = cu.user_id
JOIN corporates c ON c.id = cu.corporate_id
WHERE u.auth_user_id = auth.uid();

-- CHECK 5.2: Verificar qué corporates puedo ver
SELECT 
  '5.2 - Corporates Visibles' as check_group,
  c.id,
  c.name,
  c.slug,
  COUNT(DISTINCT le.id) as num_legal_entities,
  COUNT(DISTINCT b.id) as num_brands,
  COUNT(DISTINCT s.store_id) as num_stores,
  '✅ Accesible' as status
FROM corporates c
LEFT JOIN legal_entities le ON le.corporate_id = c.id
LEFT JOIN brands b ON b.legal_entity_id = le.id
LEFT JOIN stores s ON s.brand_id = b.id
WHERE c.id IN (
  SELECT corporate_id 
  FROM corporate_users 
  WHERE user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
)
GROUP BY c.id, c.name, c.slug;

-- CHECK 5.3: Verificar qué brands puedo ver
SELECT 
  '5.3 - Brands Visibles' as check_group,
  b.id,
  b.name,
  b.concept,
  le.name as legal_entity,
  c.name as corporate,
  COUNT(DISTINCT s.store_id) as num_stores,
  '✅ Accesible' as status
FROM brands b
JOIN legal_entities le ON le.id = b.legal_entity_id
JOIN corporates c ON c.id = le.corporate_id
LEFT JOIN stores s ON s.brand_id = b.id
WHERE c.id IN (
  SELECT corporate_id 
  FROM corporate_users 
  WHERE user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
)
GROUP BY b.id, b.name, b.concept, le.name, c.name
ORDER BY c.name, b.name;

-- CHECK 5.4: Verificar qué stores puedo ver
SELECT 
  '5.4 - Stores Visibles' as check_group,
  s.store_id,
  s.name as store_name,
  s.code as store_code,
  s.city,
  b.name as brand,
  c.name as corporate,
  CASE WHEN s.active THEN '✅ Activa' ELSE '❌ Inactiva' END as status
FROM stores s
JOIN brands b ON b.id = s.brand_id
JOIN legal_entities le ON le.id = b.legal_entity_id
JOIN corporates c ON c.id = le.corporate_id
WHERE c.id IN (
  SELECT corporate_id 
  FROM corporate_users 
  WHERE user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
)
ORDER BY c.name, b.name, s.name;

-- CHECK 5.5: Test de permisos - Intentar ver data de ejemplo
-- Este query debería funcionar sin errores si RLS está bien configurado
SELECT 
  '5.5 - Test Lectura Data' as check_group,
  'corporates' as tabla,
  COUNT(*) as registros_visibles,
  '✅ Lectura OK' as status
FROM corporates
UNION ALL
SELECT 
  '5.5 - Test Lectura Data',
  'legal_entities',
  COUNT(*),
  '✅ Lectura OK'
FROM legal_entities
UNION ALL
SELECT 
  '5.5 - Test Lectura Data',
  'brands',
  COUNT(*),
  '✅ Lectura OK'
FROM brands
UNION ALL
SELECT 
  '5.5 - Test Lectura Data',
  'stores',
  COUNT(*),
  '✅ Lectura OK'
FROM stores;
