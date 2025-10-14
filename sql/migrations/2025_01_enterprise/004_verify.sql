-- ============================================
-- VERIFICACIONES DE INTEGRIDAD
-- ============================================

-- 1. Verificar que todas las tablas existen
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'corporates')
    THEN '✅ corporates'
    ELSE '❌ corporates MISSING'
  END as table_check
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'legal_entities')
    THEN '✅ legal_entities'
    ELSE '❌ legal_entities MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brands')
    THEN '✅ brands'
    ELSE '❌ brands MISSING'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'corporate_users')
    THEN '✅ corporate_users'
    ELSE '❌ corporate_users MISSING'
  END;

-- 2. Verificar stores sin brand_id
SELECT 
  COUNT(*) as stores_sin_brand,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Todos los stores tienen brand_id'
    ELSE '❌ Hay stores sin brand_id'
  END as status
FROM stores
WHERE brand_id IS NULL;

-- 3. Verificar compras sin legal_entity_id
SELECT 
  COUNT(*) as compras_sin_legal_entity,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Todas las compras tienen legal_entity_id'
    ELSE '❌ Hay compras sin legal_entity_id'
  END as status
FROM compras
WHERE legal_entity_id IS NULL;

-- 4. Verificar jerarquía completa
SELECT 
  c.name as corporate,
  le.name as legal_entity,
  le.rfc,
  b.name as brand,
  b.concept,
  COUNT(DISTINCT s.store_id) as num_stores
FROM corporates c
JOIN legal_entities le ON le.corporate_id = c.id
JOIN brands b ON b.legal_entity_id = le.id
LEFT JOIN stores s ON s.brand_id = b.id
GROUP BY c.id, c.name, le.id, le.name, le.rfc, b.id, b.name, b.concept
ORDER BY c.name, b.name;

-- 5. Verificar RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('corporates', 'legal_entities', 'brands', 'corporate_users')
ORDER BY tablename, cmd;

-- 6. Summary counts
SELECT 
  (SELECT COUNT(*) FROM corporates) as total_corporates,
  (SELECT COUNT(*) FROM legal_entities) as total_legal_entities,
  (SELECT COUNT(*) FROM brands) as total_brands,
  (SELECT COUNT(*) FROM stores) as total_stores,
  (SELECT COUNT(*) FROM compras) as total_compras,
  (SELECT COUNT(*) FROM ventas) as total_ventas;
