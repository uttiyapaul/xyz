import { AccountSettingsView } from "@/features/dashboard/settings/AccountSettingsView";

/**
 * Profile route is kept explicit because the top-bar account menu already
 * points here. Reusing the feature view avoids another placeholder route.
 */
export default function ProfileSettingsPage() {
  return <AccountSettingsView />;
}
