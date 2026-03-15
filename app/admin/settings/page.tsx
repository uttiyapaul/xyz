import { SystemSettingsView } from "@/features/admin/settings/SystemSettingsView";

/**
 * Route entry stays intentionally thin.
 * Platform system settings behavior belongs to the admin settings feature.
 */
export const dynamic = "force-dynamic";

export default function SystemSettingsPage() {
  return <SystemSettingsView />;
}
