"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import shellStyles from "@/components/layout/ShellLayout.module.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ToastContainer } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { canAccessPlatformAdmin, getUserPrimaryRole } from "@/lib/auth/roles";

/**
 * Admin layout is one of the first PR2 touchpoints:
 * route access is now derived from the canonical role catalog instead of a
 * loose boolean that can drift away from the actual role model.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const canAccessAdminRoutes = user ? canAccessPlatformAdmin(getUserPrimaryRole(user)) : false;

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
      return;
    }

    if (!isLoading && user && !canAccessAdminRoutes) {
      router.replace("/dashboard");
    }
  }, [canAccessAdminRoutes, isLoading, router, user]);

  if (isLoading || !canAccessAdminRoutes) {
    return null;
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
