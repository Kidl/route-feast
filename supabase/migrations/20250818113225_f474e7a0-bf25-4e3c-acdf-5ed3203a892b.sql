-- Insert demo restaurant tables for testing
INSERT INTO public.restaurant_tables (restaurant_id, table_number, capacity, table_type, status, location_notes) VALUES
-- Using a static UUID for demo purposes
('11111111-1111-1111-1111-111111111111', '1', 2, 'standard', 'available', 'By window'),
('11111111-1111-1111-1111-111111111111', '2', 4, 'standard', 'available', 'Center area'),
('11111111-1111-1111-1111-111111111111', '3', 6, 'large', 'available', 'Private corner'),
('11111111-1111-1111-1111-111111111111', '4', 4, 'standard', 'available', 'Near bar'),
('11111111-1111-1111-1111-111111111111', '5', 2, 'standard', 'occupied', 'Terrace'),
('11111111-1111-1111-1111-111111111111', '6', 8, 'large', 'available', 'Private dining room'),
('11111111-1111-1111-1111-111111111111', '7', 4, 'standard', 'available', 'Center area'),
('11111111-1111-1111-1111-111111111111', '8', 2, 'standard', 'available', 'By window');