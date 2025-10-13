-- Trigger para crear usuario en tabla users automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- Crear un nuevo tenant para este usuario
  INSERT INTO public.tenants (name)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.email))
  RETURNING tenant_id INTO new_tenant_id;
  
  -- Crear registro de usuario
  INSERT INTO public.users (auth_user_id, tenant_id, email, name, role)
  VALUES (
    NEW.id,
    new_tenant_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'admin'
  );
  
  RETURN NEW;
END;
$$;

-- Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insertar usuario existente (axlolivella@gmail.com)
DO $$
DECLARE
  v_auth_user_id UUID;
  v_tenant_id UUID;
BEGIN
  -- Buscar el auth_user_id
  SELECT id INTO v_auth_user_id
  FROM auth.users
  WHERE email = 'axlolivella@gmail.com'
  LIMIT 1;
  
  IF v_auth_user_id IS NOT NULL THEN
    -- Verificar si ya tiene tenant
    SELECT tenant_id INTO v_tenant_id
    FROM public.users
    WHERE auth_user_id = v_auth_user_id;
    
    -- Si no tiene registro, crearlo
    IF v_tenant_id IS NULL THEN
      -- Crear tenant
      INSERT INTO public.tenants (name)
      VALUES ('OLMA')
      RETURNING tenant_id INTO v_tenant_id;
      
      -- Crear usuario
      INSERT INTO public.users (auth_user_id, tenant_id, email, name, role)
      VALUES (
        v_auth_user_id,
        v_tenant_id,
        'axlolivella@gmail.com',
        'Axel Olivella',
        'admin'
      );
      
      RAISE NOTICE 'Usuario creado para axlolivella@gmail.com con tenant_id: %', v_tenant_id;
    END IF;
  END IF;
END $$;