// app/dashboard/settings/page.tsx — redirect to profile tab
// Legacy route prototype kept during migration out of components/page.tsx naming.
import { redirect } from "next/navigation";

export default function SettingsPage() {
  redirect("/dashboard/settings/profile");
}
