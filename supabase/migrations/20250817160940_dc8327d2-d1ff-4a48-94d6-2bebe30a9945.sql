-- Function to safely decrease available spots for a schedule
CREATE OR REPLACE FUNCTION decrease_available_spots(
  schedule_id uuid,
  spots_to_decrease integer
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE route_schedules 
  SET available_spots = GREATEST(0, available_spots - spots_to_decrease)
  WHERE id = schedule_id 
  AND available_spots >= spots_to_decrease;
  
  -- Check if the update affected any rows
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not enough available spots or schedule not found';
  END IF;
END;
$$;