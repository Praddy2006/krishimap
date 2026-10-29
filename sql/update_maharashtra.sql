-- Richer data for the Maharashtra state row.
-- CHECK FIRST: open sql/schema.sql and confirm the table is called `states` and
-- the columns are soil_type, major_crops, climate, farming_notes.
-- If a column name is different, change it below before running.
-- Also confirm the row is named exactly 'Maharashtra'.

UPDATE states
SET
  soil_type = 'Black cotton soil (regur) over the Deccan plateau, formed from basalt; laterite and coastal soils in the Konkan; red and yellow soils in eastern Vidarbha; alluvial soils in river valleys',
  major_crops = 'Cotton, sugarcane, jowar, soybean, tur (pigeon pea), rice, wheat, gram, onion, grapes, pomegranate, banana, mango (Alphonso), oranges (Nagpur), turmeric',
  climate = 'Tropical monsoon. The Konkan coast and Western Ghats get very heavy rain, while the rain-shadow belt of central Maharashtra and parts of Marathwada is dry and drought-prone. Vidarbha has hot summers and moderate to heavy rain.',
  farming_notes = 'Five farming regions: Konkan (rice, mango, cashew), North Maharashtra (grapes, onion, banana, cotton), Western Maharashtra (sugarcane, pomegranate, vegetables), Marathwada (cotton, soybean, tur, drought-prone) and Vidarbha (cotton, soybean, oranges, rice in the east). Much of the cropped area is rain-fed. Irrigation depends on the Godavari, Krishna, Bhima and Tapi basins, with a strong cooperative sugar sector and growing drip irrigation. Click the state to explore all districts and their crops.'
WHERE name = 'Maharashtra';

-- Check the result:
-- SELECT name, soil_type, major_crops FROM states WHERE name = 'Maharashtra';