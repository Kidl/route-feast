-- Update existing restaurants with proper Stavanger coordinates for Google Maps
UPDATE restaurants 
SET 
  lat = CASE 
    WHEN name = 'Restaurant K2' THEN 58.9731
    WHEN name = 'Sabi Omakase' THEN 58.9715
    WHEN name = 'Bravo' THEN 58.9720
    WHEN name = 'Bellies' THEN 58.9708
    WHEN name = 'An Nam' THEN 58.9725
    WHEN name = 'Kansui' THEN 58.9712
    WHEN name = 'Miyako' THEN 58.9718
    WHEN name = 'Casa Gio' THEN 58.9722
    WHEN name = 'Delicatessen Tapasbar' THEN 58.9710
    WHEN name = 'Meze Restaurant' THEN 58.9716
    ELSE 58.9718 -- Default Pedersgata center
  END,
  lng = CASE
    WHEN name = 'Restaurant K2' THEN 5.7346
    WHEN name = 'Sabi Omakase' THEN 5.7335
    WHEN name = 'Bravo' THEN 5.7340
    WHEN name = 'Bellies' THEN 5.7332
    WHEN name = 'An Nam' THEN 5.7343
    WHEN name = 'Kansui' THEN 5.7338
    WHEN name = 'Miyako' THEN 5.7341
    WHEN name = 'Casa Gio' THEN 5.7345
    WHEN name = 'Delicatessen Tapasbar' THEN 5.7336
    WHEN name = 'Meze Restaurant' THEN 5.7339
    ELSE 5.7341 -- Default Pedersgata center
  END
WHERE name IN (
  'Restaurant K2', 'Sabi Omakase', 'Bravo', 'Bellies', 
  'An Nam', 'Kansui', 'Miyako', 'Casa Gio', 
  'Delicatessen Tapasbar', 'Meze Restaurant'
);

-- Insert sample restaurants if they don't exist
INSERT INTO restaurants (name, description, cuisine_type, address, city, lat, lng, status, phone, email, tags)
SELECT 
  name, description, cuisine_type, address, city, lat, lng, status, phone, email, tags
FROM (VALUES
  ('Restaurant K2', 'Michelin-stjernet restaurant som fokuserer på økologiske, lokale og bærekraftige ingredienser. Tildelt både Michelin-stjerne og bærekraftskløver.', 'Moderne nordisk', 'Pedersgata 32, Stavanger', 'Stavanger', 58.9731, 5.7346, 'active', '+47 51 84 38 00', 'booking@restaurantk2.no', ARRAY['michelin', 'bærekraftig', 'nordisk']),
  ('Sabi Omakase', 'Michelin-stjernet sushi-restaurant ledet av kokk Roger Asakil Joya. Tilbyr tradisjonell omakase-opplevelse med ingredienser av høyeste kvalitet.', 'Japansk sushi', 'Pedersgata 28, Stavanger', 'Stavanger', 58.9715, 5.7335, 'active', '+47 51 84 27 00', 'post@sabiomakase.no', ARRAY['michelin', 'sushi', 'omakase']),
  ('Bravo', 'À la carte-meny med enkle småretter og snacks. Korttreiste ingredienser som varierer etter sesong. Naturlig vinliste. Nevnt i Michelin Guide.', 'Moderne europeisk', 'Pedersgata 30, Stavanger', 'Stavanger', 58.9720, 5.7340, 'active', '+47 51 84 25 00', 'hei@bravostavanger.no', ARRAY['michelin guide', 'naturlige viner', 'sesong']),
  ('Bellies', 'Utelukkende plantebasert restaurant som lager fantastiske retter som tilfredsstiller både øyet og ganen. Anbefalt i Michelin Guide.', 'Plantebasert', 'Pedersgata 26, Stavanger', 'Stavanger', 58.9708, 5.7332, 'active', '+47 51 84 23 00', 'hello@bellies.no', ARRAY['michelin guide', 'plantebasert', 'vegansk']),
  ('An Nam', 'En middag på An Nam er som en reise gjennom Vietnam, fra rismarker i nord til havner i sør. Østlige krydder og urter kombinert med lokale norske ingredienser.', 'Vietnamesisk', 'Pedersgata 34, Stavanger', 'Stavanger', 58.9725, 5.7343, 'active', '+47 51 84 39 00', 'info@annam.no', ARRAY['vietnamesisk', 'lokale ingredienser', 'asiatisk']),
  ('Kansui', 'Serverer byens beste ramen i japansk stil! Flere varianter på menyen. Spis som en japaner og nyt måltidet med lange slurk!', 'Japansk ramen', 'Pedersgata 29, Stavanger', 'Stavanger', 58.9712, 5.7338, 'active', '+47 51 84 29 00', 'info@kansui.no', ARRAY['ramen', 'japansk', 'autentisk']),
  ('Miyako', 'Asiatisk fusjonskonsept inspirert av flere østasiatiske land. Bredt utvalg av sushi, sashimi, tempura og varme retter, pluss vegetariske og veganske alternativer.', 'Asiatisk fusion', 'Pedersgata 31, Stavanger', 'Stavanger', 58.9718, 5.7341, 'active', '+47 51 84 31 00', 'post@miyako.no', ARRAY['fusion', 'sushi', 'vegetarisk']),
  ('Casa Gio', 'Serverer mat laget av kvalitetsingredienser med få kombinasjoner. Fersk pasta, myk ravioli, dampende tagliatelle, risotto og alt det gode forbundet med italiensk mat.', 'Italiensk', 'Pedersgata 33, Stavanger', 'Stavanger', 58.9722, 5.7345, 'active', '+47 51 84 33 00', 'ciao@casagio.no', ARRAY['italiensk', 'pasta', 'tradisjonell']),
  ('Delicatessen Tapasbar', 'Slapp av og nyt et glass vin med deilige tapas av mange forskjellige typer. Mat laget for deling i hyggelig selskap rundt et bord eller i baren.', 'Spansk tapas', 'Pedersgata 27, Stavanger', 'Stavanger', 58.9710, 5.7336, 'active', '+47 51 84 27 00', 'hola@delicatessen.no', ARRAY['tapas', 'vin', 'deling']),
  ('Meze Restaurant', 'Middagsretter og småretter fra middelhavsland servert alene eller sammen for et komplett måltid. Meze er perfekt å dele med venner!', 'Middelhavs', 'Pedersgata 30B, Stavanger', 'Stavanger', 58.9716, 5.7339, 'active', '+47 51 84 30 00', 'info@meze.no', ARRAY['meze', 'middelhavs', 'deling'])
) AS new_restaurants(name, description, cuisine_type, address, city, lat, lng, status, phone, email, tags)
WHERE NOT EXISTS (SELECT 1 FROM restaurants WHERE restaurants.name = new_restaurants.name);