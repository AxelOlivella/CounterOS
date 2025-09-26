-- Insert sample data for CounterOS demo (with existence checks)

DO $$
DECLARE
    moyo_id UUID;
    store1_id UUID;
BEGIN
    -- Get Moyo tenant ID
    SELECT id INTO moyo_id FROM public.tenants WHERE subdomain = 'moyo';
    
    -- Check if sample data already exists
    IF NOT EXISTS (SELECT 1 FROM public.stores WHERE tenant_id = moyo_id AND code = 'HMO-001') THEN
        -- Insert stores for Moyo
        INSERT INTO public.stores (id, tenant_id, code, name, address, is_active) VALUES
            (gen_random_uuid(), moyo_id, 'HMO-001', 'Moyo Progreso', 'Av. Progreso 123, Hermosillo', true),
            (gen_random_uuid(), moyo_id, 'HMO-002', 'Moyo Encinas', 'Blvd. Encinas 456, Hermosillo', true),
            (gen_random_uuid(), moyo_id, 'HMO-003', 'Moyo Quiroga', 'Av. Quiroga 789, Hermosillo', true);
    END IF;

    -- Get first store ID for sample data
    SELECT id INTO store1_id FROM public.stores WHERE code = 'HMO-001' LIMIT 1;
    
    -- Insert sample daily sales only if none exist
    IF NOT EXISTS (SELECT 1 FROM public.daily_sales WHERE tenant_id = moyo_id) AND store1_id IS NOT NULL THEN
        -- Insert today's sales data
        INSERT INTO public.daily_sales (tenant_id, store_id, date, gross_sales, discounts, transactions) VALUES
            (moyo_id, store1_id, CURRENT_DATE, 28500, 850, 185),
            (moyo_id, store1_id, CURRENT_DATE - 1, 22300, 650, 142),
            (moyo_id, store1_id, CURRENT_DATE - 2, 31200, 920, 201);
    END IF;
    
    -- Insert sample purchases only if none exist
    IF NOT EXISTS (SELECT 1 FROM public.purchases WHERE tenant_id = moyo_id) AND store1_id IS NOT NULL THEN
        INSERT INTO public.purchases (tenant_id, store_id, invoice_uuid, supplier_rfc, supplier_name, issue_date, subtotal, tax, total, xml_metadata) VALUES
            (moyo_id, store1_id, 'UUID-SAMPLE-001', 'PROV123456789', 'Proveedor de Ingredientes SA', CURRENT_DATE - 1, 5500, 880, 6380, '{"version": "4.0", "serie": "A", "folio": "1001"}'::jsonb),
            (moyo_id, store1_id, 'UUID-SAMPLE-002', 'PROV987654321', 'Distribuidora de Alimentos', CURRENT_DATE - 2, 3200, 512, 3712, '{"version": "4.0", "serie": "B", "folio": "2001"}'::jsonb);
    END IF;
    
    -- Insert sample labor costs only if none exist
    IF NOT EXISTS (SELECT 1 FROM public.labor_costs WHERE tenant_id = moyo_id) AND store1_id IS NOT NULL THEN
        INSERT INTO public.labor_costs (tenant_id, store_id, date, labor_cost, hours) VALUES
            (moyo_id, store1_id, CURRENT_DATE, 1200, 10),
            (moyo_id, store1_id, CURRENT_DATE - 1, 1150, 9.5),
            (moyo_id, store1_id, CURRENT_DATE - 2, 1300, 11);
    END IF;
    
    -- Insert sample expenses only if none exist
    IF NOT EXISTS (SELECT 1 FROM public.expenses WHERE tenant_id = moyo_id) AND store1_id IS NOT NULL THEN
        INSERT INTO public.expenses (tenant_id, store_id, date, category, amount, note) VALUES
            (moyo_id, store1_id, CURRENT_DATE, 'renta', 25000, 'Renta mensual'),
            (moyo_id, store1_id, CURRENT_DATE, 'servicios', 4200, 'CFE, agua, gas'),
            (moyo_id, store1_id, CURRENT_DATE - 1, 'marketing', 2500, 'Publicidad digital');
    END IF;
    
    -- Insert sample alerts only if none exist
    IF NOT EXISTS (SELECT 1 FROM public.alerts WHERE tenant_id = moyo_id) AND store1_id IS NOT NULL THEN
        INSERT INTO public.alerts (tenant_id, store_id, type, severity, payload) VALUES
            (moyo_id, store1_id, 'food_cost_high', 'warn', '{"value": 32.8, "threshold": 30, "period": "2025-01"}'::jsonb),
            (moyo_id, store1_id, 'labor_high', 'info', '{"value": 21.2, "threshold": 20, "period": "2025-01"}'::jsonb),
            (moyo_id, store1_id, 'low_sales', 'crit', '{"value": 15200, "avg_7d": 18500, "period": "today"}'::jsonb);
    END IF;

END $$;