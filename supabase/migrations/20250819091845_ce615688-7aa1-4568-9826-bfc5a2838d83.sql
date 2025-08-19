
-- Clear existing route stops to rebuild them properly
DELETE FROM route_stops;

-- Add route stops with restaurants and dishes for each route
-- Route 1: Stavanger Gourmet Walk (3 stops)
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min)
SELECT 
  r.id as route_id,
  rest.id as restaurant_id,
  d.id as dish_id,
  ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY rest.name) - 1 as order_index,
  45 as time_override_min
FROM routes r
CROSS JOIN LATERAL (
  SELECT restaurants.id, restaurants.name 
  FROM restaurants 
  WHERE restaurants.status = 'active' 
  AND restaurants.cuisine_type IN ('Norwegian', 'Seafood', 'European')
  ORDER BY RANDOM() 
  LIMIT 3
) rest
CROSS JOIN LATERAL (
  SELECT dishes.id 
  FROM dishes 
  JOIN menus ON dishes.menu_id = menus.id 
  WHERE menus.restaurant_id = rest.id 
  AND dishes.available_for_route = true
  ORDER BY RANDOM() 
  LIMIT 2
) d
WHERE r.name = 'Stavanger Gourmet Walk';

-- Route 2: Asian Fusion Tour (4 stops)
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min)
SELECT 
  r.id as route_id,
  rest.id as restaurant_id,
  d.id as dish_id,
  ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY rest.name) - 1 as order_index,
  40 as time_override_min
FROM routes r
CROSS JOIN LATERAL (
  SELECT restaurants.id, restaurants.name 
  FROM restaurants 
  WHERE restaurants.status = 'active' 
  AND restaurants.cuisine_type IN ('Asian', 'Japanese', 'Thai', 'Chinese')
  ORDER BY RANDOM() 
  LIMIT 4
) rest
CROSS JOIN LATERAL (
  SELECT dishes.id 
  FROM dishes 
  JOIN menus ON dishes.menu_id = menus.id 
  WHERE menus.restaurant_id = rest.id 
  AND dishes.available_for_route = true
  ORDER BY RANDOM() 
  LIMIT 1
) d
WHERE r.name = 'Asian Fusion Tour';

-- Route 3: Mediterranean Journey (3 stops)
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min)
SELECT 
  r.id as route_id,
  rest.id as restaurant_id,
  d.id as dish_id,
  ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY rest.name) - 1 as order_index,
  50 as time_override_min
FROM routes r
CROSS JOIN LATERAL (
  SELECT restaurants.id, restaurants.name 
  FROM restaurants 
  WHERE restaurants.status = 'active' 
  AND restaurants.cuisine_type IN ('Mediterranean', 'Italian', 'Greek')
  ORDER BY RANDOM() 
  LIMIT 3
) rest
CROSS JOIN LATERAL (
  SELECT dishes.id 
  FROM dishes 
  JOIN menus ON dishes.menu_id = menus.id 
  WHERE menus.restaurant_id = rest.id 
  AND dishes.available_for_route = true
  ORDER BY RANDOM() 
  LIMIT 2
) d
WHERE r.name = 'Mediterranean Journey';

-- Route 4: Michelin Star Experience (2 stops - premium experience)
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min)
SELECT 
  r.id as route_id,
  rest.id as restaurant_id,
  d.id as dish_id,
  ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY rest.name) - 1 as order_index,
  60 as time_override_min
FROM routes r
CROSS JOIN LATERAL (
  SELECT restaurants.id, restaurants.name 
  FROM restaurants 
  WHERE restaurants.status = 'active' 
  AND restaurants.cuisine_type IN ('Fine Dining', 'European', 'French')
  ORDER BY RANDOM() 
  LIMIT 2
) rest
CROSS JOIN LATERAL (
  SELECT dishes.id 
  FROM dishes 
  JOIN menus ON dishes.menu_id = menus.id 
  WHERE menus.restaurant_id = rest.id 
  AND dishes.available_for_route = true
  AND dishes.dish_type IN ('Main Course', 'Appetizer')
  ORDER BY RANDOM() 
  LIMIT 2
) d
WHERE r.name = 'Michelin Star Experience';

-- Route 5: Seafood Odyssey (3 stops)
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min)
SELECT 
  r.id as route_id,
  rest.id as restaurant_id,
  d.id as dish_id,
  ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY rest.name) - 1 as order_index,
  45 as time_override_min
FROM routes r
CROSS JOIN LATERAL (
  SELECT restaurants.id, restaurants.name 
  FROM restaurants 
  WHERE restaurants.status = 'active' 
  AND restaurants.cuisine_type IN ('Seafood', 'Norwegian', 'Coastal')
  ORDER BY RANDOM() 
  LIMIT 3
) rest
CROSS JOIN LATERAL (
  SELECT dishes.id 
  FROM dishes 
  JOIN menus ON dishes.menu_id = menus.id 
  WHERE menus.restaurant_id = rest.id 
  AND dishes.available_for_route = true
  AND dishes.dish_type IN ('Main Course', 'Appetizer', 'Seafood Special')
  ORDER BY RANDOM() 
  LIMIT 2
) d
WHERE r.name = 'Seafood Odyssey';

-- Route 6: Nordic Flavors (4 stops)
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min)
SELECT 
  r.id as route_id,
  rest.id as restaurant_id,
  d.id as dish_id,
  ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY rest.name) - 1 as order_index,
  35 as time_override_min
FROM routes r
CROSS JOIN LATERAL (
  SELECT restaurants.id, restaurants.name 
  FROM restaurants 
  WHERE restaurants.status = 'active' 
  AND restaurants.cuisine_type IN ('Nordic', 'Scandinavian', 'Norwegian')
  ORDER BY RANDOM() 
  LIMIT 4
) rest
CROSS JOIN LATERAL (
  SELECT dishes.id 
  FROM dishes 
  JOIN menus ON dishes.menu_id = menus.id 
  WHERE menus.restaurant_id = rest.id 
  AND dishes.available_for_route = true
  ORDER BY RANDOM() 
  LIMIT 1
) d
WHERE r.name = 'Nordic Flavors';

-- For remaining routes, add 2-3 stops each with varied restaurants
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min)
SELECT 
  r.id as route_id,
  rest.id as restaurant_id,
  d.id as dish_id,
  ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY rest.name) - 1 as order_index,
  CASE 
    WHEN RANDOM() < 0.3 THEN 30
    WHEN RANDOM() < 0.7 THEN 45
    ELSE 60
  END as time_override_min
FROM routes r
CROSS JOIN LATERAL (
  SELECT restaurants.id, restaurants.name 
  FROM restaurants 
  WHERE restaurants.status = 'active'
  ORDER BY RANDOM() 
  LIMIT CASE 
    WHEN RANDOM() < 0.25 THEN 1
    WHEN RANDOM() < 0.75 THEN 2
    ELSE 3
  END
) rest
CROSS JOIN LATERAL (
  SELECT dishes.id 
  FROM dishes 
  JOIN menus ON dishes.menu_id = menus.id 
  WHERE menus.restaurant_id = rest.id 
  AND dishes.available_for_route = true
  ORDER BY RANDOM() 
  LIMIT CASE WHEN RANDOM() < 0.5 THEN 1 ELSE 2 END
) d
WHERE r.name NOT IN ('Stavanger Gourmet Walk', 'Asian Fusion Tour', 'Mediterranean Journey', 'Michelin Star Experience', 'Seafood Odyssey', 'Nordic Flavors');

-- Update route durations based on total stop times
UPDATE routes 
SET duration_hours = COALESCE(
  (SELECT SUM(time_override_min) / 60.0 
   FROM route_stops 
   WHERE route_stops.route_id = routes.id), 
  duration_hours
);
