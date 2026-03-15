import { AdminHealthView } from "@/features/admin/health/AdminHealthView";

export const dynamic = "force-dynamic";

/**
 * Thin route entry for the platform health snapshot.
 */
export default function AdminHealthPage() {
  return <AdminHealthView />;
}
