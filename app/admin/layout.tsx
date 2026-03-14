"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
    <div style={{ display: "flex", minHeight: "100vh", background: "#050508" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div
          style={{
            background: "#7C3AED",
            padding: "4px 20px",
            fontSize: "11px",
            color: "#fff",
            fontWeight: "600",
            letterSpacing: "1px",
            textAlign: "center",
          }}
        >
          PLATFORM ADMIN MODE
        </div>
        <TopBar />
        <main style={{ flex: 1, overflow: "auto", padding: "24px" }}>{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}
