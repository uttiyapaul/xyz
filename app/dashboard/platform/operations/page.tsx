import { PlatformOperationsView } from "@/features/platform/operations/PlatformOperationsView";

export const dynamic = "force-dynamic";

/**
 * Thin route entry for the platform operations workspace.
 */
export default function PlatformOperationsPage() {
  return <PlatformOperationsView />;
}
