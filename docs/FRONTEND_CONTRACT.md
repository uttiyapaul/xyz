# Frontend Contract

Date: 2026-03-14

This project already has a working website. Frontend cleanup must therefore be conservative:

- Align new work to the live database dump and approved role architecture.
- Keep `proxy.ts` as the active request and auth guard.
- Do not remove working routes unless a replacement route is ready in the same PR.
- Treat legacy route-like files under `components/` as migration targets, not emergency deletions.

## Source Of Truth

Use these in order:

1. Live SQL dump in `.aiassistant/Rules/full_dump.sql`
2. `carbonA2Z_Role_Architecture.txt`
3. `carbonA2Z_Frontend_Implementation_Plan.md`
4. Current repo code, only where it does not conflict with the above

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
- Treat `board_report_recipient` as non-interactive
- Keep route files in `app/` only:
- `page.tsx`
- `layout.tsx`
- `loading.tsx`
- `error.tsx`
- Keep reusable UI in `components/`
- Do not keep duplicate screen implementations in both `app/` and `components/`
