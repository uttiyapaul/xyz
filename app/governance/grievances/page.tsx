import { GrievanceGovernanceView } from "@/features/governance/grievances/GrievanceGovernanceView";

/**
 * Thin route entry for governance incident and escalation oversight.
 */
export const dynamic = "force-dynamic";

export default function GovernanceGrievancesPage() {
  return <GrievanceGovernanceView />;
}
