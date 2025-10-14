-- Test data: Insert second store for multi-store fuzzy matching test
-- This is test data, not a schema change
INSERT INTO public.stores (
  tenant_id, 
  name, 
  code,
  slug, 
  location,
  city,
  concept, 
  target_food_cost_pct, 
  active
)
VALUES (
  '69496161-a93f-4bf4-83d8-5a1aa1342ce2',
  'Plaza Norte',
  'PLZ-NORTE-001',
  'plaza-norte',
  'Hermosillo, Sonora',
  'Hermosillo',
  'fast_casual',
  28.5,
  true
)
ON CONFLICT (tenant_id, code) DO NOTHING;