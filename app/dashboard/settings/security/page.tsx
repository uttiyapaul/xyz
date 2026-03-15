import { SecuritySettingsView } from "@/features/dashboard/settings/SecuritySettingsView";

/**
 * Thin route entry for personal security posture, session management, and the
 * frontend inactivity-lock policy.
 */
export default function SecuritySettingsPage() {
  return <SecuritySettingsView />;
}
