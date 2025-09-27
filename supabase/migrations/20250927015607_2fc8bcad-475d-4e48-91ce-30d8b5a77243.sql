-- Simple seed data for CounterOS demo
insert into tenants (name, subdomain, theme, rfc)
values ('Demo CounterOS', 'demo-counteros', '{"primary": "#00C853", "secondary": "#FFFFFF"}', 'DCO240927ABC')
on conflict (subdomain) do nothing;

-- Get the tenant ID and create demo data
do $$
declare
    demo_tenant_id uuid;
    demo_store_id uuid;
begin
    -- Get demo tenant
    select id into demo_tenant_id from tenants where subdomain = 'demo-counteros' limit 1;
    
    -- Insert demo store
    if not exists (select 1 from stores where tenant_id = demo_tenant_id and code = 'MXY-PORTAL') then
        insert into stores (tenant_id, name, code, address) 
        values (demo_tenant_id, 'Portal Centro', 'MXY-PORTAL', 'Centro Histórico, CDMX');
    end if;
    
    -- Get store ID
    select id into demo_store_id from stores where tenant_id = demo_tenant_id and code = 'MXY-PORTAL';
    
    -- Insert demo sales data (last 30 days)
    if not exists (select 1 from daily_sales where tenant_id = demo_tenant_id and store_id = demo_store_id) then
        insert into daily_sales (tenant_id, store_id, date, gross_sales, discounts, transactions)
        select 
            demo_tenant_id,
            demo_store_id,
            d::date,
            case when extract(dow from d) in (6,0) then 52000 + (random() * 18000)::numeric
                 else 38000 + (random() * 12000)::numeric end,
            case when extract(dow from d) in (6,0) then 2500 + (random() * 1200)::numeric
                 else 1800 + (random() * 800)::numeric end,
            case when extract(dow from d) in (6,0) then 210 + (random() * 50)::integer
                 else 165 + (random() * 35)::integer end
        from generate_series(current_date - interval '29 days', current_date, interval '1 day') d;
    end if;
    
    -- Insert demo purchases
    if not exists (select 1 from purchases where tenant_id = demo_tenant_id and store_id = demo_store_id) then
        insert into purchases (tenant_id, store_id, issue_date, supplier_name, supplier_rfc, total, subtotal, tax, invoice_uuid)
        select
            demo_tenant_id,
            demo_store_id,
            d::date,
            case (random() * 4)::integer
                when 0 then 'Lácteos Premium SA de CV'
                when 1 then 'Frutas y Verduras del Valle'
                when 2 then 'Insumos Gourmet México'
                else 'Distribuidora Alimentaria'
            end,
            'LPR' || lpad((random() * 999999)::text, 6, '0') || (array['ABC','XYZ','DEF'])[ceil(random()*3)],
            6500 + (random() * 8500)::numeric,
            5600 + (random() * 7300)::numeric,
            900 + (random() * 1200)::numeric,
            gen_random_uuid()::text
        from generate_series(current_date - interval '29 days', current_date, interval '3 days') d;
    end if;
    
    -- Insert demo expenses  
    if not exists (select 1 from expenses where tenant_id = demo_tenant_id and store_id = demo_store_id) then
        insert into expenses (tenant_id, store_id, date, category, amount)
        select
            demo_tenant_id,
            demo_store_id,
            d::date,
            categories.category,
            case categories.category
                when 'Nómina' then 18000 + (random() * 7000)::numeric
                when 'Energía' then 3200 + (random() * 1800)::numeric
                when 'Renta' then 28000::numeric
                when 'Marketing' then 2500 + (random() * 2000)::numeric
                else 1000 + (random() * 800)::numeric
            end
        from generate_series(current_date - interval '29 days', current_date, interval '7 days') d
        cross join (values ('Nómina'), ('Energía'), ('Renta'), ('Marketing')) as categories(category);
    end if;
    
end $$;