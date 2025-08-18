-- Add tables for restaurant table management
CREATE TABLE public.restaurant_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL,
  table_number TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  table_type TEXT DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  location_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, table_number)
);

-- Enable RLS
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;

-- Create policies for restaurant tables
CREATE POLICY "Admin users can manage restaurant tables"
ON public.restaurant_tables
FOR ALL
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE admin_users.user_id = auth.uid() 
  AND 'write' = ANY(admin_users.permissions)
));

CREATE POLICY "Public can view restaurant tables"
ON public.restaurant_tables
FOR SELECT
USING (true);

-- Add table_id to bookings
ALTER TABLE public.bookings 
ADD COLUMN table_id UUID REFERENCES public.restaurant_tables(id);

-- Update booking status to match kanban requirements
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check,
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'ongoing', 'completed', 'cancelled', 'no_table'));

-- Add trigger for restaurant_tables updated_at
CREATE TRIGGER update_restaurant_tables_updated_at
  BEFORE UPDATE ON public.restaurant_tables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();