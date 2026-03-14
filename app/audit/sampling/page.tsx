import { AuditSamplingView } from "@/features/audit/AuditSamplingView";

/**
 * Thin route entry: the audit feature owns live sampling posture and evidence density.
 */
export default function AuditSamplingPage() {
  return <AuditSamplingView />;
}
