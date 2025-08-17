-- Create restaurants table
CREATE TABLE public.restaurants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  phone text,
  email text,
  website text,
  address text NOT NULL,
  city text,
  country text DEFAULT 'Norway',
  lat numeric(10,8),
  lng numeric(11,8),
  opening_hours jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create restaurant images table
CREATE TABLE public.restaurant_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  url text NOT NULL,
  is_cover boolean DEFAULT false,
  alt_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create menus table
CREATE TABLE public.menus (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  title text NOT NULL,
  language text DEFAULT 'no',
  default_prep_time_min integer DEFAULT 15,
  is_seasonal boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create dishes table  
CREATE TABLE public.dishes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id uuid NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2) DEFAULT 0,
  currency text DEFAULT 'NOK',
  dish_type text NOT NULL CHECK (dish_type IN ('starter', 'main', 'dessert', 'drink', 'other')),
  available_for_route boolean DEFAULT true,
  prep_time_min_override integer,
  photo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create dish tags table (many-to-many relationship)
CREATE TABLE public.dish_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dish_id uuid NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  tag text NOT NULL,
  UNIQUE(dish_id, tag)
);

-- Create dish allergens table (many-to-many relationship)
CREATE TABLE public.dish_allergens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dish_id uuid NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  allergen_code text NOT NULL CHECK (allergen_code IN (
    'gluten', 'lactose', 'nuts', 'egg', 'shellfish', 'fish', 
    'soy', 'sesame', 'celery', 'mustard', 'sulphites', 'lupin', 'molluscs'
  )),
  UNIQUE(dish_id, allergen_code)
);

-- Create route stops table (replaces the simpler routes.restaurants jsonb)
CREATE TABLE public.route_stops (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  dish_id uuid NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  time_override_min integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(route_id, order_index),
  UNIQUE(route_id, restaurant_id, dish_id)
);

-- Update existing routes table to remove restaurants jsonb column and add new fields
ALTER TABLE public.routes 
DROP COLUMN IF EXISTS restaurants,
ADD COLUMN IF NOT EXISTS language text DEFAULT 'no',
ADD COLUMN IF NOT EXISTS capacity_per_slot integer DEFAULT 20,
ADD COLUMN IF NOT EXISTS blackout_dates date[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft'));

-- Create storage bucket for restaurant images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('restaurant-images', 'restaurant-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all new tables
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dish_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dish_allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admin users can manage restaurants" 
ON public.restaurants FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
));

CREATE POLICY "Public can view active restaurants" 
ON public.restaurants FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admin users can manage restaurant images" 
ON public.restaurant_images FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
));

CREATE POLICY "Public can view restaurant images" 
ON public.restaurant_images FOR SELECT 
USING (true);

CREATE POLICY "Admin users can manage menus" 
ON public.menus FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
));

CREATE POLICY "Public can view active menus" 
ON public.menus FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin users can manage dishes" 
ON public.dishes FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
));

CREATE POLICY "Public can view dishes" 
ON public.dishes FOR SELECT 
USING (true);

CREATE POLICY "Admin users can manage dish tags" 
ON public.dish_tags FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
));

CREATE POLICY "Public can view dish tags" 
ON public.dish_tags FOR SELECT 
USING (true);

CREATE POLICY "Admin users can manage dish allergens" 
ON public.dish_allergens FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
));

CREATE POLICY "Public can view dish allergens" 
ON public.dish_allergens FOR SELECT 
USING (true);

CREATE POLICY "Admin users can manage route stops" 
ON public.route_stops FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
));

CREATE POLICY "Public can view route stops" 
ON public.route_stops FOR SELECT 
USING (true);

-- Create RLS policies for restaurant images storage
CREATE POLICY "Admin users can upload restaurant images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'restaurant-images' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
  )
);

CREATE POLICY "Admin users can update restaurant images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'restaurant-images' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
  )
);

CREATE POLICY "Admin users can delete restaurant images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'restaurant-images' AND 
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
  )
);

CREATE POLICY "Restaurant images are publicly viewable" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'restaurant-images');

-- Add triggers for updated_at columns
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menus_updated_at
  BEFORE UPDATE ON public.menus
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at
  BEFORE UPDATE ON public.dishes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_restaurant_images_restaurant_id ON public.restaurant_images(restaurant_id);
CREATE INDEX idx_restaurant_images_is_cover ON public.restaurant_images(is_cover) WHERE is_cover = true;
CREATE INDEX idx_menus_restaurant_id ON public.menus(restaurant_id);
CREATE INDEX idx_menus_active ON public.menus(is_active) WHERE is_active = true;
CREATE INDEX idx_dishes_menu_id ON public.dishes(menu_id);
CREATE INDEX idx_dishes_available_for_route ON public.dishes(available_for_route) WHERE available_for_route = true;
CREATE INDEX idx_dishes_dish_type ON public.dishes(dish_type);
CREATE INDEX idx_dish_tags_dish_id ON public.dish_tags(dish_id);
CREATE INDEX idx_dish_allergens_dish_id ON public.dish_allergens(dish_id);
CREATE INDEX idx_route_stops_route_id ON public.route_stops(route_id);
CREATE INDEX idx_route_stops_order ON public.route_stops(route_id, order_index);
CREATE INDEX idx_restaurants_status ON public.restaurants(status) WHERE status = 'active';
CREATE INDEX idx_restaurants_location ON public.restaurants(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;