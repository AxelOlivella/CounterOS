-- ============================================
-- MIGRACIÓN: Crear defaults por tenant existente
-- ============================================

-- PASO 1: Crear corporate default
INSERT INTO corporates (id, name, slug)
SELECT 
  tenant_id,
  name || ' Corporate',
  LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) || '-corporate'
FROM tenants
WHERE NOT EXISTS (
  SELECT 1 FROM corporates WHERE id = tenants.tenant_id
);

-- PASO 2: Crear legal_entity default
INSERT INTO legal_entities (corporate_id, name, rfc)
SELECT 
  t.tenant_id,
  t.name || ' SA de CV',
  COALESCE(
    'RFC' || LPAD(ROW_NUMBER() OVER (ORDER BY t.tenant_id)::TEXT, 9, '0'),
    'RFC' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 12))
  )
FROM tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM legal_entities WHERE corporate_id = t.tenant_id
);

-- PASO 3: Crear brand default por tenant
INSERT INTO brands (legal_entity_id, name, slug, concept, target_food_cost)
SELECT 
  le.id,
  'Marca Principal',
  'principal',
  COALESCE(
    (SELECT concept FROM stores WHERE tenant_id = le.corporate_id LIMIT 1),
    'other'
  ),
  COALESCE(
    (SELECT AVG(target_food_cost_pct) FROM stores WHERE tenant_id = le.corporate_id),
    30.0
  )
FROM legal_entities le
WHERE NOT EXISTS (
  SELECT 1 FROM brands WHERE legal_entity_id = le.id
);

-- ============================================
-- EXTENDER TABLA: stores (agregar brand_id)
-- ============================================

-- PASO 1: Agregar columna (nullable)
DO $$ BEGIN
  ALTER TABLE stores ADD COLUMN brand_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END$$;

-- PASO 2: Llenar brand_id con default
UPDATE stores s
SET brand_id = (
  SELECT b.id 
  FROM brands b
  JOIN legal_entities le ON le.id = b.legal_entity_id
  WHERE le.corporate_id = s.tenant_id
  LIMIT 1
)
WHERE s.brand_id IS NULL;

-- PASO 3: Hacer NOT NULL
ALTER TABLE stores ALTER COLUMN brand_id SET NOT NULL;

-- PASO 4: Agregar FK
DO $$ BEGIN
  ALTER TABLE stores ADD CONSTRAINT fk_stores_brand 
    FOREIGN KEY (brand_id) REFERENCES brands(id) 
    ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

-- PASO 5: Crear índice
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_stores_brand ON stores(brand_id);
EXCEPTION WHEN duplicate_table THEN NULL;
END$$;

-- ============================================
-- EXTENDER TABLA: compras (agregar legal_entity_id)
-- ============================================

-- PASO 1: Agregar columna (nullable)
DO $$ BEGIN
  ALTER TABLE compras ADD COLUMN legal_entity_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END$$;

-- PASO 2: Llenar legal_entity_id
UPDATE compras c
SET legal_entity_id = (
  SELECT b.legal_entity_id
  FROM stores s
  JOIN brands b ON b.id = s.brand_id
  WHERE s.store_id = c.store_id
  LIMIT 1
)
WHERE c.legal_entity_id IS NULL;

-- PASO 3: Hacer NOT NULL
ALTER TABLE compras ALTER COLUMN legal_entity_id SET NOT NULL;

-- PASO 4: Agregar FK
DO $$ BEGIN
  ALTER TABLE compras ADD CONSTRAINT fk_compras_legal_entity 
    FOREIGN KEY (legal_entity_id) REFERENCES legal_entities(id) 
    ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

-- PASO 5: Crear índice
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_compras_legal_entity 
    ON compras(legal_entity_id);
EXCEPTION WHEN duplicate_table THEN NULL;
END$$;