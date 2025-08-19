-- Fix consecutive restaurant stops in existing routes
-- Remove route stops where the same restaurant appears consecutively

DELETE FROM route_stops 
WHERE id IN (
  SELECT rs2.id 
  FROM route_stops rs1
  JOIN route_stops rs2 ON rs1.route_id = rs2.route_id 
    AND rs2.order_index = rs1.order_index + 1
    AND rs1.restaurant_id = rs2.restaurant_id
);

-- Reorder remaining stops to ensure sequential order_index
UPDATE route_stops 
SET order_index = subq.new_order_index
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY route_id ORDER BY order_index) - 1 as new_order_index
  FROM route_stops
) subq
WHERE route_stops.id = subq.id;

-- Add replacement stops for routes that now have fewer than 2 stops
INSERT INTO route_stops (route_id, restaurant_id, dish_id, order_index, time_override_min)
SELECT 
  r.id as route_id,
  rest.id as restaurant_id,
  d.id as dish_id,
  COALESCE((SELECT MAX(order_index) + 1 FROM route_stops WHERE route_id = r.id), 0) as order_index,
  45 as time_override_min
FROM routes r
CROSS JOIN restaurants rest
CROSS JOIN LATERAL (
  SELECT dishes.id 
  FROM dishes 
  JOIN menus ON dishes.menu_id = menus.id 
  WHERE menus.restaurant_id = rest.id 
  AND dishes.available_for_route = true
  ORDER BY RANDOM() 
  LIMIT 1
) d
WHERE r.is_active = true
  AND rest.status = 'active'
  AND (SELECT COUNT(*) FROM route_stops WHERE route_id = r.id) < 2
  AND NOT EXISTS (
    SELECT 1 FROM route_stops rs 
    WHERE rs.route_id = r.id AND rs.restaurant_id = rest.id
  )
  AND rest.id IN (
    SELECT restaurants.id FROM restaurants 
    WHERE status = 'active' 
    ORDER BY RANDOM() 
    LIMIT 1
  );

-- Update route durations
UPDATE routes 
SET duration_hours = COALESCE(
  (SELECT SUM(time_override_min) / 60.0 
   FROM route_stops 
   WHERE route_stops.route_id = routes.id), 
  2.5
);