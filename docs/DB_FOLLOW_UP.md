# Database Follow-Up

Last updated: 2026-03-16

## Purpose

This is the living backlog for database, schema, claims, and backend-support
items that the frontend has already encountered while building the portal.

Why this file exists:
- It keeps frontend delivery moving without pretending missing DB or backend
  pieces are already solved.
- It records every live workaround, read-only lane, or schema substitution the
  frontend is using today.
- It gives later DB/backend work a concrete list of what the current UI is
  waiting on.

Update rule:
- Update this file in the same PR whenever frontend work depends on a schema
  workaround, a missing DB object, a read-only substitute, or a backend-owned
  compliance control that is not live yet.
- Record the affected route or feature so later DB work can trace impact
  quickly.
- Remove an item only when the checked-in dump or server code proves the gap is
  closed and the frontend workaround has been removed.

Status legend:
- `Critical follow-up`: frontend can function, but correctness or regulatory
  posture is incomplete without the DB/backend change.
- `Planned follow-up`: the product flow is live enough for demo/pre-production,
  but the real data contract still needs to be finished.
- `Verification needed`: docs or product intent reference an object that is not
  yet confirmed in the checked-in dump.

## Critical Follow-Up

### 1. JWT Scope Claims Need To Be Emitted Consistently

- Status: `Critical follow-up`
- Gap:
  - The frontend can parse `org_ids`, `primary_org_id`, `scope_site_ids`, and
    `scope_legal_entity_ids`, but the upstream claims hook must emit those
    fields consistently in JWT `app_metadata`.
- Why this matters:
  - Scope-aware UX is already built. Without the live scope arrays in the JWT,
    sessions can degrade toward organization-wide visibility when site or legal
    entity scoping should be narrower.
- Current frontend handling:
  - `lib/auth/sessionScope.ts` normalizes the arrays when present.
  - `context/AuthContext.tsx` exposes `primaryOrgId`, `siteScopeIds`, and
    `legalEntityScopeIds`.
  - Scoped views already consume those values instead of `orgIds[0]`.
- Affected live surfaces:
  - dashboard home
  - activity, source, and report workspaces
  - org user assignment flows
  - every scope-aware role family
- Done when:
  - fresh JWTs always carry the full scope fields for scoped users.

### 2. Authoritative MFA Verification Workflow

- Status: `Critical follow-up`
- Gap:
  - `record_mfa_verification(...)` is not confirmed in the checked-in dump.
  - The admin role-assignment flow currently writes `mfa_verified_at` as a
    frontend/server-action stopgap.
- Why this matters:
  - Assignment-time confirmation is not a substitute for an auth-pipeline proof
    of MFA completion.
  - The UI is intentionally carrying the compliance cues now, but the
    authoritative source still belongs in the backend/security layer.
- Current frontend handling:
  - `features/admin/users/UsersClient.tsx` makes MFA posture visible before
    save.
  - `features/admin/users/actions.ts` writes `mfa_verified_at` when the role
    requires MFA.
- Affected live surfaces:
  - organization user management
  - privileged role assignment
  - future step-up routes
- Done when:
  - MFA verification is recorded by an authoritative backend flow or function,
    and the UI reads that result instead of simulating verification at
    assignment time.

### 3. DSAR Identity Verification And OTP Flow

- Status: `Critical follow-up`
- Gap:
  - Public DSAR intake is live, and `identity_verified` is visible in privacy
    and grievance workspaces, but the secure verification issuance and consume
    flow is not implemented.
- Why this matters:
  - The portal can collect requests and show verification posture, but a
    regulation-grade rights-request flow still needs a secure identity check.
- Current frontend handling:
  - `app/privacy/request/page.tsx` and
    `features/legal/DataSubjectRequestForm.tsx` create the request.
  - governance views show whether a request is already identity-verified.
- Affected live surfaces:
  - public privacy request page
  - DPO governance workspace
  - grievance governance workspace
- Done when:
  - a secure OTP or equivalent verification mechanism exists and updates the
    underlying DSAR verification state.

### 4. Dedicated Grievance Case Model

- Status: `Critical follow-up`
- Gap:
  - The current schema does not expose a standalone grievance-case table.
- Why this matters:
  - `grievance_officer` now has a real workspace, but it is anchored on
    incidents, escalated DSARs, and consent withdrawals instead of a first-class
    grievance case ledger.
- Current frontend handling:
  - `features/governance/grievances/GrievanceGovernanceView.tsx` uses live
    incident, DSAR, and consent data.
  - dashboard home explains the workaround explicitly instead of inventing fake
    case records.
- Affected live surfaces:
  - grievance governance workspace
  - dashboard home for `grievance_officer`
- Done when:
  - the schema includes a grievance-case model with case status, intake source,
    ownership, escalation, and resolution history.

### 5. Landing Lead Capture Still Needs A Dedicated Booking Contract

- Status: `Critical follow-up`
- Gap:
  - The landing page now writes into the live `leads` table, but the checked-in
    schema is still narrower than the richer public demo-booking form.
  - First name, last name, company, phone, and interest details are currently
    compressed into the `source` field until a dedicated public booking intake
    contract exists.
- Why this matters:
  - The public site is now DB-backed and no longer uses fake success behavior,
    but the schema still needs a cleaner booking/contact model for later
    production hardening.
  - Consent evidence and booking metadata should not remain packed into a
    generic source field long term.
- Current frontend handling:
  - `components/landing/LandingScripts.tsx` submits directly to `leads` via the
    live Supabase client.
  - explicit consent is required before the landing request is saved.
  - public-facing failures now show a safe retry message instead of a fake
    success state.
  - cookie preferences are still stored in `localStorage` on the landing page.
- Affected live surfaces:
  - `/`
  - public cookie banner and demo request form
- Done when:
  - the booking form has a dedicated intake contract or expanded schema, and
    cookie-consent persistence is aligned with the product's consent model.

## Planned Follow-Up

### 6. Canonical Carbon-Credit Schema Needs Confirmation

- Status: `Verification needed`
- Gap:
  - `carbon_credits` is referenced in product language, but it is not confirmed
    in the checked-in dump.
  - The live finance route currently uses `carbon_offsets` and
    `payment_transactions`.
- Why this matters:
  - Product naming and schema naming can drift if the marketplace model is not
    finalized.
- Current frontend handling:
  - `features/finance/carbon-credits/FinanceCarbonCreditsView.tsx` uses the
    existing offset and payment transaction tables.
- Affected live surfaces:
  - `/finance/carbon-credits`
  - executive shortcuts pointing to the credit market lane
- Done when:
  - the canonical carbon-credit data contract is confirmed and the route naming,
    schema naming, and reporting logic all match.

### 7. System Settings Need Real Persistence

- Status: `Planned follow-up`
- Gap:
  - platform-wide settings do not yet have a confirmed persistence layer or
    mutation contract.
- Why this matters:
  - the frontend now shows a live settings posture board, but production
    control settings still need audit-friendly storage, mutation history, and
    enforcement sources.
- Current frontend handling:
  - `features/admin/settings/SystemSettingsView.tsx` now reads live policy,
    incident, backup, session, and rollout posture from the database.
  - The route is intentionally read-only and no longer fakes a save flow.
- Affected live surfaces:
  - `/admin/settings`
- Done when:
  - a backend-backed configuration model exists for system settings, secrets,
    and enforcement switches.

### 8. Tenant Billing And Lifecycle Mutations

- Status: `Planned follow-up`
- Gap:
  - platform tenant oversight is live, but billing and lifecycle mutation
    operations are not finalized.
- Why this matters:
  - the control plane can observe readiness today, but it cannot yet perform the
    full tenant-management lifecycle from the live admin surface.
- Current frontend handling:
  - `features/admin/tenants/AdminTenantsView.tsx` is intentionally read-only for
    those controls.
- Affected live surfaces:
  - `/admin/tenants`
- Done when:
  - billing-state changes, lifecycle transitions, and related audit trails are
    backed by real mutations.

### 9. AI Extraction Needs Intake, Quarantine, And Review Tables

- Status: `Planned follow-up`
- Gap:
  - the UI contract for AI invoice extraction is live, but document upload,
    quarantine, parse job tracking, extracted field staging, and approval write
    paths are not yet wired.
- Why this matters:
  - the compliance-safe user experience is in place, but the actual regulated
    ingestion pipeline still needs its backend contract.
- Current frontend handling:
  - `features/data/ai-extract/AIExtractionWorkbench.tsx` shows disclosure,
    review, and security expectations without pretending uploads already work.
- Affected live surfaces:
  - `/data/ai-extract`
- Done when:
  - uploads, parse results, review decisions, and final posting steps are backed
    by real storage and mutation flows.

### 10. Audit Log Enrichment Fields

- Status: `Planned follow-up`
- Gap:
  - audit guidance calls for richer fields such as IP address,
    device fingerprint, and result/outcome metadata, but those are not yet the
    standard live contract across admin log surfaces.
- Why this matters:
  - the platform already has audit views, but their forensic usefulness depends
    on the backend enriching and storing the fields consistently.
- Current frontend handling:
  - admin log screens are ready to display audit posture without exposing raw
    internal errors.
- Affected live surfaces:
  - `/admin/logs`
  - other future control-plane review screens
- Done when:
  - enriched audit fields are consistently present in the log source and visible
    in the admin ledger.

## Verification Needed Against Future Dumps

### 11. `record_mfa_verification(...)`

- Status: `Verification needed`
- Current state:
  - not found in the checked-in dump.
- Risk:
  - docs or future migrations may refer to it as if it already exists.
- Action later:
  - confirm whether this should exist as a function, replace it with another
    verification flow, or remove references to it.

### 12. `carbon_credits`

- Status: `Verification needed`
- Current state:
  - not found in the checked-in dump.
- Risk:
  - product copy, role routes, and schema assumptions can drift.
- Action later:
  - confirm the canonical object name or add the missing table/view/function in
    a future migration.

## Completion Rule

This file is only "done" when:
- every live workaround listed above is either removed or backed by real DB and
  server support, and
- the checked-in dump, server code, and frontend all tell the same truth.
