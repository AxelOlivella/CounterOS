-- CounterOS Database Schema
-- Multi-tenant QSR/Retail management system

-- Create custom types
CREATE TYPE app_role AS ENUM ('owner', 'manager', 'analyst', 'staff');
CREATE TYPE alert_severity AS ENUM ('info', 'warn', 'crit');

-- 1. Tenants table
CREATE TABLE public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    rfc TEXT,
    subdomain TEXT UNIQUE NOT NULL,
    theme JSONB DEFAULT '{"primary": "#00C853", "secondary": "#FFFFFF"}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role app_role NOT NULL DEFAULT 'staff',
    store_scope JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(tenant_id, email)
);

-- 3. Stores table
CREATE TABLE public.stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    open_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(tenant_id, code)
);

-- 4. Daily sales table
CREATE TABLE public.daily_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    gross_sales DECIMAL(12,2) NOT NULL DEFAULT 0,
    discounts DECIMAL(12,2) NOT NULL DEFAULT 0,
    net_sales DECIMAL(12,2) GENERATED ALWAYS AS (gross_sales - discounts) STORED,
    transactions INTEGER NOT NULL DEFAULT 0,
    avg_ticket DECIMAL(12,2) GENERATED ALWAYS AS (
        CASE WHEN transactions > 0 THEN (gross_sales - discounts) / transactions ELSE 0 END
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(tenant_id, store_id, date)
);

-- 5. Purchases table (CFDI invoices)
CREATE TABLE public.purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    invoice_uuid TEXT UNIQUE NOT NULL,
    supplier_rfc TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    issue_date DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    xml_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 6. Purchase items table
CREATE TABLE public.purchase_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE NOT NULL,
    sku TEXT NOT NULL,
    description TEXT NOT NULL,
    qty DECIMAL(12,4) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    line_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'ingrediente'
);

-- 7. Stock daily table
CREATE TABLE public.stock_daily (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    opening_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    closing_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    waste_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(tenant_id, store_id, date)
);

-- 8. Labor costs table
CREATE TABLE public.labor_costs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    labor_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    hours DECIMAL(8,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(tenant_id, store_id, date)
);

-- 9. Expenses table
CREATE TABLE public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 10. Alerts table
CREATE TABLE public.alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL,
    severity alert_severity NOT NULL DEFAULT 'info',
    payload JSONB DEFAULT '{}',
    delivered_via TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 11. Files table
CREATE TABLE public.files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    filename TEXT NOT NULL,
    size_bytes INTEGER DEFAULT 0,
    processed BOOLEAN DEFAULT false,
    error TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labor_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_daily_sales_tenant_store_date ON public.daily_sales(tenant_id, store_id, date);
CREATE INDEX idx_purchases_tenant_store_date ON public.purchases(tenant_id, store_id, issue_date);
CREATE INDEX idx_purchase_items_tenant_purchase ON public.purchase_items(tenant_id, purchase_id);
CREATE INDEX idx_stock_daily_tenant_store_date ON public.stock_daily(tenant_id, store_id, date);
CREATE INDEX idx_labor_costs_tenant_store_date ON public.labor_costs(tenant_id, store_id, date);
CREATE INDEX idx_expenses_tenant_store_date_cat ON public.expenses(tenant_id, store_id, date, category);

-- Create function to get user's tenant
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid();
$$;

-- RLS Policies for tenants
CREATE POLICY "Users can view their own tenant" ON public.tenants
  FOR SELECT USING (id = public.get_user_tenant_id());

-- RLS Policies for users
CREATE POLICY "Users can view users in their tenant" ON public.users
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- RLS Policies for stores
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
CREATE POLICY "Users can view daily sales in their tenant" ON public.daily_sales
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Staff can manage daily sales" ON public.daily_sales
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- RLS Policies for purchases
CREATE POLICY "Users can view purchases in their tenant" ON public.purchases
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Staff can manage purchases" ON public.purchases
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- RLS Policies for purchase_items
CREATE POLICY "Users can view purchase items in their tenant" ON public.purchase_items
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Staff can manage purchase items" ON public.purchase_items
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- RLS Policies for stock_daily
CREATE POLICY "Users can view stock in their tenant" ON public.stock_daily
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Staff can manage stock" ON public.stock_daily
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- RLS Policies for labor_costs
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
CREATE POLICY "Users can view expenses in their tenant" ON public.expenses
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Staff can manage expenses" ON public.expenses
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- RLS Policies for alerts
CREATE POLICY "Users can view alerts in their tenant" ON public.alerts
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "System can create alerts" ON public.alerts
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());

-- RLS Policies for files
CREATE POLICY "Users can view files in their tenant" ON public.files
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Users can manage files" ON public.files
  FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- Insert sample tenants
INSERT INTO public.tenants (name, subdomain, theme) VALUES 
('Moyo', 'moyo', '{"primary": "#8B5CF6", "secondary": "#FFFFFF", "logo_url": ""}'),
('Nutrisa', 'nutrisa', '{"primary": "#00C853", "secondary": "#FFFFFF", "logo_url": ""}'),
('Crepas', 'crepas', '{"primary": "#F59E0B", "secondary": "#FFFFFF", "logo_url": ""}');

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;