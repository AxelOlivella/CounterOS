-- Enable RLS on all business tables (if not already enabled)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_components ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies on business tables to start clean
DROP POLICY IF EXISTS "Tenant access only - expenses SELECT" ON public.expenses;
DROP POLICY IF EXISTS "Tenant access only - expenses INSERT" ON public.expenses;
DROP POLICY IF EXISTS "Tenant access only - expenses UPDATE" ON public.expenses;
DROP POLICY IF EXISTS "Tenant access only - expenses DELETE" ON public.expenses;

DROP POLICY IF EXISTS "Tenant access only - sales SELECT" ON public.sales;
DROP POLICY IF EXISTS "Tenant access only - sales INSERT" ON public.sales;
DROP POLICY IF EXISTS "Tenant access only - sales UPDATE" ON public.sales;
DROP POLICY IF EXISTS "Tenant access only - sales DELETE" ON public.sales;

DROP POLICY IF EXISTS "Tenant access only - ingredients SELECT" ON public.ingredients;
DROP POLICY IF EXISTS "Tenant access only - ingredients INSERT" ON public.ingredients;
DROP POLICY IF EXISTS "Tenant access only - ingredients UPDATE" ON public.ingredients;
DROP POLICY IF EXISTS "Tenant access only - ingredients DELETE" ON public.ingredients;

DROP POLICY IF EXISTS "Tenant access only - products SELECT" ON public.products;
DROP POLICY IF EXISTS "Tenant access only - products INSERT" ON public.products;
DROP POLICY IF EXISTS "Tenant access only - products UPDATE" ON public.products;
DROP POLICY IF EXISTS "Tenant access only - products DELETE" ON public.products;

DROP POLICY IF EXISTS "Tenant access only - stores SELECT" ON public.stores;
DROP POLICY IF EXISTS "Tenant access only - stores INSERT" ON public.stores;
DROP POLICY IF EXISTS "Tenant access only - stores UPDATE" ON public.stores;
DROP POLICY IF EXISTS "Tenant access only - stores DELETE" ON public.stores;

DROP POLICY IF EXISTS "Tenant access only - recipe_components SELECT" ON public.recipe_components;
DROP POLICY IF EXISTS "Tenant access only - recipe_components INSERT" ON public.recipe_components;
DROP POLICY IF EXISTS "Tenant access only - recipe_components UPDATE" ON public.recipe_components;
DROP POLICY IF EXISTS "Tenant access only - recipe_components DELETE" ON public.recipe_components;

-- Create tenant-based RLS policies for expenses table
CREATE POLICY "Tenant access only - expenses SELECT"
ON public.expenses FOR SELECT
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = expenses.tenant_id));

CREATE POLICY "Tenant access only - expenses INSERT"
ON public.expenses FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = expenses.tenant_id));

CREATE POLICY "Tenant access only - expenses UPDATE"
ON public.expenses FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = expenses.tenant_id));

CREATE POLICY "Tenant access only - expenses DELETE"
ON public.expenses FOR DELETE
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = expenses.tenant_id));

-- Create tenant-based RLS policies for sales table
CREATE POLICY "Tenant access only - sales SELECT"
ON public.sales FOR SELECT
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = sales.tenant_id));

CREATE POLICY "Tenant access only - sales INSERT"
ON public.sales FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = sales.tenant_id));

CREATE POLICY "Tenant access only - sales UPDATE"
ON public.sales FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = sales.tenant_id));

CREATE POLICY "Tenant access only - sales DELETE"
ON public.sales FOR DELETE
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = sales.tenant_id));

-- Create tenant-based RLS policies for ingredients table
CREATE POLICY "Tenant access only - ingredients SELECT"
ON public.ingredients FOR SELECT
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = ingredients.tenant_id));

CREATE POLICY "Tenant access only - ingredients INSERT"
ON public.ingredients FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = ingredients.tenant_id));

CREATE POLICY "Tenant access only - ingredients UPDATE"
ON public.ingredients FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = ingredients.tenant_id));

CREATE POLICY "Tenant access only - ingredients DELETE"
ON public.ingredients FOR DELETE
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = ingredients.tenant_id));

-- Create tenant-based RLS policies for products table
CREATE POLICY "Tenant access only - products SELECT"
ON public.products FOR SELECT
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = products.tenant_id));

CREATE POLICY "Tenant access only - products INSERT"
ON public.products FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = products.tenant_id));

CREATE POLICY "Tenant access only - products UPDATE"
ON public.products FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = products.tenant_id));

CREATE POLICY "Tenant access only - products DELETE"
ON public.products FOR DELETE
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = products.tenant_id));

-- Create tenant-based RLS policies for stores table
CREATE POLICY "Tenant access only - stores SELECT"
ON public.stores FOR SELECT
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = stores.tenant_id));

CREATE POLICY "Tenant access only - stores INSERT"
ON public.stores FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = stores.tenant_id));

CREATE POLICY "Tenant access only - stores UPDATE"
ON public.stores FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = stores.tenant_id));

CREATE POLICY "Tenant access only - stores DELETE"
ON public.stores FOR DELETE
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = stores.tenant_id));

-- Create tenant-based RLS policies for recipe_components table
CREATE POLICY "Tenant access only - recipe_components SELECT"
ON public.recipe_components FOR SELECT
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = recipe_components.tenant_id));

CREATE POLICY "Tenant access only - recipe_components INSERT"
ON public.recipe_components FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = recipe_components.tenant_id));

CREATE POLICY "Tenant access only - recipe_components UPDATE"
ON public.recipe_components FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = recipe_components.tenant_id));

CREATE POLICY "Tenant access only - recipe_components DELETE"
ON public.recipe_components FOR DELETE
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = recipe_components.tenant_id));