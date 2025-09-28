-- Fix critical security issue: Add RLS protection to finance tables (not views)
ALTER TABLE public.finance_portal_centro_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for finance_portal_centro_history
-- Since this contains financial data, restrict access to authenticated users only
CREATE POLICY "Only authenticated users can view financial history" 
ON public.finance_portal_centro_history 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add RLS protection to finance_portal_centro_opx_detail
ALTER TABLE public.finance_portal_centro_opx_detail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only authenticated users can view opx detail" 
ON public.finance_portal_centro_opx_detail 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create user roles table for proper RBAC
CREATE TYPE public.app_role AS ENUM ('admin', 'supervisor', 'operator');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    tenant_id UUID REFERENCES public.tenants(tenant_id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, tenant_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Create policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles in their tenant" 
ON public.user_roles 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
    AND ur.tenant_id = user_roles.tenant_id
  )
);

-- Add role column to users table for compatibility
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'operator';

-- Update existing users to have operator role
UPDATE public.users SET role = 'operator' WHERE role IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_id ON public.user_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users(tenant_id);