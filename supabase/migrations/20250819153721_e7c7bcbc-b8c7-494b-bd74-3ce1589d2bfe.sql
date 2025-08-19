-- Create route availability calendar (Airbnb-style)
CREATE TABLE public.route_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  max_capacity INTEGER NOT NULL DEFAULT 20,
  price_override_nok INTEGER NULL, -- Override default route price for this date
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(route_id, available_date, start_time)
);

-- Add RLS policies for route availability
ALTER TABLE public.route_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available route dates"
ON public.route_availability
FOR SELECT
USING (is_available = true);

CREATE POLICY "Admin users can manage route availability"
ON public.route_availability
FOR ALL
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
));

-- Create restaurant bookings for individual stops
CREATE TABLE public.restaurant_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  route_stop_id UUID NULL REFERENCES route_stops(id) ON DELETE SET NULL,
  stop_number INTEGER NOT NULL,
  estimated_arrival_time TIMESTAMPTZ NOT NULL,
  estimated_departure_time TIMESTAMPTZ NOT NULL,
  number_of_people INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'ongoing', 'completed', 'cancelled')),
  table_id UUID NULL REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  special_requests TEXT NULL,
  allergies TEXT NULL,
  dietary_preferences TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies for restaurant bookings
ALTER TABLE public.restaurant_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own restaurant bookings"
ON public.restaurant_bookings
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM bookings b 
  WHERE b.id = restaurant_bookings.booking_id 
  AND (b.user_id = auth.uid() OR b.guest_email = auth.email())
));

CREATE POLICY "Admin users can manage restaurant bookings"
ON public.restaurant_bookings
FOR ALL
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
));

-- Add walking time between restaurants to route stops
ALTER TABLE public.route_stops 
ADD COLUMN walking_time_to_next_min INTEGER DEFAULT 10;

-- Create restaurant operating hours
CREATE TABLE public.restaurant_operating_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, day_of_week)
);

-- Add RLS policies for restaurant operating hours
ALTER TABLE public.restaurant_operating_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view restaurant operating hours"
ON public.restaurant_operating_hours
FOR SELECT
USING (true);

CREATE POLICY "Admin users can manage restaurant operating hours"
ON public.restaurant_operating_hours
FOR ALL
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
));

-- Add booking type to bookings table
ALTER TABLE public.bookings 
ADD COLUMN booking_type TEXT DEFAULT 'table' CHECK (booking_type IN ('table', 'route'));

-- Update existing triggers
CREATE TRIGGER update_route_availability_updated_at
  BEFORE UPDATE ON public.route_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restaurant_bookings_updated_at
  BEFORE UPDATE ON public.restaurant_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restaurant_operating_hours_updated_at
  BEFORE UPDATE ON public.restaurant_operating_hours
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default operating hours for existing restaurants (9 AM to 9 PM, Monday to Sunday)
INSERT INTO public.restaurant_operating_hours (restaurant_id, day_of_week, open_time, close_time)
SELECT 
  r.id,
  generate_series(0, 6) as day_of_week,
  '09:00'::TIME as open_time,
  '21:00'::TIME as close_time
FROM public.restaurants r
WHERE r.status = 'active'
ON CONFLICT (restaurant_id, day_of_week) DO NOTHING;