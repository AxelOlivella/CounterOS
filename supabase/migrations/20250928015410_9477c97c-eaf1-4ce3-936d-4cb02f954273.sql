-- Create Nutrisa tenant
INSERT INTO tenants (tenant_id, name, theme) 
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Nutrisa',
  '{
    "name": "NutrisaOS",
    "primary": "#E91E63"
  }'::jsonb
);

-- Update demo@nutrisa.com user to point to Nutrisa tenant
UPDATE users 
SET tenant_id = '00000000-0000-0000-0000-000000000002'
WHERE email = 'demo@nutrisa.com';