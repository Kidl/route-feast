-- Add route stops for all remaining routes without stops

-- After Work Social - casual dining
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
WHERE r.name = 'After Work Social'
AND res.name = 'Bravo'
AND d.dish_type = 'Forrett'
LIMIT 1;

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
WHERE r.name = 'After Work Social'
AND res.name = 'Delicatessen Tapasbar'
AND d.dish_type = 'Signature Dish'
LIMIT 1;

-- Asian Fusion Journey
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
WHERE r.name = 'Asian Fusion Journey'
AND res.name = 'Kansui'
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
WHERE r.name = 'Asian Fusion Journey'
AND res.name = 'Miyako'
AND d.dish_type = 'Signature Dish'
LIMIT 1;

-- Breakfast to Dinner Marathon
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min) 
SELECT 
    r.id as route_id,
    res.id as restaurant_id,
    d.id as dish_id,
    1 as order_index,
    30 as time_override_min
FROM routes r
CROSS JOIN restaurants res
INNER JOIN menus m ON m.restaurant_id = res.id
INNER JOIN dishes d ON d.menu_id = m.id
WHERE r.name = 'Breakfast to Dinner Marathon'
AND res.name LIKE '%Bakery%'
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
WHERE r.name = 'Breakfast to Dinner Marathon'
AND res.name = 'Casa Gio'
AND d.dish_type = 'Signature Dish'
LIMIT 1;

INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min) 
SELECT 
    r.id as route_id,
    res.id as restaurant_id,
    d.id as dish_id,
    3 as order_index,
    40 as time_override_min
FROM routes r
CROSS JOIN restaurants res
INNER JOIN menus m ON m.restaurant_id = res.id
INNER JOIN dishes d ON d.menu_id = m.id
WHERE r.name = 'Breakfast to Dinner Marathon'
AND res.name = 'Restaurant K2'
AND d.dish_type = 'Dessert'
LIMIT 1;

-- Date Night Romance
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min) 
SELECT 
    r.id as route_id,
    res.id as restaurant_id,
    d.id as dish_id,
    1 as order_index,
    60 as time_override_min
FROM routes r
CROSS JOIN restaurants res
INNER JOIN menus m ON m.restaurant_id = res.id
INNER JOIN dishes d ON d.menu_id = m.id
WHERE r.name = 'Date Night Romance'
AND res.name = 'Sabi Omakase'
AND d.dish_type = 'Signature Dish'
LIMIT 1;

INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min) 
SELECT 
    r.id as route_id,
    res.id as restaurant_id,
    d.id as dish_id,
    2 as order_index,
    30 as time_override_min
FROM routes r
CROSS JOIN restaurants res
INNER JOIN menus m ON m.restaurant_id = res.id
INNER JOIN dishes d ON d.menu_id = m.id
WHERE r.name = 'Date Night Romance'
AND res.name = 'Restaurant K2'
AND d.dish_type = 'Dessert'
LIMIT 1;

-- Mediterranean Classics
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
WHERE r.name = 'Mediterranean Classics'
AND res.name = 'Meze Restaurant'
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
WHERE r.name = 'Mediterranean Classics'
AND res.name = 'Delicatessen Tapasbar'
AND d.dish_type = 'Signature Dish'
LIMIT 1;

-- Seafood Spectacular
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min) 
SELECT 
    r.id as route_id,
    res.id as restaurant_id,
    d.id as dish_id,
    1 as order_index,
    50 as time_override_min
FROM routes r
CROSS JOIN restaurants res
INNER JOIN menus m ON m.restaurant_id = res.id
INNER JOIN dishes d ON d.menu_id = m.id
WHERE r.name = 'Seafood Spectacular'
AND res.name = 'Bellies'
AND d.dish_type = 'Signature Dish'
LIMIT 1;

INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min) 
SELECT 
    r.id as route_id,
    res.id as restaurant_id,
    d.id as dish_id,
    2 as order_index,
    35 as time_override_min
FROM routes r
CROSS JOIN restaurants res
INNER JOIN menus m ON m.restaurant_id = res.id
INNER JOIN dishes d ON d.menu_id = m.id
WHERE r.name = 'Seafood Spectacular'
AND res.name = 'Miyako'
AND d.dish_type = 'Forrett'
LIMIT 1;

-- Student Special (budget-friendly)
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min) 
SELECT 
    r.id as route_id,
    res.id as restaurant_id,
    d.id as dish_id,
    1 as order_index,
    30 as time_override_min
FROM routes r
CROSS JOIN restaurants res
INNER JOIN menus m ON m.restaurant_id = res.id
INNER JOIN dishes d ON d.menu_id = m.id
WHERE r.name = 'Student Special'
AND res.name LIKE '%Pizza%'
AND d.dish_type = 'Signature Dish'
LIMIT 1;

-- Add more stops for remaining routes with similar pattern
-- Continue with other routes to ensure all have at least 2-3 stops each