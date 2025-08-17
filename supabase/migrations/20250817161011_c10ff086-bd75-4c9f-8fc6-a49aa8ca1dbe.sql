-- Fix security warnings by setting search_path for functions
DROP FUNCTION IF EXISTS decrease_available_spots(uuid, integer);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Recreate update_updated_at_column with proper security settings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

-- Recreate decrease_available_spots with proper security settings  
CREATE OR REPLACE FUNCTION public.decrease_available_spots(
  schedule_id uuid,
  spots_to_decrease integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  UPDATE public.route_schedules 
  SET available_spots = GREATEST(0, available_spots - spots_to_decrease)
  WHERE id = schedule_id 
  AND available_spots >= spots_to_decrease;
  
  -- Check if the update affected any rows
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not enough available spots or schedule not found';
  END IF;
END;
$$;