// app/dashboard/layout.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ToastContainer } from "@/components/ui/Toast";

// Session idle timeouts (ms) — audit requirement
const IDLE_TIMEOUT_ADMIN = 30 * 60 * 1000;  // 30 min for admin/consultant
const IDLE_TIMEOUT_STANDARD = 60 * 60 * 1000; // 60 min for others
const ADMIN_ROLES = ["platform_admin", "platform_superadmin", "consultant_lead",
  "consultant_analyst", "platform_support"];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, user, roles } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine idle timeout based on user role
  const idleTimeoutMs = roles.some(r => ADMIN_ROLES.includes(r))
    ? IDLE_TIMEOUT_ADMIN
    : IDLE_TIMEOUT_STANDARD;
  const warningMs = idleTimeoutMs - 2 * 60 * 1000; // warn 2 min before logout

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/auth/login?reason=idle");
  }, [router]);

  const resetIdleTimer = useCallback(() => {
    setShowIdleWarning(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    warningTimer.current = setTimeout(() => setShowIdleWarning(true), warningMs);
    idleTimer.current = setTimeout(logout, idleTimeoutMs);
  }, [idleTimeoutMs, warningMs, logout]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [isLoading, user, router]);

  // Idle detection
  useEffect(() => {
    if (!user) return;
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer(); // start timer on mount

    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdleTimer));
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, [user, resetIdleTimer]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#050508",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 36, height: 36, border: "2px solid #1A1A24",
            borderTopColor: "#F59E0B", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
          }} />
          <div style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "2px" }}>LOADING</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!user) return null; // Redirect in progress

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#050508" }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column",
        minWidth: 0, overflow: "hidden" }}>
        <TopBar onSidebarToggle={() => setSidebarCollapsed(c => !c)} />

        <main style={{ flex: 1, overflow: "auto", padding: "24px" }}
          id="main-content" role="main">
          {children}
        </main>
      </div>

      <ToastContainer />

      {/* Idle warning banner */}
      {showIdleWarning && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9998,
          background: "rgba(245,158,11,0.95)", padding: "12px 24px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
        }} role="alert">
          <span style={{ color: "#000", fontSize: "14px", fontWeight: "600" }}>
            ⚠ Session expiring in 2 minutes due to inactivity.
          </span>
          <button onClick={resetIdleTimer} style={{
            padding: "6px 16px", background: "#000", border: "none",
            borderRadius: "4px", color: "#F59E0B", fontSize: "13px",
            cursor: "pointer", fontWeight: "600",
          }}>
            Stay signed in
          </button>
        </div>
      )}
    </div>
  );
}