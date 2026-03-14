"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "@/features/auth/AuthScreen.module.css";
import { supabase } from "@/lib/supabase/client";

function joinClasses(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else {
        setError("This reset link is invalid or has expired. Please request a new one.");
      }
    });
  }, []);

  async function handleReset() {
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Must contain at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Must contain at least one number");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.replace("/auth/login"), 3000);
  }

  if (success) {
    return (
      <div className={styles.centeredState}>
        <div className={joinClasses(styles.stateIcon, styles.stateIconSuccess)}>
          <CheckCircle2 size={40} />
        </div>
        <h2 className={joinClasses(styles.stateTitle, styles.stateTitleSuccess)}>Password updated</h2>
        <p className={styles.stateBody}>Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Set new password</h1>
      <p className={styles.subtitle}>Choose a strong password for your account.</p>

      {error && (
        <div className={styles.errorBanner}>
          <div>{error}</div>
          {!sessionReady && (
            <div className={styles.fieldGroupCompact}>
              <Link href="/auth/forgot-password" className={styles.footerLink}>
                Request a new link
              </Link>
            </div>
          )}
        </div>
      )}

      {sessionReady && (
        <>
          {[
            { label: "NEW PASSWORD", value: password, setValue: setPassword, placeholder: "Min 8 chars" },
            { label: "CONFIRM PASSWORD", value: confirm, setValue: setConfirm, placeholder: "Repeat password" },
          ].map(({ label, value, setValue, placeholder }) => (
            <div key={label} className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{label}</label>
              <input
                type="password"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleReset()}
                placeholder={placeholder}
                disabled={loading}
                className={joinClasses(styles.input, error && !value && styles.inputError)}
              />
            </div>
          ))}

          <button
            onClick={handleReset}
            disabled={loading}
            className={joinClasses(styles.submitButton, loading && styles.submitButtonLoading)}
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </>
      )}
    </div>
  );
}
