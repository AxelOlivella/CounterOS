-- Fix critical security vulnerability: Restrict user data access
-- Current policy allows any authenticated user to see all user emails and data
-- This fixes it to only allow users to see their own profile

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view profiles by email" ON public.users;

-- Create a secure policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = auth_user_id);

-- Optional: If you need users to see basic info of other users (like names for mentions/assignments)
-- you can create a separate view with limited data and appropriate policies
-- For now, we're implementing the most secure approach where users only see their own data