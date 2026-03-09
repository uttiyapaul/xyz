/**
 * CarbonIQ Platform — types/ghg.types.ts
 * Domain types for GHG accounting, CBAM compliance, AI validation.
 * Aligned with: ISO 14064-1, GHG Protocol, CBAM Regulation (EU) 2023/956
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export type GhgScope = 1 | 2 | 3;

export type Scope3Category =
  | 1  | 2  | 3  | 4  | 5  | 6  | 7  | 8
  | 9  | 10 | 11 | 12 | 13 | 14 | 15;

export type ActivityCategory =
  | "stationary_combustion"
  | "mobile_combustion"
  | "fugitive_emissions"
  | "process_emissions"
  | "grid_electricity"
  | "steam_heat"
  | "purchased_cooling"
  | "purchased_goods"
  | "capital_goods"
  | "fuel_energy_upstream"
  | "transportation_upstream"
  | "waste_generated"
  | "business_travel"
  | "employee_commute"
  | "upstream_leased_assets"
  | "transportation_downstream"
  | "processing_of_sold_products"
  | "use_of_sold_products"
  | "end_of_life_treatment"
  | "downstream_leased_assets"
  | "franchises"
  | "investments";

export type GridZone = "NR" | "WR" | "SR" | "ER" | "NER" | "NATIONAL";

export type GwpBasis = "AR4" | "AR5" | "AR6";

export type VerificationStatement = "reasonable" | "limited" | "none";

export type RiskLevel = "critical" | "high" | "medium" | "low" | "negligible";

export type DataSource =
  | "meter_reading"
  | "invoice"
  | "logbook"
  | "estimate"
  | "engineering_calculation"
  | "mass_balance"
  | "eia_report"
  | "third_party_audit"
  | "ai_extracted";

export type OrganizationBoundary =
  | "equity_share"
  | "financial_control"
  | "operational_control";

export type ReportingStandard =
  | "GHG_PROTOCOL"
  | "ISO_14064_1"
  | "ISO_14064_2"
  | "ISO_14064_3"
  | "CDP"
  | "TCFD"
  | "BRSR"
  | "CBAM";

// ---------------------------------------------------------------------------
// Emission Factors
// ---------------------------------------------------------------------------
export interface EmissionFactor {
  id:                 string;
  factor_code:        string;
  factor_version:     string;
  factor_name:        string;
  activity_category:  ActivityCategory;
  activity_detail:    string | null;
  scope:              GhgScope;
  scope3_category:    Scope3Category | null;
  applicable_region:  string;
  grid_zone:          GridZone | null;
  kgco2e_per_unit:    number;
  kgco2_per_unit:     number | null;
  kgch4_per_unit:     number | null;
  kgn2o_per_unit:     number | null;
  activity_unit:      string;
  gwp_basis:          GwpBasis;
  uncertainty_pct:    number | null;
  source_code:        string | null;
  source_url:         string | null;
  valid_from:         string;      // ISO date string
  valid_to:           string | null;
  is_current:         boolean;
  is_superseded:      boolean;
  embedding_ready:    boolean;
  created_at:         string;
  updated_at:         string;
}

// ---------------------------------------------------------------------------
// GHG Monthly Readings
// ---------------------------------------------------------------------------
export interface GhgReading {
  id:                  string;
  org_id:              string;
  site_id:             string | null;
  asset_id:            string | null;
  reporting_period:    string;           // YYYY-MM-01
  scope:               GhgScope;
  scope3_category:     Scope3Category | null;
  activity_category:   ActivityCategory;
  activity_detail:     string | null;
  activity_quantity:   number;
  activity_unit:       string;
  ef_factor_code:      string;
  ef_factor_version:   string;
  kgco2_total:         number | null;
  kgch4_total:         number | null;
  kgn2o_total:         number | null;
  kgsf6_total:         number | null;
  kghfc_total:         number | null;
  kgpfc_total:         number | null;
  kgnf3_total:         number | null;
  kgco2e_total:        number;           // GENERATED column
  data_source:         DataSource;
  is_estimated:        boolean;
  estimation_method:   string | null;
  uncertainty_pct:     number | null;
  evidence_doc_id:     string | null;
  notes:               string | null;
  created_by:          string;
  verified_by:         string | null;
  created_at:          string;
  updated_at:          string;
}

export interface GhgReadingCreate extends Omit<GhgReading,
  "id" | "kgco2e_total" | "created_at" | "updated_at" | "created_by" | "verified_by"
> {}

// ---------------------------------------------------------------------------
// AI Validation
// ---------------------------------------------------------------------------
export interface AiValidation {
  id:                    string;
  reading_id:            string;
  model_id:              string;
  model_version:         string;
  trust_score:           number;          // 0–100
  anomaly_score:         number;          // 0–100
  risk_level:            RiskLevel;
  validation_flags:      ValidationFlag[];
  recommendations:       string[];
  human_review_required: boolean;
  reviewed_by:           string | null;
  reviewed_at:           string | null;
  review_notes:          string | null;
  created_at:            string;
}

export interface ValidationFlag {
  code:        string;
  severity:    RiskLevel;
  description: string;
  field:       string | null;
}

// ---------------------------------------------------------------------------
// Organization hierarchy
// ---------------------------------------------------------------------------
export interface Organization {
  id:                string;
  name:              string;
  legal_name:        string;
  cin:               string | null;       // MCA Company Identification Number
  gstin:             string | null;
  pan:               string | null;
  sector:            string;
  sub_sector:        string | null;
  boundary_approach: OrganizationBoundary;
  reporting_currency: string;
  base_year:         number;
  created_at:        string;
}

export interface Site {
  id:          string;
  org_id:      string;
  site_name:   string;
  site_code:   string;
  state:       string;
  district:    string | null;
  grid_zone:   GridZone;
  latitude:    number | null;
  longitude:   number | null;
  created_at:  string;
}

// ---------------------------------------------------------------------------
// Dashboard aggregates
// ---------------------------------------------------------------------------
export interface DashboardMetrics {
  total_tco2e:         number;
  scope1_tco2e:        number;
  scope2_tco2e:        number;
  scope3_tco2e:        number;
  active_anomalies:    number;
  pending_reviews:     number;
  trust_score_avg:     number;
  readings_this_month: number;
  yoy_change_pct:      number | null;
  last_updated:        string;
}

export interface MonthlyTrend {
  month:         string;   // YYYY-MM
  scope1_tco2e:  number;
  scope2_tco2e:  number;
  scope3_tco2e:  number;
  total_tco2e:   number;
}

// ---------------------------------------------------------------------------
// CBAM Product Emissions
// ---------------------------------------------------------------------------
export interface ProductEmission {
  id:                  string;
  org_id:              string;
  product_code:        string;             // CN code
  product_name:        string;
  cbam_sector:         string;
  production_qty:      number;
  production_unit:     string;
  direct_emissions:    number;             // tCO2e
  indirect_emissions:  number;             // tCO2e
  see_tco2e_per_tonne: number;            // Specific Embedded Emissions
  carbon_price_eur:    number | null;
  reporting_period:    string;
  created_at:          string;
}

// ---------------------------------------------------------------------------
// GWP Factors
// ---------------------------------------------------------------------------
export interface GwpFactor {
  gas_id:           string;
  gas_name:         string;
  chemical_formula: string | null;
  gwp_100yr:        number;
  gwp_20yr:         number | null;
  gwp_basis:        GwpBasis;
  is_kyoto_gas:     boolean;
  is_f_gas:         boolean;
  is_ods:           boolean;
}
