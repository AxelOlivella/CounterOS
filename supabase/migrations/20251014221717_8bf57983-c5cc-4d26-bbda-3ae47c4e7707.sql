-- ============================================
-- EXTENSIONES Y FUNCIONES BASE
-- ============================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Función para auto-actualizar updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = timezone('utc', now());
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END$$;

-- ============================================
-- TABLA: corporates (grupos económicos)
-- ============================================

CREATE TABLE IF NOT EXISTS corporates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Índices
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_corporates_slug ON corporates(slug);
EXCEPTION WHEN duplicate_table THEN NULL;
END$$;

-- Trigger updated_at
DO $$ BEGIN
  CREATE TRIGGER trg_corporates_updated_at
  BEFORE UPDATE ON corporates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

COMMENT ON TABLE corporates IS 'Grupos económicos (ej: Grupo Nutrisa, Grupo MYT)';

-- ============================================
-- TABLA: legal_entities (razones sociales)
-- ============================================

CREATE TABLE IF NOT EXISTS legal_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id UUID NOT NULL REFERENCES corporates(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  name TEXT NOT NULL,
  rfc TEXT UNIQUE NOT NULL,
  tax_regime TEXT,
  tax_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Índices
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_legal_entities_corporate 
    ON legal_entities(corporate_id);
  CREATE INDEX IF NOT EXISTS idx_legal_entities_rfc 
    ON legal_entities(rfc);
EXCEPTION WHEN duplicate_table THEN NULL;
END$$;

-- Trigger updated_at
DO $$ BEGIN
  CREATE TRIGGER trg_legal_entities_updated_at
  BEFORE UPDATE ON legal_entities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

COMMENT ON TABLE legal_entities IS 'Razones sociales con RFC para CFDIs';
COMMENT ON COLUMN legal_entities.rfc IS 'RFC único para vincular facturas';

-- ============================================
-- TABLA: brands (marcas comerciales)
-- ============================================

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_entity_id UUID NOT NULL REFERENCES legal_entities(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  concept TEXT NOT NULL CHECK (concept IN (
    'sushi', 'crepas', 'cafe', 'hamburguesas', 'tacos',
    'froyo', 'pizza', 'fast_casual', 'casual_dining', 'other'
  )),
  description TEXT,
  branding JSONB DEFAULT '{}'::jsonb,
  target_food_cost NUMERIC(5,2) DEFAULT 30.0 
    CHECK (target_food_cost >= 0 AND target_food_cost <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(legal_entity_id, slug)
);

-- Índices
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_brands_legal_entity 
    ON brands(legal_entity_id);
  CREATE INDEX IF NOT EXISTS idx_brands_concept 
    ON brands(concept);
EXCEPTION WHEN duplicate_table THEN NULL;
END$$;

-- Trigger updated_at
DO $$ BEGIN
  CREATE TRIGGER trg_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

COMMENT ON TABLE brands IS 'Marcas comerciales (ej: Moshi Moshi, La Crêpe)';
COMMENT ON COLUMN brands.concept IS 'Tipo de concepto gastronómico';
COMMENT ON COLUMN brands.branding IS 'JSON con logo, colores, skin: {logo, primary_color, secondary_color}';

-- ============================================
-- TABLA: corporate_users (control de acceso)
-- ============================================

CREATE TABLE IF NOT EXISTS corporate_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  corporate_id UUID NOT NULL REFERENCES corporates(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'analyst', 'viewer')),
  access_scope TEXT NOT NULL CHECK (access_scope IN ('corporate', 'brand', 'store')),
  access_filter JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(user_id, corporate_id)
);

-- Índices
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_corporate_users_user 
    ON corporate_users(user_id);
  CREATE INDEX IF NOT EXISTS idx_corporate_users_corporate 
    ON corporate_users(corporate_id);
EXCEPTION WHEN duplicate_table THEN NULL;
END$$;

COMMENT ON TABLE corporate_users IS 'Permisos granulares por usuario';
COMMENT ON COLUMN corporate_users.access_filter IS 'JSON con filtros: {brand_ids: [...], store_ids: [...]}';