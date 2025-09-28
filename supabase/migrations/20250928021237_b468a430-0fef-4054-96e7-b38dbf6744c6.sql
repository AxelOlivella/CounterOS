-- Fix RLS policies for stores table to match existing function pattern
-- The stores table needs proper RLS but users need to access it through the get_stores_data function

-- First check current policies on stores table
DO $$
BEGIN
    -- Drop existing conflicting policies on stores if they exist
    DROP POLICY IF EXISTS "tenant_stores_select" ON public.stores;
    DROP POLICY IF EXISTS "Users can view stores from their tenant only" ON public.stores;
    DROP POLICY IF EXISTS "Tenant access only - stores SELECT" ON public.stores;
    
    -- Create a new policy that allows access via the function
    CREATE POLICY "Users can view stores via function" ON public.stores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.tenant_id = stores.tenant_id
        )
    );
    
    -- Ensure RLS is enabled
    ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
    
    -- Grant necessary permissions to authenticated users
    GRANT SELECT ON public.stores TO authenticated;
    
END $$;