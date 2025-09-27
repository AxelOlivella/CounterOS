-- =========================
-- CounterOS – esquema mínimo (MVP)
-- Tablas: tenants, stores, ingredients, products, recipes, sales, expenses
-- Vistas: daily_food_cost_view, pnl_monthly_view
-- RLS por tenant_id
-- =========================

-- Limpieza opcional (solo en desarrollo)
-- DROP SCHEMA public CASCADE; CREATE SCHEMA public;

-- ─────────────────────────────────────────────────────────────
-- 1) TENANCY Y CATÁLOGOS BÁSICOS
-- ─────────────────────────────────────────────────────────────
create table if not exists tenants (
  tenant_id uuid primary key default gen_random_uuid(),
  name text not null,
  theme jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists stores (
  store_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(tenant_id) on delete cascade,
  code text not null,           -- ej. "MXY-PORTAL-CENTRO"
  name text not null,
  city text,
  active boolean default true,
  created_at timestamptz default now(),
  unique(tenant_id, code)
);

-- ─────────────────────────────────────────────────────────────
-- 2) INSUMOS / PRODUCTOS / RECETAS
-- ─────────────────────────────────────────────────────────────
create table if not exists ingredients (
  ingredient_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(tenant_id) on delete cascade,
  code text not null,                 -- ej. "LECHE_LTS"
  name text not null,                 -- "Leche entera"
  unit text not null,                 -- "l","kg","g","pz"
  cost_per_unit numeric(12,4) not null default 0, -- MXN por unidad declarada
  created_at timestamptz default now(),
  unique(tenant_id, code)
);

create table if not exists products (
  product_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(tenant_id) on delete cascade,
  sku text not null,                  -- ej. "YO-NAT-12OZ"
  name text not null,                 -- "Yogurt natural 12oz"
  active boolean default true,
  created_at timestamptz default now(),
  unique(tenant_id, sku)
);

-- receta = lista de componentes (insumos) por producto
create table if not exists recipe_components (
  recipe_component_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(tenant_id) on delete cascade,
  product_id uuid not null references products(product_id) on delete cascade,
  ingredient_id uuid not null references ingredients(ingredient_id),
  qty numeric(12,4) not null,        -- cantidad en unidad declarada del ingrediente
  constraint uq_recipe unique (tenant_id, product_id, ingredient_id)
);

-- ─────────────────────────────────────────────────────────────
-- 3) VENTAS POS (CSV) – a nivel línea
-- ─────────────────────────────────────────────────────────────
create table if not exists sales (
  sale_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(tenant_id) on delete cascade,
  store_id uuid not null references stores(store_id) on delete cascade,
  sold_at timestamptz not null,
  ticket_id text not null,
  sku text not null,                 -- debe matchear products.sku
  qty numeric(12,4) not null,
  unit_price numeric(12,4) not null,
  created_at timestamptz default now()
);

create index if not exists idx_sales_tenant_date on sales(tenant_id, sold_at);
create index if not exists idx_sales_tenant_store on sales(tenant_id, store_id);

-- ─────────────────────────────────────────────────────────────
-- 4) GASTOS FIJOS / VARIABLES PARA P&L
-- ─────────────────────────────────────────────────────────────
create table if not exists expenses (
  expense_id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(tenant_id) on delete cascade,
  store_id uuid not null references stores(store_id) on delete cascade,
  period date not null,              -- usar día 1 del mes (YYYY-MM-01)
  rent numeric(14,2) default 0,
  payroll numeric(14,2) default 0,
  energy numeric(14,2) default 0,
  marketing_pct numeric(6,4) default 0, -- ej. 0.02 = 2%
  royalty_pct numeric(6,4) default 0,   -- ej. 0.06 = 6%
  other numeric(14,2) default 0,
  created_at timestamptz default now(),
  unique(tenant_id, store_id, period)
);

-- ─────────────────────────────────────────────────────────────
-- 5) VISTAS DE CÁLCULO (Food Cost & P&L)
--    Supuesto MVP: COGS = consumo teórico (receta×ventas) * costo ingrediente
-- ─────────────────────────────────────────────────────────────
-- Vista auxiliar: ventas agregadas por producto / día
create or replace view v_sales_daily as
select
  s.tenant_id,
  s.store_id,
  date_trunc('day', s.sold_at)::date as day,
  p.product_id,
  p.sku,
  sum(s.qty) as qty_sold,
  sum(s.qty * s.unit_price) as revenue
from sales s
join products p
  on p.tenant_id = s.tenant_id
 and p.sku = s.sku
group by 1,2,3,4,5;

-- Consumo teórico por ingrediente / día
create or replace view v_theoretical_consumption_daily as
select
  vs.tenant_id,
  vs.store_id,
  vs.day,
  rc.ingredient_id,
  sum(vs.qty_sold * rc.qty) as qty_needed
from v_sales_daily vs
join recipe_components rc
  on rc.tenant_id = vs.tenant_id
 and rc.product_id = vs.product_id
group by 1,2,3,4;

-- Food cost diario por tienda
create or replace view daily_food_cost_view as
select
  t.tenant_id,
  vs.store_id,
  vs.day,
  sum(vs.revenue) as revenue,
  sum(tc.qty_needed * i.cost_per_unit) as cogs,
  case when sum(vs.revenue) = 0 then 0
       else round(100 * sum(tc.qty_needed * i.cost_per_unit) / sum(vs.revenue), 2)
  end as food_cost_pct
from v_sales_daily vs
join v_theoretical_consumption_daily tc
  on tc.tenant_id = vs.tenant_id
 and tc.store_id = vs.store_id
 and tc.day = vs.day
join ingredients i
  on i.ingredient_id = tc.ingredient_id
 and i.tenant_id = tc.tenant_id
join tenants t on t.tenant_id = vs.tenant_id
group by 1,2,3
order by vs.day;

-- P&L mensual (simplificado)
create or replace view pnl_monthly_view as
with revenue_month as (
  select tenant_id, store_id, date_trunc('month', sold_at)::date as period,
         sum(qty * unit_price) as revenue
  from sales
  group by 1,2,3
),
cogs_month as (
  select tenant_id, store_id, date_trunc('month', day)::date as period,
         sum(cogs) as cogs
  from daily_food_cost_view
  group by 1,2,3
)
select
  r.tenant_id,
  r.store_id,
  r.period,
  coalesce(r.revenue,0) as revenue,
  coalesce(c.cogs,0) as cogs,
  e.rent,
  e.payroll,
  e.energy,
  round(coalesce(r.revenue,0) * coalesce(e.marketing_pct,0), 2) as marketing,
  round(coalesce(r.revenue,0) * coalesce(e.royalty_pct,0), 2) as royalties,
  e.other,
  (coalesce(r.revenue,0)
   - coalesce(c.cogs,0)
   - coalesce(e.rent,0)
   - coalesce(e.payroll,0)
   - coalesce(e.energy,0)
   - round(coalesce(r.revenue,0) * coalesce(e.marketing_pct,0), 2)
   - round(coalesce(r.revenue,0) * coalesce(e.royalty_pct,0), 2)
   - coalesce(e.other,0)
  ) as ebitda
from revenue_month r
left join cogs_month c
  on c.tenant_id = r.tenant_id
 and c.store_id = r.store_id
 and c.period = r.period
left join expenses e
  on e.tenant_id = r.tenant_id
 and e.store_id = r.store_id
 and e.period = r.period;

-- ─────────────────────────────────────────────────────────────
-- 6) RLS (Row Level Security) por tenant_id
-- ─────────────────────────────────────────────────────────────
alter table tenants enable row level security;
alter table stores enable row level security;
alter table ingredients enable row level security;
alter table products enable row level security;
alter table recipe_components enable row level security;
alter table sales enable row level security;
alter table expenses enable row level security;

-- Política: permitir al usuario cuyo JWT incluya claim `tenant_id` ver/insertar solo su tenant
-- Configura Supabase Auth para inyectar claim tenant_id en el JWT.

create policy "tenant_isolation_select" on tenants
  for select using (true); -- opcional: lectura pública de catálogo (o restríngelo si prefieres)

create policy "stores_tenant_r" on stores
  for select using (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id');
create policy "stores_tenant_w" on stores
  for insert with check (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id');
create policy "stores_tenant_u" on stores
  for update using (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id');

create policy "ingredients_tenant_r" on ingredients
  for select using (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id');
create policy "ingredients_tenant_cu" on ingredients
  for all using (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')
  with check (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id');

create policy "products_tenant_all" on products
  for all using (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')
  with check (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id');

create policy "recipes_tenant_all" on recipe_components
  for all using (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')
  with check (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id');

create policy "sales_tenant_all" on sales
  for all using (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')
  with check (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id');

create policy "expenses_tenant_all" on expenses
  for all using (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')
  with check (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id');

-- Índices útiles
create index if not exists idx_recipe_by_product on recipe_components(product_id);
create index if not exists idx_ingredients_tenant_code on ingredients(tenant_id, code);
create index if not exists idx_products_tenant_sku on products(tenant_id, sku);