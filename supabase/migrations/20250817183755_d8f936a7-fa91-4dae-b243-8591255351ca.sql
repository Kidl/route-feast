-- Add cuisine type and tags to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN cuisine_type TEXT,
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Add index for better performance on tag searches
CREATE INDEX idx_restaurants_tags ON public.restaurants USING GIN(tags);
CREATE INDEX idx_restaurants_cuisine_type ON public.restaurants(cuisine_type);

-- Insert some sample cuisine types and tags for existing restaurants
UPDATE public.restaurants 
SET cuisine_type = CASE 
  WHEN name ILIKE '%sushi%' OR name ILIKE '%asian%' THEN 'Asian'
  WHEN name ILIKE '%pizza%' OR name ILIKE '%italian%' THEN 'Italian'
  WHEN name ILIKE '%nordic%' OR name ILIKE '%scandinavian%' THEN 'Nordic'
  WHEN name ILIKE '%french%' THEN 'French'
  WHEN name ILIKE '%american%' THEN 'American'
  WHEN name ILIKE '%seafood%' THEN 'Seafood'
  ELSE 'International'
END,
tags = CASE 
  WHEN name ILIKE '%fine%' OR name ILIKE '%michelin%' THEN ARRAY['fine-dining', 'upscale']
  WHEN name ILIKE '%casual%' OR name ILIKE '%bistro%' THEN ARRAY['casual', 'cozy']
  WHEN name ILIKE '%vegan%' OR name ILIKE '%plant%' THEN ARRAY['vegan', 'healthy']
  WHEN name ILIKE '%seafood%' THEN ARRAY['seafood', 'fresh']
  WHEN name ILIKE '%bar%' OR name ILIKE '%pub%' THEN ARRAY['bar', 'drinks']
  ELSE ARRAY['restaurant']
END;