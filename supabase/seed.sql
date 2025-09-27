-- Seed rápido para demo (1 tenant, 1 tienda, 3 productos, 5 insumos)

insert into tenants (tenant_id, name)
values ('00000000-0000-0000-0000-000000000001', 'Demo Tenant')
on conflict do nothing;

insert into stores (tenant_id, code, name, city)
values ('00000000-0000-0000-0000-000000000001', 'MXY-PORTAL', 'Portal Centro', 'CDMX')
on conflict do nothing;

-- Insumos
insert into ingredients (tenant_id, code, name, unit, cost_per_unit)
values
('00000000-0000-0000-0000-000000000001','LECHE_L','Leche entera','l',22.00),
('00000000-0000-0000-0000-000000000001','BASE_YO_KG','Base yogurt','kg',85.00),
('00000000-0000-0000-0000-000000000001','MANGO_KG','Mango','kg',60.00),
('00000000-0000-0000-0000-000000000001','NUZ_PZ','Nuez','pz',3.50),
('00000000-0000-0000-0000-000000000001','VASO_12OZ','Vaso 12oz','pz',1.80)
on conflict do nothing;

-- Productos
insert into products (tenant_id, sku, name)
values
('00000000-0000-0000-0000-000000000001','YO-NAT-12','Yogurt natural 12oz'),
('00000000-0000-0000-0000-000000000001','YO-MAN-12','Yogurt mango 12oz'),
('00000000-0000-0000-0000-000000000001','YO-MAN-NUZ-12','Yogurt mango+nuez 12oz')
on conflict do nothing;

-- Recetas (cantidades en unidad declarada del ingrediente)
-- Supuesto: 0.20 kg base por vaso / 0.06 kg mango / 1 pieza nuez / 1 vaso
insert into recipe_components (tenant_id, product_id, ingredient_id, qty)
select '00000000-0000-0000-0000-000000000001', p.product_id, i.ingredient_id, 0.20
from products p join ingredients i on p.tenant_id=i.tenant_id
where p.sku in ('YO-NAT-12','YO-MAN-12','YO-MAN-NUZ-12') and i.code='BASE_YO_KG';

insert into recipe_components (tenant_id, product_id, ingredient_id, qty)
select '00000000-0000-0000-0000-000000000001', p.product_id, i.ingredient_id, 0.06
from products p join ingredients i on p.tenant_id=i.tenant_id
where p.sku in ('YO-MAN-12','YO-MAN-NUZ-12') and i.code='MANGO_KG';

insert into recipe_components (tenant_id, product_id, ingredient_id, qty)
select '00000000-0000-0000-0000-000000000001', p.product_id, i.ingredient_id, 1
from products p join ingredients i on p.tenant_id=i.tenant_id
where p.sku='YO-MAN-NUZ-12' and i.code='NUZ_PZ';

insert into recipe_components (tenant_id, product_id, ingredient_id, qty)
select '00000000-0000-0000-0000-000000000001', p.product_id, i.ingredient_id, 1
from products p join ingredients i on p.tenant_id=i.tenant_id
where p.sku in ('YO-NAT-12','YO-MAN-12','YO-MAN-NUZ-12') and i.code='VASO_12OZ';

-- Ventas de una semana (POS)
insert into sales (tenant_id, store_id, sold_at, ticket_id, sku, qty, unit_price)
select '00000000-0000-0000-0000-000000000001', s.store_id, d, 'TKT-'||to_char(d,'YYYYMMDD')||'-01', 'YO-NAT-12', 35, 52.00
from stores s, generate_series(now()::date-6, now()::date, interval '1 day') d
where s.code='MXY-PORTAL';

insert into sales (tenant_id, store_id, sold_at, ticket_id, sku, qty, unit_price)
select '00000000-0000-0000-0000-000000000001', s.store_id, d, 'TKT-'||to_char(d,'YYYYMMDD')||'-02', 'YO-MAN-12', 28, 58.00
from stores s, generate_series(now()::date-6, now()::date, interval '1 day') d
where s.code='MXY-PORTAL';

insert into sales (tenant_id, store_id, sold_at, ticket_id, sku, qty, unit_price)
select '00000000-0000-0000-0000-000000000001', s.store_id, d, 'TKT-'||to_char(d,'YYYYMMDD')||'-03', 'YO-MAN-NUZ-12', 18, 64.00
from stores s, generate_series(now()::date-6, now()::date, interval '1 day') d
where s.code='MXY-PORTAL';

-- Gastos del mes
insert into expenses (tenant_id, store_id, period, rent, payroll, energy, marketing_pct, royalty_pct, other)
select '00000000-0000-0000-0000-000000000001', store_id, date_trunc('month', now())::date,
       38000, 52000, 14500, 0.02, 0.06, 3000
from stores
where code='MXY-PORTAL';