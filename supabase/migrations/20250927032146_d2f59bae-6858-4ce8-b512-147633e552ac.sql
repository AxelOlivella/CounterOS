-- Fix user data exposure issue
-- Drop the overly permissive policy that allows any user to see all profiles
DROP POLICY IF EXISTS "Users can view profiles by email" ON public.users;

-- Create a secure policy that only allows users to see their own profile
CREATE POLICY "Users can view their own profile only" 
ON public.users 
FOR SELECT 
USING (auth.uid() = auth_user_id);

-- Enable RLS on all business tables (if not already enabled)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_components ENABLE ROW LEVEL SECURITY;

-- Create tenant-based RLS policies for expenses table
CREATE POLICY "Users can view expenses from their tenant only"
ON public.expenses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = expenses.tenant_id
  )
);

CREATE POLICY "Users can insert expenses for their tenant only"
ON public.expenses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = expenses.tenant_id
  )
);

CREATE POLICY "Users can update expenses from their tenant only"
ON public.expenses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = expenses.tenant_id
  )
);

CREATE POLICY "Users can delete expenses from their tenant only"
ON public.expenses
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = expenses.tenant_id
  )
);

-- Create tenant-based RLS policies for sales table
CREATE POLICY "Users can view sales from their tenant only"
ON public.sales
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = sales.tenant_id
  )
);

CREATE POLICY "Users can insert sales for their tenant only"
ON public.sales
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = sales.tenant_id
  )
);

CREATE POLICY "Users can update sales from their tenant only"
ON public.sales
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = sales.tenant_id
  )
);

CREATE POLICY "Users can delete sales from their tenant only"
ON public.sales
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = sales.tenant_id
  )
);

-- Create tenant-based RLS policies for ingredients table
CREATE POLICY "Users can view ingredients from their tenant only"
ON public.ingredients
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = ingredients.tenant_id
  )
);

CREATE POLICY "Users can insert ingredients for their tenant only"
ON public.ingredients
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = ingredients.tenant_id
  )
);

CREATE POLICY "Users can update ingredients from their tenant only"
ON public.ingredients
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = ingredients.tenant_id
  )
);

CREATE POLICY "Users can delete ingredients from their tenant only"
ON public.ingredients
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = ingredients.tenant_id
  )
);

-- Create tenant-based RLS policies for products table
CREATE POLICY "Users can view products from their tenant only"
ON public.products
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = products.tenant_id
  )
);

CREATE POLICY "Users can insert products for their tenant only"
ON public.products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = products.tenant_id
  )
);

CREATE POLICY "Users can update products from their tenant only"
ON public.products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = products.tenant_id
  )
);

CREATE POLICY "Users can delete products from their tenant only"
ON public.products
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = products.tenant_id
  )
);

-- Create tenant-based RLS policies for stores table
CREATE POLICY "Users can view stores from their tenant only"
ON public.stores
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = stores.tenant_id
  )
);

CREATE POLICY "Users can insert stores for their tenant only"
ON public.stores
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = stores.tenant_id
  )
);

CREATE POLICY "Users can update stores from their tenant only"
ON public.stores
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = stores.tenant_id
  )
);

CREATE POLICY "Users can delete stores from their tenant only"
ON public.stores
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = stores.tenant_id
  )
);

-- Create tenant-based RLS policies for recipe_components table
CREATE POLICY "Users can view recipe_components from their tenant only"
ON public.recipe_components
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = recipe_components.tenant_id
  )
);

CREATE POLICY "Users can insert recipe_components for their tenant only"
ON public.recipe_components
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = recipe_components.tenant_id
  )
);

CREATE POLICY "Users can update recipe_components from their tenant only"
ON public.recipe_components
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = recipe_components.tenant_id
  )
);

CREATE POLICY "Users can delete recipe_components from their tenant only"
ON public.recipe_components
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.tenant_id = recipe_components.tenant_id
  )
);