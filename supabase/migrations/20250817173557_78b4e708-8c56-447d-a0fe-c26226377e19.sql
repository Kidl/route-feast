-- Seed restaurants data
INSERT INTO public.restaurants (name, description, address, city, country, lat, lng, phone, email, website, status) VALUES
('Restaurant K2', 'Michelin-stjernet restaurant som fokuserer på økologiske, lokale og bærekraftige ingredienser. Tildelt både Michelin-stjerne og bærekraftskløver.', 'Øvre Holmegate 15', 'Stavanger', 'Norway', 58.9699, 5.7331, '+47 51 89 52 80', 'post@restaurantk2.no', 'https://restaurantk2.no', 'active'),
('Sabi Omakase', 'Michelin-stjernet sushi-restaurant ledet av kokk Roger Asakil Joya. Tilbyr tradisjonell omakase-opplevelse med ingredienser av høyeste kvalitet.', 'Pedersgata 38', 'Stavanger', 'Norway', 58.9700, 5.7333, '+47 51 89 31 30', 'booking@sabiomakase.no', 'https://sabiomakase.no', 'active'),
('Bravo', 'À la carte-meny med enkle småretter og snacks. Korttreiste ingredienser som varierer etter sesong. Naturlig vinliste. Nevnt i Michelin Guide.', 'Øvre Holmegate 27', 'Stavanger', 'Norway', 58.9701, 5.7334, '+47 51 84 37 00', 'hei@bravostavanger.no', 'https://bravostavanger.no', 'active'),
('Bellies', 'Utelukkende plantebasert restaurant som lager fantastiske retter som tilfredsstiller både øyet og ganen. Anbefalt i Michelin Guide.', 'Øvre Holmegate 15', 'Stavanger', 'Norway', 58.9702, 5.7335, '+47 400 03 280', 'info@bellies.no', 'https://bellies.no', 'active'),
('An Nam', 'En middag på An Nam er som en reise gjennom Vietnam, fra rismarker i nord til havner i sør. Østlige krydder og urter kombinert med lokale norske ingredienser.', 'Løkkeveien 59', 'Stavanger', 'Norway', 58.9703, 5.7336, '+47 51 56 62 62', 'post@annam.no', 'https://annam.no', 'active');

-- Seed restaurant images (using placeholder URLs for now)
INSERT INTO public.restaurant_images (restaurant_id, url, is_cover) 
SELECT 
  r.id,
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&crop=faces',
  true
FROM public.restaurants r
WHERE r.name = 'Restaurant K2';

INSERT INTO public.restaurant_images (restaurant_id, url, is_cover) 
SELECT 
  r.id,
  'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop&crop=faces',
  true
FROM public.restaurants r
WHERE r.name = 'Sabi Omakase';

INSERT INTO public.restaurant_images (restaurant_id, url, is_cover) 
SELECT 
  r.id,
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&crop=faces',
  true
FROM public.restaurants r
WHERE r.name = 'Bravo';

INSERT INTO public.restaurant_images (restaurant_id, url, is_cover) 
SELECT 
  r.id,
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop&crop=faces',
  true
FROM public.restaurants r
WHERE r.name = 'Bellies';

INSERT INTO public.restaurant_images (restaurant_id, url, is_cover) 
SELECT 
  r.id,
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop&crop=faces',
  true
FROM public.restaurants r
WHERE r.name = 'An Nam';

-- Add additional images for each restaurant
INSERT INTO public.restaurant_images (restaurant_id, url, is_cover) 
SELECT 
  r.id,
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=faces',
  false
FROM public.restaurants r;

INSERT INTO public.restaurant_images (restaurant_id, url, is_cover) 
SELECT 
  r.id,
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop&crop=faces',
  false
FROM public.restaurants r;

-- Seed menus
INSERT INTO public.menus (restaurant_id, title, language, default_prep_time_min, is_seasonal, is_active)
SELECT 
  r.id,
  'Hovedmeny',
  'no',
  20,
  false,
  true
FROM public.restaurants r
WHERE r.name = 'Restaurant K2';

INSERT INTO public.menus (restaurant_id, title, language, default_prep_time_min, is_seasonal, is_active)
SELECT 
  r.id,
  'Omakase Menu',
  'no',
  30,
  false,
  true
FROM public.restaurants r
WHERE r.name = 'Sabi Omakase';

INSERT INTO public.menus (restaurant_id, title, language, default_prep_time_min, is_seasonal, is_active)
SELECT 
  r.id,
  'À la Carte',
  'no',
  15,
  true,
  true
FROM public.restaurants r
WHERE r.name = 'Bravo';

INSERT INTO public.menus (restaurant_id, title, language, default_prep_time_min, is_seasonal, is_active)
SELECT 
  r.id,
  'Plantebasert Meny',
  'no',
  18,
  false,
  true
FROM public.restaurants r
WHERE r.name = 'Bellies';

INSERT INTO public.menus (restaurant_id, title, language, default_prep_time_min, is_seasonal, is_active)
SELECT 
  r.id,
  'Vietnamesisk Meny',
  'no',
  25,
  false,
  true
FROM public.restaurants r
WHERE r.name = 'An Nam';

-- Seed dishes for Restaurant K2
INSERT INTO public.dishes (menu_id, name, description, price, dish_type, available_for_route)
SELECT 
  m.id,
  'Bærekraftig torsk',
  'Lokalt fanget torsk med sesonggrønnsaker og urtesaus',
  385.00,
  'main',
  true
FROM public.menus m
JOIN public.restaurants r ON m.restaurant_id = r.id
WHERE r.name = 'Restaurant K2';

INSERT INTO public.dishes (menu_id, name, description, price, dish_type, available_for_route)
SELECT 
  m.id,
  'Økologisk lammesadel',
  'Norsk lam med røstet rotgrønnsaker og timiansjy',
  425.00,
  'main',
  true
FROM public.menus m
JOIN public.restaurants r ON m.restaurant_id = r.id
WHERE r.name = 'Restaurant K2';

-- Add allergens for dishes
INSERT INTO public.dish_allergens (dish_id, allergen_code)
SELECT 
  d.id,
  'fish'
FROM public.dishes d
WHERE d.name = 'Bærekraftig torsk';

-- Add tags for dishes
INSERT INTO public.dish_tags (dish_id, tag)
SELECT 
  d.id,
  'Bærekraftig'
FROM public.dishes d
WHERE d.name = 'Bærekraftig torsk';

INSERT INTO public.dish_tags (dish_id, tag)
SELECT 
  d.id,
  'Lokale ingredienser'
FROM public.dishes d
WHERE d.name = 'Bærekraftig torsk';

-- Seed dishes for Sabi Omakase
INSERT INTO public.dishes (menu_id, name, description, price, dish_type, available_for_route, prep_time_min_override)
SELECT 
  m.id,
  'Omakase 7 retter',
  'Kokkens utvalg av sju sushi-retter med premium ingredienser',
  850.00,
  'main',
  true,
  45
FROM public.menus m
JOIN public.restaurants r ON m.restaurant_id = r.id
WHERE r.name = 'Sabi Omakase';

INSERT INTO public.dish_allergens (dish_id, allergen_code)
SELECT 
  d.id,
  'fish'
FROM public.dishes d
WHERE d.name = 'Omakase 7 retter';

INSERT INTO public.dish_allergens (dish_id, allergen_code)
SELECT 
  d.id,
  'soy'
FROM public.dishes d
WHERE d.name = 'Omakase 7 retter';

INSERT INTO public.dish_tags (dish_id, tag)
SELECT 
  d.id,
  'Premium'
FROM public.dishes d
WHERE d.name = 'Omakase 7 retter';

INSERT INTO public.dish_tags (dish_id, tag)
SELECT 
  d.id,
  'Tradisjonell'
FROM public.dishes d
WHERE d.name = 'Omakase 7 retter';

-- Seed dishes for Bravo
INSERT INTO public.dishes (menu_id, name, description, price, dish_type, available_for_route)
SELECT 
  m.id,
  'Sesongterrine',
  'Lokal terrine med sesonggrønnsaker og syltede urter',
  165.00,
  'starter',
  true
FROM public.menus m
JOIN public.restaurants r ON m.restaurant_id = r.id
WHERE r.name = 'Bravo';

-- Seed dishes for Bellies
INSERT INTO public.dishes (menu_id, name, description, price, dish_type, available_for_route)
SELECT 
  m.id,
  'Plantebasert "pulled pork"',
  'Kreativ plantebasert versjon av pulled pork med BBQ-saus',
  285.00,
  'main',
  true
FROM public.menus m
JOIN public.restaurants r ON m.restaurant_id = r.id
WHERE r.name = 'Bellies';

-- Seed dishes for An Nam  
INSERT INTO public.dishes (menu_id, name, description, price, dish_type, available_for_route)
SELECT 
  m.id,
  'Pho Bo',
  'Tradisjonell vietnamesisk nudelsuppe med oksekjøtt og urter',
  225.00,
  'main',
  true
FROM public.menus m
JOIN public.restaurants r ON m.restaurant_id = r.id
WHERE r.name = 'An Nam';

INSERT INTO public.dish_allergens (dish_id, allergen_code)
SELECT 
  d.id,
  'gluten'
FROM public.dishes d
WHERE d.name = 'Pho Bo';

INSERT INTO public.dish_tags (dish_id, tag)
SELECT 
  d.id,
  'Tradisjonell'
FROM public.dishes d
WHERE d.name = 'Pho Bo';

INSERT INTO public.dish_tags (dish_id, tag)
SELECT 
  d.id,
  'Suppe'
FROM public.dishes d
WHERE d.name = 'Pho Bo';