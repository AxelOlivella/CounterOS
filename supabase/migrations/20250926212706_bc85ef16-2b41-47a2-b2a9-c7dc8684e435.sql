-- Insert demo stores for each tenant
INSERT INTO public.stores (name, code, tenant_id, address) 
SELECT 'Moyo Progreso', 'MOYO-001', t.id, 'Av. Progreso 123, Col. Centro'
FROM public.tenants t 
WHERE t.name = 'Moyo' 
AND NOT EXISTS (SELECT 1 FROM public.stores WHERE code = 'MOYO-001');

INSERT INTO public.stores (name, code, tenant_id, address) 
SELECT 'Nutrisa Plaza', 'NUT-001', t.id, 'Plaza Central Local 45'
FROM public.tenants t 
WHERE t.name = 'Nutrisa' 
AND NOT EXISTS (SELECT 1 FROM public.stores WHERE code = 'NUT-001');

INSERT INTO public.stores (name, code, tenant_id, address) 
SELECT 'Crepas Mall', 'CREP-001', t.id, 'Mall Norte Piso 2'
FROM public.tenants t 
WHERE t.name = 'Crepas' 
AND NOT EXISTS (SELECT 1 FROM public.stores WHERE code = 'CREP-001');

-- Insert some demo sales data for today (net_sales will be calculated automatically)
INSERT INTO public.daily_sales (date, store_id, tenant_id, gross_sales, discounts, transactions) 
SELECT 
  CURRENT_DATE, 
  s.id, 
  s.tenant_id, 
  30000, 
  1500, 
  185
FROM public.stores s 
WHERE s.code = 'MOYO-001'
AND NOT EXISTS (
  SELECT 1 FROM public.daily_sales 
  WHERE store_id = s.id AND date = CURRENT_DATE
);

INSERT INTO public.daily_sales (date, store_id, tenant_id, gross_sales, discounts, transactions) 
SELECT 
  CURRENT_DATE, 
  s.id, 
  s.tenant_id, 
  24000, 
  1200, 
  142
FROM public.stores s 
WHERE s.code = 'NUT-001'
AND NOT EXISTS (
  SELECT 1 FROM public.daily_sales 
  WHERE store_id = s.id AND date = CURRENT_DATE
);

INSERT INTO public.daily_sales (date, store_id, tenant_id, gross_sales, discounts, transactions) 
SELECT 
  CURRENT_DATE, 
  s.id, 
  s.tenant_id, 
  33000, 
  1800, 
  201
FROM public.stores s 
WHERE s.code = 'CREP-001'
AND NOT EXISTS (
  SELECT 1 FROM public.daily_sales 
  WHERE store_id = s.id AND date = CURRENT_DATE
);

-- Insert some demo purchase data
INSERT INTO public.purchases (tenant_id, store_id, supplier_name, supplier_rfc, issue_date, subtotal, tax, total, invoice_uuid) 
SELECT 
  s.tenant_id, 
  s.id, 
  'Proveedor Demo Moyo', 
  'ABC123456789', 
  CURRENT_DATE - INTERVAL '1 day', 
  8000, 
  1280, 
  9280, 
  'MOYO-' || extract(epoch from now())::text
FROM public.stores s 
WHERE s.code = 'MOYO-001'
AND NOT EXISTS (SELECT 1 FROM public.purchases WHERE supplier_name = 'Proveedor Demo Moyo');

INSERT INTO public.purchases (tenant_id, store_id, supplier_name, supplier_rfc, issue_date, subtotal, tax, total, invoice_uuid) 
SELECT 
  s.tenant_id, 
  s.id, 
  'Proveedor Demo Nutrisa', 
  'DEF123456789', 
  CURRENT_DATE - INTERVAL '1 day', 
  6000, 
  960, 
  6960, 
  'NUT-' || extract(epoch from now())::text
FROM public.stores s 
WHERE s.code = 'NUT-001'
AND NOT EXISTS (SELECT 1 FROM public.purchases WHERE supplier_name = 'Proveedor Demo Nutrisa');

INSERT INTO public.purchases (tenant_id, store_id, supplier_name, supplier_rfc, issue_date, subtotal, tax, total, invoice_uuid) 
SELECT 
  s.tenant_id, 
  s.id, 
  'Proveedor Demo Crepas', 
  'GHI123456789', 
  CURRENT_DATE - INTERVAL '1 day', 
  9000, 
  1440, 
  10440, 
  'CREP-' || extract(epoch from now())::text
FROM public.stores s 
WHERE s.code = 'CREP-001'
AND NOT EXISTS (SELECT 1 FROM public.purchases WHERE supplier_name = 'Proveedor Demo Crepas');