"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import styles from "@/components/security/SecretValue.module.css";
import { SECRET_CLIPBOARD_CLEAR_MS } from "@/lib/security/sessionLock";

interface SecretValueProps {
  title: string;
  description: string;
  secretValue: string;
  helperText: string;
  acknowledgeLabel?: string;
  onAcknowledge?: () => void;
}

function maskSecret(secretValue: string): string {
  if (secretValue.length <= 12) {
    return "************";
  }

  return `${secretValue.slice(0, 8)}******${secretValue.slice(-4)}`;
}

/**
 * Shared secret-handling primitive for one-time API keys and webhook secrets.
 *
 * It keeps secrets masked by default, requires explicit reveal, and performs a
 * best-effort clipboard clear after 60 seconds once a secret is copied.
 */
export function SecretValue({
  title,
  description,
  secretValue,
  helperText,
  acknowledgeLabel,
  onAcknowledge,
}: SecretValueProps) {
  const [revealed, setRevealed] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const clipboardTimerRef = useRef<number | null>(null);

  const visibleValue = useMemo(
    () => (revealed ? secretValue : maskSecret(secretValue)),
    [revealed, secretValue],
  );

  useEffect(() => {
    return () => {
      if (clipboardTimerRef.current != null) {
        window.clearTimeout(clipboardTimerRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(secretValue);
      setCopyState("copied");

      if (clipboardTimerRef.current != null) {
        window.clearTimeout(clipboardTimerRef.current);
      }

      clipboardTimerRef.current = window.setTimeout(() => {
        void navigator.clipboard.writeText("");
        setCopyState("idle");
      }, SECRET_CLIPBOARD_CLEAR_MS);
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.meta}>
          <button
            type="button"
            className={`${styles.button} ${styles.primaryButton}`.trim()}
            onClick={() => setRevealed((current) => !current)}
          >
            {revealed ? "Hide secret" : "Reveal secret"}
          </button>
          {revealed ? (
            <button type="button" className={styles.button} onClick={() => void handleCopy()}>
              {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy unavailable" : "Copy secret"}
            </button>
          ) : null}
          {acknowledgeLabel && onAcknowledge ? (
            <button type="button" className={`${styles.button} ${styles.secondaryButton}`.trim()} onClick={onAcknowledge}>
              {acknowledgeLabel}
            </button>
          ) : null}
        </div>
      </div>

      <p className={styles.message}>{description}</p>
      <div className={`${styles.secret} ${revealed ? "" : styles.secretMasked}`.trim()}>{visibleValue}</div>
      <div className={styles.hint}>
        {helperText}
        {revealed && copyState !== "failed" ? " Clipboard clear is attempted automatically after 60 seconds." : ""}
        {copyState === "failed" ? " Clipboard access is unavailable in this browser context." : ""}
      </div>
    </div>
  );
}
