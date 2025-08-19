-- Add title and description fields to route_stops table
ALTER TABLE route_stops 
ADD COLUMN title text,
ADD COLUMN description text;

-- Update existing stops with default titles
UPDATE route_stops 
SET title = 'Stopp ' || (order_index + 1)::text 
WHERE title IS NULL;