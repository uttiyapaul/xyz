------------------------------------------------------------
-- COMPLETE GHG ACCOUNTING SCHEMA
------------------------------------------------------------

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Sites/Facilities
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT,
  country TEXT,
  facility_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emission Sources
CREATE TABLE IF NOT EXISTS emission_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  source_name TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('Scope 1', 'Scope 2', 'Scope 3')),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Data
CREATE TABLE IF NOT EXISTS activity_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_id UUID REFERENCES emission_sources(id) ON DELETE SET NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  activity_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emission Factor Sources
CREATE TABLE IF NOT EXISTS emission_factor_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  version TEXT,
  publication_year INT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emission Factors
CREATE TABLE IF NOT EXISTS emission_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES emission_factor_sources(id) ON DELETE SET NULL,
  factor_name TEXT NOT NULL,
  gas_type TEXT NOT NULL CHECK (gas_type IN ('CO2', 'CH4', 'N2O', 'HFC', 'PFC', 'SF6', 'NF3')),
  unit TEXT NOT NULL,
  factor_value NUMERIC NOT NULL,
  valid_from DATE,
  valid_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emission Results
CREATE TABLE IF NOT EXISTS emission_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activity_data(id) ON DELETE CASCADE,
  emission_factor_id UUID REFERENCES emission_factors(id) ON DELETE SET NULL,
  scope TEXT NOT NULL,
  co2 NUMERIC DEFAULT 0,
  ch4 NUMERIC DEFAULT 0,
  n2o NUMERIC DEFAULT 0,
  co2e_total NUMERIC NOT NULL,
  gwp_version TEXT DEFAULT 'AR5',
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence Documents
CREATE TABLE IF NOT EXISTS evidence_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activity_data(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  sha256_hash TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reporting Periods
CREATE TABLE IF NOT EXISTS reporting_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  year INT NOT NULL,
  quarter INT CHECK (quarter BETWEEN 1 AND 4),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'verified', 'published')),
  total_emissions NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, year, quarter)
);

-- Audit Log
CREATE TABLE IF NOT EXISTS ghg_audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  row_id UUID,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

------------------------------------------------------------
-- INDEXES
------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_activity_org ON activity_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_source ON activity_data(source_id);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_data(activity_date);
CREATE INDEX IF NOT EXISTS idx_sources_org ON emission_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_sites_org ON sites(organization_id);
CREATE INDEX IF NOT EXISTS idx_results_org ON emission_results(organization_id);
CREATE INDEX IF NOT EXISTS idx_results_activity ON emission_results(activity_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org ON user_roles(organization_id);

------------------------------------------------------------
-- AUDIT TRIGGER FUNCTION
------------------------------------------------------------

CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO ghg_audit_log (table_name, row_id, action, old_data, new_data, changed_by)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

------------------------------------------------------------
-- APPLY AUDIT TRIGGERS
------------------------------------------------------------

DROP TRIGGER IF EXISTS audit_activity ON activity_data;
CREATE TRIGGER audit_activity
AFTER INSERT OR UPDATE OR DELETE ON activity_data
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS audit_sources ON emission_sources;
CREATE TRIGGER audit_sources
AFTER INSERT OR UPDATE OR DELETE ON emission_sources
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS audit_results ON emission_results;
CREATE TRIGGER audit_results
AFTER INSERT OR UPDATE OR DELETE ON emission_results
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

------------------------------------------------------------
-- ROW LEVEL SECURITY
------------------------------------------------------------

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE emission_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE emission_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_periods ENABLE ROW LEVEL SECURITY;

------------------------------------------------------------
-- RLS POLICIES
------------------------------------------------------------

-- Organizations: users can only see their own orgs
CREATE POLICY tenant_isolation_organizations ON organizations
FOR ALL USING (
  id IN (
    SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
  )
);

-- User Roles: users can see roles in their orgs
CREATE POLICY tenant_isolation_user_roles ON user_roles
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
  )
);

-- Sites
CREATE POLICY tenant_isolation_sites ON sites
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
  )
);

-- Emission Sources
CREATE POLICY tenant_isolation_sources ON emission_sources
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
  )
);

-- Activity Data
CREATE POLICY tenant_isolation_activity ON activity_data
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
  )
);

-- Emission Results
CREATE POLICY tenant_isolation_results ON emission_results
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
  )
);

-- Evidence Documents
CREATE POLICY tenant_isolation_evidence ON evidence_documents
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
  )
);

-- Reporting Periods
CREATE POLICY tenant_isolation_periods ON reporting_periods
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM user_roles WHERE user_id = auth.uid()
  )
);

------------------------------------------------------------
-- SEED DATA: Emission Factor Sources
------------------------------------------------------------

INSERT INTO emission_factor_sources (source_name, version, publication_year, url) VALUES
('IPCC AR5', '2014', 2014, 'https://www.ipcc.ch/report/ar5/'),
('EPA GHG Emission Factors', '2024', 2024, 'https://www.epa.gov/climateleadership'),
('DEFRA UK', '2024', 2024, 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting')
ON CONFLICT DO NOTHING;

------------------------------------------------------------
-- SEED DATA: Common Emission Factors
------------------------------------------------------------

INSERT INTO emission_factors (source_id, factor_name, gas_type, unit, factor_value) VALUES
((SELECT id FROM emission_factor_sources WHERE source_name = 'EPA GHG Emission Factors' LIMIT 1), 'Natural Gas Combustion', 'CO2', 'kg CO2/m3', 1.93),
((SELECT id FROM emission_factor_sources WHERE source_name = 'EPA GHG Emission Factors' LIMIT 1), 'Diesel Combustion', 'CO2', 'kg CO2/L', 2.68),
((SELECT id FROM emission_factor_sources WHERE source_name = 'EPA GHG Emission Factors' LIMIT 1), 'Electricity Grid (India)', 'CO2', 'kg CO2/kWh', 0.82),
((SELECT id FROM emission_factor_sources WHERE source_name = 'EPA GHG Emission Factors' LIMIT 1), 'Coal Combustion', 'CO2', 'kg CO2/kg', 2.42)
ON CONFLICT DO NOTHING;
