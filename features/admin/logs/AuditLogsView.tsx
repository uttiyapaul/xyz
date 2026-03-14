import { createServerSupabaseClient } from "@/lib/supabase/admin";

import styles from "@/features/admin/logs/AuditLogsView.module.css";

interface AuditLogRow {
  id: string;
  table_name: string | null;
  record_id: string | null;
  operation: string | null;
  changed_by_user_id: string | null;
  event_timestamp: string | null;
  event_hash: string | null;
}

function formatTimestamp(value: string | null): string {
  if (!value) {
    return "Unknown";
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return value;
  }

  return timestamp.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getOperationBadgeClass(operation: string | null): string {
  if (operation === "INSERT") {
    return `${styles.badge} ${styles.badgeInsert}`;
  }

  if (operation === "UPDATE") {
    return `${styles.badge} ${styles.badgeUpdate}`;
  }

  return `${styles.badge} ${styles.badgeDelete}`;
}

/**
 * Platform audit logs stay in a server component because the page depends on a
 * privileged ledger query. Errors are rendered into the page so deployment
 * failures turn into an admin-visible state instead of a build crash.
 */
export async function AuditLogsView() {
  let logs: AuditLogRow[] = [];
  let errorMessage: string | null = null;

  try {
    const supabaseAdmin = createServerSupabaseClient();
    const { data, error } = await supabaseAdmin
      .from("ghg_audit_log")
      .select("id, table_name, record_id, operation, changed_by_user_id, event_timestamp, event_hash")
      .order("event_timestamp", { ascending: false })
      .limit(100);

    if (error) {
      errorMessage = error.message;
    } else {
      logs = (data ?? []) as AuditLogRow[];
    }
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Audit log access failed before the page could load.";
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Platform Oversight</p>
        <h1 className={styles.title}>Platform Audit Logs</h1>
        <p className={styles.subtitle}>
          Immutable operational ledger for platform-wide changes. The page intentionally reads through the
          service-role admin client so security reviews and deployment builds do not depend on a browser client path.
        </p>
      </header>

      {errorMessage ? <div className={styles.alert}>Failed to load audit logs: {errorMessage}</div> : null}

      <div className={styles.panel}>
        {logs.length === 0 ? (
          <div className={styles.emptyState}>No audit logs are available for the current environment.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.headRow}>
                  <th className={styles.headerCell}>Timestamp</th>
                  <th className={styles.headerCell}>Operation</th>
                  <th className={styles.headerCell}>Table</th>
                  <th className={styles.headerCell}>Record ID</th>
                  <th className={styles.headerCell}>User ID</th>
                  <th className={styles.headerCell}>Event Hash</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr
                    key={log.id}
                    className={`${styles.row} ${index % 2 === 1 ? styles.rowMuted : ""}`.trim()}
                  >
                    <td className={`${styles.cell} ${styles.monoCell} ${styles.timestampCell}`}>
                      {formatTimestamp(log.event_timestamp)}
                    </td>
                    <td className={styles.cell}>
                      <span className={getOperationBadgeClass(log.operation)}>{log.operation ?? "UNKNOWN"}</span>
                    </td>
                    <td className={`${styles.cell} ${styles.monoCell}`}>{log.table_name ?? "-"}</td>
                    <td className={`${styles.cell} ${styles.monoCell}`}>{log.record_id ?? "-"}</td>
                    <td className={`${styles.cell} ${styles.monoCell} ${styles.userCell}`}>
                      {log.changed_by_user_id ?? "SYSTEM"}
                    </td>
                    <td className={`${styles.cell} ${styles.monoCell} ${styles.hashCell}`} title={log.event_hash ?? ""}>
                      {log.event_hash ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
