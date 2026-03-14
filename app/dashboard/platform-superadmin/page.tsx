import { PlatformSuperAdminDashboardView } from "@/features/dashboard/platform-superadmin/PlatformSuperAdminDashboardView";

/**
 * Route entry stays intentionally thin.
 * Platform dashboard behavior lives in the feature so the app tree only owns routing.
 */
export default function PlatformSuperAdminPage() {
  return <PlatformSuperAdminDashboardView />;
}
