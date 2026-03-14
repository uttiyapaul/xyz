"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import Link from "next/link";

import styles from "@/features/auth/AuthScreen.module.css";
import { supabase } from "@/lib/supabase/client";

function joinClasses(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className={styles.centeredState}>
        <div className={styles.stateIcon}>
          <Mail size={40} />
        </div>
        <h2 className={styles.stateTitle}>Check your email</h2>
        <p className={styles.stateBody}>
          If an account exists for <strong className={styles.inlineStrong}>{email}</strong>, you will receive a
          password reset link shortly.
        </p>
        <Link href="/auth/login" className={styles.footerLink}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Reset your password</h1>
      <p className={styles.subtitle}>Enter your email and we&apos;ll send you a reset link.</p>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>EMAIL ADDRESS</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
          placeholder="you@company.com"
          autoComplete="email"
          disabled={loading}
          className={joinClasses(styles.input, error && styles.inputError)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={joinClasses(styles.submitButton, loading && styles.submitButtonLoading)}
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>

      <p className={styles.footerText}>
        <Link href="/auth/login" className={styles.footerLink}>
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
