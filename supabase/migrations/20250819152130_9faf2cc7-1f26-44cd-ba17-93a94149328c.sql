-- Fix consecutive restaurant stops in existing routes
-- Remove route stops where the same restaurant appears consecutively

WITH consecutive_stops AS (
  SELECT 
    rs1.id as current_stop_id,
    rs1.route_id,
    rs1.restaurant_id,
    rs1.order_index,
    rs2.restaurant_id as next_restaurant_id,
    rs2.id as next_stop_id
  FROM route_stops rs1
  LEFT JOIN route_stops rs2 ON rs1.route_id = rs2.route_id 
    AND rs2.order_index = rs1.order_index + 1
  WHERE rs1.restaurant_id = rs2.restaurant_id
),
stops_to_remove AS (
  SELECT next_stop_id as stop_id
  FROM consecutive_stops
  WHERE next_stop_id IS NOT NULL
)
DELETE FROM route_stops 
WHERE id IN (SELECT stop_id FROM stops_to_remove);

-- Reorder remaining stops to ensure sequential order_index
WITH reordered_stops AS (
  SELECT 
    id,
    route_id,
    ROW_NUMBER() OVER (PARTITION BY route_id ORDER BY order_index) - 1 as new_order_index
  FROM route_stops
)
UPDATE route_stops 
SET order_index = reordered_stops.new_order_index
FROM reordered_stops
WHERE route_stops.id = reordered_stops.id;

-- Add replacement stops for routes that now have too few stops
-- Ensure each route has at least 2 stops with different restaurants
WITH route_stop_counts AS (
  SELECT 
    r.id as route_id,
    r.name,
    COUNT(rs.id) as stop_count,
    ARRAY_AGG(DISTINCT rs.restaurant_id) as used_restaurants
  FROM routes r
  LEFT JOIN route_stops rs ON r.id = rs.route_id
  WHERE r.is_active = true
  GROUP BY r.id, r.name
  HAVING COUNT(rs.id) < 2
),
available_restaurants AS (
  SELECT 
    rsc.route_id,
    rsc.stop_count,
    rest.id as restaurant_id,
    rest.name as restaurant_name
  FROM route_stop_counts rsc
  CROSS JOIN restaurants rest
  WHERE rest.status = 'active'
  AND NOT (rest.id = ANY(rsc.used_restaurants))
)
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min)
SELECT 
  ar.route_id,
  ar.restaurant_id,
  d.id as dish_id,
  COALESCE((SELECT MAX(order_index) + 1 FROM route_stops WHERE route_id = ar.route_id), 0) + 
    ROW_NUMBER() OVER (PARTITION BY ar.route_id ORDER BY RANDOM()) - 1 as order_index,
  45 as time_override_min
FROM available_restaurants ar
CROSS JOIN LATERAL (
  SELECT dishes.id 
  FROM dishes 
  JOIN menus ON dishes.menu_id = menus.id 
  WHERE menus.restaurant_id = ar.restaurant_id 
  AND dishes.available_for_route = true
  ORDER BY RANDOM() 
  LIMIT 1
) d
WHERE ar.route_id IN (SELECT route_id FROM route_stop_counts)
AND ROW_NUMBER() OVER (PARTITION BY ar.route_id ORDER BY RANDOM()) <= 2;

-- Update route durations based on updated stop times
UPDATE routes 
SET duration_hours = COALESCE(
  (SELECT SUM(time_override_min) / 60.0 
   FROM route_stops 
   WHERE route_stops.route_id = routes.id), 
  2.5
);