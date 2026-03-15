import { PrivacyGovernanceView } from "@/features/governance/privacy/PrivacyGovernanceView";

/**
 * Thin route entry for the DPO privacy operations workspace.
 */
export const dynamic = "force-dynamic";

export default function GovernancePrivacyPage() {
  return <PrivacyGovernanceView />;
}
