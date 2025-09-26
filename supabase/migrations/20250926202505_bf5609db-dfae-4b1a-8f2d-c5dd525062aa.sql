-- Fix function to use fully qualified table names with empty search_path
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.users.tenant_id FROM public.users WHERE public.users.id = auth.uid();
$$;