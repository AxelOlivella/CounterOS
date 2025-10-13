-- Add missing columns to stores table for better data structure
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS concept text;

-- Create unique index on slug for URL-friendly store access
CREATE UNIQUE INDEX IF NOT EXISTS stores_tenant_slug_idx 
ON stores(tenant_id, slug) 
WHERE slug IS NOT NULL;

-- Update existing stores to have slugs based on their codes
UPDATE stores 
SET slug = lower(regexp_replace(code, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Set location from city where available
UPDATE stores 
SET location = city 
WHERE location IS NULL AND city IS NOT NULL;