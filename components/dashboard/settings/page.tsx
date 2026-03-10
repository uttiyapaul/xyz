// app/dashboard/settings/page.tsx — redirect to profile tab
import { redirect } from "next/navigation";

export default function SettingsPage() {
  redirect("/dashboard/settings/profile");
}