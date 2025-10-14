-- ═══════════════════════════════════════════════════════════════════
-- AUDITORÍA POST-MIGRACIÓN ENTERPRISE - PARTE 2
-- Verificación de Integridad de Datos (CRÍTICO)
-- ═══════════════════════════════════════════════════════════════════

-- CHECK 2.1: Stores sin brand_id (debe ser 0)
SELECT 
  '2.1 - Stores Huérfanos' as check_group,
  COUNT(*) as stores_sin_brand,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS - Sin stores huérfanos'
    ELSE '🔴 FAIL - HAY ' || COUNT(*) || ' STORES SIN BRAND'
  END as status
FROM stores
WHERE brand_id IS NULL;

-- CHECK 2.2: Compras sin legal_entity_id (debe ser 0)
SELECT 
  '2.2 - Compras Huérfanas' as check_group,
  COUNT(*) as compras_sin_legal_entity,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS - Sin compras huérfanas'
    ELSE '🔴 FAIL - HAY ' || COUNT(*) || ' COMPRAS SIN LEGAL ENTITY'
  END as status
FROM compras
WHERE legal_entity_id IS NULL;

-- CHECK 2.3: Brands huérfanos (debe ser 0)
SELECT 
  '2.3 - Brands Huérfanos' as check_group,
  COUNT(*) as brands_sin_legal_entity,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS - Sin brands huérfanos'
    ELSE '🔴 FAIL - HAY ' || COUNT(*) || ' BRANDS SIN LEGAL ENTITY'
  END as status
FROM brands b
WHERE NOT EXISTS (
  SELECT 1 FROM legal_entities le WHERE le.id = b.legal_entity_id
);

-- CHECK 2.4: Legal entities huérfanos (debe ser 0)
SELECT 
  '2.4 - Legal Entities Huérfanos' as check_group,
  COUNT(*) as legal_entities_sin_corporate,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASS - Sin legal entities huérfanos'
    ELSE '🔴 FAIL - HAY ' || COUNT(*) || ' LEGAL ENTITIES SIN CORPORATE'
  END as status
FROM legal_entities le
WHERE NOT EXISTS (
  SELECT 1 FROM corporates c WHERE c.id = le.corporate_id
);

-- CHECK 2.5: Verificar Foreign Keys están bien vinculadas
SELECT 
  '2.5 - Foreign Keys' as check_group,
  'stores → brands' as relacion,
  COUNT(DISTINCT s.brand_id) as brands_referenciadas,
  COUNT(DISTINCT b.id) as brands_existentes,
  CASE 
    WHEN COUNT(DISTINCT s.brand_id) = COUNT(DISTINCT b.id) 
    THEN '✅ Todas las referencias válidas'
    ELSE '⚠️ Revisar referencias'
  END as status
FROM stores s
JOIN brands b ON b.id = s.brand_id;

-- CHECK 2.6: Verificar que cada tenant tiene su estructura
SELECT 
  '2.6 - Estructura por Tenant' as check_group,
  t.name as tenant,
  COUNT(DISTINCT s.store_id) as num_stores,
  COUNT(DISTINCT s.brand_id) as num_brands_usados,
  COUNT(DISTINCT c.compra_id) as num_compras,
  COUNT(DISTINCT v.id) as num_ventas,
  CASE 
    WHEN COUNT(DISTINCT s.store_id) > 0 AND COUNT(DISTINCT s.brand_id) > 0 
    THEN '✅ Estructura completa'
    ELSE '⚠️ Revisar datos'
  END as status
FROM tenants t
LEFT JOIN stores s ON s.tenant_id = t.tenant_id
LEFT JOIN compras c ON c.tenant_id = t.tenant_id
LEFT JOIN ventas v ON v.tenant_id = t.tenant_id
GROUP BY t.tenant_id, t.name
ORDER BY t.name;
