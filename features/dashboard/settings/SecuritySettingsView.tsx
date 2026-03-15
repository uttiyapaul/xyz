"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import styles from "@/features/dashboard/settings/SecuritySettingsView.module.css";
import { useAuth } from "@/context/AuthContext";
import { SESSION_LOCK_TIMEOUT_MS, SECRET_CLIPBOARD_CLEAR_MS, formatMinutesFromMilliseconds } from "@/lib/security/sessionLock";
import { supabase } from "@/lib/supabase/client";

interface UserSession {
  id: string;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  country_code: string | null;
  city: string | null;
  login_at: string;
  last_active_at: string;
  is_active: boolean;
  mfa_verified: boolean;
  risk_score: number | null;
}

interface SecurityMessage {
  tone: "info" | "danger";
  text: string;
}

function getRiskTone(score: number | null): string {
  if (score == null || score < 0.3) {
    return `${styles.badge} ${styles.statusSafe}`;
  }

  if (score < 0.7) {
    return `${styles.badge} ${styles.statusRisk}`;
  }

  return `${styles.badge} ${styles.statusDanger}`;
}

/**
 * Personal security settings surface for session posture and inactivity policy.
 * This page makes the frontend lock and active-session inventory visible while
 * backend revocation enforcement continues to harden in later phases.
 */
export function SecuritySettingsView() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<SecurityMessage | null>(null);
  const [workingSessionId, setWorkingSessionId] = useState<string | null>(null);

  const loadSessions = useCallback(async (showLoadingState = true) => {
    if (!userId) {
      return;
    }

    if (showLoadingState) {
      setLoading(true);
    }

    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("last_active_at", { ascending: false });

    if (error) {
      setMessage({
        tone: "danger",
        text: "Active sessions could not be loaded. Refresh the page or try again shortly.",
      });
      setSessions([]);
      setLoading(false);
      return;
    }

    setSessions((data ?? []) as UserSession[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      queueMicrotask(() => {
        void loadSessions(false);
      });
    }
  }, [loadSessions, userId]);

  const mfaVerifiedCount = useMemo(() => sessions.filter((session) => session.mfa_verified).length, [sessions]);

  async function forceLogout(sessionId: string) {
    if (!userId) {
      return;
    }

    setWorkingSessionId(sessionId);
    setMessage(null);

    const updateResponse = await supabase
      .from("user_sessions")
      .update({
        force_logged_out_at: new Date().toISOString(),
        force_logout_by: userId,
        force_logout_reason: "User-initiated remote logout",
        is_active: false,
        logout_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (updateResponse.error) {
      setWorkingSessionId(null);
      setMessage({
        tone: "danger",
        text: "The selected session could not be closed. Try again in a moment.",
      });
      return;
    }

    await supabase.functions.invoke("invalidate-session", {
      body: { session_id: sessionId },
    });

    setWorkingSessionId(null);
    setMessage({
      tone: "info",
      text: "Session closed. The remote device should lose access shortly.",
    });
    await loadSessions();
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Security & Sessions</h1>
        <p className={styles.subtitle}>
          Review personal session posture, MFA coverage, and the inactivity lock now active across the authenticated
          portal shell.
        </p>
      </header>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Inactivity lock</h2>
          <p className={styles.metricValue}>{formatMinutesFromMilliseconds(SESSION_LOCK_TIMEOUT_MS)} min</p>
          <p className={styles.cardText}>
            Sensitive pages blur after inactivity and require re-authentication to continue. Backend enforcement will
            follow in the next phase.
          </p>
        </article>
        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Clipboard clear</h2>
          <p className={styles.metricValue}>{formatMinutesFromMilliseconds(SECRET_CLIPBOARD_CLEAR_MS)} min</p>
          <p className={styles.cardText}>
            Secret reveal flows attempt to clear copied values from the clipboard after 60 seconds.
          </p>
        </article>
        <article className={styles.card}>
          <h2 className={styles.cardTitle}>MFA-verified sessions</h2>
          <p className={styles.metricValue}>{mfaVerifiedCount}</p>
          <p className={styles.cardText}>Sessions with verified MFA state currently visible in the live session inventory.</p>
        </article>
      </section>

      <div className={styles.alert} data-tone="info">
        The session lock is now active in the frontend shell. Server-side inactivity revocation and privileged route
        step-up will be tightened in the backend phase.
      </div>

      {message ? (
        <div className={styles.alert} data-tone={message.tone}>
          {message.text}
        </div>
      ) : null}

      <section className={styles.card}>
        <div>
          <div>
            <h2 className={styles.cardTitle}>Active sessions</h2>
            <p className={styles.cardText}>
              Devices currently signed in to your account. Use this list to close stale or suspicious sessions.
            </p>
          </div>
        </div>

        {userId && loading ? (
          <div className={styles.alert} data-tone="info">Loading session inventory...</div>
        ) : sessions.length === 0 ? (
          <div className={styles.emptyState}>No active sessions are visible for this account right now.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeaderCell}>Device</th>
                  <th className={styles.tableHeaderCell}>Location</th>
                  <th className={styles.tableHeaderCell}>Last active</th>
                  <th className={styles.tableHeaderCell}>Risk</th>
                  <th className={styles.tableHeaderCell}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td className={styles.tableCell}>
                      <div>{session.browser ?? "Unknown browser"} on {session.os ?? "Unknown OS"}</div>
                      <div className={styles.monoText}>
                        {session.device_type ?? "Unknown device"} {session.mfa_verified ? "| MFA verified" : "| MFA pending"}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      {[session.ip_address, session.city, session.country_code].filter(Boolean).join(" | ") || "Unknown"}
                    </td>
                    <td className={styles.tableCell}>{new Date(session.last_active_at).toLocaleString("en-IN")}</td>
                    <td className={styles.tableCell}>
                      <span className={getRiskTone(session.risk_score)}>
                        {session.risk_score == null ? "Low visibility" : `${Math.round(session.risk_score * 100)}% risk`}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <button
                        type="button"
                        onClick={() => void forceLogout(session.id)}
                        disabled={workingSessionId === session.id}
                        className={`${styles.button} ${styles.dangerButton}`.trim()}
                      >
                        {workingSessionId === session.id ? "Closing..." : "Sign out"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
