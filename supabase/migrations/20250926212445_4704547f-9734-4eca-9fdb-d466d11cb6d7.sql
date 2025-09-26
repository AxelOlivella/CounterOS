-- Insert demo tenants (only if they don't exist)
INSERT INTO public.tenants (name, subdomain, theme) 
SELECT 'Moyo', 'moyo', '{"primary": "#8B5CF6", "secondary": "#FFFFFF"}'
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE name = 'Moyo');

INSERT INTO public.tenants (name, subdomain, theme) 
SELECT 'Nutrisa', 'nutrisa', '{"primary": "#00C853", "secondary": "#FFFFFF"}'
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE name = 'Nutrisa');

INSERT INTO public.tenants (name, subdomain, theme) 
SELECT 'Crepas', 'crepas', '{"primary": "#F59E0B", "secondary": "#FFFFFF"}'
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE name = 'Crepas');

-- Insert demo users for each tenant
INSERT INTO public.users (email, name, role, tenant_id) 
SELECT 'moyo@demo.com', 'Admin Moyo', 'owner', t.id
FROM public.tenants t 
WHERE t.name = 'Moyo' 
AND NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'moyo@demo.com');

INSERT INTO public.users (email, name, role, tenant_id) 
SELECT 'nutrisa@demo.com', 'Admin Nutrisa', 'owner', t.id
FROM public.tenants t 
WHERE t.name = 'Nutrisa' 
AND NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'nutrisa@demo.com');

INSERT INTO public.users (email, name, role, tenant_id) 
SELECT 'crepas@demo.com', 'Admin Crepas', 'owner', t.id
FROM public.tenants t 
WHERE t.name = 'Crepas' 
AND NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'crepas@demo.com');