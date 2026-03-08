-- Create sectors table
CREATE TABLE sectors (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL
);

-- Create products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  sector_id TEXT NOT NULL REFERENCES sectors(id),
  label TEXT NOT NULL,
  cn TEXT NOT NULL,
  world_default DECIMAL(10,3) NOT NULL,
  bmg_b DECIMAL(10,3) NOT NULL,
  india_f DECIMAL(10,3) NOT NULL,
  route TEXT NOT NULL,
  unit TEXT NOT NULL
);

-- Insert sectors
INSERT INTO sectors (id, label, color, icon) VALUES
('steel', 'Iron & Steel', '#F59E0B', '⬡'),
('aluminium', 'Aluminium', '#06B6D4', '◈'),
('cement', 'Cement', '#94A3B8', '▪'),
('fertiliser', 'Fertilisers', '#22C55E', '◉'),
('hydrogen', 'Hydrogen', '#A78BFA', 'H₂');

-- Insert steel products
INSERT INTO products (id, sector_id, label, cn, world_default, bmg_b, india_f, route, unit) VALUES
('pig_iron', 'steel', 'Pig Iron', '7201', 2.07, 1.210, 1.22, 'BF/BOF', 't'),
('steel_semi_bf', 'steel', 'Steel Semis — BF/BOF', '7207', 2.21, 1.364, 1.20, 'BF/BOF', 't'),
('steel_semi_dri', 'steel', 'Steel Semis — DRI/EAF', '7207', 1.85, 0.475, 1.15, 'DRI/EAF', 't'),
('steel_semi_eaf', 'steel', 'Steel Semis — Scrap/EAF', '7207', 1.10, 0.066, 1.08, 'Scrap/EAF', 't'),
('hr_flat', 'steel', 'Hot-Rolled Flat Steel', '7208', 2.28, 1.370, 1.20, 'BF/BOF', 't'),
('cr_flat', 'steel', 'Cold-Rolled Flat Steel', '7209', 2.39, 1.458, 1.20, 'BF/BOF', 't'),
('coated_steel', 'steel', 'Coated / Galvanized Steel', '7210', 2.35, 1.491, 1.20, 'BF/BOF', 't'),
('ss_semis', 'steel', 'Stainless Steel Semis', '7218', 4.08, 1.189, 1.15, 'EAF', 't'),
('steel_struct', 'steel', 'Steel Structures (CN 7308)', '7308', 5.01, 1.491, 1.20, 'BF/BOF', 't'),
('ferro_mn', 'steel', 'Ferro-Manganese', '7202 1', 3.51, 1.361, 1.18, 'EAF', 't'),
('ferro_cr', 'steel', 'Ferro-Chromium', '7202 4', 5.45, 1.142, 1.18, 'EAF', 't');

-- Insert aluminium products
INSERT INTO products (id, sector_id, label, cn, world_default, bmg_b, india_f, route, unit) VALUES
('al_unwrought_p', 'aluminium', 'Unwrought Aluminium (Primary)', '7601', 10.49, 1.423, 1.28, 'Primary smelting', 't'),
('al_bars', 'aluminium', 'Aluminium Bars & Rods', '7604', 9.80, 1.485, 1.24, 'Primary', 't'),
('al_sheets', 'aluminium', 'Aluminium Plates, Sheets, Strip', '7606', 12.11, 1.485, 1.24, 'Primary', 't'),
('al_struct', 'aluminium', 'Aluminium Structures (CN 7610)', '7610', 12.04, 1.493, 1.24, 'Primary', 't'),
('al_wire', 'aluminium', 'Aluminium Wire', '7605', 9.80, 1.485, 1.22, 'Primary', 't'),
('al_foil', 'aluminium', 'Aluminium Foil', '7607', 12.11, 1.599, 1.24, 'Primary', 't');

-- Insert cement products
INSERT INTO products (id, sector_id, label, cn, world_default, bmg_b, india_f, route, unit) VALUES
('clinker', 'cement', 'Cement Clinker', '2523 10', 0.87, 0.666, 1.12, 'Rotary kiln', 't'),
('grey_portland', 'cement', 'Grey Portland Cement', '2523 29', 0.87, 0.666, 1.12, 'Rotary kiln', 't'),
('white_portland', 'cement', 'White Portland Cement', '2523 21', 1.26, 0.859, 1.10, 'Rotary kiln', 't'),
('aluminous_cem', 'cement', 'Aluminous Cement', '2523 30', 1.90, 0.717, 1.10, 'Rotary kiln', 't');

-- Insert fertiliser products
INSERT INTO products (id, sector_id, label, cn, world_default, bmg_b, india_f, route, unit) VALUES
('ammonia', 'fertiliser', 'Ammonia (Anhydrous)', '2814 10', 2.82, 1.522, 1.20, 'SMR', 't'),
('urea', 'fertiliser', 'Urea', '3102 10', 1.90, 0.902, 1.18, 'Ammonia-based', 't'),
('amm_nitrate', 'fertiliser', 'Ammonium Nitrate', '3102 30', 2.39, 0.767, 1.16, 'Ammonia-based', 't'),
('nitric_acid', 'fertiliser', 'Nitric Acid', '2808', 2.60, 0.582, 1.15, 'Ostwald', 't'),
('dap', 'fertiliser', 'Diammonium Phosphate (DAP)', '3105 30', 0.75, 0.339, 1.12, 'Ammonia-based', 't'),
('urea_an_sol', 'fertiliser', 'Urea-AN Solution (UAS)', '3102 80', 1.34, 0.625, 1.15, 'Ammonia-based', 't');

-- Insert hydrogen products
INSERT INTO products (id, sector_id, label, cn, world_default, bmg_b, india_f, route, unit) VALUES
('hydrogen', 'hydrogen', 'Hydrogen (Grey / SMR)', '2804 10', 10.4, 5.089, 1.30, 'SMR', 't');

-- Enable Row Level Security
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on sectors" ON sectors FOR SELECT USING (true);
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
