-- GastroRoute Booking System Schema

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'no')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create routes table for restaurant routes
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  price_nok INTEGER NOT NULL, -- Price in øre (NOK cents)
  duration_hours DECIMAL(3,1) NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 20,
  location TEXT NOT NULL,
  highlights TEXT[] DEFAULT '{}',
  restaurants JSONB NOT NULL DEFAULT '[]', -- Store restaurant data as JSON
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create route_schedules table for available time slots
CREATE TABLE public.route_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  start_time TIME NOT NULL,
  available_spots INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(route_id, available_date, start_time)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT UNIQUE NOT NULL DEFAULT 'GR-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email TEXT,
  guest_phone TEXT,
  guest_name TEXT,
  route_id UUID REFERENCES public.routes(id) ON DELETE RESTRICT,
  schedule_id UUID REFERENCES public.route_schedules(id) ON DELETE RESTRICT,
  number_of_people INTEGER NOT NULL CHECK (number_of_people > 0),
  total_amount_nok INTEGER NOT NULL, -- Total in øre (NOK cents)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded')),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  special_requests TEXT,
  allergies TEXT,
  dietary_preferences TEXT[] DEFAULT '{}',
  confirmation_sent_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create booking_participants table for detailed participant info
CREATE TABLE public.booking_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  name TEXT,
  allergies TEXT,
  dietary_preferences TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_participants ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Routes policies (public read access)
CREATE POLICY "Anyone can view active routes" ON public.routes
  FOR SELECT USING (is_active = true);

-- Route schedules policies (public read access)
CREATE POLICY "Anyone can view active schedules" ON public.route_schedules
  FOR SELECT USING (is_active = true);

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (
    user_id = auth.uid() OR 
    (user_id IS NULL AND guest_email = auth.email())
  );

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    (user_id IS NULL AND guest_email = auth.email())
  );

-- Booking participants policies
CREATE POLICY "Users can view participants for their bookings" ON public.booking_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE bookings.id = booking_participants.booking_id 
      AND (bookings.user_id = auth.uid() OR bookings.guest_email = auth.email())
    )
  );

CREATE POLICY "Users can manage participants for their bookings" ON public.booking_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE bookings.id = booking_participants.booking_id 
      AND (bookings.user_id = auth.uid() OR bookings.guest_email = auth.email())
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample routes data
INSERT INTO public.routes (name, description, image_url, price_nok, duration_hours, max_capacity, location, highlights, restaurants) VALUES
('Michelin Experience Stavanger', 
 'Embark on a prestigious culinary journey through Stavanger''s Michelin-starred and Michelin Guide mentioned restaurants. Experience world-class dining from sustainable Nordic cuisine to innovative plant-based dishes.',
 '/src/assets/route-michelin.jpg',
 219900, -- 2199 NOK in øre
 5.0,
 12,
 'Stavanger Sentrum',
 ARRAY['Michelin-starred dining', 'Sustainable ingredients', 'Premium omakase', 'Natural wines'],
 '[
   {"name": "Restaurant K2", "cuisine": "Modern Nordic", "michelinMentioned": true},
   {"name": "Sabi Omakase", "cuisine": "Japanese Sushi", "michelinMentioned": true},
   {"name": "Bravo", "cuisine": "Modern European", "michelinMentioned": true},
   {"name": "Bellies", "cuisine": "Plant-Based", "michelinMentioned": true}
 ]'::jsonb),

('Asian Fusion Journey',
 'Discover the diverse flavors of Asia in Stavanger. From authentic Vietnamese cuisine to traditional Japanese ramen and innovative Asian fusion, experience the continent''s culinary diversity.',
 '/src/assets/route-asian.jpg',
 129900, -- 1299 NOK in øre
 4.0,
 16,
 'Pedersgata Area',
 ARRAY['Vietnamese journey', 'Authentic ramen', 'Asian fusion', 'Traditional techniques'],
 '[
   {"name": "An Nam", "cuisine": "Vietnamese", "michelinMentioned": false},
   {"name": "Kansui", "cuisine": "Japanese Ramen", "michelinMentioned": false},
   {"name": "Miyako", "cuisine": "Asian Fusion", "michelinMentioned": false}
 ]'::jsonb),

('Mediterranean Classics',
 'Savor the warmth of Mediterranean cuisine through Italy, Spain, and the Middle East. From handmade pasta to authentic tapas and sharing-style mezze dishes.',
 '/src/assets/route-mediterranean.jpg',
 109900, -- 1099 NOK in øre
 3.5,
 18,
 'Stavanger Old Town',
 ARRAY['Fresh pasta', 'Spanish tapas', 'Mediterranean mezze', 'Wine pairings'],
 '[
   {"name": "Casa Gio", "cuisine": "Italian", "michelinMentioned": false},
   {"name": "Delicatessen Tapasbar", "cuisine": "Spanish Tapas", "michelinMentioned": false},
   {"name": "Meze Restaurant", "cuisine": "Mediterranean", "michelinMentioned": false}
 ]'::jsonb);

-- Insert sample schedule data for the next 30 days
INSERT INTO public.route_schedules (route_id, available_date, start_time, available_spots)
SELECT 
  r.id,
  current_date + interval '1 day' * generate_series(1, 30),
  time '18:00',
  r.max_capacity
FROM public.routes r
WHERE r.is_active = true

UNION ALL

SELECT 
  r.id,
  current_date + interval '1 day' * generate_series(1, 30),
  time '19:30',
  r.max_capacity
FROM public.routes r
WHERE r.is_active = true AND r.name != 'Michelin Experience Stavanger'; -- Michelin only has evening slots