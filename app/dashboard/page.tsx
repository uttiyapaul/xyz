import { DashboardHomeView } from "@/features/dashboard/home/DashboardHomeView";

/**
 * Route entry stays intentionally thin.
 * The dashboard feature owns role routing so auth hardening can evolve there.
 */
export default function DashboardPage() {
  return <DashboardHomeView />;
}
