# Active Role List and Features

Last updated: 2026-03-16

## Purpose

This is the living frontend role register for the live portal.

Why this file exists:
- It records what each role can actually do in the current frontend.
- It documents the live menus, KPI blocks, shortcuts, scope behavior, and guardrails for training, audit, onboarding, and QA.
- It must stay aligned with the real implementation in `lib/auth/roles.ts`, `lib/auth/dashboardRegistry.ts`, `lib/auth/routeAccess.ts`, and the live routes under `app/`.
- It pairs with [OrganizationFlowCharts.md](./OrganizationFlowCharts.md), which shows the same system visually across auth, SoD, and data movement.

Update rule:
- Update this file in the same PR whenever a role gains a new live route, KPI block, shortcut, control, or restriction.
- Only document live DB-connected functionality.
- Do not document planned routes, placeholders, or future intentions as if they are live.

Status legend:
- `Live dedicated workspace`: the role lands in a route built for that role or role family.
- `Live shared family workspace`: the role uses a real DB-connected workspace shared with a role family.
- `Live read-focused workspace`: the role has live access but is intentionally read-heavy or restricted.
- `Non-interactive`: the role should not use the portal UI.
- `Lifecycle restricted`: the role only receives access-status messaging and no operational workspace.

## Shared Portal Building Blocks

These are the reusable live surfaces that multiple roles inherit.

### Dashboard Home
Route: `/dashboard`

What it does:
- Shows a live DB-backed home snapshot for the authenticated role family.
- Displays scoped KPI cards, current signals, a visible work queue, and scope posture.
- Shows appropriate no-data or no-scope messages instead of placeholder content.

Why it exists:
- Gives every interactive role a truthful launchpad based on current scope, current data, and current guardrails.

Common controls:
- Scope is derived from authenticated organization, site, and legal-entity claims.
- Lifecycle and non-interactive roles are blocked from operational routes and only receive status messaging.

### Account and Security Settings
Routes:
- `/dashboard/settings`
- `/dashboard/settings/profile`
- `/dashboard/settings/security`

What they do:
- Show account posture, session posture, and security-oriented settings already available in the frontend shell.

Why they exist:
- Every live user needs a stable place to review personal access posture without entering operational workflows.

### Session Lock and Security Disclosure
Live primitives:
- `components/security/SessionLockBoundary.tsx`
- `components/security/SecretValue.tsx`
- `components/ai/AIDataPoint.tsx`

What they do:
- Support inactivity lock behavior.
- Mask secrets by default and reveal them intentionally.
- Show AI-origin disclosures where AI-assisted content appears.

Why they exist:
- These are shared audit and security primitives and are part of the frontend compliance baseline.

## Live Workspace Catalog

This section describes the current live workspaces that the roles below inherit.

### Platform Control Workspace
Primary roles:
- `platform_superadmin`
- `platform_admin`

Primary routes:
- `/admin`
- `/admin/tenants`
- `/admin/rbac`
- `/admin/logs`
- `/admin/health`
- `/admin/features`

Live KPI blocks:
- `Organizations`: shows total active tenant footprint from live organization data.
- `Active Users`: shows users with active role assignments.
- `Pending Approvals`: highlights lifecycle onboarding backlog.
- `Webhook Alerts`: highlights failing or retrying integration subscriptions.

Live menus:
- `Tenants & Billing`: tracks tenant readiness, ERP posture, reporting activity, and session coverage.
- `RBAC Controls`: gives a live view of role and permission posture.
- `Global Audit Logs`: shows platform-wide audit events and control changes.
- `System Health`: shows operational readiness and system posture.
- `Global Config`: shows global feature/control posture.
- `System Settings`: shows live security, incident, backup, and enforcement posture without faking mutation flows.

Why it exists:
- This is the control-plane workspace for the platform operator tier.

Audit notes:
- Must remain isolated from client operational roles.
- Platform control access is intentionally narrower than the full platform staff category.

### Platform Operations Workspace
Primary roles:
- `platform_developer`
- `platform_support`

Primary routes:
- `/dashboard/platform/operations`
- `/dashboard/settings`

Live KPI blocks:
- `Global Flags`: shows globally enabled feature flags.
- `Active Throttles`: shows live endpoint throttle posture.
- `High-Risk Sessions`: surfaces elevated-risk active sessions.
- `Retry Queue`: shows queued webhook delivery retries.

Live menus and shortcuts:
- `Platform Ops`: dedicated engineering and support board.
- `Dashboard Hub`: shared launchpad for scope posture and cross-role signals.
- `Settings`: account and session posture review.

Why it exists:
- Gives engineering and support staff a real live platform lane without unlocking admin-only control-plane mutations.

Audit notes:
- Read-first by design.
- Retry, audit, and session pressure remain visible without exposing secret infrastructure operations.

### Platform Commercial Workspace
Primary roles:
- `platform_crm`
- `platform_sales`
- `platform_finance`

Primary routes:
- `/dashboard/platform/commercial`
- `/dashboard/settings`

Live KPI blocks:
- `Fresh Leads`: recent lead volume from the live intake table.
- `Active Tenants`: active tenant footprint in the live registry.
- `Subscription Revenue`: completed subscription-payment value recorded in INR.
- `Reporting-Active Tenants`: organizations with recent submission activity.

Live menus and shortcuts:
- `Commercial Pulse`: dedicated demand, tenant, and revenue board.
- `Dashboard Hub`: shared platform launchpad for scope posture.
- `Settings`: account and session posture review.

Why it exists:
- Keeps commercial staff in a DB-backed workspace without exposing client operational flows or admin control surfaces.

Audit notes:
- Lead emails stay masked in the UI.
- Tenant-readiness posture must not be mistaken for operational data authority.

### Platform Models Workspace
Primary roles:
- `digital_twin_engineer`
- `platform_data_scientist`

Primary routes:
- `/dashboard/platform/models`
- `/dashboard/settings`

Live KPI blocks:
- `Active Twin Models`: active digital-twin models in the registry.
- `Scenario Runs`: current synthetic scenario rows.
- `Display Approved`: scenarios approved for display while staying non-reportable.
- `Flagged AI Records`: audit-flagged rows from AI validation summary.

Live menus and shortcuts:
- `Models & Twins`: dedicated digital-twin and AI-validation board.
- `Dashboard Hub`: shared launchpad for role posture.
- `Settings`: account and session posture review.

Why it exists:
- Gives modeling and data-science roles a real frontend lane while keeping the synthetic/non-reportable boundary explicit.

Audit notes:
- Scenario data remains synthetic and non-reportable.
- AI model visibility must not expose deployment endpoints or bypass verified-data controls.

### Governance Workspace
Primary roles:
- `dpo`
- `grievance_officer`

Primary routes:
- `/governance/privacy`
- `/governance/grievances`
- `/dashboard`

Live KPI blocks:
- `Open DSARs`: live rights requests still awaiting closure.
- `Overdue DSARs`: requests already beyond their due date.
- `Open Incidents`: active incident rows visible to governance.
- `Withdrawn Consents`: consent records already carrying withdrawal state.

Live menus and shortcuts:
- `Privacy Operations`: DPO-facing DSAR, DPIA, ROPA, transfer, and consent oversight.
- `Incident Escalations`: grievance-facing incident, escalation, and withdrawal watchlist.
- `Dashboard Hub`: governance-aware home snapshot and shortcut launchpad.

Why it exists:
- Gives privacy and grievance roles live, regulation-oriented routes instead of leaving them stranded on the generic platform home.

Audit notes:
- DPO oversight must remain independent from the same organization's access administration.
- The current schema does not yet expose a dedicated grievance-case table, so the grievance lane is anchored on incidents, DSAR escalations, and consent withdrawals.

### Consulting Workspace
Primary roles:
- `consultant_lead`
- `consultant_senior`
- `consultant_analyst`
- `consultant_viewer`
- `consultant_trainee`

Primary routes:
- `/consulting/portfolio`
- `/consulting/scenario`
- `/dashboard/reports`

Live KPI blocks:
- `Assigned Clients`: visible client organizations in the consulting scope.
- `Active Sites`: visible site footprint across assigned clients.
- `Scenario Models`: scenario rows visible to the consulting session.
- `Approved Displays`: scenario outputs already approved for display.

Live menus and shortcuts:
- `Client Portfolio`: current client list and engagement posture.
- `Scenario Modeler`: modeled pathways and scenario review.
- `Annual Emissions`: live annual emissions baseline for advisory work.

Why it exists:
- Supports advisory and portfolio work without bypassing operational approvals.

Audit notes:
- Consulting recommendations remain advisory.
- Trainee access is supervised and expiry-sensitive.

### Organization Administration Workspace
Primary roles:
- `subsidiary_admin`
- `client_superadmin`
- `client_admin`
- `client_it_admin`
- `api_key_manager`
- `iot_device_manager`

Primary routes:
- `/org/users`
- `/org/facilities`
- `/org/integrations`

Live KPI blocks:
- `Team Members`: visible roster inside the current organization.
- `Active Assignments`: currently active role assignments.
- `Scoped Assignments`: assignments constrained by site or legal entity.
- `Integrations`: visible API key and webhook surfaces.

Live menus:
- `Team Management`: role assignment, SoD review, expiry handling, and scope-aware user management.
- `Facilities & Sites`: site and facility structure used by scoped workflows.
- `Data Integrations`: API, ERP, webhook, and device posture for the assigned organization.

Why it exists:
- Gives org-side admins and integration operators live control over their current tenant boundary.

Audit notes:
- Team assignment UX is scope-aware and SoD-aware.
- Integration access does not grant approval authority.

### Sustainability Workspace
Primary roles:
- `group_sustainability_head`
- `group_consolidator`
- `country_manager`
- `regional_analyst`
- `sustainability_head`
- `cbam_compliance_officer`
- `esg_manager`
- `regulatory_filing_agent`
- `supply_chain_analyst`

Primary routes:
- `/sustainability/targets`
- `/sustainability/disclosures`
- `/sustainability/cbam-reports`
- `/sustainability/offsets`
- `/dashboard/reports`

Live KPI blocks:
- `Targets`: visible target rows.
- `On Track`: targets currently meeting the glidepath.
- `Mandatory Completed`: mandatory disclosure indicators already carrying saved values.
- `Frameworks Ready`: frameworks whose mandatory indicators are complete for filing preparation.
- `Open Filings`: filing rows not yet closed or accepted.
- `EU Export Rows`: product-emission rows marked as exported to the EU.

Live menus and shortcuts:
- `Emissions Targets`: target posture and planning view.
- `Disclosure Hub`: framework disclosure, provenance, and filing-readiness workspace.
- `CBAM Declarations`: filing and declaration workspace.
- `Carbon Offsets`: offset-related sustainability view.
- `Annual Emissions`: live emissions rollup feeding reports and filings.

Why it exists:
- Gives climate strategy and disclosure roles access to approved emissions posture and filing readiness.

Audit notes:
- Uses live approved/downstream data.
- Must not bypass accounting review, approval, or verifier independence.

### Accounting and Review Workspace
Primary roles:
- `carbon_accountant`
- `data_reviewer`
- `data_approver`

Primary routes:
- `/accounting/approvals`
- `/accounting/anomalies`
- `/accounting/factors`

Live KPI blocks:
- `Pending Queue`: pending or flagged records awaiting review or approval.
- `Validated Rows`: rows already validated for downstream action.
- `Open Anomalies`: unresolved anomaly flags.
- `Factor Gaps`: sources missing factor linkage.

Live menus:
- `Data Approvals`: review and approval queue with visible SoD boundaries.
- `Emission Factors`: factor coverage and source linkage visibility.
- `Anomalies`: anomaly queue and follow-up.

Why it exists:
- Supports review-grade emissions control with visible four-eyes separation.

Audit notes:
- Reviewers and approvers are intentionally segregated.
- Self-approval blockers are surfaced in the home metrics and signals.

### Data Entry Workspace
Primary roles:
- `data_entry_operator`
- `facility_manager`
- `supply_chain_reporter`

Primary routes:
- `/dashboard/activity`
- `/dashboard/sources`
- `/data/upload`
- `/data/ai-extract`
- `/data/history`

Live KPI blocks:
- `Visible Sites`: sites currently inside scope.
- `Registered Sources`: source-register rows visible to the session.
- `Open Records`: activity rows not yet accepted.
- `Evidence Pending`: document uploads still waiting for review closure.

Live menus:
- `Activity Entry`: live scoped activity capture.
- `Source Register`: live source coverage and mapping.
- `Bulk Upload`: structured data import workspace.
- `AI Invoice Parse`: AI-assisted extraction workspace with disclosure-first handling.
- `My Submissions`: operator-facing history of submissions and evidence.

Why it exists:
- Supports live data capture, evidence intake, and submission tracking against real source and site data.

Audit notes:
- Data-entry roles cannot use the same lane as final approval.
- `supply_chain_reporter` remains constrained to scoped disclosure tasks.

### Executive and External Reporting Workspace
Primary roles:
- `cfo_viewer`
- `finance_analyst`
- `carbon_credit_trader`
- `executive_viewer`
- `investor_viewer`
- `lender_viewer`

Primary routes:
- `/finance/liability`
- `/finance/carbon-credits`
- `/finance/reports`
- `/dashboard/reports`

Live KPI blocks:
- `Latest FY tCO2e`: latest visible annual emissions total.
- `Open Filings`: filings not yet closed.
- `Completed Outflow`: recorded financial outflow in INR.
- `Verified Exports`: export rows carrying verification status.

Live menus:
- `Carbon Liability`: finance exposure and liability posture.
- `Credit Market`: live carbon-credit surface.
- `Board Packs`: executive and stakeholder reporting.
- `Annual Emissions`: rollup behind board and finance reporting.

Why it exists:
- Supports read-focused finance, executive, and controlled external reporting on live data.

Audit notes:
- Executive and external users consume approved data downstream of review and verification.
- `lender_viewer` remains intentionally constrained and read-focused.

### Verification Workspace
Primary roles:
- `platform_auditor`
- `verifier_lead`
- `verifier_approver`
- `verifier_iso`
- `cbam_verifier`
- `verifier_reviewer`
- `regulatory_inspector`

Primary routes:
- `/audit/rfis`
- `/audit/sampling`
- `/audit/vault`

Live KPI blocks:
- `Active Engagements`: visible verification rows.
- `Open Findings`: unresolved findings.
- `Final Statements`: verification rows carrying final statement dates.
- `Signoff Events`: visible signoff-chain activity.

Live menus:
- `Active RFIs`: findings and response workflow.
- `Data Sampling`: evidence density and sampling candidate review.
- `Assurance Vault`: statements, evidence, and signoff posture.

Why it exists:
- Supports live verifier and assurance operations across evidence, sampling, and signoff.

Audit notes:
- Verifier independence remains mandatory.
- `verifier_approver` carries the strictest final-opinion expectations.

### Non-Interactive and Lifecycle Roles
Primary roles:
- `board_report_recipient`
- `erp_service_account`
- `readonly_api_user`
- `webhook_consumer`
- `pending_approval`
- `invited_unaccepted`
- `suspended`
- `offboarded`

Behavior:
- No live operational workspace is opened for these roles.
- The portal only shows access-state or restricted-status behavior where applicable.

Why it exists:
- These roles are not supposed to perform interactive operational work in the portal.

Audit notes:
- Machine accounts must never use the interactive UI.
- Lifecycle roles must not access operational routes until status changes.

## Active Role Register

Each role below is documented against the current live frontend.

### 1. Platform Superadmin
- Status: `Live dedicated workspace`
- Primary route: `/admin`
- Current live workspace: Platform Control Workspace
- What this role does: runs tenant-wide control-plane oversight across organizations, access posture, logs, and system health.
- Current live features:
  - `KPI - Organizations`: shows active tenant footprint for platform oversight.
  - `KPI - Active Users`: shows currently active user-assignment population.
  - `Menu - Tenants & Billing`: reviews tenant readiness and billing-adjacent posture.
  - `Menu - Global Audit Logs`: reviews platform events and change evidence.
- Why this matters: this is the top operational control role in the frontend.
- Guardrail: must remain isolated from client-side operational roles.

### 2. Platform Admin
- Status: `Live dedicated workspace`
- Primary route: `/admin`
- Current live workspace: Platform Control Workspace
- What this role does: manages platform administration, tenancy, feature posture, and health without exceeding superadmin scope.
- Current live features:
  - `KPI - Pending Approvals`: shows onboarding backlog needing review.
  - `KPI - Webhook Alerts`: surfaces integration failures needing follow-up.
  - `Menu - RBAC Controls`: reviews the platform permission model.
  - `Menu - System Health`: monitors operational posture.
  - `Menu - System Settings`: reviews live security, backup, and enforcement posture.
- Why this matters: keeps daily platform administration separate from the broader superadmin lane.
- Guardrail: broad rights, but narrower than `platform_superadmin`.

### 3. Platform Developer
- Status: `Live dedicated workspace`
- Primary route: `/dashboard/platform/operations`
- Current live workspace: Platform Operations Workspace
- What this role does: reviews rollout posture, rate-limit baselines, retry pressure, and audit-visible operations signals from a dedicated engineering lane.
- Current live features:
  - `KPI - Global Flags`: shows current full-platform rollout count.
  - `KPI - Active Throttles`: shows live endpoint-throttle posture.
  - `Menu - Platform Ops`: dedicated engineering workspace for live platform posture.
  - `Menu - Dashboard Hub`: shared launchpad for scope posture.
- Why this matters: gives engineering a real operations lane without granting control-plane mutation pages.
- Guardrail: engineering access must not overrule verified or approved data states.

### 4. Platform Auditor
- Status: `Live read-focused workspace`
- Primary route: `/audit/rfis`
- Current live workspace: Verification Workspace
- What this role does: reviews assurance evidence, RFIs, and sampling posture from an audit-oriented lane.
- Current live features:
  - `KPI - Open Findings`: shows unresolved verification issues.
  - `Menu - Active RFIs`: reviews open requests and client responses.
  - `Menu - Data Sampling`: inspects evidence density and sample candidates.
  - `Menu - Assurance Vault`: consumes locked assurance evidence.
- Why this matters: gives the platform audit function a real assurance workspace.
- Guardrail: remains independent and read-focused relative to client operations.

### 5. Digital Twin Engineer
- Status: `Live dedicated workspace`
- Primary route: `/dashboard/platform/models`
- Current live workspace: Platform Models Workspace
- What this role does: reviews digital-twin models, scenario posture, and synthetic-run status from a dedicated modeling lane.
- Current live features:
  - `KPI - Active Twin Models`: shows current active model count in the registry.
  - `KPI - Scenario Runs`: shows live synthetic scenario count.
  - `Menu - Models & Twins`: dedicated digital-twin workspace.
  - `Menu - Dashboard Hub`: shared launchpad for role posture.
- Why this matters: gives the role a real modeling lane without implying approval or control authority.
- Guardrail: modeling access must stay separate from approval-grade compliance actions.

### 6. Platform CRM
- Status: `Live dedicated workspace`
- Primary route: `/dashboard/platform/commercial`
- Current live workspace: Platform Commercial Workspace
- What this role does: reviews masked lead demand, tenant readiness, and recent reporting activity from a commercial relationship lane.
- Current live features:
  - `KPI - Fresh Leads`: shows recent live lead volume.
  - `KPI - Active Tenants`: shows active tenant footprint in the registry.
  - `Menu - Commercial Pulse`: dedicated demand and tenant-readiness board.
  - `Menu - Dashboard Hub`: shared platform entry point.
- Why this matters: keeps CRM work inside a defined live lane with truthful tenant and demand context.
- Guardrail: commercial access must not bypass tenant-scoped operational controls.

### 7. Platform Sales
- Status: `Live dedicated workspace`
- Primary route: `/dashboard/platform/commercial`
- Current live workspace: Platform Commercial Workspace
- What this role does: uses the commercial board for live lead, tenant, and reporting-activity context during pipeline work.
- Current live features:
  - `KPI - Reporting-Active Tenants`: shows organizations with recent submission activity.
  - `KPI - Fresh Leads`: shows recent pipeline demand.
  - `Menu - Commercial Pulse`: dedicated commercial workspace.
  - `Menu - Dashboard Hub`: shared launchpad.
- Why this matters: preserves a real portal lane for sales without leaking operational authority.
- Guardrail: visibility remains commercial and limited by need.

### 8. Platform Finance
- Status: `Live dedicated workspace`
- Primary route: `/dashboard/platform/commercial`
- Current live workspace: Platform Commercial Workspace
- What this role does: reviews platform subscription revenue, tenant readiness, and payment-processor posture from the commercial board.
- Current live features:
  - `KPI - Subscription Revenue`: shows completed subscription-payment value in INR.
  - `KPI - Active Tenants`: shows live tenant footprint.
  - `Menu - Commercial Pulse`: dedicated commercial workspace.
  - `Menu - Dashboard Hub`: shared platform landing page.
- Why this matters: keeps platform-finance visibility distinct from client carbon-finance workflows.
- Guardrail: must remain separate from client finance execution lanes.

### 9. Platform Data Scientist
- Status: `Live dedicated workspace`
- Primary route: `/dashboard/platform/models`
- Current live workspace: Platform Models Workspace
- What this role does: reviews AI validation summary, public AI model posture, and synthetic scenario confidence from the dedicated model lane.
- Current live features:
  - `KPI - Flagged AI Records`: shows audit-flagged validation rows.
  - `KPI - Display Approved`: shows scenarios approved for display.
  - `Menu - Models & Twins`: dedicated AI and digital-twin workspace.
  - `Menu - Dashboard Hub`: shared launchpad.
- Why this matters: provides a real DB-connected model lane instead of only a generic shared home.
- Guardrail: analytical access supports the pipeline but does not overrule verified data.

### 10. Platform Support
- Status: `Live dedicated workspace`
- Primary route: `/dashboard/platform/operations`
- Current live workspace: Platform Operations Workspace
- What this role does: uses the operations board for short-lived support visibility across retries, session posture, and audit-visible signals.
- Current live features:
  - `KPI - Retry Queue`: shows webhook delivery backlog needing follow-up.
  - `KPI - High-Risk Sessions`: shows elevated-risk active sessions.
  - `Menu - Platform Ops`: dedicated operations workspace.
  - `Menu - Dashboard Hub`: shared support landing page.
- Why this matters: gives support a live lane without opening platform-admin pages.
- Guardrail: support access is temporary and must remain tightly controlled.

### 11. DPO
- Status: `Live dedicated workspace`
- Primary route: `/governance/privacy`
- Current live workspace: Governance Workspace
- What this role does: runs privacy operations across live DSAR, DPIA, ROPA, transfer, consent, and privacy-incident posture.
- Current live features:
  - `KPI - Open DSARs`: shows rights requests still awaiting closure.
  - `KPI - ROPA Reviews Due`: surfaces processing records due for review.
  - `Menu - Privacy Operations`: primary route for DSAR, DPIA, transfer, and consent oversight.
  - `Menu - Incident Escalations`: supporting route for privacy-linked incident review.
- Why this matters: the DPO now has a real governance workspace instead of only the generic dashboard home.
- Guardrail: the DPO must remain independent from the same organization's access administration.

### 12. Grievance Officer
- Status: `Live dedicated workspace`
- Primary route: `/governance/grievances`
- Current live workspace: Governance Workspace
- What this role does: runs incident and escalation oversight from the live incident, DSAR, and consent-withdrawal datasets currently available in the schema.
- Current live features:
  - `KPI - Open Incidents`: shows governance-visible incident response load.
  - `KPI - Escalated DSARs`: shows rights requests escalated into governance.
  - `Menu - Incident Escalations`: primary queue for incident and escalation response.
  - `Menu - Privacy Operations`: supporting route when a case needs deeper privacy review.
- Why this matters: grievance oversight is now grounded in live escalation data instead of a generic shared dashboard.
- Guardrail: grievance handling must remain independent from data approval actions.

### 13. Consultant Lead
- Status: `Live dedicated workspace`
- Primary route: `/consulting/portfolio`
- Current live workspace: Consulting Workspace
- What this role does: leads client engagement, portfolio review, and scenario advisory across assigned clients.
- Current live features:
  - `KPI - Assigned Clients`: shows visible consulting portfolio size.
  - `Menu - Client Portfolio`: reviews client workstreams and posture.
  - `Menu - Scenario Modeler`: reviews modeled pathways for advisory work.
  - `Shortcut - Annual Emissions`: uses live inventory as advisory baseline.
- Why this matters: this is the lead consulting lane for multi-client oversight.
- Guardrail: advice does not replace formal approval or verifier independence.

### 14. Consultant Senior
- Status: `Live dedicated workspace`
- Primary route: `/consulting/portfolio`
- Current live workspace: Consulting Workspace
- What this role does: delivers senior consulting work across the visible client portfolio.
- Current live features:
  - `KPI - Active Sites`: shows visible site footprint across client scope.
  - `Menu - Client Portfolio`: reviews client engagements.
  - `Menu - Scenario Modeler`: supports deeper scenario analysis.
  - `Shortcut - Annual Emissions`: reviews live emissions baseline.
- Why this matters: keeps senior consulting on live client data without granting regulated signoff power.
- Guardrail: client support must not blur into final signoff authority.

### 15. Consultant Analyst
- Status: `Live dedicated workspace`
- Primary route: `/consulting/scenario`
- Current live workspace: Consulting Workspace
- What this role does: focuses on analytical consulting and scenario support inside assigned client scope.
- Current live features:
  - `KPI - Scenario Models`: shows visible scenario volume.
  - `KPI - Approved Displays`: shows outputs already approved for display.
  - `Menu - Scenario Modeler`: primary modeling route.
  - `Shortcut - Annual Emissions`: baseline for scenario work.
- Why this matters: provides a live scenario-first lane for consulting analysis.
- Guardrail: recommendations remain advisory and cannot bypass regulated workflows.

### 16. Consultant Viewer
- Status: `Live read-focused workspace`
- Primary route: `/consulting/portfolio`
- Current live workspace: Consulting Workspace
- What this role does: consumes client portfolio and scenario posture in a read-oriented consulting lane.
- Current live features:
  - `KPI - Assigned Clients`: visible client footprint.
  - `Menu - Client Portfolio`: read-oriented portfolio review.
  - `Menu - Scenario Modeler`: controlled scenario visibility.
- Why this matters: supports read-only consulting visibility without mutation-heavy controls.
- Guardrail: viewer access must remain read-focused.

### 17. Consultant Trainee
- Status: `Live dedicated workspace`
- Primary route: `/consulting/portfolio`
- Current live workspace: Consulting Workspace
- What this role does: learns and contributes under supervision in a time-boxed consulting lane.
- Current live features:
  - `KPI - Assigned Clients`: visible supervised portfolio.
  - `Menu - Client Portfolio`: trainee-facing client posture.
  - `Menu - Scenario Modeler`: controlled scenario learning surface.
- Why this matters: gives trainees a live environment without pretending they have full consulting authority.
- Guardrail: expiry-limited and closely supervised.

### 18. Subsidiary Admin
- Status: `Live dedicated workspace`
- Primary route: `/org/users`
- Current live workspace: Organization Administration Workspace
- What this role does: administers users, facilities, and integrations for subsidiary-level scope.
- Current live features:
  - `KPI - Team Members`: visible roster in subsidiary scope.
  - `KPI - Scoped Assignments`: shows scope-constrained assignments.
  - `Menu - Team Management`: scoped role assignment and SoD review.
  - `Menu - Facilities & Sites`: facility and site administration.
- Why this matters: gives subsidiary operators a real org-admin lane on live data.
- Guardrail: must still honor assignment scope and tier restrictions.

### 19. Group Sustainability Head
- Status: `Live dedicated workspace`
- Primary route: `/sustainability/targets`
- Current live workspace: Sustainability Workspace
- What this role does: oversees group-wide target posture and consolidated sustainability progress.
- Current live features:
  - `KPI - Targets`: visible target inventory.
  - `KPI - On Track`: visible glidepath posture.
  - `Menu - Emissions Targets`: target and strategy review.
  - `Menu - Disclosure Hub`: framework completeness and filing-readiness posture.
  - `Menu - CBAM Declarations`: filing posture from approved data.
- Why this matters: this is the strategic group-level climate lane.
- Guardrail: group oversight must still respect org, site, and legal-entity scope.

### 20. Group Consolidator
- Status: `Live dedicated workspace`
- Primary route: `/sustainability/targets`
- Current live workspace: Sustainability Workspace
- What this role does: consolidates sustainability and reporting posture across visible group scope.
- Current live features:
  - `KPI - Open Filings`: current filing backlog.
  - `KPI - Frameworks Ready`: disclosure frameworks whose mandatory indicators are complete.
  - `Menu - Emissions Targets`: consolidated target posture.
  - `Menu - Disclosure Hub`: framework completion and provenance review.
  - `Menu - CBAM Declarations`: disclosure readiness.
  - `Shortcut - Annual Emissions`: live rollup behind consolidation.
- Why this matters: supports cross-entity consolidation on real reporting data.
- Guardrail: consolidation remains downstream of review and approval controls.

### 21. Country Manager
- Status: `Live dedicated workspace`
- Primary route: `/sustainability/targets`
- Current live workspace: Sustainability Workspace
- What this role does: manages sustainability posture at the country level inside assigned scope.
- Current live features:
  - `KPI - EU Export Rows`: export-related emissions visibility.
  - `Menu - Emissions Targets`: country-level planning and performance.
  - `Menu - Disclosure Hub`: framework disclosure readiness for the active reporting year.
  - `Menu - CBAM Declarations`: country-level filing posture.
- Why this matters: supports localized sustainability management on live data.
- Guardrail: country views must still respect inherited assignment scope.

### 22. Regional Analyst
- Status: `Live dedicated workspace`
- Primary route: `/dashboard/reports`
- Current live workspace: Sustainability Workspace
- What this role does: reviews regional emissions and sustainability posture in a report-heavy lane.
- Current live features:
  - `KPI - Targets`: visible regional target rows.
  - `Menu - Annual Emissions`: live report workspace.
  - `Menu - Disclosure Hub`: framework completeness and filing-readiness context.
  - `Menu - Emissions Targets`: strategy context.
- Why this matters: supports regional analysis without mixing in approval authority.
- Guardrail: analysis remains read-heavy and downstream of approvals.

### 23. Client Superadmin
- Status: `Live dedicated workspace`
- Primary route: `/org/users`
- Current live workspace: Organization Administration Workspace
- What this role does: acts as the top organization admin for users, facilities, and integrations.
- Current live features:
  - `KPI - Team Members`: visible org roster.
  - `KPI - Active Assignments`: current assignment posture.
  - `Menu - Team Management`: scoped role assignment and SoD monitoring.
  - `Menu - Data Integrations`: API, ERP, webhook, and device posture.
- Why this matters: this is the highest tenant-side administration lane.
- Guardrail: still subject to SoD and verifier independence rules.

### 24. Client Admin
- Status: `Live dedicated workspace`
- Primary route: `/org/users`
- Current live workspace: Organization Administration Workspace
- What this role does: manages day-to-day organization administration within the assigned tenant.
- Current live features:
  - `KPI - Scoped Assignments`: visible scope restrictions across the team.
  - `Menu - Team Management`: daily org-user administration.
  - `Menu - Facilities & Sites`: structure maintenance.
  - `Menu - Data Integrations`: org integration review.
- Why this matters: supports operational org administration on live data.
- Guardrail: cannot be combined with `dpo` for the same organization.

### 25. Client IT Admin
- Status: `Live dedicated workspace`
- Primary route: `/org/integrations`
- Current live workspace: Organization Administration Workspace
- What this role does: administers integration and systems posture for the tenant.
- Current live features:
  - `KPI - Integrations`: visible API key and webhook posture.
  - `Menu - Data Integrations`: primary integration workspace.
  - `Menu - Team Management`: user context when needed.
- Why this matters: keeps technical tenant administration on a live scoped surface.
- Guardrail: integration access stays inside the assigned organization boundary.

### 26. Sustainability Head
- Status: `Live dedicated workspace`
- Primary route: `/sustainability/targets`
- Current live workspace: Sustainability Workspace
- What this role does: owns sustainability planning, targets, and disclosure preparation.
- Current live features:
  - `KPI - Targets`: visible target program.
  - `KPI - On Track`: glidepath posture.
  - `Menu - Emissions Targets`: strategy and target management.
  - `Menu - Disclosure Hub`: framework disclosures and provenance posture.
  - `Menu - CBAM Declarations`: disclosure posture.
- Why this matters: this is the main climate strategy lane for the tenant.
- Guardrail: final submission stays downstream of review, approval, and signoff checks.

### 27. CBAM Compliance Officer
- Status: `Live dedicated workspace`
- Primary route: `/sustainability/cbam-reports`
- Current live workspace: Sustainability Workspace
- What this role does: handles CBAM-specific reporting and compliance review.
- Current live features:
  - `KPI - Open Filings`: CBAM-related filing backlog.
  - `KPI - EU Export Rows`: export-linked emissions footprint.
  - `Menu - Disclosure Hub`: framework disclosure and readiness workspace.
  - `Menu - CBAM Declarations`: primary filing route.
  - `Shortcut - Annual Emissions`: live inventory behind filing work.
- Why this matters: provides the regulated filing lane for CBAM work.
- Guardrail: must stay limited to relevant embedded-emissions workflow.

### 28. ESG Manager
- Status: `Live dedicated workspace`
- Primary route: `/sustainability/targets`
- Current live workspace: Sustainability Workspace
- What this role does: manages ESG planning and disclosure on top of live approved emissions posture.
- Current live features:
  - `KPI - Targets`: ESG target inventory.
  - `KPI - SBTi posture`: target alignment signal.
  - `Menu - Emissions Targets`: ESG strategy lane.
  - `Menu - Disclosure Hub`: framework disclosure and provenance management.
  - `Menu - Carbon Offsets`: offset-related sustainability view.
- Why this matters: aligns disclosure and planning with live climate data.
- Guardrail: should consume approved data and not short-circuit accounting controls.

### 29. Carbon Accountant
- Status: `Live dedicated workspace`
- Primary route: `/accounting/approvals`
- Current live workspace: Accounting and Review Workspace
- What this role does: manages review-grade emissions accounting, anomalies, and factor coverage.
- Current live features:
  - `KPI - Pending Queue`: records awaiting review or approval.
  - `KPI - Factor Gaps`: sources still missing factor linkage.
  - `Menu - Data Approvals`: accounting queue and review posture.
  - `Menu - Emission Factors`: coverage and factor posture.
- Why this matters: this is the core accounting control lane.
- Guardrail: preparation and approval duties remain segregated from final signoff.

### 30. Regulatory Filing Agent
- Status: `Live dedicated workspace`
- Primary route: `/sustainability/cbam-reports`
- Current live workspace: Sustainability Workspace
- What this role does: prepares and tracks regulated filings using approved disclosure data.
- Current live features:
  - `KPI - Open Filings`: current filing backlog.
  - `Menu - Disclosure Hub`: primary framework disclosure and completeness workspace.
  - `Menu - CBAM Declarations`: filing preparation and review.
  - `Shortcut - Annual Emissions`: live emissions rollup behind filings.
- Why this matters: gives filing operators a dedicated live disclosure surface.
- Guardrail: filing access depends on already-approved disclosure data.

### 31. Supply Chain Analyst
- Status: `Live dedicated workspace`
- Primary route: `/dashboard/reports`
- Current live workspace: Sustainability Workspace
- What this role does: analyzes upstream and downstream emissions posture in a report-heavy lane.
- Current live features:
  - `KPI - EU Export Rows`: export-facing product-emission visibility.
  - `Menu - Annual Emissions`: live reporting workspace.
  - `Menu - Disclosure Hub`: framework completeness, provenance, and filing-readiness context.
  - `Menu - CBAM Declarations`: disclosure context for supply-chain analysis.
- Why this matters: supports supply-chain emissions insight on approved data.
- Guardrail: analysis remains downstream of validated activity data.

### 32. Data Reviewer
- Status: `Live dedicated workspace`
- Primary route: `/accounting/approvals`
- Current live workspace: Accounting and Review Workspace
- What this role does: performs first-line review on submitted operational records and evidence.
- Current live features:
  - `KPI - Pending Queue`: visible review workload.
  - `KPI - Open Anomalies`: unresolved anomaly posture.
  - `Menu - Data Approvals`: review queue.
  - `Menu - Anomalies`: follow-up and investigation.
- Why this matters: establishes the first review layer before final approval.
- Guardrail: reviewers cannot also act as final approvers in the same organization.

### 33. Data Approver
- Status: `Live dedicated workspace`
- Primary route: `/accounting/approvals`
- Current live workspace: Accounting and Review Workspace
- What this role does: performs final approval on already-reviewed emissions records.
- Current live features:
  - `KPI - Validated Rows`: records queued for downstream acceptance.
  - `Signal - SoD control`: warns if self-originated rows would be blocked.
  - `Menu - Data Approvals`: final-approval queue.
  - `Menu - Emission Factors`: factor readiness context before approval.
- Why this matters: closes the four-eyes control loop.
- Guardrail: approvers must remain separate from reviewers and originators.

### 34. IoT Device Manager
- Status: `Live dedicated workspace`
- Primary route: `/org/integrations`
- Current live workspace: Organization Administration Workspace
- What this role does: manages device and ingestion posture for telemetry-backed data capture.
- Current live features:
  - `KPI - Integrations`: current API and webhook/device posture.
  - `Menu - Data Integrations`: primary integration lane.
  - `Shortcut - Settings`: account posture without broader admin expansion.
- Why this matters: supports telemetry operations on the live tenant boundary.
- Guardrail: device access does not imply emissions approval authority.

### 35. Data Entry Operator
- Status: `Live dedicated workspace`
- Primary route: `/dashboard/activity`
- Current live workspace: Data Entry Workspace
- What this role does: captures day-to-day activity records and evidence in a personal operational lane.
- Current live features:
  - `KPI - Open Records`: own records not yet accepted.
  - `KPI - Evidence Pending`: own evidence awaiting review closure.
  - `Menu - Activity Entry`: primary capture route.
  - `Menu - My Submissions`: personal submission history.
- Why this matters: this is the main manual data-capture role in the live portal.
- Guardrail: operators cannot review or finally approve their own work.

### 36. Facility Manager
- Status: `Live dedicated workspace`
- Primary route: `/dashboard/activity`
- Current live workspace: Data Entry Workspace
- What this role does: manages site-level capture and follow-up across visible facility scope.
- Current live features:
  - `KPI - Visible Sites`: site scope posture.
  - `KPI - Registered Sources`: visible source-register footprint.
  - `Menu - Activity Entry`: site-level capture pipeline.
  - `Menu - Source Register`: facility/source coverage review.
- Why this matters: gives facility operations a live, scoped data lane.
- Guardrail: facility views must remain inside site scope and review controls.

### 37. CFO Viewer
- Status: `Live dedicated workspace`
- Primary route: `/finance/reports`
- Current live workspace: Executive and External Reporting Workspace
- What this role does: consumes finance-facing emissions and reporting posture in an executive lane.
- Current live features:
  - `KPI - Latest FY tCO2e`: current annual emissions total.
  - `KPI - Open Filings`: filing backlog relevant to executive posture.
  - `Menu - Board Packs`: executive reporting surface.
  - `Menu - Carbon Liability`: liability context.
- Why this matters: gives finance leadership live reporting without operational mutation.
- Guardrail: executive visibility remains read-oriented.

### 38. Finance Analyst
- Status: `Live dedicated workspace`
- Primary route: `/finance/liability`
- Current live workspace: Executive and External Reporting Workspace
- What this role does: analyzes liability, outflow, and reporting posture from live approved data.
- Current live features:
  - `KPI - Completed Outflow`: finance outflow visibility.
  - `KPI - Verified Exports`: verified export-row count.
  - `Menu - Carbon Liability`: primary liability workspace.
  - `Menu - Board Packs`: reporting context.
- Why this matters: supports deeper finance analysis on live emissions and filing posture.
- Guardrail: financial analysis does not replace approval controls.

### 39. Carbon Credit Trader
- Status: `Live dedicated workspace`
- Primary route: `/finance/carbon-credits`
- Current live workspace: Executive and External Reporting Workspace
- What this role does: reviews live carbon-credit posture and market-facing activity support.
- Current live features:
  - `Menu - Credit Market`: primary carbon-credit route.
  - `Menu - Carbon Liability`: liability context for trading decisions.
  - `Menu - Board Packs`: reporting backdrop.
- Why this matters: gives the carbon-market lane a real route in the live portal.
- Guardrail: own-trade approval still requires a second authorized user.

### 40. Executive Viewer
- Status: `Live dedicated workspace`
- Primary route: `/finance/reports`
- Current live workspace: Executive and External Reporting Workspace
- What this role does: consumes high-level climate and finance reporting without entering operational workflows.
- Current live features:
  - `KPI - Latest FY tCO2e`: latest visible emissions baseline.
  - `Menu - Board Packs`: executive reporting surface.
  - `Shortcut - Annual Emissions`: report drilldown route.
- Why this matters: supports senior leadership visibility on approved data.
- Guardrail: dashboards should remain read-heavy and approval-safe.

### 41. Board Report Recipient
- Status: `Non-interactive`
- Primary route: none
- Current live workspace: Non-Interactive and Lifecycle Roles
- What this role does: receives packaged board reporting outside the interactive operational UI.
- Current live features:
  - `Access behavior`: no interactive dashboard is opened for this role.
- Why this matters: board recipients should consume curated output, not operational tools.
- Guardrail: intentionally excluded from interactive dashboard routing.

### 42. Verifier Lead
- Status: `Live dedicated workspace`
- Primary route: `/audit/rfis`
- Current live workspace: Verification Workspace
- What this role does: leads assurance engagements, findings review, and client follow-up.
- Current live features:
  - `KPI - Active Engagements`: current verification volume.
  - `KPI - Open Findings`: unresolved assurance posture.
  - `Menu - Active RFIs`: main findings and response queue.
  - `Menu - Assurance Vault`: evidence and statement review.
- Why this matters: this is the main lead-verifier operational lane.
- Guardrail: must remain independent from client operational roles.

### 43. Verifier Approver
- Status: `Live dedicated workspace`
- Primary route: `/audit/vault`
- Current live workspace: Verification Workspace
- What this role does: provides final verifier opinion and signoff review.
- Current live features:
  - `KPI - Final Statements`: final-opinion posture.
  - `KPI - Signoff Events`: visible signoff-chain activity.
  - `Menu - Assurance Vault`: primary final-opinion surface.
  - `Menu - Active RFIs`: supporting findings context.
- Why this matters: closes assurance work in the live portal.
- Guardrail: requires strict independence and the strongest approval discipline.

### 44. Verifier ISO
- Status: `Live dedicated workspace`
- Primary route: `/audit/sampling`
- Current live workspace: Verification Workspace
- What this role does: focuses on ISO-aligned evidence sampling and assurance review.
- Current live features:
  - `KPI - Active Engagements`: visible verification scope.
  - `Menu - Data Sampling`: primary ISO-oriented route.
  - `Menu - Assurance Vault`: evidence context.
- Why this matters: provides an ISO-specialist lane without mixing with client operations.
- Guardrail: ISO duties remain fully separated from client operational roles.

### 45. CBAM Verifier
- Status: `Live dedicated workspace`
- Primary route: `/audit/rfis`
- Current live workspace: Verification Workspace
- What this role does: verifies CBAM-related product and embedded-emissions evidence.
- Current live features:
  - `KPI - Open Findings`: CBAM-related assurance backlog.
  - `Menu - Active RFIs`: primary findings route.
  - `Menu - Data Sampling`: evidence sampling posture.
- Why this matters: gives CBAM assurance a live verifier workspace.
- Guardrail: requires accreditation-backed independence.

### 46. Verifier Reviewer
- Status: `Live dedicated workspace`
- Primary route: `/audit/rfis`
- Current live workspace: Verification Workspace
- What this role does: works review-stage findings and evidence follow-up.
- Current live features:
  - `KPI - Open Findings`: visible review workload.
  - `Menu - Active RFIs`: primary review-stage route.
  - `Menu - Assurance Vault`: evidence follow-up context.
- Why this matters: supports assurance review before final opinion.
- Guardrail: reviewer duties remain separate from client operational activities.

### 47. Regulatory Inspector
- Status: `Live read-focused workspace`
- Primary route: `/audit/vault`
- Current live workspace: Verification Workspace
- What this role does: reviews regulated evidence and assurance output in a time-boxed lane.
- Current live features:
  - `KPI - Final Statements`: visible completed assurance outputs.
  - `Menu - Assurance Vault`: primary read-focused evidence route.
  - `Menu - Active RFIs`: supporting context where allowed.
- Why this matters: supports controlled inspection visibility on live evidence.
- Guardrail: access is time-boxed and read-controlled.

### 48. Investor Viewer
- Status: `Live read-focused workspace`
- Primary route: `/finance/reports`
- Current live workspace: Executive and External Reporting Workspace
- What this role does: consumes curated investor-facing reporting from approved live data.
- Current live features:
  - `Menu - Board Packs`: primary investor reporting route.
  - `KPI - Latest FY tCO2e`: high-level emissions baseline.
  - `KPI - Verified Exports`: verified export posture where visible.
- Why this matters: provides a controlled external reporting lane.
- Guardrail: limited to approved and published reporting surfaces.

### 49. Lender Viewer
- Status: `Live read-focused workspace`
- Primary route: `/finance/reports`
- Current live workspace: Executive and External Reporting Workspace
- What this role does: consumes controlled lender-facing disclosures.
- Current live features:
  - `Menu - Board Packs`: primary lender reporting route.
  - `KPI - Open Filings`: filing posture relevant to controlled disclosure.
  - `Signal - Audience posture`: confirms read-only external posture.
- Why this matters: supports lender visibility without operational sprawl.
- Guardrail: lender access remains intentionally constrained.

### 50. Supply Chain Reporter
- Status: `Live dedicated workspace`
- Primary route: `/data/history`
- Current live workspace: Data Entry Workspace
- What this role does: submits and tracks supply-chain disclosure records in a constrained external-operational lane.
- Current live features:
  - `Menu - My Submissions`: primary disclosure tracking route.
  - `Shortcut - Dashboard Home`: scoped launchpad for current reporting task.
  - `KPI - Open Records`: disclosure records still in flight.
- Why this matters: supports supplier-facing reporting on a live DB-backed workflow.
- Guardrail: must stay constrained to assigned disclosure scope.

### 51. API Key Manager
- Status: `Live dedicated workspace`
- Primary route: `/org/integrations`
- Current live workspace: Organization Administration Workspace
- What this role does: manages integration credentials and automation posture for the tenant.
- Current live features:
  - `Menu - Data Integrations`: primary key and webhook workspace.
  - `Shortcut - Settings`: account and session posture.
  - `KPI - Integrations`: visible credential and webhook surface count.
- Why this matters: keeps automation credential management inside a controlled tenant workspace.
- Guardrail: credentials do not expand business-data approval authority.

### 52. ERP Service Account
- Status: `Non-interactive`
- Primary route: none
- Current live workspace: Non-Interactive and Lifecycle Roles
- What this role does: serves machine-to-machine ERP synchronization and should not use the portal UI.
- Current live features:
  - `Access behavior`: interactive dashboard is intentionally blocked.
- Why this matters: protects the portal from machine-account misuse.
- Guardrail: machine role only.

### 53. Readonly API User
- Status: `Non-interactive`
- Primary route: none
- Current live workspace: Non-Interactive and Lifecycle Roles
- What this role does: provides controlled read-only API access and should not use the portal UI.
- Current live features:
  - `Access behavior`: interactive dashboard is intentionally blocked.
- Why this matters: enforces separation between machine API access and human portal use.
- Guardrail: machine role only.

### 54. Webhook Consumer
- Status: `Non-interactive`
- Primary route: none
- Current live workspace: Non-Interactive and Lifecycle Roles
- What this role does: consumes integration events and callbacks outside the interactive portal.
- Current live features:
  - `Access behavior`: interactive dashboard is intentionally blocked.
- Why this matters: keeps callback identities outside the human UI.
- Guardrail: machine role only.

### 55. Pending Approval
- Status: `Lifecycle restricted`
- Primary route: `/dashboard`
- Current live workspace: Non-Interactive and Lifecycle Roles
- What this role does: receives status messaging while waiting for review and assignment.
- Current live features:
  - `Access behavior`: no operational workspace is opened.
- Why this matters: blocks premature operational access.
- Guardrail: no operational route until approval is complete.

### 56. Invited Unaccepted
- Status: `Lifecycle restricted`
- Primary route: `/dashboard`
- Current live workspace: Non-Interactive and Lifecycle Roles
- What this role does: receives invitation-state messaging until acceptance is complete.
- Current live features:
  - `Access behavior`: no operational workspace is opened.
- Why this matters: prevents operational access before invitation acceptance.
- Guardrail: invitation must be accepted first.

### 57. Suspended
- Status: `Lifecycle restricted`
- Primary route: `/dashboard`
- Current live workspace: Non-Interactive and Lifecycle Roles
- What this role does: receives suspended-account messaging and no operational access.
- Current live features:
  - `Access behavior`: no operational workspace is opened.
- Why this matters: preserves clear blocked-access behavior.
- Guardrail: suspended accounts must not access operational tooling.

### 58. Offboarded
- Status: `Lifecycle restricted`
- Primary route: `/dashboard`
- Current live workspace: Non-Interactive and Lifecycle Roles
- What this role does: receives removed-access messaging and no operational access.
- Current live features:
  - `Access behavior`: no operational workspace is opened.
- Why this matters: preserves clean removal of portal access.
- Guardrail: offboarded accounts must not access operational tooling.

## Documentation Rules For Future Development

When a role is extended, update this file with:
- the exact route added
- the menu label shown in the live UI
- the KPI or data blocks that became live
- the DB-backed purpose of the page
- the scope rule for org, site, and legal-entity visibility
- the SoD or independence rule that the role must respect
- whether the page is editable, approval-capable, or read-only
- any audit-facing messaging, AI disclosure, or secret-handling behavior added to that role's flow
