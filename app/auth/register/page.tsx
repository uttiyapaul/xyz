// app/auth/register/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  background: "#07070E", border: "1px solid #1A1A24",
  borderRadius: "6px", color: "#FAFAF8", fontSize: "14px", outline: "none",
};

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);

  function validate(): string | null {
    if (!fullName.trim()) return "Full name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Valid email required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    if (password !== confirm) return "Passwords do not match";
    return null;
  }

  async function handleRegister() {
    setError(null);
    const ve = validate();
    if (ve) { setError(ve); return; }
    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });

    setLoading(false);
    if (authError) { setError(authError.message); return; }
    setSuccess(true);
  }

  if (success) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>✉</div>
        <h2 style={{ color: "#FAFAF8", fontSize: "18px", marginBottom: "12px" }}>
          Check your email
        </h2>
        <p style={{ color: "#6B7280", fontSize: "13px", lineHeight: "1.6" }}>
          We sent a confirmation link to <strong style={{ color: "#FAFAF8" }}>{email}</strong>.
          Click it to activate your account.
        </p>
        <Link href="/auth/login" style={{ display: "inline-block", marginTop: "24px",
          color: "#F59E0B", fontSize: "13px", textDecoration: "none" }}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#FAFAF8",
        margin: "0 0 6px" }}>
        Create your account
      </h1>
      <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "28px" }}>
        Request access to the CarbonIQ platform
      </p>

      {error && (
        <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)", borderRadius: "6px",
          marginBottom: "16px", fontSize: "13px", color: "#EF4444" }}>
          {error}
        </div>
      )}

      {[
        { label: "FULL NAME", value: fullName, set: setFullName, type: "text", placeholder: "Jane Smith", ac: "name" },
        { label: "EMAIL ADDRESS", value: email, set: setEmail, type: "email", placeholder: "jane@company.com", ac: "email" },
        { label: "PASSWORD", value: password, set: setPassword, type: "password", placeholder: "Min 8 chars, 1 uppercase, 1 number", ac: "new-password" },
        { label: "CONFIRM PASSWORD", value: confirm, set: setConfirm, type: "password", placeholder: "Repeat password", ac: "new-password" },
      ].map(({ label, value, set, type, placeholder, ac }) => (
        <div key={label} style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "11px", color: "#6B7280", display: "block",
            marginBottom: "6px", letterSpacing: "0.5px" }}>
            {label}
          </label>
          <input type={type} value={value} onChange={e => set(e.target.value)}
            placeholder={placeholder} autoComplete={ac} disabled={loading}
            onKeyDown={e => e.key === "Enter" && handleRegister()}
            style={inputStyle} />
        </div>
      ))}

      <p style={{ fontSize: "11px", color: "#4B5563", marginBottom: "20px",
        lineHeight: "1.5" }}>
        By registering you agree to our{" "}
        <Link href="/privacy" style={{ color: "#F59E0B", textDecoration: "none" }}>Privacy Policy</Link>
        {" "}and{" "}
        <Link href="/terms" style={{ color: "#F59E0B", textDecoration: "none" }}>Terms of Service</Link>.
      </p>

      <button onClick={handleRegister} disabled={loading} style={{
        width: "100%", padding: "12px",
        background: loading ? "rgba(245,158,11,0.7)" : "#F59E0B",
        border: "none", borderRadius: "6px", color: "#000",
        fontSize: "14px", fontWeight: "600",
        cursor: loading ? "not-allowed" : "pointer",
      }}>
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p style={{ marginTop: "20px", fontSize: "13px", color: "#6B7280", textAlign: "center" }}>
        Already have an account?{" "}
        <Link href="/auth/login" style={{ color: "#F59E0B", textDecoration: "none" }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}