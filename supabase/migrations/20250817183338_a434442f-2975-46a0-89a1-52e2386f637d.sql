-- Fix infinite recursion in admin_users policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "Admin users can manage admin users" ON admin_users;

-- Create a new policy that doesn't cause recursion
-- Allow users to view admin_users if they have a valid auth.uid()
-- and manage their own admin_user record
CREATE POLICY "Users can view admin users if authenticated" 
ON admin_users 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own admin user record" 
ON admin_users 
FOR ALL 
USING (user_id = auth.uid());