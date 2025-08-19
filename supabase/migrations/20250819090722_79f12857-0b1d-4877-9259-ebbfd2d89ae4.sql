-- Add sample route stops for existing routes

-- First, let's see what routes we have
-- Then add sample route stops for the Michelin Star Journey route

-- Get the route ID for Michelin Star Journey (we can see from the form it exists)
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min) 
SELECT 
    r.id as route_id,
    res.id as restaurant_id,
    d.id as dish_id,
    1 as order_index,
    45 as time_override_min
FROM routes r
CROSS JOIN restaurants res
INNER JOIN menus m ON m.restaurant_id = res.id
INNER JOIN dishes d ON d.menu_id = m.id
WHERE r.name = 'Michelin Star Journey'
AND res.name = 'Restaurant K2'
AND d.dish_type = 'Forrett'
LIMIT 1;

-- Add second stop
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min) 
SELECT 
    r.id as route_id,
    res.id as restaurant_id,
    d.id as dish_id,
    2 as order_index,
    60 as time_override_min
FROM routes r
CROSS JOIN restaurants res
INNER JOIN menus m ON m.restaurant_id = res.id
INNER JOIN dishes d ON d.menu_id = m.id
WHERE r.name = 'Michelin Star Journey'
AND res.name = 'Sabi Omakase'
AND d.dish_type = 'Signature Dish'
LIMIT 1;

-- Add third stop
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min) 
SELECT 
    r.id as route_id,
    res.id as restaurant_id,
    d.id as dish_id,
    3 as order_index,
    30 as time_override_min
FROM routes r
CROSS JOIN restaurants res
INNER JOIN menus m ON m.restaurant_id = res.id
INNER JOIN dishes d ON d.menu_id = m.id
WHERE r.name = 'Michelin Star Journey'
AND res.name = 'Restaurant K2'
AND d.dish_type = 'Dessert'
LIMIT 1;

-- Add route stops for other existing routes as well

-- Urban Food Adventure
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min) 
SELECT 
    r.id as route_id,
    res.id as restaurant_id,
    d.id as dish_id,
    1 as order_index,
    40 as time_override_min
FROM routes r
CROSS JOIN restaurants res
INNER JOIN menus m ON m.restaurant_id = res.id
INNER JOIN dishes d ON d.menu_id = m.id
WHERE r.name LIKE '%Urban%'
AND res.name = 'Bellies'
AND d.dish_type = 'Forrett'
LIMIT 1;

INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min) 
SELECT 
    r.id as route_id,
    res.id as restaurant_id,
    d.id as dish_id,
    2 as order_index,
    50 as time_override_min
FROM routes r
CROSS JOIN restaurants res
INNER JOIN menus m ON m.restaurant_id = res.id
INNER JOIN dishes d ON d.menu_id = m.id
WHERE r.name LIKE '%Urban%'
AND res.name = 'Casa Gio'
AND d.dish_type = 'Signature Dish'
LIMIT 1;

-- Asian Fusion route stops
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min) 
SELECT 
    r.id as route_id,
    res.id as restaurant_id,
    d.id as dish_id,
    1 as order_index,
    35 as time_override_min
FROM routes r
CROSS JOIN restaurants res
INNER JOIN menus m ON m.restaurant_id = res.id
INNER JOIN dishes d ON d.menu_id = m.id
WHERE r.name LIKE '%Asian%'
AND res.name = 'Miyako'
AND d.dish_type = 'Forrett'
LIMIT 1;

INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min) 
SELECT 
    r.id as route_id,
    res.id as restaurant_id,
    d.id as dish_id,
    2 as order_index,
    45 as time_override_min
FROM routes r
CROSS JOIN restaurants res
INNER JOIN menus m ON m.restaurant_id = res.id
INNER JOIN dishes d ON d.menu_id = m.id
WHERE r.name LIKE '%Asian%'
AND res.name = 'An Nam'
AND d.dish_type = 'Signature Dish'
LIMIT 1;

-- Mediterranean route stops
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min) 
SELECT 
    r.id as route_id,
    res.id as restaurant_id,
    d.id as dish_id,
    1 as order_index,
    40 as time_override_min
FROM routes r
CROSS JOIN restaurants res
INNER JOIN menus m ON m.restaurant_id = res.id
INNER JOIN dishes d ON d.menu_id = m.id
WHERE r.name LIKE '%Mediterranean%'
AND res.name = 'Meze Restaurant'
AND d.dish_type = 'Forrett'
LIMIT 1;

INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min) 
SELECT 
    r.id as route_id,
    res.id as restaurant_id,
    d.id as dish_id,
    2 as order_index,
    55 as time_override_min
FROM routes r
CROSS JOIN restaurants res
INNER JOIN menus m ON m.restaurant_id = res.id
INNER JOIN dishes d ON d.menu_id = m.id
WHERE r.name LIKE '%Mediterranean%'
AND res.name = 'Delicatessen Tapasbar'
AND d.dish_type = 'Signature Dish'
LIMIT 1;