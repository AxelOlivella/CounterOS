-- Create a demo user in the users table for testing
-- Note: This user should be created after Supabase Auth user is created

DO $$
DECLARE
    moyo_id UUID;
BEGIN
    -- Get Moyo tenant ID
    SELECT id INTO moyo_id FROM public.tenants WHERE subdomain = 'moyo';
    
    -- Insert a demo user (this should match an auth.users entry when created)
    -- The actual auth.users will be created when someone signs up with this email
    INSERT INTO public.users (id, tenant_id, email, name, role, store_scope)
    SELECT 
        gen_random_uuid(),
        moyo_id,
        'demo@moyo.com',
        'Demo User',
        'owner',
        '[]'::jsonb
    WHERE NOT EXISTS (
        SELECT 1 FROM public.users WHERE email = 'demo@moyo.com' AND tenant_id = moyo_id
    );

END $$;