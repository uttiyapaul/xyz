# Frontend Contract

Date: 2026-03-14

This project already has a working website. Frontend cleanup must therefore be conservative:

- Align new work to the live database dump and approved role architecture.
- Keep `proxy.ts` as the active request and auth guard.
- Do not remove working routes unless a replacement route is ready in the same PR.
- Remove dead route-like files under `components/` instead of keeping compatibility copies.

## Source Of Truth

Use these in order:

1. Live SQL dump in `.aiassistant/Rules/full_dump.sql`
2. `A2Z_Carbon_Full_Audit_Report_2026.docx` for regulatory and frontend compliance obligations
3. [docs/FRONTEND_AUDIT_2026_ACTIONS.md](./FRONTEND_AUDIT_2026_ACTIONS.md) for frontend-only execution guidance extracted from that audit
4. `carbonA2Z_Role_Architecture.txt`
5. `carbonA2Z_Frontend_Implementation_Plan.md`
6. Current repo code, only where it does not conflict with the above

## Confirmed Live Objects

- `client_organizations`
- `client_legal_entities`
- `client_sites`
- `user_organization_roles`
- `platform_roles`
- `platform_permissions`
- `role_permissions`
- `mfa_enforcement_config`
- `user_sessions`
- `ghg_emission_source_register`
- `activity_data`
- `ghg_monthly_readings`
- `ghg_submissions`
- `ghg_signoff_chain`
- `ghg_documents`
- `data_subject_access_requests`
- `ropa_entries`
- `dpia_register`
- `security_incidents`
- `consent_records`
- `international_data_transfers`
- `verifiers`
- `ghg_verifications`
- `api_keys`
- `webhook_subscriptions`
- `erp_systems`
- `erp_field_mappings`
- `iot_device_registry`
- `iot_raw_readings`
- `v_active_organizations`
- `v_active_sites`
- `v_active_fleet`
- `mv_site_emissions`
- `mv_targets_progress`
- `mv_ai_validation_summary`
- `get_my_annual_emissions()`
- `has_permission(org_id, permission_code)`

## Not Confirmed In Current Dump

These may exist in a newer environment, but they are not present in the checked-in dump and should be treated as backend follow-up items until verified:

- `record_mfa_verification(...)`
- `carbon_credits`

## Immediate Guardrails

- Use `role_id`, not `platform_role_id`
- Read auth claims from JWT `app_metadata`, not `user_metadata`
- Respect `scope_site_ids` and `scope_legal_entity_ids`
- Prefer `useAuth().primaryOrgId`, `siteScopeIds`, and `legalEntityScopeIds` over ad hoc `orgIds[0]` lookups
- Treat `board_report_recipient` as non-interactive
- Keep route-owned files in `app/` only:
- `page.tsx`
- `layout.tsx`
- `loading.tsx`
- `error.tsx`
- `not-found.tsx`
- metadata route files such as `manifest.ts`, `robots.txt`, and `favicon.ico`
- Keep global styles in `styles/`
- Keep feature code, server actions, and client views outside `app/`
- Keep reusable UI in `components/`
- Do not keep duplicate screen implementations in multiple folders just to preserve old paths
- Do not use inline CSS via React `style` props; use CSS modules or shared stylesheet classes instead
- Do not add Supabase GraphQL access in frontend code
- Treat AI output as advisory until the UI shows confidence, attribution, and human-review state
- Design all approval and verifier flows so SoD remains visible in the UI, not just hidden in backend logic
- Mask secrets by default in the UI; full reveal must require explicit user action
- All user-facing errors must provide a clear next step and must not expose raw provider or model details

## Audit Priority Order

When there is a conflict between speed and completeness, use this frontend-only remediation order from the 2026 audit:

1. Auth/session UX compatible with HttpOnly cookie transport
2. Session inactivity lock and sensitive-content blur
3. CSP-safe frontend patterns and removal of inline styles
4. AI disclosure, attribution, and human-review markers
5. Sensitive data masking and reveal controls
6. Reduced-motion and WCAG AA cleanup

## Code Documentation Rule

- Every non-trivial file we add or materially change should include enough in-code explanation for the next developer or agent to understand its purpose quickly.
- Add short descriptions for non-obvious components, server actions, utilities, and data flows.
- Document important assumptions, scope rules, side effects, and why a decision exists when that context is not obvious from the code alone.
- Prefer concise file headers, function descriptions, and targeted inline comments over long comment blocks.
- Do not add filler comments that only restate the code literally; comments must explain intent, behavior, constraints, or integration details.
- Whenever a role gains a new live route, KPI, menu item, shortcut, guardrail, or restriction, update [docs/ActiveRoleListandFeatures.md](./ActiveRoleListandFeatures.md) in the same PR so training and audit documentation stays current.
