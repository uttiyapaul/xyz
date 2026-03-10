// app/auth/reset-password/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase puts access_token in URL hash on redirect from email link
    // getSession will pick it up automatically
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
      else setError("This reset link is invalid or has expired. Please request a new one.");
    });
  }, []);

  async function handleReset() {
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!/[A-Z]/.test(password)) { setError("Must contain at least one uppercase letter"); return; }
    if (!/[0-9]/.test(password)) { setError("Must contain at least one number"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) { setError(updateError.message); return; }
    setSuccess(true);
    setTimeout(() => router.replace("/auth/login"), 3000);
  }

  if (success) return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "40px", marginBottom: "16px" }}>✓</div>
      <h2 style={{ color: "#22C55E", fontSize: "18px", margin: "0 0 12px" }}>
        Password updated
      </h2>
      <p style={{ color: "#6B7280", fontSize: "13px" }}>
        Redirecting you to sign in…
      </p>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#FAFAF8", margin: "0 0 6px" }}>
        Set new password
      </h1>
      <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "28px" }}>
        Choose a strong password for your account.
      </p>

      {error && (
        <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)", borderRadius: "6px",
          marginBottom: "16px", fontSize: "13px", color: "#EF4444" }}>
          {error}
          {!sessionReady && (
            <div style={{ marginTop: "8px" }}>
              <Link href="/auth/forgot-password" style={{ color: "#F59E0B", textDecoration: "none" }}>
                Request a new link →
              </Link>
            </div>
          )}
        </div>
      )}

      {sessionReady && (
        <>
          {[
            { label: "NEW PASSWORD", value: password, set: setPassword, placeholder: "Min 8 chars" },
            { label: "CONFIRM PASSWORD", value: confirm, set: setConfirm, placeholder: "Repeat password" },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label} style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "11px", color: "#6B7280", display: "block", marginBottom: "6px" }}>
                {label}
              </label>
              <input type="password" value={value} onChange={e => set(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleReset()}
                placeholder={placeholder} disabled={loading}
                style={{ width: "100%", padding: "10px 12px", background: "#07070E",
                  border: "1px solid #1A1A24", borderRadius: "6px",
                  color: "#FAFAF8", fontSize: "14px", outline: "none" }} />
            </div>
          ))}
          <button onClick={handleReset} disabled={loading} style={{
            width: "100%", padding: "12px",
            background: loading ? "rgba(245,158,11,0.7)" : "#F59E0B",
            border: "none", borderRadius: "6px", color: "#000",
            fontSize: "14px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer",
          }}>
            {loading ? "Updating…" : "Update password"}
          </button>
        </>
      )}
    </div>
  );
}