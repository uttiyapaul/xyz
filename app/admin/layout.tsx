"use client";

import shellStyles from "@/components/layout/ShellLayout.module.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { OpaqueNotFoundView } from "@/components/state/OpaqueNotFoundView";
import { TopBar } from "@/components/layout/TopBar";
import { ToastContainer } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { canAccessPlatformAdmin, getUserPrimaryRole } from "@/lib/auth/roles";

/**
 * Admin layout is one of the first PR2 touchpoints:
 * route access is now derived from the canonical role catalog instead of a
 * loose boolean that can drift away from the actual role model.
 *
 * Keep this fallback opaque. The request proxy already enforces access at the
 * edge, but the client layout must not undo route-enumeration protection by
 * redirecting blocked users to a different page.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const canAccessAdminRoutes = user ? canAccessPlatformAdmin(getUserPrimaryRole(user)) : false;

  if (isLoading) {
    return null;
  }

  if (!user || !canAccessAdminRoutes) {
    return <OpaqueNotFoundView />;
  }

  return (
    <div className={shellStyles.root}>
      <Sidebar />
      <div className={shellStyles.column}>
        <div className={shellStyles.adminBanner}>PLATFORM ADMIN MODE</div>
        <TopBar />
        <main className={`${shellStyles.main} ${shellStyles.mainPadded}`}>{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}
