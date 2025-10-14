-- ═══════════════════════════════════════════════════════════════════
-- AUDITORÍA POST-MIGRACIÓN ENTERPRISE - PARTE 3
-- Verificación de Jerarquía Completa
-- ═══════════════════════════════════════════════════════════════════

-- CHECK 3.1: Vista completa de la jerarquía
SELECT 
  '3.1 - Jerarquía Completa' as check_group,
  c.name as corporate,
  le.name as legal_entity,
  le.rfc,
  b.name as brand,
  b.concept,
  b.target_food_cost as target_fc_pct,
  COUNT(DISTINCT s.store_id) as num_stores,
  COUNT(DISTINCT co.compra_id) as num_compras,
  COUNT(DISTINCT v.id) as num_ventas,
  CASE 
    WHEN COUNT(DISTINCT s.store_id) > 0 THEN '✅ Operacional'
    ELSE '⚠️ Sin tiendas'
  END as status
FROM corporates c
LEFT JOIN legal_entities le ON le.corporate_id = c.id
LEFT JOIN brands b ON b.legal_entity_id = le.id
LEFT JOIN stores s ON s.brand_id = b.id
LEFT JOIN compras co ON co.legal_entity_id = le.id
LEFT JOIN ventas v ON v.store_id = s.store_id
GROUP BY c.id, c.name, le.id, le.name, le.rfc, b.id, b.name, b.concept, b.target_food_cost
ORDER BY c.name, le.name, b.name;

-- CHECK 3.2: Resumen por nivel jerárquico
SELECT 
  '3.2 - Resumen Jerárquico' as check_group,
  'Corporates' as nivel,
  COUNT(*) as total,
  '✅' as status
FROM corporates
UNION ALL
SELECT 
  '3.2 - Resumen Jerárquico',
  'Legal Entities',
  COUNT(*),
  CASE WHEN COUNT(*) >= (SELECT COUNT(*) FROM corporates) THEN '✅' ELSE '⚠️' END
FROM legal_entities
UNION ALL
SELECT 
  '3.2 - Resumen Jerárquico',
  'Brands',
  COUNT(*),
  CASE WHEN COUNT(*) >= (SELECT COUNT(*) FROM legal_entities) THEN '✅' ELSE '⚠️' END
FROM brands
UNION ALL
SELECT 
  '3.2 - Resumen Jerárquico',
  'Stores',
  COUNT(*),
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '🔴' END
FROM stores;

-- CHECK 3.3: Stores por Brand (verificar distribución)
SELECT 
  '3.3 - Distribución Stores' as check_group,
  b.name as brand,
  b.concept,
  COUNT(s.store_id) as num_stores,
  STRING_AGG(s.name, ', ' ORDER BY s.name) as stores,
  CASE 
    WHEN COUNT(s.store_id) > 0 THEN '✅ Tiene tiendas'
    ELSE '⚠️ Brand sin tiendas'
  END as status
FROM brands b
LEFT JOIN stores s ON s.brand_id = b.id
GROUP BY b.id, b.name, b.concept
ORDER BY COUNT(s.store_id) DESC, b.name;

-- CHECK 3.4: Verificar consistencia tenant_id
-- Todos los stores de un brand deben tener el mismo tenant_id
SELECT 
  '3.4 - Consistencia Tenant' as check_group,
  b.name as brand,
  COUNT(DISTINCT s.tenant_id) as tenants_diferentes,
  CASE 
    WHEN COUNT(DISTINCT s.tenant_id) = 1 THEN '✅ Consistente'
    WHEN COUNT(DISTINCT s.tenant_id) = 0 THEN '⚠️ Sin tiendas'
    ELSE '🔴 FAIL - Múltiples tenants en mismo brand'
  END as status
FROM brands b
LEFT JOIN stores s ON s.brand_id = b.id
GROUP BY b.id, b.name
HAVING COUNT(DISTINCT s.tenant_id) > 1;

-- Si no devuelve filas, significa que todo está bien
