"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import styles from "@/components/security/SessionLockBoundary.module.css";
import { useAuth } from "@/context/AuthContext";
import { SESSION_LOCK_TIMEOUT_MS, formatMinutesFromMilliseconds } from "@/lib/security/sessionLock";
import { supabase } from "@/lib/supabase/client";

const PUBLIC_PATHS = new Set(["/"]);
const PUBLIC_PREFIXES = ["/auth", "/calculator"];
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "scroll", "touchstart", "focus"] as const;

function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) {
    return false;
  }

  return !PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Frontend inactivity lock required by the 2026 audit.
 *
 * Important:
 * - This is a UX-side control that blurs sensitive content after 15 minutes.
 * - The backend/request layer still needs to enforce the same inactivity rule.
 * - Re-authentication uses the current email/password session path where
 *   available; SSO-only flows can still fall back to sign-out and fresh login.
 */
export function SessionLockBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timeoutRef = useRef<number | null>(null);
  const lastActivityAtRef = useRef(0);
  const isEnabled = useMemo(
    () => !isLoading && Boolean(user) && isProtectedPath(pathname),
    [isLoading, pathname, user],
  );

  const clearLockTimer = useCallback(() => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleLock = useCallback(() => {
    clearLockTimer();
    const elapsedMs = Date.now() - lastActivityAtRef.current;
    const remainingMs = Math.max(SESSION_LOCK_TIMEOUT_MS - elapsedMs, 0);

    timeoutRef.current = window.setTimeout(() => {
      setIsLocked(true);
      setPassword("");
      setErrorMessage(null);
    }, remainingMs);
  }, [clearLockTimer]);

  const markActivity = useCallback(() => {
    if (!isEnabled || isLocked) {
      return;
    }

    lastActivityAtRef.current = Date.now();
    scheduleLock();
  }, [isEnabled, isLocked, scheduleLock]);

  useEffect(() => {
    if (!isEnabled) {
      clearLockTimer();
      return;
    }

    lastActivityAtRef.current = Date.now();
    scheduleLock();

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") {
        return;
      }

      if (Date.now() - lastActivityAtRef.current >= SESSION_LOCK_TIMEOUT_MS) {
        setIsLocked(true);
        setPassword("");
        setErrorMessage(null);
        clearLockTimer();
        return;
      }

      markActivity();
    }

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearLockTimer();
    };
  }, [clearLockTimer, isEnabled, markActivity, scheduleLock]);

  async function handleUnlock() {
    if (!user?.email) {
      setErrorMessage("This session cannot be re-authenticated inline. Sign in again to continue.");
      return;
    }

    if (!password) {
      setErrorMessage("Enter your password to unlock the session.");
      return;
    }

    setUnlocking(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (error) {
      setUnlocking(false);
      setErrorMessage("Re-authentication failed. Check your password or sign in again.");
      return;
    }

    setUnlocking(false);
    setIsLocked(false);
    setPassword("");
    lastActivityAtRef.current = Date.now();
    scheduleLock();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
  }

  if (!isEnabled) {
    return <>{children}</>;
  }

  return (
    <div className={styles.boundary}>
      <div className={`${styles.surface} ${isLocked ? styles.surfaceLocked : ""}`.trim()}>{children}</div>

      {isLocked ? (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="session-lock-title">
          <div className={styles.dialog}>
            <div>
              <p className={styles.eyebrow}>Security Hold</p>
              <h2 id="session-lock-title" className={styles.title}>
                Session locked after inactivity
              </h2>
            </div>

            <p className={styles.message}>
              Sensitive workspace content is blurred after{" "}
              <span className={styles.strongText}>
                {formatMinutesFromMilliseconds(SESSION_LOCK_TIMEOUT_MS)} minutes
              </span>{" "}
              of inactivity. Re-authenticate to continue, or sign out and return later.
            </p>

            <div className={styles.fieldGroup}>
              <label htmlFor="session-unlock-password" className={styles.label}>
                Re-enter your password
              </label>
              <input
                id="session-unlock-password"
                type="password"
                value={password}
                autoFocus
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleUnlock();
                  }
                }}
                className={styles.input}
                placeholder="Password"
              />
              <p className={styles.helper}>
                This is the frontend inactivity lock required by the audit. Server-side revocation will be tightened in
                the next backend phase.
              </p>
            </div>

            {errorMessage ? <div className={styles.error}>{errorMessage}</div> : null}

            <div className={styles.actions}>
              <button
                type="button"
                onClick={() => void handleUnlock()}
                disabled={unlocking}
                className={`${styles.button} ${styles.primaryButton}`.trim()}
              >
                {unlocking ? "Verifying..." : "Unlock Session"}
              </button>
              <button type="button" onClick={() => void handleSignOut()} className={`${styles.button} ${styles.secondaryButton}`.trim()}>
                Sign out instead
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
