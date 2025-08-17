-- Create route schedules for all routes (next 30 days)
INSERT INTO public.route_schedules (route_id, available_date, start_time, available_spots, is_active)
SELECT 
    r.id,
    current_date + i,
    time_slot,
    r.max_capacity,
    true
FROM public.routes r
CROSS JOIN generate_series(0, 29) AS i
CROSS JOIN (
    VALUES 
        ('11:00'::time),
        ('13:00'::time), 
        ('17:00'::time),
        ('19:00'::time)
) AS times(time_slot)
WHERE r.name IN (
    'Michelin Star Journey', 'Plant-Based Paradise', 'Nordic Essence', 'Asian Fusion Adventure',
    'Ramen & Sushi Experience', 'Vietnamese Street Food Tour', 'Italian Amore', 'Mediterranean Tapas Journey',
    'Gourmet Burger Experience', 'Pizza & Kebab Classic', 'Global Spice Route', 'Breakfast to Dinner Marathon',
    'Dumpling & Dim Sum Delight', 'Seafood Spectacular', 'Student Special', 'Lunch Express',
    'After Work Social', 'Date Night Romance', 'Gluten-Free Journey', 'Vegan Delights',
    'Scandinavian Classics', 'Immigration Stories', 'Summer Fresh', 'Winter Comfort',
    'Family Adventure', 'Corporate Team Building', 'Street Food Safari', 'Coffee & Pastry Morning',
    'Weekend Warrior', 'Sunday Brunch Extravaganza'
);

-- Create route stops connecting routes to restaurants and specific dishes
-- Michelin Star Journey (Restaurant K2 + Sabi Omakase)
INSERT INTO public.route_stops (route_id, restaurant_id, dish_id, order_index)
SELECT 
    r.id,
    rest.id,
    d.id,
    ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY rest.name, d.name)
FROM public.routes r
JOIN public.restaurants rest ON rest.name IN ('Restaurant K2', 'Sabi Omakase')
JOIN public.menus m ON m.restaurant_id = rest.id
JOIN public.dishes d ON d.menu_id = m.id
WHERE r.name = 'Michelin Star Journey'
AND ((rest.name = 'Restaurant K2' AND d.name IN ('Østers fra Limfjorden', 'Torsk fra Lofoten'))
     OR (rest.name = 'Sabi Omakase' AND d.name IN ('Omakase 12 pieces', 'Sake Flight')));

-- Plant-Based Paradise (Bellies)
INSERT INTO public.route_stops (route_id, restaurant_id, dish_id, order_index)
SELECT 
    r.id,
    rest.id,
    d.id,
    ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY rest.name, d.name)
FROM public.routes r
JOIN public.restaurants rest ON rest.name = 'Bellies'
JOIN public.menus m ON m.restaurant_id = rest.id
JOIN public.dishes d ON d.menu_id = m.id
WHERE r.name = 'Plant-Based Paradise'
AND d.name IN ('Beet Tartare', 'Mushroom Risotto', 'Raw Chocolate Tart');

-- Nordic Essence (Bravo)
INSERT INTO public.route_stops (route_id, restaurant_id, dish_id, order_index)
SELECT 
    r.id,
    rest.id,
    d.id,
    ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY rest.name, d.name)
FROM public.routes r
JOIN public.restaurants rest ON rest.name = 'Bravo'
JOIN public.menus m ON m.restaurant_id = rest.id
JOIN public.dishes d ON d.menu_id = m.id
WHERE r.name = 'Nordic Essence'
AND d.name IN ('Fermentert gulrot', 'Laks fra Hardanger', 'Naturvin');

-- Asian Fusion Adventure (Miyako + Kansui + An Nam)
INSERT INTO public.route_stops (route_id, restaurant_id, dish_id, order_index)
SELECT 
    r.id,
    rest.id,
    d.id,
    ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY rest.name, d.name)
FROM public.routes r
JOIN public.restaurants rest ON rest.name IN ('Miyako', 'Kansui', 'An Nam')
JOIN public.menus m ON m.restaurant_id = rest.id
JOIN public.dishes d ON d.menu_id = m.id
WHERE r.name = 'Asian Fusion Adventure'
AND ((rest.name = 'Miyako' AND d.name = 'Signature Dish')
     OR (rest.name = 'Kansui' AND d.name = 'Tonkotsu Ramen')
     OR (rest.name = 'An Nam' AND d.name = 'Pho Bo'));

-- Italian Amore (Casa Gio)
INSERT INTO public.route_stops (route_id, restaurant_id, dish_id, order_index)
SELECT 
    r.id,
    rest.id,
    d.id,
    ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY rest.name, d.name)
FROM public.routes r
JOIN public.restaurants rest ON rest.name = 'Casa Gio'
JOIN public.menus m ON m.restaurant_id = rest.id
JOIN public.dishes d ON d.menu_id = m.id
WHERE r.name = 'Italian Amore'
AND d.name IN ('Antipasto', 'Tagliatelle al Tartufo', 'Tiramisu');

-- Vietnamese Street Food Tour (An Nam)
INSERT INTO public.route_stops (route_id, restaurant_id, dish_id, order_index)
SELECT 
    r.id,
    rest.id,
    d.id,
    ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY rest.name, d.name)
FROM public.routes r
JOIN public.restaurants rest ON rest.name = 'An Nam'
JOIN public.menus m ON m.restaurant_id = rest.id
JOIN public.dishes d ON d.menu_id = m.id
WHERE r.name = 'Vietnamese Street Food Tour'
AND d.name IN ('Pho Bo', 'Banh Mi', 'Fresh Spring Rolls');

-- Add route stops for remaining routes with basic dish selections
INSERT INTO public.route_stops (route_id, restaurant_id, dish_id, order_index)
SELECT 
    r.id,
    rest.id,
    d.id,
    ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY rest.name, d.name)
FROM public.routes r
JOIN public.restaurants rest ON rest.status = 'active'
JOIN public.menus m ON m.restaurant_id = rest.id
JOIN public.dishes d ON d.menu_id = m.id
WHERE r.name IN (
    'Ramen & Sushi Experience', 'Mediterranean Tapas Journey', 'Gourmet Burger Experience',
    'Pizza & Kebab Classic', 'Global Spice Route', 'Dumpling & Dim Sum Delight',
    'Student Special', 'After Work Social', 'Family Adventure'
)
AND d.name IN ('Signature Dish', 'Forrett', 'Dessert')
AND NOT EXISTS (
    SELECT 1 FROM public.route_stops rs WHERE rs.route_id = r.id
)
LIMIT 3;