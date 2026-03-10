// components/layout/TopBar.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface TopBarProps {
  onSidebarToggle?: () => void;
}

export function TopBar({ onSidebarToggle }: TopBarProps) {
  const router = useRouter();
  const { user, roles } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signing, setSigning]   = useState(false);

  async function handleSignOut() {
    setSigning(true);
    await supabase.auth.signOut();
    router.replace("/auth/login");
  }

  const displayName = (user?.user_metadata?.full_name as string) || user?.email || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const primaryRole = roles[0] ?? "user";
  const roleLabel = primaryRole.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <header style={{
      height: 56, background: "#07070E", borderBottom: "1px solid #111120",
      display: "flex", alignItems: "center", padding: "0 20px",
      justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
    }}>
      {/* Left: hamburger */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {onSidebarToggle && (
          <button onClick={onSidebarToggle} aria-label="Toggle sidebar"
            style={{ background: "none", border: "none", color: "#6B7280",
              cursor: "pointer", fontSize: "16px", padding: "4px" }}>
            ☰
          </button>
        )}
      </div>

      {/* Right: user menu */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setMenuOpen(o => !o)}
          aria-label="User menu" aria-expanded={menuOpen}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "transparent", border: "none", cursor: "pointer",
            padding: "6px 8px", borderRadius: "6px",
          }}>
          {/* Avatar */}
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: "700", color: "#F59E0B",
          }}>
            {initials}
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "13px", color: "#FAFAF8", fontWeight: "500",
              maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap" }}>
              {displayName}
            </div>
            <div style={{ fontSize: "10px", color: "#6B7280", textTransform: "capitalize" }}>
              {roleLabel}
            </div>
          </div>
          <span style={{ color: "#6B7280", fontSize: "10px" }}>▾</span>
        </button>

        {menuOpen && (
          <>
            {/* Backdrop */}
            <div onClick={() => setMenuOpen(false)} style={{
              position: "fixed", inset: 0, zIndex: 40,
            }} aria-hidden="true" />
            {/* Dropdown */}
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 4px)",
              background: "#0D0D14", border: "1px solid #1A1A24",
              borderRadius: "8px", minWidth: 180, zIndex: 50,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              overflow: "hidden",
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #1A1A24" }}>
                <div style={{ fontSize: "12px", color: "#FAFAF8", fontWeight: "600",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.email}
                </div>
                <div style={{ fontSize: "10px", color: "#6B7280", marginTop: "2px" }}>
                  {roleLabel}
                </div>
              </div>

              {[
                { label: "Profile", href: "/dashboard/settings/profile" },
                { label: "Security", href: "/dashboard/settings/security" },
                { label: "Settings", href: "/dashboard/settings" },
              ].map(({ label, href }) => (
                <button key={href} onClick={() => { setMenuOpen(false); router.push(href); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "10px 16px", background: "none", border: "none",
                    color: "#D1D5DB", fontSize: "13px", cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#111120")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                  {label}
                </button>
              ))}

              <div style={{ borderTop: "1px solid #1A1A24" }}>
                <button onClick={handleSignOut} disabled={signing}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "10px 16px", background: "none", border: "none",
                    color: signing ? "#6B7280" : "#EF4444", fontSize: "13px",
                    cursor: signing ? "not-allowed" : "pointer",
                  }}>
                  {signing ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}