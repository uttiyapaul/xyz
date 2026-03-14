import { SourceRegisterView } from "@/features/dashboard/sources/SourceRegisterView";

/**
 * Route entry stays intentionally thin.
 * The source-register feature owns the live register UI and insert behavior.
 */
export default function SourcesPage() {
  return <SourceRegisterView />;
}
