// app/auth/forgot-password/page.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address"); return;
    }
    setLoading(true);
    // Always show success to prevent email enumeration
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    setSent(true);
  }

  if (sent) return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "40px", marginBottom: "16px" }}>✉</div>
      <h2 style={{ color: "#FAFAF8", fontSize: "18px", margin: "0 0 12px" }}>
        Check your email
      </h2>
      <p style={{ color: "#6B7280", fontSize: "13px", lineHeight: "1.6" }}>
        If an account exists for <strong style={{ color: "#FAFAF8" }}>{email}</strong>,
        you will receive a password reset link shortly.
      </p>
      <Link href="/auth/login" style={{ display: "inline-block", marginTop: "24px",
        color: "#F59E0B", fontSize: "13px", textDecoration: "none" }}>
        Back to sign in
      </Link>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#FAFAF8", margin: "0 0 6px" }}>
        Reset your password
      </h1>
      <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "28px" }}>
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {error && (
        <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)", borderRadius: "6px",
          marginBottom: "16px", fontSize: "13px", color: "#EF4444" }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "11px", color: "#6B7280", display: "block",
          marginBottom: "6px" }}>EMAIL ADDRESS</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="you@company.com" autoComplete="email" disabled={loading}
          style={{ width: "100%", padding: "10px 12px", background: "#07070E",
            border: "1px solid #1A1A24", borderRadius: "6px",
            color: "#FAFAF8", fontSize: "14px", outline: "none" }} />
      </div>

      <button onClick={handleSubmit} disabled={loading} style={{
        width: "100%", padding: "12px", background: loading ? "rgba(245,158,11,0.7)" : "#F59E0B",
        border: "none", borderRadius: "6px", color: "#000",
        fontSize: "14px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer",
      }}>
        {loading ? "Sending…" : "Send reset link"}
      </button>

      <p style={{ marginTop: "20px", fontSize: "13px", color: "#6B7280", textAlign: "center" }}>
        <Link href="/auth/login" style={{ color: "#F59E0B", textDecoration: "none" }}>
          Back to sign in
        </Link>
      </p>
    </div>
  );
}