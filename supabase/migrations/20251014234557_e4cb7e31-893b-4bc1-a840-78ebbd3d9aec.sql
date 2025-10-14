-- ═══════════════════════════════════════════════════════════════════════
-- VINCULAR USUARIOS EXISTENTES A CORPORATE_USERS
-- ═══════════════════════════════════════════════════════════════════════

-- Insertar usuarios existentes en corporate_users
-- Vinculamos cada usuario a su corporate según su tenant_id

INSERT INTO corporate_users (user_id, corporate_id, role, access_scope)
SELECT 
  u.id as user_id,
  c.id as corporate_id,
  'admin' as role,  -- Todos admin por ahora
  'corporate' as access_scope
FROM users u
JOIN stores s ON s.tenant_id = u.tenant_id
JOIN brands b ON b.id = s.brand_id
JOIN legal_entities le ON le.id = b.legal_entity_id
JOIN corporates c ON c.id = le.corporate_id
GROUP BY u.id, c.id
ON CONFLICT (user_id, corporate_id) DO NOTHING;

-- Verificar resultado
SELECT 
  'RESULTADO' as check,
  u.email,
  c.name as corporate,
  cu.role,
  cu.access_scope
FROM corporate_users cu
JOIN users u ON u.id = cu.user_id
JOIN corporates c ON c.id = cu.corporate_id
ORDER BY u.email;