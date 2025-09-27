-- Create users/profiles table to link auth users with tenants
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  tenant_id UUID REFERENCES public.tenants(tenant_id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = auth_user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo users to match the existing tenants and demo accounts
INSERT INTO public.users (auth_user_id, email, name, tenant_id)
VALUES 
  ('ae8492f3-ac36-4471-abda-64a3f3c60aa1', 'demo@crepas.com', 'Demo Crepas', (SELECT tenant_id FROM tenants LIMIT 1)),
  ('6a09fe6c-5fee-44a3-bf30-a08510429724', 'demo@moyo.com', 'Axel Olivella', (SELECT tenant_id FROM tenants LIMIT 1)),
  ('3c9285cd-2b4f-4a92-9243-8a9ed115bd45', 'demo@nutrisa.com', 'Demo Nutrisa', (SELECT tenant_id FROM tenants LIMIT 1));

-- Create index for performance
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_tenant_id ON public.users(tenant_id);