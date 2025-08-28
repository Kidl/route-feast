-- Fix security vulnerability: Restrict admin user visibility to admin users only
DROP POLICY IF EXISTS "Users can view admin users if authenticated" ON public.admin_users;

-- Create new policy that only allows admin users to view other admin users
CREATE POLICY "Admin users can view other admin users" 
ON public.admin_users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.admin_users au 
    WHERE au.user_id = auth.uid() 
    AND 'read' = ANY(au.permissions)
  )
);