"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import styles from "@/features/auth/AuthScreen.module.css";
import { isEmailVerified } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase/client";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function joinClasses(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

/**
 * Login needs both submit-time auth and mount-time session recovery.
 * The latter prevents users from being stranded on the login screen when a
 * valid session already exists and a remount is the only thing that wakes it up.
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  function safeRedirect(raw: string | null): string {
    if (!raw) {
      return "/dashboard";
    }

    if (raw.startsWith("/") && !raw.startsWith("//")) {
      return raw;
    }

    return "/dashboard";
  }

  function validate(): string | null {
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  }

  const redirectToDestination = useCallback(
    (session: Session | null) => {
      const user = session?.user;

      if (!user) {
        return;
      }

      if (!isEmailVerified(user)) {
        router.replace("/auth/verify-email");
        return;
      }

      const redirect = safeRedirect(searchParams.get("redirect"));
      window.location.replace(redirect !== "/dashboard" ? redirect : "/dashboard");
    },
    [router, searchParams],
  );

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) {
        redirectToDestination(session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) {
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        redirectToDestination(session);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [redirectToDestination]);

  const handleLogin = useCallback(async () => {
    setError(null);

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
        setError(
          `Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts !== 1 ? "s" : ""} remaining.`,
        );
      }
      return;
    }

    if (!data.session?.user) {
      setError("Authentication failed. Please try again.");
      return;
    }

    const { data: refreshed } = await supabase.auth.getSession();
    redirectToDestination(refreshed.session ?? data.session);
  }, [attempts, email, lockedUntil, password, redirectToDestination]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const emailHasError =
    error !== null && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  const passwordHasError = error !== null && (!password || password.length < 6);

  return (
    <div>
      <h1 className={styles.title}>Sign in to your account</h1>
      <p className={styles.subtitle}>Your A2Z Carbon Solutions</p>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>EMAIL ADDRESS</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="you@company.com"
          autoComplete="email"
          autoFocus
          disabled={loading || isLocked}
          className={joinClasses(styles.input, emailHasError && styles.inputError)}
          aria-label="Email address"
          aria-required="true"
        />
      </div>

      <div className={joinClasses(styles.fieldGroup, styles.fieldGroupCompact)}>
        <div className={styles.passwordHeader}>
          <label className={styles.fieldLabel}>PASSWORD</label>
          <Link href="/auth/forgot-password" className={styles.forgotPasswordLink}>
            Forgot password?
          </Link>
        </div>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="........"
          autoComplete="current-password"
          disabled={loading || isLocked}
          className={joinClasses(styles.input, passwordHasError && styles.inputError)}
          aria-label="Password"
          aria-required="true"
        />
      </div>

      <button
        onClick={handleLogin}
        disabled={loading || isLocked}
        className={joinClasses(
          styles.submitButton,
          loading && styles.submitButtonLoading,
          isLocked && styles.submitButtonLocked,
        )}
        aria-label="Sign in"
      >
        {loading ? "Signing in..." : isLocked ? "Account locked" : "Sign in"}
      </button>

      <p className={styles.footerText}>
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className={styles.footerLink}>
          Request access
        </Link>
      </p>
    </div>
  );
}
