------------------------------------------------------------
-- SEED DATA FOR TESTING
-- Run this after 002_complete_ghg_schema.sql
------------------------------------------------------------

-- Sample Organizations
INSERT INTO organizations (id, name, industry, country) VALUES
('11111111-1111-1111-1111-111111111111', 'Tata Steel India', 'Steel Manufacturing', 'India'),
('22222222-2222-2222-2222-222222222222', 'Hindalco Aluminium', 'Aluminium Production', 'India'),
('33333333-3333-3333-3333-333333333333', 'UltraTech Cement', 'Cement Manufacturing', 'India')
ON CONFLICT (id) DO NOTHING;

-- Sample Sites
INSERT INTO sites (organization_id, name, city, country, facility_type) VALUES
('11111111-1111-1111-1111-111111111111', 'Jamshedpur Plant', 'Jamshedpur', 'India', 'Integrated Steel Mill'),
('11111111-1111-1111-1111-111111111111', 'Kalinganagar Plant', 'Kalinganagar', 'India', 'Integrated Steel Mill'),
('22222222-2222-2222-2222-222222222222', 'Hirakud Smelter', 'Hirakud', 'India', 'Aluminium Smelter'),
('33333333-3333-3333-3333-333333333333', 'Rajasthan Cement Works', 'Rajasthan', 'India', 'Cement Plant')
ON CONFLICT DO NOTHING;

-- Sample Emission Sources (Scope 1)
INSERT INTO emission_sources (organization_id, site_id, source_name, scope, category) VALUES
('11111111-1111-1111-1111-111111111111', (SELECT id FROM sites WHERE name = 'Jamshedpur Plant' LIMIT 1), 'Blast Furnace #1', 'Scope 1', 'Process Emissions'),
('11111111-1111-1111-1111-111111111111', (SELECT id FROM sites WHERE name = 'Jamshedpur Plant' LIMIT 1), 'Natural Gas Boiler', 'Scope 1', 'Stationary Combustion'),
('11111111-1111-1111-1111-111111111111', (SELECT id FROM sites WHERE name = 'Jamshedpur Plant' LIMIT 1), 'Diesel Generators', 'Scope 1', 'Stationary Combustion'),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM sites WHERE name = 'Hirakud Smelter' LIMIT 1), 'Electrolysis Cells', 'Scope 1', 'Process Emissions'),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM sites WHERE name = 'Rajasthan Cement Works' LIMIT 1), 'Rotary Kiln', 'Scope 1', 'Process Emissions')
ON CONFLICT DO NOTHING;

-- Sample Emission Sources (Scope 2)
INSERT INTO emission_sources (organization_id, site_id, source_name, scope, category) VALUES
('11111111-1111-1111-1111-111111111111', (SELECT id FROM sites WHERE name = 'Jamshedpur Plant' LIMIT 1), 'Grid Electricity', 'Scope 2', 'Purchased Electricity'),
('22222222-2222-2222-2222-222222222222', (SELECT id FROM sites WHERE name = 'Hirakud Smelter' LIMIT 1), 'Grid Electricity', 'Scope 2', 'Purchased Electricity'),
('33333333-3333-3333-3333-333333333333', (SELECT id FROM sites WHERE name = 'Rajasthan Cement Works' LIMIT 1), 'Grid Electricity', 'Scope 2', 'Purchased Electricity')
ON CONFLICT DO NOTHING;

-- Sample Activity Data (January 2024)
INSERT INTO activity_data (organization_id, source_id, quantity, unit, activity_date, description) VALUES
-- Tata Steel
('11111111-1111-1111-1111-111111111111', 
 (SELECT id FROM emission_sources WHERE source_name = 'Natural Gas Boiler' AND organization_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
 125000, 'm3', '2024-01-31', 'January natural gas consumption'),
 
('11111111-1111-1111-1111-111111111111',
 (SELECT id FROM emission_sources WHERE source_name = 'Grid Electricity' AND organization_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
 2500000, 'kWh', '2024-01-31', 'January electricity consumption'),

('11111111-1111-1111-1111-111111111111',
 (SELECT id FROM emission_sources WHERE source_name = 'Diesel Generators' AND organization_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
 15000, 'L', '2024-01-31', 'January diesel consumption'),

-- Hindalco
('22222222-2222-2222-2222-222222222222',
 (SELECT id FROM emission_sources WHERE source_name = 'Grid Electricity' AND organization_id = '22222222-2222-2222-2222-222222222222' LIMIT 1),
 8500000, 'kWh', '2024-01-31', 'January electricity - smelter operations'),

-- UltraTech
('33333333-3333-3333-3333-333333333333',
 (SELECT id FROM emission_sources WHERE source_name = 'Grid Electricity' AND organization_id = '33333333-3333-3333-3333-333333333333' LIMIT 1),
 450000, 'kWh', '2024-01-31', 'January electricity consumption')
ON CONFLICT DO NOTHING;

-- Sample Emission Results (calculated)
INSERT INTO emission_results (organization_id, activity_id, emission_factor_id, scope, co2, ch4, n2o, co2e_total, gwp_version) VALUES
-- Natural Gas: 125,000 m3 × 1.93 kg CO2/m3 = 241,250 kg = 241.25 tCO2e
('11111111-1111-1111-1111-111111111111',
 (SELECT id FROM activity_data WHERE description = 'January natural gas consumption' LIMIT 1),
 (SELECT id FROM emission_factors WHERE factor_name = 'Natural Gas Combustion' LIMIT 1),
 'Scope 1', 241.25, 0, 0, 241.25, 'AR5'),

-- Diesel: 15,000 L × 2.68 kg CO2/L = 40,200 kg = 40.2 tCO2e
('11111111-1111-1111-1111-111111111111',
 (SELECT id FROM activity_data WHERE description = 'January diesel consumption' LIMIT 1),
 (SELECT id FROM emission_factors WHERE factor_name = 'Diesel Combustion' LIMIT 1),
 'Scope 1', 40.2, 0, 0, 40.2, 'AR5'),

-- Electricity Tata: 2,500,000 kWh × 0.82 kg CO2/kWh = 2,050,000 kg = 2,050 tCO2e
('11111111-1111-1111-1111-111111111111',
 (SELECT id FROM activity_data WHERE description = 'January electricity consumption' LIMIT 1),
 (SELECT id FROM emission_factors WHERE factor_name = 'Electricity Grid (India)' LIMIT 1),
 'Scope 2', 2050, 0, 0, 2050, 'AR5'),

-- Electricity Hindalco: 8,500,000 kWh × 0.82 kg CO2/kWh = 6,970,000 kg = 6,970 tCO2e
('22222222-2222-2222-2222-222222222222',
 (SELECT id FROM activity_data WHERE description = 'January electricity - smelter operations' LIMIT 1),
 (SELECT id FROM emission_factors WHERE factor_name = 'Electricity Grid (India)' LIMIT 1),
 'Scope 2', 6970, 0, 0, 6970, 'AR5'),

-- Electricity UltraTech: 450,000 kWh × 0.82 kg CO2/kWh = 369,000 kg = 369 tCO2e
('33333333-3333-3333-3333-333333333333',
 (SELECT id FROM activity_data WHERE description = 'January electricity consumption' LIMIT 1),
 (SELECT id FROM emission_factors WHERE factor_name = 'Electricity Grid (India)' LIMIT 1),
 'Scope 2', 369, 0, 0, 369, 'AR5')
ON CONFLICT DO NOTHING;

-- Sample Reporting Periods
INSERT INTO reporting_periods (organization_id, year, quarter, status, total_emissions) VALUES
('11111111-1111-1111-1111-111111111111', 2024, 1, 'draft', 2331.45),
('22222222-2222-2222-2222-222222222222', 2024, 1, 'draft', 6970),
('33333333-3333-3333-3333-333333333333', 2024, 1, 'draft', 369)
ON CONFLICT DO NOTHING;

------------------------------------------------------------
-- VERIFICATION QUERIES
------------------------------------------------------------

-- Check organizations
SELECT name, industry, country FROM organizations;

-- Check sites per organization
SELECT o.name as org_name, s.name as site_name, s.city 
FROM sites s 
JOIN organizations o ON s.organization_id = o.id
ORDER BY o.name, s.name;

-- Check emission sources by scope
SELECT o.name as org_name, es.source_name, es.scope, es.category
FROM emission_sources es
JOIN organizations o ON es.organization_id = o.id
ORDER BY o.name, es.scope, es.source_name;

-- Check total emissions by organization and scope
SELECT 
  o.name as organization,
  er.scope,
  SUM(er.co2e_total) as total_tco2e
FROM emission_results er
JOIN organizations o ON er.organization_id = o.id
GROUP BY o.name, er.scope
ORDER BY o.name, er.scope;

-- Check overall totals
SELECT 
  o.name as organization,
  SUM(er.co2e_total) as total_emissions_tco2e
FROM emission_results er
JOIN organizations o ON er.organization_id = o.id
GROUP BY o.name
ORDER BY total_emissions_tco2e DESC;
