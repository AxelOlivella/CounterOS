-- Fix RLS policies for users table
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Create more permissive policies that work with our auth setup
-- Allow users to read users table by email (since that's how we query)
CREATE POLICY "Users can view profiles by email" 
ON public.users 
FOR SELECT 
TO authenticated
USING (true);

-- Allow users to update their own profile using auth_user_id
CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (auth.uid() = auth_user_id);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = auth_user_id);