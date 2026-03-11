// app/(admin)/layout.tsx
// Route group (admin) isolates platform admin routes.
// The parentheses mean (admin) does NOT appear in the URL — /admin works directly.
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ToastContainer } from "@/components/ui/Toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isPlatformAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) { router.replace("/auth/login"); return; }
    if (!isLoading && user && !isPlatformAdmin) {
      // Non-admins get silently redirected — do not reveal admin route exists
      router.replace("/dashboard");
    }
  }, [isLoading, user, isPlatformAdmin, router]);

  if (isLoading || !isPlatformAdmin) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#050508" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Admin indicator */}
        <div style={{ background: "#7C3AED", padding: "4px 20px",
          fontSize: "11px", color: "#fff", fontWeight: "600",
          letterSpacing: "1px", textAlign: "center" }}>
          ⚠ PLATFORM ADMIN MODE
        </div>
        <TopBar />
        <main style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}