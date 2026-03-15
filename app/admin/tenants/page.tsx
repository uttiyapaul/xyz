import { AdminTenantsView } from "@/features/admin/tenants/AdminTenantsView";

export const dynamic = "force-dynamic";

/**
 * Thin route entry for platform tenant oversight.
 */
export default function AdminTenantsPage() {
  return <AdminTenantsView />;
}
