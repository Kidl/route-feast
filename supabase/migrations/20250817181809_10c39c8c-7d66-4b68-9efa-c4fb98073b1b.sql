-- Create 30 diverse culinary routes
INSERT INTO public.routes (name, description, location, price_nok, duration_hours, max_capacity, highlights, image_url, status, is_active) VALUES 

-- Premium Experiences
('Michelin Star Journey', 'En eksklusiv reise gjennom Stavangers Michelin-stjernede restauranter. Opplev verdensklasse kokkekunst på Restaurant K2 og Sabi Omakase.', 'Stavanger Sentrum', 1299900, 4.5, 8, ARRAY['Michelin-starred dining', '2 Michelin restaurants', 'Premium sake pairing', 'Chef interactions'], '/src/assets/route-michelin.jpg', 'active', true),

('Plant-Based Paradise', 'Oppdage det innovative plantebaserte kjøkkenet hos Bellies, kombinert med ferske salater og veganske delikatesser.', 'Stavanger Sentrum', 89900, 3.0, 12, ARRAY['100% plant-based', 'Michelin mentioned', 'Sustainable dining', 'Creative presentations'], '/src/assets/route-urban.jpg', 'active', true),

('Nordic Essence', 'Autentisk nordisk mat med lokale råvarer fra Bravo og moderne tolkninger av tradisjonelle retter.', 'Stavanger Sentrum', 129900, 3.5, 10, ARRAY['Local ingredients', 'Modern Nordic', 'Natural wines', 'Seasonal menu'], '/src/assets/route-nordic.jpg', 'active', true),

-- Asian Journey Routes
('Asian Fusion Adventure', 'En smaksreise gjennom Asia med stopp hos Miyako, Kansui og An Nam for autentiske smaker fra øst.', 'Stavanger Sentrum', 89900, 4.0, 15, ARRAY['Multi-Asian cuisine', 'Authentic flavors', 'Traditional techniques', 'Cultural experience'], '/src/assets/route-asian.jpg', 'active', true),

('Ramen & Sushi Experience', 'Perfekt kombinasjon av Japans to kulinariske ikoner - håndverks-ramen hos Kansui og premium sushi hos Sabi Omakase.', 'Stavanger Sentrum', 79900, 3.0, 12, ARRAY['Authentic Japanese', 'Handcrafted ramen', 'Premium sushi', 'Traditional techniques'], '/src/assets/route-asian.jpg', 'active', true),

('Vietnamese Street Food Tour', 'Opplev Vietnams gatemat-kultur hos An Nam med tradisjonell Pho, Banh Mi og ferske vårrullar.', 'Stavanger Sentrum', 49900, 2.5, 16, ARRAY['Street food culture', 'Fresh herbs', 'Traditional recipes', 'Casual dining'], '/src/assets/route-asian.jpg', 'active', true),

-- European Cuisine Routes
('Italian Amore', 'En romantisk reise gjennom Italia med hjemmelaget pasta, risotto og klassisk tiramisu hos Casa Gio.', 'Stavanger Sentrum', 69900, 3.0, 14, ARRAY['Handmade pasta', 'Traditional recipes', 'Italian wines', 'Romantic atmosphere'], '/src/assets/route-mediterranean.jpg', 'active', true),

('Mediterranean Tapas Journey', 'Oppdage smakene fra Middelhavet med deling av tapas og meze hos Delicatessen og Meze Restaurant.', 'Stavanger Sentrum', 59900, 3.5, 18, ARRAY['Sharing plates', 'Mediterranean flavors', 'Social dining', 'Wine pairing'], '/src/assets/route-mediterranean.jpg', 'active', true),

-- Burger & Comfort Food
('Gourmet Burger Experience', 'Byens beste håndlagde burgere hos Hekkan Burger med biologisk trekull og Prima Jæren kjøtt.', 'Stavanger Sentrum', 39900, 2.0, 20, ARRAY['Hand-crafted burgers', 'Local meat', 'Charcoal grilled', 'Artisan bread'], '/src/assets/route-urban.jpg', 'active', true),

('Pizza & Kebab Classic', 'Kombinasjon av authentic tyrkisk kebab hos Istanbul og ekte italiensk pizza hos Panzanella.', 'Stavanger Sentrum', 44900, 2.5, 22, ARRAY['Authentic recipes', 'Traditional ovens', 'Fresh ingredients', 'Casual atmosphere'], '/src/assets/route-urban.jpg', 'active', true),

-- International Fusion
('Global Spice Route', 'En verdensomspennende smaksreise med krydder fra Noras Kitchen (pakistansk/indisk) og Zouq.', 'Stavanger Sentrum', 54900, 3.0, 16, ARRAY['Halal cuisine', 'Traditional spices', 'Family recipes', 'Cultural stories'], '/src/assets/route-asian.jpg', 'active', true),

('Breakfast to Dinner Marathon', 'Full dag med kaffe og bakverk hos Molinå, lunsj hos Miyako og middag hos Restaurant K2.', 'Stavanger Sentrum', 149900, 6.0, 8, ARRAY['All-day dining', 'From bakery to fine dining', 'Local ingredients', 'Diverse experiences'], '/src/assets/route-urban.jpg', 'active', true),

-- Specialty Dining Experiences
('Dumpling & Dim Sum Delight', 'Spesiell opplevelse med håndlagde dumplings hos Yips og tradisjonelle teknikker.', 'Stavanger Sentrum', 39900, 2.0, 18, ARRAY['Handmade dumplings', 'Asian techniques', 'Fresh ingredients', 'Interactive experience'], '/src/assets/route-asian.jpg', 'active', true),

('Seafood Spectacular', 'Fokus på sjømat med ferske østers og kamskjell fra Restaurant K2 og andre marine delikatesser.', 'Stavanger Sentrum', 119900, 3.5, 10, ARRAY['Fresh seafood', 'Local catch', 'Expert preparation', 'Ocean flavors'], '/src/assets/route-seafood.jpg', 'active', true),

-- Budget-Friendly Options
('Student Special', 'Rimelig alternativ med de beste signaturrettene fra utvalgte restauranter.', 'Stavanger Sentrum', 29900, 2.5, 25, ARRAY['Budget-friendly', 'Signature dishes', 'Student portions', 'Great value'], '/src/assets/route-urban.jpg', 'active', true),

('Lunch Express', 'Rask og deilig lunsjopplevelse på 3 steder med fokus på kvalitet og effektivitet.', 'Stavanger Sentrum', 34900, 2.0, 20, ARRAY['Quick service', 'Quality lunch', 'Efficient routing', 'Business friendly'], '/src/assets/route-urban.jpg', 'active', true),

-- Evening & Late Night
('After Work Social', 'Perfekt for kollegaer - deling av mat og drikke på sosiale steder.', 'Stavanger Sentrum', 49900, 3.0, 24, ARRAY['Social dining', 'After work', 'Sharing plates', 'Networking'], '/src/assets/route-urban.jpg', 'active', true),

('Date Night Romance', 'Romantisk opplevelse for par med intim atmosfære og delte retter.', 'Stavanger Sentrum', 89900, 4.0, 12, ARRAY['Romantic atmosphere', 'Intimate dining', 'Shared experiences', 'Wine pairing'], '/src/assets/route-mediterranean.jpg', 'active', true),

-- Specialty Dietary
('Gluten-Free Journey', 'Trygg opplevelse for glutenintolerante med nøye utvalgte retter.', 'Stavanger Sentrum', 69900, 3.0, 12, ARRAY['Gluten-free options', 'Safe dining', 'Careful selection', 'Health conscious'], '/src/assets/route-nordic.jpg', 'active', true),

('Vegan Delights', 'Helt vegansk opplevelse med innovative plantebaserte retter.', 'Stavanger Sentrum', 74900, 3.5, 14, ARRAY['100% vegan', 'Plant innovations', 'Sustainable choices', 'Creative cuisine'], '/src/assets/route-urban.jpg', 'active', true),

-- Cultural Experiences
('Scandinavian Classics', 'Tradisjonelle skandinaviske smaker med moderne presentasjon.', 'Stavanger Sentrum', 84900, 3.5, 16, ARRAY['Traditional flavors', 'Modern presentation', 'Local heritage', 'Cultural stories'], '/src/assets/route-nordic.jpg', 'active', true),

('Immigration Stories', 'Opplev hvordan ulike kulturer har påvirket Stavangers matscene.', 'Stavanger Sentrum', 64900, 4.0, 18, ARRAY['Cultural diversity', 'Immigration stories', 'Fusion cuisine', 'Historical context'], '/src/assets/route-urban.jpg', 'active', true),

-- Seasonal Specials
('Summer Fresh', 'Sesongens beste med ferske ingredienser og lette retter.', 'Stavanger Sentrum', 74900, 3.0, 20, ARRAY['Seasonal ingredients', 'Fresh preparations', 'Light dishes', 'Summer vibes'], '/src/assets/route-nordic.jpg', 'active', true),

('Winter Comfort', 'Varmende retter og komfortmat perfekt for kalde dager.', 'Stavanger Sentrum', 79900, 3.5, 16, ARRAY['Comfort food', 'Warming dishes', 'Hearty portions', 'Cozy atmosphere'], '/src/assets/route-nordic.jpg', 'active', true),

-- Family & Group Experiences
('Family Adventure', 'Barnevennlig opplevelse med retter som passer hele familien.', 'Stavanger Sentrum', 54900, 2.5, 30, ARRAY['Family-friendly', 'Kid approved', 'Diverse options', 'Group dining'], '/src/assets/route-urban.jpg', 'active', true),

('Corporate Team Building', 'Perfekt for firmaarrangementer med fokus på samarbeid og opplevelse.', 'Stavanger Sentrum', 94900, 4.0, 40, ARRAY['Team building', 'Corporate dining', 'Group activities', 'Professional service'], '/src/assets/route-urban.jpg', 'active', true),

-- Quick Bites & Street Food
('Street Food Safari', 'Rask og autentisk gatemat fra forskjellige kulturer.', 'Stavanger Sentrum', 39900, 2.0, 25, ARRAY['Authentic street food', 'Quick bites', 'Cultural variety', 'Casual dining'], '/src/assets/route-urban.jpg', 'active', true),

('Coffee & Pastry Morning', 'Start dagen med kaffe og bakverk på de beste stedene.', 'Stavanger Sentrum', 24900, 1.5, 20, ARRAY['Artisan coffee', 'Fresh pastries', 'Morning energy', 'Cozy cafes'], '/src/assets/route-urban.jpg', 'active', true),

-- Premium Weekends
('Weekend Warrior', 'Spesiell helgeopplevelse med det beste fra flere kjøkken.', 'Stavanger Sentrum', 109900, 5.0, 12, ARRAY['Weekend special', 'Multiple cuisines', 'Extended experience', 'Premium service'], '/src/assets/route-michelin.jpg', 'active', true),

('Sunday Brunch Extravaganza', 'Overdådig brunch-opplevelse med det beste fra morgenbord til lunsj.', 'Stavanger Sentrum', 79900, 3.0, 18, ARRAY['Brunch specialties', 'Extended menu', 'Weekend relaxation', 'Social dining'], '/src/assets/route-urban.jpg', 'active', true);