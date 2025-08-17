-- Fix RLS policies to allow guest bookings
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;

-- Create a new policy that allows both authenticated users and guests to create bookings
CREATE POLICY "Allow booking creation" ON public.bookings
  FOR INSERT
  WITH CHECK (
    -- Allow if user is authenticated and user_id matches
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    -- Allow if it's a guest booking (no user_id, but has guest_email)
    (user_id IS NULL AND guest_email IS NOT NULL)
  );