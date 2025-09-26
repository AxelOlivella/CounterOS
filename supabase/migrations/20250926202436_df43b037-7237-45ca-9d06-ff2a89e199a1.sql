-- Fix security warning: Function Search Path Mutable
-- Update the function to have a secure search path

CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid();
$$;

-- Create RLS policies now that the function is secure

-- RLS Policies for tenants
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
CREATE POLICY "Users can view their own tenant" ON public.tenants
  FOR SELECT USING (id = public.get_user_tenant_id());

-- RLS Policies for users  
DROP POLICY IF EXISTS "Users can view users in their tenant" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can view users in their tenant" ON public.users
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- RLS Policies for stores
DROP POLICY IF EXISTS "Users can view stores in their tenant" ON public.stores;
DROP POLICY IF EXISTS "Owners and managers can manage stores" ON public.stores;

CREATE POLICY "Users can view stores in their tenant" ON public.stores
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Owners and managers can manage stores" ON public.stores
  FOR ALL USING (
    tenant_id = public.get_user_tenant_id() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

-- RLS Policies for daily_sales
DROP POLICY IF EXISTS "Users can view daily sales in their tenant" ON public.daily_sales;
DROP POLICY IF EXISTS "Staff can manage daily sales" ON public.daily_sales;

CREATE POLICY "Users can view daily sales in their tenant" ON public.daily_sales
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Staff can manage daily sales" ON public.daily_sales
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- RLS Policies for purchases
DROP POLICY IF EXISTS "Users can view purchases in their tenant" ON public.purchases;
DROP POLICY IF EXISTS "Staff can manage purchases" ON public.purchases;

CREATE POLICY "Users can view purchases in their tenant" ON public.purchases
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Staff can manage purchases" ON public.purchases
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- RLS Policies for purchase_items
DROP POLICY IF EXISTS "Users can view purchase items in their tenant" ON public.purchase_items;
DROP POLICY IF EXISTS "Staff can manage purchase items" ON public.purchase_items;

CREATE POLICY "Users can view purchase items in their tenant" ON public.purchase_items
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Staff can manage purchase items" ON public.purchase_items
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- RLS Policies for stock_daily
DROP POLICY IF EXISTS "Users can view stock in their tenant" ON public.stock_daily;
DROP POLICY IF EXISTS "Staff can manage stock" ON public.stock_daily;

CREATE POLICY "Users can view stock in their tenant" ON public.stock_daily
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Staff can manage stock" ON public.stock_daily
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- RLS Policies for labor_costs
DROP POLICY IF EXISTS "Users can view labor costs in their tenant" ON public.labor_costs;
DROP POLICY IF EXISTS "Managers can manage labor costs" ON public.labor_costs;

CREATE POLICY "Users can view labor costs in their tenant" ON public.labor_costs
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Managers can manage labor costs" ON public.labor_costs
  FOR ALL USING (
    tenant_id = public.get_user_tenant_id() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

-- RLS Policies for expenses
DROP POLICY IF EXISTS "Users can view expenses in their tenant" ON public.expenses;
DROP POLICY IF EXISTS "Staff can manage expenses" ON public.expenses;

CREATE POLICY "Users can view expenses in their tenant" ON public.expenses
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Staff can manage expenses" ON public.expenses
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- RLS Policies for alerts
DROP POLICY IF EXISTS "Users can view alerts in their tenant" ON public.alerts;
DROP POLICY IF EXISTS "System can create alerts" ON public.alerts;

CREATE POLICY "Users can view alerts in their tenant" ON public.alerts
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "System can create alerts" ON public.alerts
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());

-- RLS Policies for files
DROP POLICY IF EXISTS "Users can view files in their tenant" ON public.files;
DROP POLICY IF EXISTS "Users can manage files" ON public.files;

CREATE POLICY "Users can view files in their tenant" ON public.files
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Users can manage files" ON public.files
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_sales_tenant_store_date ON public.daily_sales(tenant_id, store_id, date);
CREATE INDEX IF NOT EXISTS idx_purchases_tenant_store_date ON public.purchases(tenant_id, store_id, issue_date);
CREATE INDEX IF NOT EXISTS idx_purchase_items_tenant_purchase ON public.purchase_items(tenant_id, purchase_id);
CREATE INDEX IF NOT EXISTS idx_stock_daily_tenant_store_date ON public.stock_daily(tenant_id, store_id, date);
CREATE INDEX IF NOT EXISTS idx_labor_costs_tenant_store_date ON public.labor_costs(tenant_id, store_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_tenant_store_date_cat ON public.expenses(tenant_id, store_id, date, category);