# Frontend Audit Actions 2026

Date: 2026-03-15

Source: `A2Z_Carbon_Full_Audit_Report_2026.docx`

This note is a frontend-only extraction of the March 15, 2026 audit report.
Database, infrastructure, secrets, SIEM, and other backend items are tracked
elsewhere. This file exists so future frontend work stays aligned to the latest
regulatory and audit guidance without mixing in non-frontend remediation.

## Build Now

These items are frontend-owned or frontend-led and should shape all upcoming UI work.

### Critical

- Use cookie-based auth assumptions only. Frontend code must not rely on `localStorage` or `sessionStorage` for JWT persistence. Session state should assume HttpOnly cookie transport and server-aware hydration.
- Keep `proxy.ts` as the request guard and design the UI around privileged-route step-up flows rather than client-only trust.
- Preserve SoD boundaries in UX:
  - `data_reviewer` and `data_approver` must remain distinct approval experiences.
  - verifier roles must not reuse operational approval surfaces.
  - lifecycle roles remain non-interactive.

### High

- Implement a 15-minute inactivity session lock in the frontend shell:
  - blur sensitive content
  - block interaction
  - require re-authentication
  - keep the experience ready for server-side enforcement later
- Upgrade CSP-compatible frontend patterns:
  - no inline scripts
  - no inline styles
  - keep dynamic script usage compatible with nonce + future `strict-dynamic`
- Do not surface raw backend, model, token, or provider errors to end users.
  Every error state must end with a clear resolution path.
- Sensitive secret displays must be masked by default:
  - API keys show prefix only
  - full reveal requires explicit user action
  - clipboard flows should be designed for timed clearing
- Keep AI-assisted screens compliant:
  - show confidence level
  - show source attribution
  - show human-reviewed status
  - do not present AI output as authoritative by default
- Frontend data access must not use Supabase GraphQL directly.
  Use Supabase JS with RLS, typed RPC calls, or Next.js server actions only.

### Medium

- Remove remaining React `style={{}}` usage except for truly computed visual values.
- Enforce CSS variable tokens for colors, spacing, type, radius, and shadow usage.
  Do not add raw hex values or ad hoc spacing in component files.
- Respect `prefers-reduced-motion` and ensure critical flows work without animation.
- Build toward WCAG 2.1 AA on all production screens.
- Keep TypeScript strict and avoid `any` unless documented and justified.
- Refactor oversized files. New or heavily touched component files should stay under 200 lines where practical.

## Needs Backend Support Later

These are frontend-relevant, but final compliance depends on backend or infrastructure work that will be handled later.

- Global MFA enforcement for privileged roles. Frontend should prepare step-up and blocked-state UX, but true enforcement belongs at the request layer.
- Full HttpOnly cookie migration confirmation. Frontend should stop assuming token storage access, but backend/session transport owns the final control.
- DSAR OTP verification flow. Frontend can design the verification screens, but the secure verification mechanism depends on backend support.
- AI PII minimization and human-review enforcement. Frontend can expose disclosure/status UI, but backend must guarantee the underlying controls.
- Audit log enrichment (`ip_address`, `device_fingerprint`, `result`). Frontend can prepare display structure once the backend ships those fields.
- Lead PII retention, ERP credential expiry alerts, and other retention jobs are backend-owned, though future admin screens may expose their state.

## Mandatory Frontend Rules Derived From The Audit

- No inline CSS in component files.
- No hardcoded secrets or secret-like values in client code.
- No raw GraphQL frontend usage.
- No UI that bypasses SoD logic for convenience.
- No AI result presented without confidence and review context.
- No secret reveal without an explicit reveal flow.
- No new screen without accessible error, loading, and empty states.

## Immediate Development Order

1. Finish removing inline styles and move shared styling to CSS modules or tokenized stylesheets.
2. Build the session-lock shell and re-auth prompt.
3. Add AI result disclosure primitives that all AI-assisted screens can reuse.
4. Add secret-masking/reveal primitives for API keys and similar values.
5. Add reduced-motion and accessibility cleanup across dashboard and auth shells.
6. Keep all new role dashboards and admin surfaces aligned to SoD and scope-aware UX.
