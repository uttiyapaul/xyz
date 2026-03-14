import { SystemSettingsView } from "@/features/admin/settings/SystemSettingsView";

/**
 * Route entry stays intentionally thin.
 * Platform system settings behavior belongs to the admin settings feature.
 */
export default function SystemSettingsPage() {
  return <SystemSettingsView />;
}
