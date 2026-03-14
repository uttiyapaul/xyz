import { AuditRfisView } from "@/features/audit/AuditRfisView";

/**
 * Thin route entry: the audit feature owns the scoped RFI workspace.
 */
export default function AuditRfisPage() {
  return <AuditRfisView />;
}
