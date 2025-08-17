-- Create menus for the new restaurants
INSERT INTO public.menus (restaurant_id, title, language, is_active)
SELECT 
  r.id,
  r.name || ' Menu',
  'no',
  true
FROM public.restaurants r
WHERE r.name IN ('An Nam', 'Bravo', 'Bellies', 'Restaurant Broken', 'Casa Gio', 'Delicatessen Tapasbar', 'Hekkan Burger', 'Istanbul Pizza & Kebab', 'Kansui', 'Restaurant K2', 'Meze Restaurant', 'Miyako', 'Molinå Bakery & Eatery', 'Noras Kitchen', 'Panzanella Pizzeria', 'Sabi Omakase', 'Yips Dumplings & Digg', 'Zouq')
AND NOT EXISTS (
  SELECT 1 FROM public.menus WHERE menus.restaurant_id = r.id
);

-- Add sample dishes for Vietnamese restaurant (An Nam)
INSERT INTO public.dishes (menu_id, name, description, price, dish_type, currency, available_for_route)
SELECT 
  m.id,
  dish_name,
  dish_description,
  dish_price,
  dish_type,
  'NOK',
  true
FROM public.menus m
JOIN public.restaurants r ON m.restaurant_id = r.id
CROSS JOIN (
  VALUES 
    ('Pho Bo', 'Tradisjonell vietnamesisk nudelsuppe med oksekjøtt, ferske urter og ris-nudler', 189, 'main'),
    ('Banh Mi', 'Vietnamesisk baguette med marinert svinekjøtt, pickles og koriander', 149, 'starter'),
    ('Fresh Spring Rolls', 'Ferske vårruller med reker, salat og mintblader', 129, 'starter'),
    ('Grilled Beef Salad', 'Grillet oksekjøtt med frisk salat og vietnamesisk dressing', 219, 'main'),
    ('Vietnamese Coffee', 'Tradisjonell vietnamesisk kaffe med kondensert melk', 49, 'drink')
) AS dishes(dish_name, dish_description, dish_price, dish_type)
WHERE r.name = 'An Nam';

-- Add sample dishes for Nordic fine dining (Bravo)
INSERT INTO public.dishes (menu_id, name, description, price, dish_type, currency, available_for_route)
SELECT 
  m.id,
  dish_name,
  dish_description,
  dish_price,
  dish_type,
  'NOK',
  true
FROM public.menus m
JOIN public.restaurants r ON m.restaurant_id = r.id
CROSS JOIN (
  VALUES 
    ('Fermentert gulrot', 'Sesongfermentert gulrot med hasselnøtt og timian', 95, 'starter'),
    ('Rogn og brioche', 'Lokalt rogn servert på varm brioche med seterrømme', 165, 'starter'),
    ('Laks fra Hardanger', 'Røkt laks med agurkemuls og dill', 245, 'main'),
    ('Entrecôte', 'Norsk entrecôte med rotgrønnsaker og bearnaise', 285, 'main'),
    ('Naturvin', 'Utvalg av naturviner fra Europa', 89, 'drink')
) AS dishes(dish_name, dish_description, dish_price, dish_type)
WHERE r.name = 'Bravo';

-- Add sample dishes for plant-based restaurant (Bellies)
INSERT INTO public.dishes (menu_id, name, description, price, dish_type, currency, available_for_route)
SELECT 
  m.id,
  dish_name,
  dish_description,
  dish_price,
  dish_type,
  'NOK',
  true
FROM public.menus m
JOIN public.restaurants r ON m.restaurant_id = r.id
CROSS JOIN (
  VALUES 
    ('Beet Tartare', 'Marinert rødbete-tartar med kapers og syltet løk', 145, 'starter'),
    ('Mushroom Risotto', 'Kremet sopprisotto med trøffelolje og cashew-parmesan', 195, 'main'),
    ('Cauliflower Steak', 'Grillet blomkålbiff med tahini-saus og granateple', 185, 'main'),
    ('Raw Chocolate Tart', 'Rå sjokoladeterte med avokado og bær', 95, 'dessert'),
    ('Kombucha', 'Hjemmelaget kombucha med ingefær og sitron', 65, 'drink')
) AS dishes(dish_name, dish_description, dish_price, dish_type)
WHERE r.name = 'Bellies';

-- Add sample dishes for Italian restaurant (Casa Gio)
INSERT INTO public.dishes (menu_id, name, description, price, dish_type, currency, available_for_route)
SELECT 
  m.id,
  dish_name,
  dish_description,
  dish_price,
  dish_type,
  'NOK',
  true
FROM public.menus m
JOIN public.restaurants r ON m.restaurant_id = r.id
CROSS JOIN (
  VALUES 
    ('Antipasto', 'Utvalg av italienske delikatesser med oliven og ost', 165, 'starter'),
    ('Tagliatelle al Tartufo', 'Fersk tagliatelle med trøffel og parmesan', 245, 'main'),
    ('Ravioli di Ricotta', 'Hjemmelaget ravioli fylt med ricotta og spinat', 215, 'main'),
    ('Risotto ai Porcini', 'Kremet risotto med steinsopp og hvitvin', 225, 'main'),
    ('Tiramisu', 'Klassisk italiensk tiramisu med mascarpone', 85, 'dessert')
) AS dishes(dish_name, dish_description, dish_price, dish_type)
WHERE r.name = 'Casa Gio';

-- Add sample dishes for Japanese ramen (Kansui)
INSERT INTO public.dishes (menu_id, name, description, price, dish_type, currency, available_for_route)
SELECT 
  m.id,
  dish_name,
  dish_description,
  dish_price,
  dish_type,
  'NOK',
  true
FROM public.menus m
JOIN public.restaurants r ON m.restaurant_id = r.id
CROSS JOIN (
  VALUES 
    ('Tonkotsu Ramen', 'Kremet svinebuljong med ramen-nudler og chashu', 189, 'main'),
    ('Miso Ramen', 'Miso-basert buljong med grønnsaker og egg', 179, 'main'),
    ('Gyoza', 'Dampede dumplings fylt med svinekjøtt og kål', 95, 'starter'),
    ('Edamame', 'Salte edamame-bønner med havsalt', 65, 'starter'),
    ('Japanese Beer', 'Asahi eller Kirin øl', 75, 'drink')
) AS dishes(dish_name, dish_description, dish_price, dish_type)
WHERE r.name = 'Kansui';

-- Add sample dishes for Michelin star restaurant (Restaurant K2)
INSERT INTO public.dishes (menu_id, name, description, price, dish_type, currency, available_for_route)
SELECT 
  m.id,
  dish_name,
  dish_description,
  dish_price,
  dish_type,
  'NOK',
  true
FROM public.menus m
JOIN public.restaurants r ON m.restaurant_id = r.id
CROSS JOIN (
  VALUES 
    ('Østers fra Limfjorden', 'Ferske østers med eple og vanilje', 145, 'starter'),
    ('Kamskjell fra Frøya', 'Kamskjell med jernurt og brennesle', 195, 'starter'),
    ('Torsk fra Lofoten', 'Vilt torsk med jordskokk og kaviar', 345, 'main'),
    ('Lam fra Jæren', 'Lammefilet med timian og rotgrønnsaker', 365, 'main'),
    ('Rabarbra og vanilje', 'Rabarbrakompott med vaniljeis og kanel', 125, 'dessert')
) AS dishes(dish_name, dish_description, dish_price, dish_type)
WHERE r.name = 'Restaurant K2';

-- Add sample dishes for Michelin star sushi (Sabi Omakase)
INSERT INTO public.dishes (menu_id, name, description, price, dish_type, currency, available_for_route)
SELECT 
  m.id,
  dish_name,
  dish_description,
  dish_price,
  dish_type,
  'NOK',
  true
FROM public.menus m
JOIN public.restaurants r ON m.restaurant_id = r.id
CROSS JOIN (
  VALUES 
    ('Omakase 12 pieces', 'Kokkes utvalg av 12 sushi-biter med sesongråvarer', 695, 'main'),
    ('Omakase 16 pieces', 'Utvidet omakase med 16 premium sushi-biter', 895, 'main'),
    ('Chutoro Nigiri', 'Medium fett tunfisk fra Japan', 95, 'starter'),
    ('Uni Nigiri', 'Sjøpinnsvin fra Hokkaido', 125, 'starter'),
    ('Sake Flight', 'Utvalg av premium sake fra Japan', 295, 'drink')
) AS dishes(dish_name, dish_description, dish_price, dish_type)
WHERE r.name = 'Sabi Omakase';

-- Add basic dishes for remaining restaurants
INSERT INTO public.dishes (menu_id, name, description, price, dish_type, currency, available_for_route)
SELECT 
  m.id,
  dish_name,
  dish_description,
  dish_price,
  dish_type,
  'NOK',
  true
FROM public.menus m
JOIN public.restaurants r ON m.restaurant_id = r.id
CROSS JOIN (
  VALUES 
    ('Signature Dish', 'Restaurantens signaturrett', 195, 'main'),
    ('Forrett', 'Dagens forrett', 95, 'starter'),
    ('Dessert', 'Hjemmelaget dessert', 85, 'dessert')
) AS dishes(dish_name, dish_description, dish_price, dish_type)
WHERE r.name IN ('Restaurant Broken', 'Delicatessen Tapasbar', 'Hekkan Burger', 'Istanbul Pizza & Kebab', 'Meze Restaurant', 'Miyako', 'Molinå Bakery & Eatery', 'Noras Kitchen', 'Panzanella Pizzeria', 'Yips Dumplings & Digg', 'Zouq');