// app/auth/layout.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, redirect away from auth pages
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh", background: "#050508",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "24px",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Brand header */}
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "12px",
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px", fontSize: "22px",
        }}>
          ◈
        </div>
        <div style={{ fontSize: "18px", fontWeight: "700", color: "#FAFAF8",
          letterSpacing: "-0.3px" }}>
          CarbonIQ
        </div>
        <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px",
          letterSpacing: "1.5px" }}>
          GHG ACCOUNTING PLATFORM
        </div>
      </div>

      {/* Auth card */}
      <div style={{
        width: "100%", maxWidth: 420,
        background: "#0D0D14", border: "1px solid #1A1A24",
        borderRadius: "12px", padding: "32px",
      }}>
        {children}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "24px", fontSize: "11px", color: "#374151",
        textAlign: "center" }}>
        ISO 14064 · GHG Protocol · CBAM Compliant
      </div>
    </div>
  );
}