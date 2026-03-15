import Link from "next/link";

import HeroSection from "@/components/landing/hero/HeroSection";

type ScopePanelId = "1" | "2" | "3";

interface PainPoint {
  marker: string;
  title: string;
  description: string;
  revealClass?: string;
}

interface ScopeKpi {
  label: string;
  value: string;
  toneClass?: string;
  delta: string;
  deltaClass: string;
}

interface ScopeTableRow {
  facility: string;
  type: string;
  emissions: string;
  variance: string;
  varianceClass: string;
  cbamFlag?: { label: string; className: string } | null;
  status?: { label: string; className: string } | null;
}

interface ScopePanel {
  id: ScopePanelId;
  tabLabel: string;
  headline: string;
  subline: string;
  kpis: ScopeKpi[];
  tableHeaders?: string[];
  tableRows?: ScopeTableRow[];
  tableTotal?: ScopeTableRow;
  scope3Bars?: Array<{ label: string; widthClass: string; value: string }>;
}

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  tag: string;
  revealClass?: string;
}

interface LoopStep {
  icon: string;
  nodeClass: string;
  title: string;
  description: string;
}

interface BadgeChip {
  label: string;
  dotClass: string;
}

interface ProductCard {
  icon: string;
  name: string;
  chemistry: string;
  description: string;
  specs: string[];
}

interface MetricChip {
  value: string;
  label: string;
}

interface ComplianceCard {
  badgeClass: string;
  badgeLabel: string;
  title: string;
  description: string;
  revealClass?: string;
}

interface PricingTier {
  tier: string;
  name: string;
  pricePrefix?: string;
  price: string;
  period?: string;
  description: string;
  features: Array<{ label: string; unavailable?: boolean }>;
  ctaLabel: string;
  ctaClassName: string;
  featured?: boolean;
  featuredLabel?: string;
  revealClass?: string;
}

interface FooterColumn {
  title: string;
  links: Array<{ label: string; href: string; hash?: boolean }>;
}

const PROBLEM_PAIN_POINTS: PainPoint[] = [
  {
    marker: "01",
    title: "No tamper-evident audit trail",
    description:
      "Regulators cannot trust data that can be silently edited in a spreadsheet. Teams need a clear chain of who changed what, when, and why.",
    revealClass: "rd1",
  },
  {
    marker: "02",
    title: "Months of manual consolidation",
    description:
      "Collecting Scope 3 data across suppliers still takes entire reporting cycles for many enterprises, which means the data is stale before sign-off.",
    revealClass: "rd2",
  },
  {
    marker: "03",
    title: "CBAM penalties are accelerating",
    description:
      "Embedded-carbon exposure now needs verified calculation and financial visibility long before filing deadlines arrive.",
    revealClass: "rd3",
  },
  {
    marker: "04",
    title: "No path from tracking to reduction",
    description:
      "Counting carbon without capture planning leaves the commercial and operational reduction story unfinished.",
    revealClass: "rd4",
  },
];

const BEFORE_A2Z_LIST = [
  "Excel sheets with no version control",
  "Manual emission-factor lookups",
  "3-6 month annual reporting cycles",
  "Zero supply-chain visibility",
  "No path from tracking to reduction",
  "CBAM liability unknown until it is too late",
  "Verifier rejections and resubmissions",
];

const AFTER_A2Z_LIST = [
  "Real-time Scope 1/2/3 dashboard",
  "AI-matched IPCC and CBAM factor support",
  "Continuous reporting that stays audit-ready",
  "Supply-chain constellation with verified nodes",
  "Amine chemicals and CCS project delivery",
  "Live CBAM liability calculator with alerts",
  "Tamper-evident audit chain",
];

const PLATFORM_SCOPE_PANELS: ScopePanel[] = [
  {
    id: "1",
    tabLabel: "Scope 1 - Direct",
    headline: "Direct emissions posture",
    subline: "Steel, cement, aluminium, and logistics operations across India.",
    kpis: [
      { label: "Total Scope 1", value: "113,600 tCO2e", delta: "Down 8.3% vs FY24", deltaClass: "tdn" },
      { label: "CBAM Exposure", value: "EUR 2.14M", delta: "2026 estimate", deltaClass: "tfl" },
      { label: "Verification", value: "3/4 sites clear", toneClass: "mkpi-v-success", delta: "1 pending", deltaClass: "tfl" },
      { label: "Data Quality", value: "94.2%", delta: "Up 6.1%", deltaClass: "tdn" },
    ],
    tableHeaders: ["Facility", "Type", "Emissions (tCO2e)", "vs FY24", "CBAM Flag", "Status"],
    tableRows: [
      {
        facility: "Steelworks Jamshedpur",
        type: "Integrated steelwork",
        emissions: "45,200",
        variance: "Down 14.2%",
        varianceClass: "tdn",
        cbamFlag: { label: "CBAM", className: "pill p-crit" },
        status: { label: "Verified", className: "pill p-ok" },
      },
      {
        facility: "Rajasthan Cement",
        type: "Clinker production",
        emissions: "28,400",
        variance: "Down 3.1%",
        varianceClass: "tdn",
        cbamFlag: { label: "CBAM", className: "pill p-crit" },
        status: { label: "Verified", className: "pill p-ok" },
      },
      {
        facility: "Odisha Aluminium",
        type: "Primary smelting",
        emissions: "31,800",
        variance: "Up 2.4%",
        varianceClass: "tup",
        cbamFlag: { label: "CBAM", className: "pill p-crit" },
        status: { label: "Pending", className: "pill p-warn" },
      },
      {
        facility: "Pan-India Logistics Fleet",
        type: "Road transport",
        emissions: "8,200",
        variance: "Down 5.6%",
        varianceClass: "tdn",
        cbamFlag: null,
        status: { label: "Verified", className: "pill p-ok" },
      },
    ],
    tableTotal: {
      facility: "Total Scope 1",
      type: "",
      emissions: "113,600",
      variance: "Down 8.3%",
      varianceClass: "tdn",
      cbamFlag: null,
      status: null,
    },
  },
  {
    id: "2",
    tabLabel: "Scope 2 - Energy",
    headline: "Purchased electricity posture",
    subline: "Location-based and market-based energy reporting with REC coverage.",
    kpis: [
      { label: "Total Scope 2 (LB)", value: "22,400 tCO2e", delta: "Down 12.1% vs FY24", deltaClass: "tdn" },
      { label: "Renewable Share", value: "34.8%", delta: "Up 11.2%", deltaClass: "tdn" },
      { label: "Grid Factor", value: "0.716 tCO2/MWh", delta: "CEA India FY25", deltaClass: "tfl" },
      { label: "Market-Based", value: "18,900 tCO2e", delta: "With RECs", deltaClass: "tfl" },
    ],
    tableHeaders: ["Site", "Electricity (MWh)", "Location-Based", "Market-Based", "RECs Purchased", "Status"],
    tableRows: [
      {
        facility: "Jamshedpur Steel",
        type: "14,200",
        emissions: "10,167",
        variance: "7,420",
        varianceClass: "mono",
        cbamFlag: { label: "2,800 MWh", className: "mono" },
        status: { label: "Verified", className: "pill p-ok" },
      },
      {
        facility: "Rajasthan Cement",
        type: "8,900",
        emissions: "6,372",
        variance: "5,100",
        varianceClass: "mono",
        cbamFlag: { label: "1,500 MWh", className: "mono" },
        status: { label: "Verified", className: "pill p-ok" },
      },
      {
        facility: "Odisha Aluminium",
        type: "7,400",
        emissions: "5,298",
        variance: "4,900",
        varianceClass: "mono",
        cbamFlag: { label: "500 MWh", className: "mono" },
        status: { label: "In review", className: "pill p-warn" },
      },
      {
        facility: "Corporate Offices",
        type: "780",
        emissions: "558",
        variance: "480",
        varianceClass: "mono",
        cbamFlag: { label: "200 MWh", className: "mono" },
        status: { label: "Verified", className: "pill p-ok" },
      },
    ],
    tableTotal: {
      facility: "Total",
      type: "31,280",
      emissions: "22,395",
      variance: "17,900",
      varianceClass: "mono",
      cbamFlag: null,
      status: null,
    },
  },
  {
    id: "3",
    tabLabel: "Scope 3 - Value Chain",
    headline: "Supply-chain coverage posture",
    subline: "Category mapping, supplier coverage, and confidence scoring.",
    kpis: [
      { label: "Total Scope 3", value: "187,000 tCO2e", delta: "Estimated", deltaClass: "tfl" },
      { label: "Categories Tracked", value: "9 / 15", delta: "GHG Protocol", deltaClass: "tfl" },
      { label: "Supplier Coverage", value: "62%", delta: "Up 18% YTD", deltaClass: "tup" },
      { label: "Data Confidence", value: "74.3%", delta: "Improving", deltaClass: "tdn" },
    ],
    scope3Bars: [
      { label: "Purchased goods and services", widthClass: "s3-w-88", value: "82,400 tCO2e" },
      { label: "Processing of sold products", widthClass: "s3-w-42", value: "39,200 tCO2e" },
      { label: "Upstream transportation", widthClass: "s3-w-26", value: "24,100 tCO2e" },
      { label: "Business travel", widthClass: "s3-w-14", value: "13,200 tCO2e" },
      { label: "Employee commuting", widthClass: "s3-w-10", value: "9,400 tCO2e" },
      { label: "Waste generated", widthClass: "s3-w-7", value: "6,800 tCO2e" },
      { label: "Other categories", widthClass: "s3-w-13", value: "11,900 tCO2e" },
    ],
  },
];

const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: "AL",
    title: "Audit chain",
    description:
      "Every data entry, edit, and submission is recorded in a tamper-evident chain so verifiers can see who changed what and when.",
    tag: "ISO 14064-3 | CBAM Art. 8",
  },
  {
    icon: "AI",
    title: "AI anomaly detection",
    description:
      "Model-assisted anomaly checks flag emission spikes, factor mismatches, and suspicious outliers before reviewers or verifiers see them.",
    tag: "IPCC AR6 | GHG Protocol",
    revealClass: "rd1",
  },
  {
    icon: "SC",
    title: "Supply-chain constellation",
    description:
      "Supplier nodes can be tracked with verification posture, confidence, and CBAM exposure in one operational graph.",
    tag: "Scope 3 | CBAM | SBTi",
    revealClass: "rd2",
  },
  {
    icon: "CB",
    title: "CBAM liability calculator",
    description:
      "Exposure can be translated into financial liability signals so export-facing teams see the commercial impact early.",
    tag: "CBAM Regulation 2023/956",
    revealClass: "rd3",
  },
  {
    icon: "MF",
    title: "Multi-framework reporting",
    description:
      "The same operational dataset can drive BRSR, GRI, CDP, ISO 14064, and CBAM deliverables without duplicated data entry.",
    tag: "BRSR | GRI | CDP | ISO",
  },
  {
    icon: "ERP",
    title: "ERP and IoT integration",
    description:
      "Platform integrations align enterprise systems, telemetry, and evidence collection so teams do not have to stay spreadsheet-bound.",
    tag: "SAP | Oracle | REST API",
    revealClass: "rd1",
  },
];

const LOOP_STEPS: LoopStep[] = [
  { icon: "EM", nodeClass: "ln-1", title: "Emit", description: "Industrial processes, energy, and logistics." },
  { icon: "MS", nodeClass: "ln-2", title: "Measure", description: "Real-time Scope 1, 2, and 3 measurement." },
  { icon: "CP", nodeClass: "ln-3", title: "Capture", description: "Amine products and CCS project delivery." },
  { icon: "VF", nodeClass: "ln-4", title: "Verify", description: "Approval lanes, evidence, and sign-off." },
  { icon: "RP", nodeClass: "ln-5", title: "Report", description: "CBAM, BRSR, GRI, CDP, and ISO reporting." },
];

const LOOP_BADGES: BadgeChip[] = [
  { label: "GHG Platform - SaaS", dotClass: "lbadge-dot-platform" },
  { label: "Amine Manufacturing", dotClass: "lbadge-dot-amine" },
  { label: "CCS Project Services", dotClass: "lbadge-dot-ccs" },
];

const AMINE_PRODUCTS: ProductCard[] = [
  {
    icon: "MEA",
    name: "Monoethanolamine (MEA)",
    chemistry: "CAS 141-43-5 | standard post-combustion solvent",
    description:
      "The baseline industrial solvent for post-combustion CO2 capture, suited to conventional absorber-regenerator designs.",
    specs: ["30% w/w solution", "Purity >=99.5%", "Bulk and IBC"],
  },
  {
    icon: "DEA",
    name: "DEA / MDEA specialty grades",
    chemistry: "Selective H2S and gas-processing applications",
    description:
      "Lower-regeneration-energy grades for refinery, gas, and selective-treatment use cases where pressure and gas composition differ.",
    specs: ["High-pressure grade", "H2S selective", "ISO-tank supply"],
  },
  {
    icon: "BLD",
    name: "Custom amine blends",
    chemistry: "Proprietary formulations under NDA",
    description:
      "Bespoke blends engineered for flue-gas composition, corrosion constraints, and target capture performance.",
    specs: ["Custom blend", "Performance SLA", "NDA available"],
  },
  {
    icon: "DAC",
    name: "Post-combustion capture reagents",
    chemistry: "Next-generation solvent systems",
    description:
      "Advanced solvent families for biomass, power, and heavy-industry capture pathways with improved regeneration efficiency.",
    specs: ["Energy saving focus", "Biomass compatible", "BECCS ready"],
  },
];

const CCS_SERVICE_CARDS: Array<{
  icon: string;
  title: string;
  description: string;
  metrics: MetricChip[];
  revealClass?: string;
}> = [
  {
    icon: "EPC",
    title: "Turnkey CCS plant delivery",
    description:
      "FEED through commissioning for absorber-regenerator systems, heat integration, compression, and transport tie-ins.",
    metrics: [
      { value: "500t-50kt", label: "CO2 / year capacity" },
      { value: "18-36m", label: "Typical project timeline" },
    ],
  },
  {
    icon: "FG",
    title: "Post-combustion flue-gas capture",
    description:
      "Retrofit and greenfield amine-based capture for steel, cement, power, and industrial boiler environments.",
    metrics: [
      { value: "<=95%", label: "Capture efficiency" },
      { value: "Retrofit", label: "or greenfield" },
    ],
    revealClass: "rd1",
  },
  {
    icon: "DAC",
    title: "Direct air capture projects",
    description:
      "Site assessment, permitting, build-out, monitoring, and carbon-removal project support aligned to credit pathways.",
    metrics: [
      { value: "Article 6", label: "Paris Agreement track" },
      { value: "VCM", label: "Carbon-credit linkage" },
    ],
    revealClass: "rd2",
  },
  {
    icon: "FIN",
    title: "Feasibility and monetisation",
    description:
      "Pre-FEED feasibility, techno-economics, and carbon-credit revenue modeling for capture investment cases.",
    metrics: [
      { value: "$15-$120", label: "per tCO2e credit range" },
      { value: "3 registries", label: "Gold Std | VCS | CBAM" },
    ],
    revealClass: "rd3",
  },
];

const CCS_PROCESS_STEPS = [
  { step: "01", title: "Site assessment", description: "Flue-gas analysis, site survey, and permitting review." },
  { step: "02", title: "Feasibility and FEED", description: "CAPEX/OPEX modeling and design-basis definition." },
  { step: "03", title: "EPC delivery", description: "Engineering, procurement, construction, and testing." },
  { step: "04", title: "Commission and operate", description: "Amine supply, tuning, and O&M support." },
  { step: "05", title: "Verify and monetise", description: "MRV, registry support, and credit readiness." },
];

const COMPLIANCE_CARDS: ComplianceCard[] = [
  {
    badgeClass: "cfb-1",
    badgeLabel: "CBAM",
    title: "EU Carbon Border Adjustment",
    description:
      "Embedded-emission calculation, certificate readiness, and filing posture for covered import categories.",
  },
  {
    badgeClass: "cfb-2",
    badgeLabel: "ISO 14064",
    title: "GHG quantification standard",
    description:
      "Inventory, project, and verification support with approval and evidence lanes aligned to assurance workflows.",
    revealClass: "rd1",
  },
  {
    badgeClass: "cfb-3",
    badgeLabel: "BRSR",
    title: "Indian sustainability reporting",
    description:
      "SEBI-oriented environment reporting posture aligned to the operational dataset rather than manual re-entry.",
    revealClass: "rd2",
  },
  {
    badgeClass: "cfb-4",
    badgeLabel: "GHG Protocol",
    title: "Corporate accounting standard",
    description:
      "Scope 1, 2, and 3 structures with factor support and category coverage across major operational pathways.",
    revealClass: "rd3",
  },
  {
    badgeClass: "cfb-5",
    badgeLabel: "GRI",
    title: "Global Reporting Initiative",
    description:
      "Emissions, energy, and waste disclosure support for ESG reporting and investor-facing summaries.",
  },
  {
    badgeClass: "cfb-6",
    badgeLabel: "SBTi / CDP",
    title: "Targets and disclosure",
    description:
      "Target-setting, disclosure support, and reduction trajectory planning connected to measured operational data.",
    revealClass: "rd1",
  },
];

const PRICING_TIERS: PricingTier[] = [
  {
    tier: "Starter",
    name: "Essentials",
    pricePrefix: "INR",
    price: "49,000",
    period: "/month",
    description: "For smaller teams starting BRSR and foundational GHG reporting.",
    features: [
      { label: "Up to 5 facilities" },
      { label: "Scope 1 and 2 tracking" },
      { label: "BRSR auto-reporting" },
      { label: "Basic CBAM calculator" },
      { label: "Email support (48hr SLA)" },
      { label: "Scope 3 supply chain", unavailable: true },
      { label: "API and ERP connectors", unavailable: true },
      { label: "Verifier portal", unavailable: true },
    ],
    ctaLabel: "Get Started",
    ctaClassName: "btn btn-ghost btn-block",
  },
  {
    tier: "Professional",
    name: "Enterprise",
    pricePrefix: "INR",
    price: "1,80,000",
    period: "/month",
    description: "For multi-site groups with CBAM exposure and assurance workflows.",
    features: [
      { label: "Up to 25 facilities" },
      { label: "Full Scope 1, 2 and 3" },
      { label: "BRSR + GRI + ISO 14064 outputs" },
      { label: "Live CBAM liability dashboard" },
      { label: "Supply-chain constellation" },
      { label: "ERP connectors" },
      { label: "Verifier portal (3 seats)" },
      { label: "Dedicated CSM (8hr SLA)" },
    ],
    ctaLabel: "Book a Demo ->",
    ctaClassName: "btn btn-primary btn-block",
    featured: true,
    featuredLabel: "Most Popular",
    revealClass: "rd1",
  },
  {
    tier: "Custom",
    name: "Full Carbon Stack",
    price: "Custom",
    description: "Platform, amine supply, and CCS project delivery as one integrated partnership.",
    features: [
      { label: "Unlimited facilities" },
      { label: "Full Scope 1/2/3 + CBAM" },
      { label: "All compliance frameworks" },
      { label: "Amine supply contract" },
      { label: "CCS feasibility and delivery" },
      { label: "Carbon-credit monetisation support" },
      { label: "Dedicated project team" },
      { label: "24/7 enterprise SLA" },
    ],
    ctaLabel: "Talk to Sales ->",
    ctaClassName: "btn btn-ccs btn-block",
    revealClass: "rd2",
  },
];

const DEMO_BULLETS = [
  "30-minute focused demo with a platform engineer",
  "Live CBAM liability estimate using your export profile",
  "Scope 3 supplier-gap analysis overview",
  "Amine and CCS consultation when relevant",
  "Custom proposal within 48 business hours",
];

const DEMO_INTEREST_OPTIONS = [
  { value: "ghg-platform", label: "GHG platform (Scope 1/2/3 + CBAM)" },
  { value: "amine-products", label: "Amine products (MEA, DEA, custom blends)" },
  { value: "ccs-project", label: "CCS project services (feasibility / EPC)" },
  { value: "full-stack", label: "Full carbon stack (platform + amine + CCS)" },
  { value: "cbam-only", label: "CBAM compliance only" },
  { value: "brsr-only", label: "BRSR reporting only" },
];

const DEMO_SECTOR_OPTIONS = [
  { value: "steel", label: "Steel / Iron" },
  { value: "cement", label: "Cement" },
  { value: "aluminium", label: "Aluminium" },
  { value: "chemicals", label: "Chemicals / Fertilisers" },
  { value: "power", label: "Power generation" },
  { value: "refinery", label: "Refinery / Petrochemicals" },
  { value: "conglomerate", label: "Diversified conglomerate" },
  { value: "other", label: "Other" },
];

const FAQ_ITEMS = [
  {
    question: "What is CBAM and when does it apply?",
    answer:
      "CBAM is the EU carbon border regime for covered imports such as steel, cement, aluminium, fertilisers, hydrogen, and electricity. Exporters and supply-chain partners need embedded-emission visibility before the full financial regime matures.",
  },
  {
    question: "Do we need ISO 14064 certification first?",
    answer:
      "No. The platform is designed to help teams move toward ISO 14064-aligned workflows with evidence, verification, and auditability before certification is complete.",
  },
  {
    question: "How does the amine business connect to the platform?",
    answer:
      "The operational story stays connected: capture programs, supporting chemistry, and the measured inventory can be reviewed in one carbon-lifecycle narrative rather than split across disconnected vendors.",
  },
  {
    question: "How long does onboarding take for a multi-site group?",
    answer:
      "Typical onboarding for a 4-6 site enterprise with usable source data takes around 4-8 weeks, depending on integration complexity and approval readiness.",
  },
  {
    question: "What differentiates the CCS delivery service?",
    answer:
      "The delivery story combines capture-project planning, supporting solvent supply, and operational reporting posture rather than treating those as separate handoffs.",
  },
  {
    question: "Is the platform secure and privacy-aware?",
    answer:
      "The frontend is being built around cookie-compatible auth, masked secrets, reduced route enumeration, audit-aware UX, and privacy-request handling. Full control closure still depends on the wider backend and infrastructure program.",
  },
  {
    question: "Do you supply MEA in India and what are the lead times?",
    answer:
      "The public commercial story supports MEA, DEA, MDEA, and custom blends, with lead times depending on standard stock versus custom formulation.",
  },
  {
    question: "Can the platform handle Indian numbering and localisation?",
    answer:
      "Yes. The product direction supports Indian financial formatting alongside SI-unit storage for emissions and energy data.",
  },
];

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Platform",
    links: [
      { label: "GHG Dashboard", href: "#platform", hash: true },
      { label: "CBAM Calculator", href: "/calculator" },
      { label: "Compliance Coverage", href: "#compliance", hash: true },
      { label: "Pricing", href: "#pricing", hash: true },
      { label: "Sign In", href: "/auth/login" },
    ],
  },
  {
    title: "Products & Services",
    links: [
      { label: "MEA / DEA / MDEA", href: "#amine", hash: true },
      { label: "Custom amine blends", href: "#amine", hash: true },
      { label: "CCS project design", href: "#ccs", hash: true },
      { label: "Direct air capture", href: "#ccs", hash: true },
      { label: "Carbon-credit monetisation", href: "#ccs", hash: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Book a demo", href: "#demo", hash: true },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy request", href: "/privacy/request" },
    ],
  },
];

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

/**
 * Public landing content for the marketing and demo surface.
 *
 * This replaces the old `dangerouslySetInnerHTML` landing payload with typed
 * React markup so the public experience can be reviewed, tested, and secured
 * like the rest of the application. The CSS classes and DOM ids stay stable so
 * the existing scroll, scope-tab, FAQ, and form behaviors in `LandingScripts`
 * keep working without inline script attributes.
 */
export default function LandingContent() {
  return (
    <>
      <div className="bg-canvas" aria-hidden="true">
        <div className="bg-grid" />
      </div>

      <CookieBanner />
      <DesktopNavigation />
      <MobileBottomNavigation />
      <HeroSection />
      <ProblemSection />
      <PlatformDemoSection />
      <FeaturesSection />
      <CarbonLoopSection />
      <AmineSection />
      <CcsSection />
      <ComplianceSection />
      <ResultsSection />
      <PricingSection />
      <DemoSection />
      <FaqSection />
      <FinalCtaSection />
      <FooterSection />
    </>
  );
}

function CookieBanner() {
  return (
    <div id="cookie-banner" role="dialog" aria-label="Cookie preferences" aria-modal="true">
      <div className="ck-title">Your privacy, your choice</div>
      <p className="ck-desc">
        We use cookies to keep the platform working, understand how visitors use the site, and optionally
        improve relevant content. Read our <Link href="/privacy">Privacy Policy</Link> and{" "}
        <Link href="/cookies">Cookie Policy</Link>.
      </p>
      <div className="ck-toggles">
        <div className="ck-toggle">
          <div className="ck-toggle-info">
            <span className="ck-toggle-name">Necessary</span>
            <span className="ck-toggle-sub">Always active - core product behavior depends on these.</span>
          </div>
          <label className="sw">
            <input type="checkbox" defaultChecked disabled />
            <span className="sw-track" />
          </label>
        </div>
        <div className="ck-toggle">
          <div className="ck-toggle-info">
            <span className="ck-toggle-name">Analytics</span>
            <span className="ck-toggle-sub">Helps us improve the public experience.</span>
          </div>
          <label className="sw">
            <input type="checkbox" id="ck-analytics" defaultChecked />
            <span className="sw-track" />
          </label>
        </div>
        <div className="ck-toggle">
          <div className="ck-toggle-info">
            <span className="ck-toggle-name">Marketing</span>
            <span className="ck-toggle-sub">Optional personalisation for public content.</span>
          </div>
          <label className="sw">
            <input type="checkbox" id="ck-marketing" />
            <span className="sw-track" />
          </label>
        </div>
      </div>
      <div className="ck-actions">
        <button className="btn btn-primary btn-sm" id="cookie-accept" type="button">
          Accept All
        </button>
        <button className="btn btn-ghost btn-sm" id="cookie-save" type="button">
          Save Preferences
        </button>
        <button className="btn btn-ghost btn-sm" id="cookie-reject" type="button">
          Reject Non-Essential
        </button>
        <Link href="/privacy" className="ck-link">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}

function DesktopNavigation() {
  return (
    <nav className="nav" id="main-nav" role="navigation" aria-label="Main navigation">
      <a href="/" className="nav-logo" aria-label="A2Z Carbon Solutions - Home">
        <div className="nav-logo-mark" aria-hidden="true">
          A2
        </div>
        A2Z Carbon Solutions
      </a>
      <ul className="nav-links" role="list">
        <li><a href="#platform">Platform</a></li>
        <li><a href="#amine">Amine Products</a></li>
        <li><a href="#ccs">CCS Projects</a></li>
        <li><a href="#compliance">Compliance</a></li>
        <li><Link href="/calculator">CBAM Calculator</Link></li>
        <li><a href="#pricing">Pricing</a></li>
      </ul>
      <div className="nav-actions">
        <Link href="/auth/login" className="btn btn-ghost">
          Sign In
        </Link>
        <a href="#demo" className="btn btn-primary">
          Book a Demo -&gt;
        </a>
      </div>
    </nav>
  );
}

function MobileBottomNavigation() {
  return (
    <nav className="btb" id="bottom-nav" role="navigation" aria-label="Mobile navigation">
      <div className="btb-items">
        <button className="btb-item active" type="button" data-scroll-target="home" aria-label="Home" id="btb-home">
          <HomeIcon />
          Home
        </button>
        <button className="btb-item" type="button" data-scroll-target="platform" aria-label="Platform" id="btb-platform">
          <GridIcon />
          Platform
        </button>
        <button className="btb-item" type="button" data-scroll-target="amine" aria-label="Amine" id="btb-amine">
          <AtomIcon />
          Amine
        </button>
        <button className="btb-item" type="button" data-scroll-target="ccs" aria-label="CCS Projects" id="btb-ccs">
          <ShieldIcon />
          CCS
        </button>
        <a href="#demo" className="btb-cta" aria-label="Book a demo">
          <ListIcon />
          Demo
        </a>
      </div>
    </nav>
  );
}

function ProblemSection() {
  return (
    <section className="sec" id="problem" aria-labelledby="problem-h">
      <div className="container">
        <div className="sec-tag rev">The status quo is broken</div>
        <h2 className="sec-title rev rd1" id="problem-h">
          Spreadsheets were never built for regulatory accountability
        </h2>
        <div className="problem-grid">
          <div>
            <p className="lead rev">
              Enterprises now face CBAM obligations, investor scrutiny, and verification requirements at the same
              time. Spreadsheet-led carbon programs still struggle with auditability, version control, and data trust.
            </p>
            <ul className="pain-list" role="list">
              {PROBLEM_PAIN_POINTS.map((item) => (
                <li key={item.title} className={classNames("pain-item", "rev", item.revealClass)}>
                  <div className="pain-icon" aria-hidden="true">{item.marker}</div>
                  <div>
                    <span className="pain-h">{item.title}</span>
                    <span className="pain-d">{item.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="ba-wrap rev rd2">
            <div className="ba-card ba-before">
              <div className="ba-lbl">Before A2Z Carbon</div>
              <ul className="ba-list" role="list">
                {BEFORE_A2Z_LIST.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="ba-card ba-after">
              <div className="ba-lbl">After A2Z Carbon</div>
              <ul className="ba-list" role="list">
                {AFTER_A2Z_LIST.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlatformDemoSection() {
  return (
    <section className="sec solution" id="platform" aria-labelledby="sol-h">
      <div className="container">
        <div className="sol-header rev">
          <div className="sec-tag">Live platform demo</div>
          <h2 className="sec-title" id="sol-h">Your entire carbon footprint. One screen.</h2>
          <p className="sec-sub">
            Demo posture for a diversified industrial group across steel, cement, aluminium, logistics, and corporate operations.
          </p>
        </div>
        <div className="mockup rev rd1">
          <div className="mockup-bar">
            <div className="m-dots" aria-hidden="true">
              <div className="md md-r" />
              <div className="md md-y" />
              <div className="md md-g" />
            </div>
            <div className="m-title">A2Z GHG Platform - FY 2025 demo environment</div>
            <div className="m-live">Live data</div>
          </div>

          <div className="scope-tabs" role="tablist" aria-label="Emission scope selector">
            {PLATFORM_SCOPE_PANELS.map((panel, index) => (
              <button
                key={panel.id}
                className={classNames("stab", index === 0 && "active")}
                role="tab"
                aria-selected={index === 0 ? "true" : "false"}
                aria-controls={`sp-${panel.id}`}
                id={`tab-s${panel.id}`}
                type="button"
                data-scope-target={panel.id}
              >
                {panel.tabLabel}
              </button>
            ))}
          </div>

          <div className="scope-body">
            {PLATFORM_SCOPE_PANELS.map((panel, index) => (
              <div
                key={panel.id}
                className={classNames("sp", index === 0 && "active")}
                id={`sp-${panel.id}`}
                role="tabpanel"
                data-scope-panel={panel.id}
                aria-labelledby={`tab-s${panel.id}`}
              >
                <div className="mkpi-row">
                  {panel.kpis.map((kpi) => (
                    <div key={kpi.label} className="mkpi">
                      <div className="mkpi-l">{kpi.label}</div>
                      <div className={classNames("mkpi-v", kpi.toneClass)}>{kpi.value}</div>
                      <div className={kpi.deltaClass}>{kpi.delta}</div>
                    </div>
                  ))}
                </div>

                {panel.tableHeaders && panel.tableRows ? (
                  <table className="dt" aria-label={panel.headline}>
                    <thead>
                      <tr>
                        {panel.tableHeaders.map((header) => <th key={header}>{header}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {panel.tableRows.map((row) => (
                        <tr key={row.facility}>
                          <td>{row.facility}</td>
                          <td>{row.type}</td>
                          <td className="mono">{row.emissions}</td>
                          <td className={row.varianceClass}>{row.variance}</td>
                          <td>
                            {row.cbamFlag ? (
                              <span className={row.cbamFlag.className}>{row.cbamFlag.label}</span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            {row.status ? (
                              <span className={row.status.className}>{row.status.label}</span>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                      {panel.tableTotal ? (
                        <tr className="total">
                          <td><strong>{panel.tableTotal.facility}</strong></td>
                          <td>{panel.tableTotal.type ? <strong>{panel.tableTotal.type}</strong> : null}</td>
                          <td className="mono"><strong>{panel.tableTotal.emissions}</strong></td>
                          <td className={panel.tableTotal.varianceClass}>{panel.tableTotal.variance}</td>
                          <td />
                          <td />
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                ) : null}

                {panel.scope3Bars ? (
                  <div className="s3-chart" role="img" aria-label="Scope 3 emissions by category">
                    {panel.scope3Bars.map((bar) => (
                      <div key={bar.label} className="s3r">
                        <div className="s3-lbl">{bar.label}</div>
                        <div className="s3-bw">
                          <div className={classNames("s3-bar", bar.widthClass)} />
                        </div>
                        <div className="s3-val">{bar.value}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="sec" id="features" aria-labelledby="feat-h">
      <div className="container">
        <div className="rev sec-center section-gap-44">
          <div className="sec-tag">Platform capabilities</div>
          <h2 className="sec-title" id="feat-h">Built for enterprises that cannot afford to get it wrong</h2>
        </div>
        <div className="features-grid">
          {FEATURE_CARDS.map((card) => (
            <div key={card.title} className={classNames("fcard", "rev", card.revealClass)}>
              <div className="fcard-icon" aria-hidden="true">{card.icon}</div>
              <div className="fcard-title">{card.title}</div>
              <div className="fcard-desc">{card.description}</div>
              <div className="fcard-tag">{card.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CarbonLoopSection() {
  return (
    <section className="sec loop-sec" aria-labelledby="loop-h">
      <div className="container">
        <div className="sec-center rev section-gap-none">
          <div className="sec-tag">End-to-end carbon management</div>
          <h2 className="sec-title" id="loop-h">From emission to elimination - one operational loop</h2>
          <p className="sec-sub section-sub-centered">
            The public story stays clear: measure, capture, verify, and report within one connected platform posture.
          </p>
        </div>
        <div className="loop-diagram rev rd1" role="img" aria-label="Carbon management lifecycle">
          {LOOP_STEPS.map((step, index) => (
            <div key={step.title} className="loop-step">
              <div className={classNames("loop-node", step.nodeClass)} aria-hidden="true">{step.icon}</div>
              <div className="loop-step-title">{step.title}</div>
              <div className="loop-step-sub">{step.description}</div>
              {index < LOOP_STEPS.length - 1 ? <div className="loop-arrow" aria-hidden="true">-&gt;</div> : null}
            </div>
          ))}
        </div>
        <div className="loop-badge rev rd2">
          {LOOP_BADGES.map((badge) => (
            <div key={badge.label} className="lbadge">
              <div className={classNames("lbadge-dot", badge.dotClass)} />
              {badge.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AmineSection() {
  return (
    <section className="sec amine-sec" id="amine" aria-labelledby="amine-h">
      <div className="container">
        <div className="amine-grid">
          <div className="amine-info">
            <div className="sec-tag rev">Amine manufacturing</div>
            <h2 className="sec-title rev rd1 amine-title" id="amine-h">
              <span className="amine-title-lead">Industrial-grade amines for carbon capture.</span>
              <span className="amine-title-gradient">Manufactured, supplied, and supported.</span>
            </h2>
            <p className="sec-sub rev rd2">
              The public commercial lane now clearly presents bulk solvent supply, custom blending, and technical support
              for post-combustion capture programs.
            </p>
            <div className="amine-cta-box rev rd3">
              <div className="amine-cta-title">Bulk supply and technical support</div>
              <div className="amine-cta-sub">
                Custom blend formulation, commissioning support, performance monitoring, and solvent-management services.
              </div>
              <a href="#demo" className="btn btn-amine">Request Amine Quote -&gt;</a>
            </div>
          </div>
          <div className="amine-products rev rd2">
            {AMINE_PRODUCTS.map((product) => (
              <div key={product.name} className="ap-card">
                <div className="ap-icon" aria-hidden="true">{product.icon}</div>
                <div>
                  <div className="ap-name">{product.name}</div>
                  <div className="ap-chem">{product.chemistry}</div>
                  <div className="ap-desc">{product.description}</div>
                  <div className="ap-specs">
                    {product.specs.map((spec) => <span key={spec} className="ap-spec">{spec}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CcsSection() {
  return (
    <section className="sec ccs-sec" id="ccs" aria-labelledby="ccs-h">
      <div className="container">
        <div className="ccs-header sec-center rev">
          <div className="sec-tag">CCS project services</div>
          <h2 className="sec-title" id="ccs-h">Turnkey carbon capture from feasibility to first tonne</h2>
          <p className="sec-sub section-sub-centered">
            The public delivery story combines engineering, solvent supply, commissioning, and reporting readiness in one service line.
          </p>
        </div>
        <div className="ccs-grid">
          {CCS_SERVICE_CARDS.map((card) => (
            <div key={card.title} className={classNames("ccs-card", "rev", card.revealClass)}>
              <div className="ccs-icon" aria-hidden="true">{card.icon}</div>
              <div className="ccs-title">{card.title}</div>
              <div className="ccs-desc">{card.description}</div>
              <div className="ccs-metrics">
                {card.metrics.map((metric) => (
                  <div key={metric.label} className="cm">
                    <span className="cm-val">{metric.value}</span>
                    <span className="cm-lbl">{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="ccs-process rev rd2">
          <div className="ccs-process-title">How we deliver a CCS project</div>
          <div className="ccs-steps" role="list">
            {CCS_PROCESS_STEPS.map((step) => (
              <div key={step.step} className="ccs-step" role="listitem">
                <div className="ccs-snum">{step.step}</div>
                <div className="ccs-stitle">{step.title}</div>
                <div className="ccs-sdesc">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ComplianceSection() {
  return (
    <section className="sec" id="compliance" aria-labelledby="comp-h">
      <div className="container">
        <div className="sec-center rev section-gap-44">
          <div className="sec-tag">Regulatory coverage</div>
          <h2 className="sec-title" id="comp-h">
            Every framework your regulators, investors, and customers require
          </h2>
        </div>
        <div className="compliance-grid">
          {COMPLIANCE_CARDS.map((card) => (
            <div key={card.title} className={classNames("cf", "rev", card.revealClass)}>
              <div className={classNames("cf-badge", card.badgeClass)}>{card.badgeLabel}</div>
              <div className="cf-name">{card.title}</div>
              <div className="cf-desc">{card.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResultsSection() {
  return (
    <section className="sec" aria-labelledby="results-h">
      <div className="container">
        <div className="results-box rev">
          <div className="results-company" id="results-h">Illustrative industrial group case study</div>
          <p className="results-quote">
            "We moved from a four-month reporting cycle with low trust to a live posture that our assurance team can review
            without repeated rework. The liability view alone changed budget decisions before filing season."
          </p>
          <div className="results-author">
            Group Finance and Sustainability Office <span>- enterprise demo narrative</span>
          </div>
          <div className="results-stats">
            <div>
              <span className="rs-val cu" data-target="89">0</span><span>%</span>
              <span className="rs-lbl">Reduction in reporting time</span>
            </div>
            <div>
              <span className="rs-val">EUR <span className="cu" data-target="2.1" data-dec="1">0</span>M</span>
              <span className="rs-lbl">CBAM penalties avoided</span>
            </div>
            <div>
              <span className="rs-val cu" data-target="94">0</span><span>%</span>
              <span className="rs-lbl">Data quality score</span>
            </div>
            <div>
              <span className="rs-val cu" data-target="0" data-dec="0">0</span>
              <span className="auditor-revisions"> auditor revisions</span>
              <span className="rs-lbl">In the first assurance cycle</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="sec" id="pricing" aria-labelledby="price-h">
      <div className="container">
        <div className="sec-center rev section-gap-48">
          <div className="sec-tag">Platform pricing</div>
          <h2 className="sec-title" id="price-h">Simple, transparent pricing without per-facility surprises</h2>
          <p className="sec-sub section-sub-centered">
            Amine-product pricing and CCS project quotes sit beside the software offering rather than being hidden behind a dead contact flow.
          </p>
        </div>
        <div className="pricing-cards">
          {PRICING_TIERS.map((tier) => (
            <div key={tier.name} className={classNames("pc", tier.featured && "featured", "rev", tier.revealClass)}>
              {tier.featured ? <div className="pc-popular">{tier.featuredLabel}</div> : null}
              <div className="pc-tier">{tier.tier}</div>
              <div className="pc-name">{tier.name}</div>
              <div className="pc-price">
                {tier.pricePrefix ? <span className="pc-curr">{tier.pricePrefix}</span> : null}
                <span className={classNames("pc-num", tier.price === "Custom" && "pc-num-custom")}>{tier.price}</span>
                {tier.period ? <span className="pc-period">{tier.period}</span> : null}
              </div>
              <div className="pc-desc">{tier.description}</div>
              <ul className="pc-features" role="list">
                {tier.features.map((feature) => (
                  <li key={feature.label} className={feature.unavailable ? "na" : undefined}>
                    {feature.label}
                  </li>
                ))}
              </ul>
              <a href="#demo" className={tier.ctaClassName}>{tier.ctaLabel}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section className="sec demo-sec" id="demo" aria-labelledby="demo-h">
      <div className="container">
        <div className="demo-inner">
          <div className="demo-info">
            <div className="sec-tag rev">Book a demo</div>
            <h2 className="sec-title rev rd1" id="demo-h">See the full carbon stack in action for your business</h2>
            <p className="sec-sub rev rd2">
              The public booking flow now stays tied to the live intake table. If richer CRM or scheduling fields are needed later, they stay tracked in the DB follow-up list rather than being faked in the UI.
            </p>
            <ul className="demo-bullets rev rd3" role="list">
              {DEMO_BULLETS.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="dform rev rd2">
            <form id="demo-form" noValidate>
              <div id="demo-form-wrap">
                <div className="df-title">Book your demo</div>
                <div className="df-sub">Usually responds within 4 business hours</div>
                <div className="frow">
                  <div className="fg">
                    <label className="fl" htmlFor="df-fname">First Name *</label>
                    <input className="fi" type="text" id="df-fname" name="first_name" autoComplete="given-name" placeholder="Suresh" required />
                  </div>
                  <div className="fg">
                    <label className="fl" htmlFor="df-lname">Last Name *</label>
                    <input className="fi" type="text" id="df-lname" name="last_name" autoComplete="family-name" placeholder="Natarajan" required />
                  </div>
                </div>
                <div className="fg">
                  <label className="fl" htmlFor="df-email">Work Email *</label>
                  <input className="fi" type="email" id="df-email" name="email" autoComplete="email" placeholder="team@company.com" required />
                </div>
                <div className="frow">
                  <div className="fg">
                    <label className="fl" htmlFor="df-company">Company *</label>
                    <input className="fi" type="text" id="df-company" name="company" autoComplete="organization" placeholder="Industrial Group" required />
                  </div>
                  <div className="fg">
                    <label className="fl" htmlFor="df-phone">Phone</label>
                    <input className="fi" type="tel" id="df-phone" name="phone" autoComplete="tel" placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div className="fg">
                  <label className="fl" htmlFor="df-interest">Primary Interest *</label>
                  <select className="fi" id="df-interest" name="interest" defaultValue="" required>
                    <option value="" disabled>Select your primary need</option>
                    {DEMO_INTEREST_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="fg">
                  <label className="fl" htmlFor="df-sector">Industry Sector</label>
                  <select className="fi" id="df-sector" name="sector" defaultValue="">
                    <option value="" disabled>Your industry</option>
                    {DEMO_SECTOR_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <label className="df-consent">
                  <input type="checkbox" id="df-consent" name="consent" />
                  <span>
                    I consent to follow-up about this request and understand the booking will be stored in the live lead intake table.
                  </span>
                </label>
                <button className="btn btn-primary form-submit" id="df-submit" type="submit">
                  <span id="df-btn-text">Book My Demo -&gt;</span>
                </button>
                <p className="df-note">
                  By submitting, you agree to our <Link href="/privacy">Privacy Policy</Link>. We never sell your data.
                </p>
              </div>
            </form>
            <div className="df-success" id="df-success">
              <div className="sicon" aria-hidden="true">Booked</div>
              <div className="stitle">Demo booked</div>
              <div className="sdesc">
                Thank you. A member of the team will reach out within 4 business hours to confirm the slot and next steps.
                In the meantime, try the <Link href="/calculator" className="inline-link">free CBAM Calculator</Link>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="sec" id="faq" aria-labelledby="faq-h">
      <div className="container">
        <div className="sec-center rev section-gap-none">
          <div className="sec-tag">FAQ</div>
          <h2 className="sec-title" id="faq-h">Questions teams ask before every demo</h2>
        </div>
        <div className="faq-grid">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={item.question}
              className={classNames("fq", "rev", index % 4 === 1 && "rd1", index % 4 === 2 && "rd2", index % 4 === 3 && "rd3")}
              data-faq-toggle="true"
              tabIndex={0}
              role="button"
              aria-expanded="false"
            >
              <div className="fq-q">
                {item.question}
                <ChevronDownIcon />
              </div>
              <div className="fq-a">{item.answer}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="final-cta" aria-labelledby="fca-h">
      <div className="container">
        <div className="sec-tag final-cta-tag">The full carbon stack - one partner</div>
        <h2 className="sec-title rev" id="fca-h">
          Measure your carbon.
          <br />
          Capture your carbon.
          <br />
          Prove your carbon.
        </h2>
        <p className="rev rd1">
          One public story now covers measurement, compliance, commercial planning, amine products, and CCS delivery without relying on injected markup.
        </p>
        <div className="fca-btns rev rd2">
          <a href="#demo" className="btn btn-primary btn-xl">Book a Demo -&gt;</a>
          <Link href="/calculator" className="btn btn-ghost btn-xl">Free CBAM Calculator</Link>
        </div>
        <div className="fca-trust rev rd3">
          <div className="fct">GDPR-aware UX</div>
          <div className="fct">ISO 14064-3 ready</div>
          <div className="fct">CBAM 2026 ready</div>
          <div className="fct">SOC 2 pursuing</div>
          <div className="fct">Data encrypted in transit and at rest</div>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">A2Z Carbon Solutions</div>
            <div className="footer-tagline">
              The full carbon stack - GHG platform, amine manufacturing, and CCS project services with one consistent public experience.
            </div>
            <div className="footer-certs">
              <span className="fc">CBAM Ready</span>
              <span className="fc">ISO 14064</span>
              <span className="fc">BRSR</span>
              <span className="fc">GHG Protocol</span>
              <span className="fc">SOC 2 Track</span>
            </div>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <div className="footer-col-title">{column.title}</div>
              <ul className="footer-links" role="list">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.hash ? (
                      <a href={link.href}>{link.label}</a>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <div className="footer-legal">
            Copyright 2025 A2Z Carbon Solutions Pvt. Ltd. | <Link href="/privacy">Privacy</Link> |{" "}
            <Link href="/terms">Terms</Link> | <Link href="/cookies">Cookies</Link>
          </div>
          <div className="footer-legal">Built in India. Serving Europe, Asia, and beyond.</div>
        </div>
      </div>
    </footer>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function AtomIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="7.05" y2="7.05" />
      <line x1="16.95" y1="16.95" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
