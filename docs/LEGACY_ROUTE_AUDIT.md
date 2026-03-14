# Legacy Route Audit

Date: 2026-03-14

The route-like files that lived under `components/` have been renamed out of `page.tsx` naming so they no longer look like App Router entries.

## Completed In PR1

These legacy files were preserved but renamed to non-route filenames:

- `components/cbam-calculator/LegacyCalculatorRouteView.tsx`
- `components/dashboard/ai/LegacyAIValidationView.tsx`
- `components/dashboard/cbam/LegacyCBAMView.tsx`
- `components/dashboard/factors/LegacyFactorsView.tsx`
- `components/dashboard/inventory/LegacyInventoryView.tsx`
- `components/dashboard/settings/LegacySettingsRedirectView.tsx`
- `components/dashboard/settings/api-keys/LegacyApiKeysView.tsx`
- `components/dashboard/settings/profile/LegacyProfileView.tsx`
- `components/dashboard/settings/security/LegacySecurityView.tsx`
- `components/dashboard/settings/sessions/LegacySessionsView.tsx`

## Migration Rule

When one of these becomes live work:

1. Move route entry code into `app/.../page.tsx`
2. Rename reusable content to a non-route filename such as `View.tsx`
3. Keep shared UI in `components/`
4. Keep data access out of presentational view files where practical

## Current Priority

Lower priority than the already-fixed legacy routes in:

- `app/admin/page.tsx`
- `app/dashboard/reports/page.tsx`
- `app/dashboard/sources/page.tsx`
- `app/dashboard/activity/page.tsx`
