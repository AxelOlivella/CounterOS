-- ============================================
-- FIX: Políticas RLS para corporate_users
-- ============================================
-- Problema: Los usuarios no pueden leer corporate_users aunque tengan registros
-- Solución: Recrear políticas con lógica correcta

-- 1. Eliminar políticas antiguas que causan problemas
DROP POLICY IF EXISTS "policy_corporate_users_select" ON public.corporate_users;
DROP POLICY IF EXISTS "policy_corporate_users_insert" ON public.corporate_users;
DROP POLICY IF EXISTS "policy_corporate_users_update" ON public.corporate_users;

-- 2. Crear política SELECT correcta
-- Los usuarios pueden ver sus propios registros en corporate_users
CREATE POLICY "Users can view their own corporate access"
ON public.corporate_users
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- 3. Crear política INSERT solo para service_role
-- Solo el sistema puede crear asignaciones corporate
CREATE POLICY "Only service role can insert corporate users"
ON public.corporate_users
FOR INSERT
TO service_role
WITH CHECK (true);

-- 4. Crear política UPDATE solo para service_role
-- Solo el sistema puede actualizar asignaciones corporate
CREATE POLICY "Only service role can update corporate users"
ON public.corporate_users
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Verificar que RLS esté habilitado
ALTER TABLE public.corporate_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Verificación de otras tablas enterprise
-- ============================================

-- Asegurar que corporates permite lectura a usuarios asignados
DROP POLICY IF EXISTS "policy_corporates_select" ON public.corporates;
CREATE POLICY "Users can view their assigned corporate"
ON public.corporates
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT corporate_id 
    FROM public.corporate_users 
    WHERE user_id = auth.uid()
  )
);

-- Asegurar que legal_entities permite lectura a usuarios del corporate
DROP POLICY IF EXISTS "policy_legal_entities_select" ON public.legal_entities;
CREATE POLICY "Users can view legal entities of their corporate"
ON public.legal_entities
FOR SELECT
TO authenticated
USING (
  corporate_id IN (
    SELECT corporate_id 
    FROM public.corporate_users 
    WHERE user_id = auth.uid()
  )
);

-- Asegurar que brands permite lectura a usuarios del corporate
DROP POLICY IF EXISTS "policy_brands_select" ON public.brands;
CREATE POLICY "Users can view brands of their corporate"
ON public.brands
FOR SELECT
TO authenticated
USING (
  legal_entity_id IN (
    SELECT le.id
    FROM public.legal_entities le
    INNER JOIN public.corporate_users cu ON cu.corporate_id = le.corporate_id
    WHERE cu.user_id = auth.uid()
  )
);

-- ============================================
-- COMENTARIO IMPORTANTE
-- ============================================
-- Las políticas anteriores estaban verificando auth.role() = 'service_role'
-- lo cual NUNCA es true para usuarios autenticados normalmente.
-- auth.role() devuelve 'authenticated' para usuarios logueados.
-- service_role solo se usa en llamadas desde el backend con service key.
