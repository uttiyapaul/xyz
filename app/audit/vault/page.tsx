import { AuditVaultView } from "@/features/audit/AuditVaultView";

/**
 * Thin route entry: the audit feature owns the assurance vault experience.
 */
export default function AuditVaultPage() {
  return <AuditVaultView />;
}
