import { AuditLogsView } from "@/features/admin/logs/AuditLogsView";

export const dynamic = "force-dynamic";

/**
 * Thin route entry so the admin logs feature owns service-role data loading and
 * deployment-safe error handling.
 */
export default function AuditLogsPage() {
  return <AuditLogsView />;
}
