import { AccountSettingsView } from "@/features/dashboard/settings/AccountSettingsView";

/**
 * Route entry stays intentionally thin.
 * Personal account settings behavior belongs to the dashboard settings feature.
 */
export default function PersonalSettingsPage() {
  return <AccountSettingsView />;
}
