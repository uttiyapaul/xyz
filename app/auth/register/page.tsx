"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import Link from "next/link";

import styles from "@/features/auth/AuthScreen.module.css";
import { supabase } from "@/lib/supabase/client";

function joinClasses(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className={styles.centeredState}>
        <div className={styles.stateIcon}>
          <Mail size={40} />
        </div>
        <h2 className={styles.stateTitle}>Check your email</h2>
        <p className={styles.stateBody}>
          We sent a confirmation link to <strong className={styles.inlineStrong}>{email}</strong>. Click it to
          activate your account.
        </p>
        <Link href="/auth/login" className={styles.footerLink}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Create your account</h1>
      <p className={styles.subtitle}>Request access to A2Z Carbon Solutions</p>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {[
        {
          label: "FULL NAME",
          value: fullName,
          setValue: setFullName,
          type: "text",
          placeholder: "Jane Smith",
          autoComplete: "name",
        },
        {
          label: "EMAIL ADDRESS",
          value: email,
          setValue: setEmail,
          type: "email",
          placeholder: "jane@company.com",
          autoComplete: "email",
        },
        {
          label: "PASSWORD",
          value: password,
          setValue: setPassword,
          type: "password",
          placeholder: "Min 8 chars, 1 uppercase, 1 number",
          autoComplete: "new-password",
        },
        {
          label: "CONFIRM PASSWORD",
          value: confirm,
          setValue: setConfirm,
          type: "password",
          placeholder: "Repeat password",
          autoComplete: "new-password",
        },
      ].map(({ label, value, setValue, type, placeholder, autoComplete }) => (
        <div key={label} className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>{label}</label>
          <input
            type={type}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            disabled={loading}
            onKeyDown={(event) => event.key === "Enter" && handleRegister()}
            className={joinClasses(styles.input, error && !value && styles.inputError)}
          />
        </div>
      ))}

      <p className={styles.helperText}>
        By registering you agree to our{" "}
        <Link href="/privacy" className={styles.footerLink}>
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className={styles.footerLink}>
          Terms of Service
        </Link>
        .
      </p>

      <button
        onClick={handleRegister}
        disabled={loading}
        className={joinClasses(styles.submitButton, loading && styles.submitButtonLoading)}
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className={styles.footerText}>
        Already have an account?{" "}
        <Link href="/auth/login" className={styles.footerLink}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
