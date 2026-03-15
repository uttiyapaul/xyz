import { AdminRbacView } from "@/features/admin/rbac/AdminRbacView";

export const dynamic = "force-dynamic";

/**
 * Thin route entry for the RBAC oversight workspace.
 */
export default function AdminRbacPage() {
  return <AdminRbacView />;
}
