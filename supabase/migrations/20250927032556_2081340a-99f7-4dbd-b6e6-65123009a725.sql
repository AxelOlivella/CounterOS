-- Enable RLS on all business tables that need it
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_components ENABLE ROW LEVEL SECURITY;

-- Create tenant-based RLS policies for expenses table (skip if exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'tenant_expenses_select') THEN
        EXECUTE 'CREATE POLICY tenant_expenses_select ON public.expenses FOR SELECT USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = expenses.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'tenant_expenses_insert') THEN
        EXECUTE 'CREATE POLICY tenant_expenses_insert ON public.expenses FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = expenses.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'tenant_expenses_update') THEN
        EXECUTE 'CREATE POLICY tenant_expenses_update ON public.expenses FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = expenses.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'tenant_expenses_delete') THEN
        EXECUTE 'CREATE POLICY tenant_expenses_delete ON public.expenses FOR DELETE USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = expenses.tenant_id))';
    END IF;
END $$;

-- Create tenant-based RLS policies for sales table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'tenant_sales_select') THEN
        EXECUTE 'CREATE POLICY tenant_sales_select ON public.sales FOR SELECT USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = sales.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'tenant_sales_insert') THEN
        EXECUTE 'CREATE POLICY tenant_sales_insert ON public.sales FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = sales.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'tenant_sales_update') THEN
        EXECUTE 'CREATE POLICY tenant_sales_update ON public.sales FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = sales.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'tenant_sales_delete') THEN
        EXECUTE 'CREATE POLICY tenant_sales_delete ON public.sales FOR DELETE USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = sales.tenant_id))';
    END IF;
END $$;

-- Create tenant-based RLS policies for ingredients table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ingredients' AND policyname = 'tenant_ingredients_select') THEN
        EXECUTE 'CREATE POLICY tenant_ingredients_select ON public.ingredients FOR SELECT USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = ingredients.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ingredients' AND policyname = 'tenant_ingredients_insert') THEN
        EXECUTE 'CREATE POLICY tenant_ingredients_insert ON public.ingredients FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = ingredients.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ingredients' AND policyname = 'tenant_ingredients_update') THEN
        EXECUTE 'CREATE POLICY tenant_ingredients_update ON public.ingredients FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = ingredients.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ingredients' AND policyname = 'tenant_ingredients_delete') THEN
        EXECUTE 'CREATE POLICY tenant_ingredients_delete ON public.ingredients FOR DELETE USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = ingredients.tenant_id))';
    END IF;
END $$;

-- Create tenant-based RLS policies for products table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'tenant_products_select') THEN
        EXECUTE 'CREATE POLICY tenant_products_select ON public.products FOR SELECT USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = products.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'tenant_products_insert') THEN
        EXECUTE 'CREATE POLICY tenant_products_insert ON public.products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = products.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'tenant_products_update') THEN
        EXECUTE 'CREATE POLICY tenant_products_update ON public.products FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = products.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'tenant_products_delete') THEN
        EXECUTE 'CREATE POLICY tenant_products_delete ON public.products FOR DELETE USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = products.tenant_id))';
    END IF;
END $$;

-- Create tenant-based RLS policies for stores table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stores' AND policyname = 'tenant_stores_select') THEN
        EXECUTE 'CREATE POLICY tenant_stores_select ON public.stores FOR SELECT USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = stores.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stores' AND policyname = 'tenant_stores_insert') THEN
        EXECUTE 'CREATE POLICY tenant_stores_insert ON public.stores FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = stores.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stores' AND policyname = 'tenant_stores_update') THEN
        EXECUTE 'CREATE POLICY tenant_stores_update ON public.stores FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = stores.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stores' AND policyname = 'tenant_stores_delete') THEN
        EXECUTE 'CREATE POLICY tenant_stores_delete ON public.stores FOR DELETE USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = stores.tenant_id))';
    END IF;
END $$;

-- Create tenant-based RLS policies for recipe_components table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_components' AND policyname = 'tenant_recipe_components_select') THEN
        EXECUTE 'CREATE POLICY tenant_recipe_components_select ON public.recipe_components FOR SELECT USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = recipe_components.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_components' AND policyname = 'tenant_recipe_components_insert') THEN
        EXECUTE 'CREATE POLICY tenant_recipe_components_insert ON public.recipe_components FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = recipe_components.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_components' AND policyname = 'tenant_recipe_components_update') THEN
        EXECUTE 'CREATE POLICY tenant_recipe_components_update ON public.recipe_components FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = recipe_components.tenant_id))';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_components' AND policyname = 'tenant_recipe_components_delete') THEN
        EXECUTE 'CREATE POLICY tenant_recipe_components_delete ON public.recipe_components FOR DELETE USING (EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.tenant_id = recipe_components.tenant_id))';
    END IF;
END $$;