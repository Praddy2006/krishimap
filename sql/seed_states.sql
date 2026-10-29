-- Sample seed data for ~20 states to get the app working end-to-end.
-- `name` values MUST match the "name" property in public/data/india_states.geojson exactly.
-- Team TODO: add the remaining states (see README "Remaining data entry" section).

USE krishimap;

INSERT INTO states (name, soil_type, major_crops, climate, farming_notes) VALUES
('Punjab', 'Alluvial (Indo-Gangetic)', 'Wheat, rice, sugarcane', 'Semi-arid, hot summers, cold winters', 'Heavily irrigated by canals and tube-wells; among India''s highest yields per hectare.'),
('Rajasthan', 'Arid, sandy desert soil', 'Bajra (pearl millet), mustard, pulses', 'Arid to semi-arid, extreme temperature range', 'Low and erratic rainfall; heavy reliance on groundwater and drought-resistant crops.'),
('Maharashtra', 'Black cotton soil (regur)', 'Cotton, sugarcane, jowar', 'Tropical, monsoon-dependent', 'Basaltic Deccan soil retains moisture well, well suited to cotton cultivation.'),
('Kerala', 'Laterite soil', 'Coconut, rubber, spices, rice', 'Tropical, very high rainfall', 'High humidity and rainfall support plantation and spice crops year-round.'),
('West Bengal', 'Alluvial, deltaic', 'Rice, jute, tea (north)', 'Tropical, monsoon, high humidity', 'Ganges delta gives fertile alluvium; among the top rice-producing states.'),
('Uttar Pradesh', 'Alluvial (Gangetic plain)', 'Wheat, sugarcane, rice', 'Subtropical, hot summers, cool winters', 'India''s largest sugarcane producer, with an extensive canal irrigation network.'),
('Gujarat', 'Black and alluvial soil', 'Cotton, groundnut, tobacco', 'Semi-arid to arid', 'Saurashtra''s black soil favors cotton; strong agro-industrial base.'),
('Karnataka', 'Red and black soil', 'Coffee, ragi, sugarcane', 'Tropical, varies with elevation', 'Western Ghats districts grow coffee; interior plateau favors millets.'),
('Tamil Nadu', 'Red loamy and alluvial', 'Rice, millets, sugarcane', 'Tropical, gets northeast monsoon', 'Cauvery delta is a key rice belt; unusually dependent on the winter monsoon.'),
('Madhya Pradesh', 'Black soil (Malwa plateau)', 'Soybean, wheat, gram', 'Subtropical, moderate monsoon', 'Known as the "soybean state"; plateau basalt soil holds nutrients well.'),
('Assam', 'Alluvial, acidic', 'Tea, rice, jute', 'Subtropical, very high rainfall', 'Brahmaputra valley humidity and acidic soil are ideal for tea estates.'),
('Himachal Pradesh', 'Mountain / podzolic soil', 'Apples, temperate fruits, maize', 'Alpine to sub-temperate', 'Elevation-driven microclimates make it a major temperate-fruit belt.'),
('Bihar', 'Alluvial (Gangetic plain)', 'Rice, wheat, maize, lychee', 'Subtropical, humid summers', 'Flood-prone Gangetic plains give fertile but sometimes unpredictable farming conditions.'),
('Odisha', 'Alluvial and laterite', 'Rice, pulses, oilseeds', 'Tropical, cyclone-prone coast', 'Coastal deltas support rice; hinterland relies more on rain-fed pulses.'),
('Jharkhand', 'Red and lateritic soil', 'Rice, maize, pulses', 'Subtropical, moderate rainfall', 'Undulating plateau terrain limits large-scale irrigation; mostly rain-fed farming.'),
('Chhattisgarh', 'Red and yellow soil', 'Rice, maize, pulses', 'Tropical, monsoon-dependent', 'Known as a "rice bowl" of central India despite mostly rain-fed cultivation.'),
('Haryana', 'Alluvial soil', 'Wheat, rice, sugarcane', 'Semi-arid, hot summers, cold winters', 'Along with Punjab, a core Green Revolution state with strong canal irrigation.'),
('Uttarakhand', 'Mountain and alluvial (terai)', 'Rice, wheat, millets, fruits', 'Sub-temperate to alpine', 'Terrain splits farming between fertile terai plains and hill terrace cultivation.'),
('Andhra Pradesh', 'Alluvial, black and red soil', 'Rice, cotton, chillies, sugarcane', 'Tropical, coastal and interior variation', 'Godavari and Krishna deltas are highly productive rice belts.'),
('Jammu and Kashmir', 'Mountain and alluvial soil', 'Rice, maize, saffron, orchards', 'Temperate to alpine', 'Valley regions support orchards and saffron; agriculture is strongly season-limited.');

