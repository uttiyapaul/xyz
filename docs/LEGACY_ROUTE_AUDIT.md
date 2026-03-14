# Legacy Route Audit

Date: 2026-03-14

These files look like route entry points because they are named `page.tsx`, but they currently live under `components/` and are not part of the App Router tree.

## Keep For Now

Do not delete these in a cleanup-only PR unless they are first moved, imported, or replaced intentionally.

- `components/cbam-calculator/page.tsx`
- `components/dashboard/ai/page.tsx`
- `components/dashboard/cbam/page.tsx`
- `components/dashboard/factors/page.tsx`
- `components/dashboard/inventory/page.tsx`
- `components/dashboard/settings/page.tsx`
- `components/dashboard/settings/api-keys/page.tsx`
- `components/dashboard/settings/profile/page.tsx`
- `components/dashboard/settings/security/page.tsx`
- `components/dashboard/settings/sessions/page.tsx`

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
