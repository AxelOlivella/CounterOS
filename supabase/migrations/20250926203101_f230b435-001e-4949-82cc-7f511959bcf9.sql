-- Insert sample data for CounterOS demo (fixed JSONB casting)

-- Insert sample stores for each tenant
DO $$
DECLARE
    moyo_id UUID;
    nutrisa_id UUID;
    crepas_id UUID;
    store1_id UUID;
    store2_id UUID;
    store3_id UUID;
BEGIN
    -- Get tenant IDs
    SELECT id INTO moyo_id FROM public.tenants WHERE subdomain = 'moyo';
    SELECT id INTO nutrisa_id FROM public.tenants WHERE subdomain = 'nutrisa';
    SELECT id INTO crepas_id FROM public.tenants WHERE subdomain = 'crepas';

    -- Insert stores for Moyo
    INSERT INTO public.stores (id, tenant_id, code, name, address, is_active) VALUES
        (gen_random_uuid(), moyo_id, 'HMO-001', 'Moyo Progreso', 'Av. Progreso 123, Hermosillo', true),
        (gen_random_uuid(), moyo_id, 'HMO-002', 'Moyo Encinas', 'Blvd. Encinas 456, Hermosillo', true),
        (gen_random_uuid(), moyo_id, 'HMO-003', 'Moyo Quiroga', 'Av. Quiroga 789, Hermosillo', true);

    -- Insert stores for Nutrisa
    INSERT INTO public.stores (id, tenant_id, code, name, address, is_active) VALUES
        (gen_random_uuid(), nutrisa_id, 'NUT-001', 'Nutrisa Centro', 'Centro Comercial Plaza Norte', true),
        (gen_random_uuid(), nutrisa_id, 'NUT-002', 'Nutrisa Sur', 'Plaza del Sol, Local 45', true);

    -- Insert stores for Crepas
    INSERT INTO public.stores (id, tenant_id, code, name, address, is_active) VALUES
        (gen_random_uuid(), crepas_id, 'CRP-001', 'Crepas Polanco', 'Polanco, CDMX', true),
        (gen_random_uuid(), crepas_id, 'CRP-002', 'Crepas Roma', 'Roma Norte, CDMX', true);

    -- Get some store IDs for sample data
    SELECT id INTO store1_id FROM public.stores WHERE code = 'HMO-001';
    SELECT id INTO store2_id FROM public.stores WHERE code = 'HMO-002';
    SELECT id INTO store3_id FROM public.stores WHERE code = 'HMO-003';

    -- Insert sample daily sales for last 30 days (Moyo stores)
    FOR i IN 0..29 LOOP
        INSERT INTO public.daily_sales (tenant_id, store_id, date, gross_sales, discounts, transactions) VALUES
            (moyo_id, store1_id, CURRENT_DATE - INTERVAL '1 day' * i, 
             18000 + (random() * 14000)::numeric, 
             500 + (random() * 1000)::numeric, 
             120 + (random() * 100)::int),
            (moyo_id, store2_id, CURRENT_DATE - INTERVAL '1 day' * i, 
             22000 + (random() * 10000)::numeric, 
             600 + (random() * 800)::numeric, 
             150 + (random() * 70)::int),
            (moyo_id, store3_id, CURRENT_DATE - INTERVAL '1 day' * i, 
             16000 + (random() * 12000)::numeric, 
             400 + (random() * 900)::numeric, 
             100 + (random() * 80)::int);
    END LOOP;

    -- Insert sample purchases (CFDI invoices) with proper JSONB casting
    FOR i IN 0..9 LOOP
        INSERT INTO public.purchases (tenant_id, store_id, invoice_uuid, supplier_rfc, supplier_name, issue_date, subtotal, tax, total, xml_metadata) VALUES
            (moyo_id, store1_id, 'UUID-' || i || '-SAMPLE-' || store1_id::text, 
             'PROV123456789', 'Proveedor de Ingredientes SA', 
             CURRENT_DATE - INTERVAL '1 day' * (i * 3), 
             4500 + (random() * 2000)::numeric, 
             720 + (random() * 320)::numeric, 
             5220 + (random() * 2320)::numeric,
             ('{"version": "4.0", "serie": "A", "folio": "' || (1000 + i) || '"}')::jsonb);
    END LOOP;

    -- Insert sample labor costs
    FOR i IN 0..29 LOOP
        INSERT INTO public.labor_costs (tenant_id, store_id, date, labor_cost, hours) VALUES
            (moyo_id, store1_id, CURRENT_DATE - INTERVAL '1 day' * i, 
             800 + (random() * 700)::numeric, 
             8 + (random() * 4)::numeric),
            (moyo_id, store2_id, CURRENT_DATE - INTERVAL '1 day' * i, 
             900 + (random() * 600)::numeric, 
             8 + (random() * 4)::numeric),
            (moyo_id, store3_id, CURRENT_DATE - INTERVAL '1 day' * i, 
             750 + (random() * 750)::numeric, 
             8 + (random() * 4)::numeric);
    END LOOP;

    -- Insert sample expenses
    FOR i IN 0..9 LOOP
        INSERT INTO public.expenses (tenant_id, store_id, date, category, amount, note) VALUES
            (moyo_id, store1_id, CURRENT_DATE - INTERVAL '1 day' * (i * 3), 'renta', 25000, 'Renta mensual'),
            (moyo_id, store1_id, CURRENT_DATE - INTERVAL '1 day' * (i * 3), 'servicios', 3500 + (random() * 1500)::numeric, 'CFE, agua, gas'),
            (moyo_id, store2_id, CURRENT_DATE - INTERVAL '1 day' * (i * 3), 'renta', 28000, 'Renta mensual'),
            (moyo_id, store3_id, CURRENT_DATE - INTERVAL '1 day' * (i * 3), 'renta', 22000, 'Renta mensual');
    END LOOP;

    -- Insert sample alerts with proper JSONB casting
    INSERT INTO public.alerts (tenant_id, store_id, type, severity, payload) VALUES
        (moyo_id, store1_id, 'food_cost_high', 'warn', '{"value": 32.8, "threshold": 30, "period": "2025-01"}'::jsonb),
        (moyo_id, store2_id, 'labor_high', 'info', '{"value": 21.2, "threshold": 20, "period": "2025-01"}'::jsonb),
        (moyo_id, store3_id, 'low_sales', 'crit', '{"value": 15200, "avg_7d": 18500, "period": "today"}'::jsonb);

END $$;