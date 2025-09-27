-- Ensure roles can use public schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Ensure table privileges (RLS still applies)
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.tenants TO authenticated;

-- Add a targeted RLS policy on tenants so authenticated users can read their tenant
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tenants' AND policyname = 'Users can view their own tenant via users mapping'
  ) THEN
    CREATE POLICY "Users can view their own tenant via users mapping"
    ON public.tenants
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_user_id = auth.uid()
          AND u.tenant_id = tenants.tenant_id
      )
    );
  END IF;
END $$;