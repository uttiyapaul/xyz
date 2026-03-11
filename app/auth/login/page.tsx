// app/auth/login/page.tsx
"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { getUserPrimaryRole, isEmailVerified, getRoleRoute } from "@/lib/auth/roles";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// Input style helper
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  background: "#07070E", border: "1px solid #1A1A24",
  borderRadius: "6px", color: "#FAFAF8", fontSize: "14px",
  outline: "none", transition: "border-color 0.15s",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  // Validate redirect param — only allow relative paths (prevents open redirect)
  function safeRedirect(raw: string | null): string {
    if (!raw) return "/dashboard";
    // Must start with / and not be a protocol-relative URL
    if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
    return "/dashboard";
  }

  // Client-side validation before hitting Supabase
  function validate(): string | null {
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  }

  const handleLogin = useCallback(async () => {
    setError(null);

    // Check lockout
    if (lockedUntil && Date.now() < lockedUntil) {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 60000);
      setError(`Too many attempts. Try again in ${remaining} minute${remaining !== 1 ? "s" : ""}.`);
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (authError) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS);
        setError("Too many failed attempts. Account locked for 15 minutes.");
      } else {
        // Do NOT reveal whether email or password is wrong — generic message
        setError(`Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts !== 1 ? "s" : ""} remaining.`);
      }
      return;
    }

    // SUCCESS — check email verification first
    const user = data.session?.user;

    if (!user) {
      setError("Authentication failed. Please try again.");
      return;
    }

    // Check email verification
    if (!isEmailVerified(user)) {
      router.replace("/auth/verify-email");
      return;
    }

    const role = getUserPrimaryRole(user);
    const dashboardRoute = getRoleRoute(role);

    // Check for custom redirect param
    const redirect = safeRedirect(searchParams.get("redirect"));

    // Use window.location.replace to avoid history issues
    if (redirect !== "/dashboard") {
      window.location.replace(redirect);
    } else {
      window.location.replace(dashboardRoute);
    }
  }, [email, password, attempts, lockedUntil, searchParams]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  return (
    <div>
      <h1 style={{
        fontSize: "20px", fontWeight: "700", color: "#FAFAF8",
        marginBottom: "6px", margin: "0 0 6px"
      }}>
        Sign in to your account
      </h1>
      <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "28px" }}>
        Your A2Z Carbon Solutions
      </p>

      {error && (
        <div style={{
          padding: "10px 14px", background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)", borderRadius: "6px",
          marginBottom: "16px", fontSize: "13px", color: "#EF4444",
        }}>
          {error}
        </div>
      )}

      {/* Email */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{
          fontSize: "11px", color: "#6B7280", display: "block",
          marginBottom: "6px", letterSpacing: "0.5px"
        }}>
          EMAIL ADDRESS
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="you@company.com"
          autoComplete="email"
          autoFocus
          disabled={loading || isLocked}
          style={{ ...inputStyle, borderColor: error && !email ? "#EF4444" : "#1A1A24" }}
          aria-label="Email address"
          aria-required="true"
        />
      </div>

      {/* Password */}
      <div style={{ marginBottom: "8px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "6px"
        }}>
          <label style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px" }}>
            PASSWORD
          </label>
          <Link href="/auth/forgot-password" style={{
            fontSize: "12px", color: "#F59E0B", textDecoration: "none",
          }}>
            Forgot password?
          </Link>
        </div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={loading || isLocked}
          style={inputStyle}
          aria-label="Password"
          aria-required="true"
        />
      </div>

      {/* Submit — NOT a <form> */}
      <button
        onClick={handleLogin}
        disabled={loading || isLocked}
        style={{
          width: "100%", padding: "12px",
          background: isLocked ? "#1A1A24" : loading ? "rgba(245,158,11,0.7)" : "#F59E0B",
          border: "none", borderRadius: "6px",
          color: isLocked ? "#6B7280" : "#000",
          fontSize: "14px", fontWeight: "600",
          cursor: loading || isLocked ? "not-allowed" : "pointer",
          marginTop: "20px", transition: "background 0.15s",
        }}
        aria-label="Sign in"
      >
        {loading ? "Signing in…" : isLocked ? "Account locked" : "Sign in"}
      </button>

      <p style={{
        marginTop: "20px", fontSize: "13px", color: "#6B7280",
        textAlign: "center"
      }}>
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" style={{ color: "#F59E0B", textDecoration: "none" }}>
          Request access
        </Link>
      </p>
    </div>
  );
}