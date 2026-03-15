import Link from "next/link";

import styles from "@/features/portal/WorkspaceShell.module.css";
import { requireGovernanceActor } from "@/features/governance/shared/governanceAccess";
import {
  loadGovernanceWorkspaceData,
  type ConsentRow,
  type DsarRow,
  type IncidentRow,
} from "@/features/governance/shared/loadGovernanceWorkspace";

function formatDate(value: string | null): string {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

function humanizeToken(value: string): string {
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getIncidentPriority(incidents: IncidentRow[]): IncidentRow[] {
  return incidents
    .filter((row) => !["resolved", "closed", "false_positive"].includes(row.status))
    .sort((left, right) => {
      const severityWeight = (value: string) =>
        value === "critical" ? 4 : value === "high" ? 3 : value === "medium" ? 2 : value === "low" ? 1 : 0;

      return severityWeight(right.severity) - severityWeight(left.severity);
    });
}

function getEscalatedDsars(dsars: DsarRow[]): DsarRow[] {
  return dsars
    .filter(
      (row) =>
        row.escalated_at &&
        !["fulfilled", "rejected", "withdrawn"].includes(row.status),
    )
    .sort((left, right) => {
      const leftTime = left.escalated_at ? new Date(left.escalated_at).getTime() : 0;
      const rightTime = right.escalated_at ? new Date(right.escalated_at).getTime() : 0;

      return rightTime - leftTime;
    });
}

function getWithdrawnConsents(consents: ConsentRow[]): ConsentRow[] {
  return consents
    .filter((row) => row.is_withdrawn)
    .sort((left, right) => {
      const leftTime = left.withdrawn_at ? new Date(left.withdrawn_at).getTime() : 0;
      const rightTime = right.withdrawn_at ? new Date(right.withdrawn_at).getTime() : 0;

      return rightTime - leftTime;
    });
}

/**
 * Grievance and escalation governance workspace.
 *
 * The live schema does not currently expose a standalone grievance-case table.
 * This view therefore anchors the role on the real incident, escalation, and
 * consent-withdrawal datasets that grievance handling already depends on today.
 */
export async function GrievanceGovernanceView() {
  let errorMessage: string | null = null;
  let incidents: IncidentRow[] = [];
  let escalatedDsars: DsarRow[] = [];
  let withdrawnConsents: ConsentRow[] = [];

  try {
    await requireGovernanceActor(["grievance_officer", "dpo"]);
    const governanceData = await loadGovernanceWorkspaceData();

    incidents = getIncidentPriority(governanceData.incidents);
    escalatedDsars = getEscalatedDsars(governanceData.dsars);
    withdrawnConsents = getWithdrawnConsents(governanceData.consents);
  } catch (error) {
    console.error("Failed to load grievance governance workspace:", error);
    errorMessage =
      "Incident and escalation data is unavailable right now. Verify governance access and reload the page.";
  }

  const now = Date.now();
  const privacyIncidents = incidents.filter((row) => row.personal_data_involved);
  const criticalIncidents = incidents.filter((row) => ["critical", "high"].includes(row.severity));
  const dpaDeadlineIncidents = incidents.filter(
    (row) =>
      row.dpa_notification_required &&
      row.dpa_notification_deadline &&
      new Date(row.dpa_notification_deadline).getTime() <= now + 72 * 60 * 60 * 1000,
  );
  const userNotificationIncidents = incidents.filter((row) => row.user_notification_required);
  const unverifiedDsars = escalatedDsars.filter((row) => !row.identity_verified);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Governance Workspace</p>
        <h1 className={styles.title}>Incident Escalations</h1>
        <p className={styles.subtitle}>
          Review live incident pressure, escalated data-subject requests, and consent withdrawals from a
          governance-safe lane. Until a dedicated grievance-case table exists, this workspace stays anchored on the
          real escalation datasets already present in the schema.
        </p>
      </header>

      <div className={styles.body}>
        {errorMessage ? (
          <div className={styles.alert} data-tone="warning">
            {errorMessage}
          </div>
        ) : null}

        <section className={styles.metricsGrid}>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Open Incidents</p>
            <p className={styles.metricValue}>{formatNumber(incidents.length)}</p>
            <p className={styles.metricHint}>Incident rows still under active response or containment.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Critical Queue</p>
            <p className={styles.metricValue}>{formatNumber(criticalIncidents.length)}</p>
            <p className={styles.metricHint}>High-severity incidents currently visible to governance.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Escalated DSARs</p>
            <p className={styles.metricValue}>{formatNumber(escalatedDsars.length)}</p>
            <p className={styles.metricHint}>Requests escalated for governance follow-up and response handling.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Withdrawn Consents</p>
            <p className={styles.metricValue}>{formatNumber(withdrawnConsents.length)}</p>
            <p className={styles.metricHint}>Consent withdrawals currently visible in the live schema.</p>
          </article>
        </section>

        <div className={styles.contentGrid}>
          <aside className={styles.sidebarStack}>
            <section className={styles.card}>
              <div className={styles.cardSection}>
                <h2 className={styles.cardTitle}>Escalation Signals</h2>
                <div className={styles.stack}>
                  <div className={styles.alert} data-tone={dpaDeadlineIncidents.length > 0 ? "warning" : "info"}>
                    {formatNumber(dpaDeadlineIncidents.length)} incident(s) are approaching a DPA deadline.
                  </div>
                  <div className={styles.alert} data-tone={userNotificationIncidents.length > 0 ? "warning" : "info"}>
                    {formatNumber(userNotificationIncidents.length)} incident(s) still require or track user notification.
                  </div>
                  <div className={styles.alert} data-tone={unverifiedDsars.length > 0 ? "warning" : "info"}>
                    {formatNumber(unverifiedDsars.length)} escalated DSAR(s) still lack identity verification.
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardSection}>
                <h2 className={styles.cardTitle}>Governance Shortcuts</h2>
                <div className={styles.linkGrid}>
                  <Link href="/governance/privacy" className={styles.linkCard}>
                    <p className={styles.linkCardTitle}>Privacy Operations</p>
                    <p className={styles.linkCardDescription}>
                      Move into DSAR, ROPA, DPIA, transfer, and consent oversight when the case needs privacy review.
                    </p>
                    <p className={styles.linkCardCta}>Open privacy queue</p>
                  </Link>
                  <Link href="/dashboard/settings" className={styles.linkCard}>
                    <p className={styles.linkCardTitle}>Account Settings</p>
                    <p className={styles.linkCardDescription}>
                      Review session posture while grievance handling remains separated from platform admin duties.
                    </p>
                    <p className={styles.linkCardCta}>Open settings</p>
                  </Link>
                </div>
              </div>
            </section>
          </aside>

          <div className={styles.stack}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Incident Queue</h2>
                  <p className={styles.cardDescription}>
                    Current active incidents with emphasis on privacy involvement, severity, and deadline pressure.
                  </p>
                </div>
                <div className={styles.badgeRow}>
                  <span className={styles.badge} data-tone={criticalIncidents.length > 0 ? "warning" : "info"}>
                    {formatNumber(criticalIncidents.length)} critical
                  </span>
                  <span className={styles.badge} data-tone={privacyIncidents.length > 0 ? "warning" : "info"}>
                    {formatNumber(privacyIncidents.length)} privacy linked
                  </span>
                </div>
              </div>
              {incidents.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyTitle}>No open incidents</p>
                  <p className={styles.emptyDescription}>
                    The live schema does not currently show any incident rows awaiting governance follow-up.
                  </p>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.tableHeaderCell}>Incident</th>
                        <th className={styles.tableHeaderCell}>Type / Severity</th>
                        <th className={styles.tableHeaderCell}>Privacy</th>
                        <th className={styles.tableHeaderCell}>Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidents.slice(0, 8).map((row) => (
                        <tr key={row.id}>
                          <td className={styles.tableCell}>
                            <strong className={styles.emphasis}>{row.incident_ref?.trim() || row.title}</strong>
                            <div className={styles.smallText}>Detected {formatDate(row.detected_at)}</div>
                          </td>
                          <td className={styles.tableCell}>
                            <div>{humanizeToken(row.incident_type)}</div>
                            <div className={styles.smallText}>
                              {humanizeToken(row.severity)} | {humanizeToken(row.status)}
                            </div>
                          </td>
                          <td className={styles.tableCell}>
                            <div className={styles.badgeRow}>
                              {row.personal_data_involved ? (
                                <span className={styles.badge} data-tone="warning">
                                  Personal data
                                </span>
                              ) : (
                                <span className={styles.badge} data-tone="info">
                                  General
                                </span>
                              )}
                              {row.user_notification_required ? (
                                <span className={styles.badge} data-tone="warning">
                                  Notify users
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className={styles.tableCell}>
                            <div>{formatDate(row.dpa_notification_deadline)}</div>
                            <div className={styles.smallText}>
                              {row.dpa_notification_required ? "DPA notice required" : "No DPA notice flagged"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Escalated DSARs</h2>
                  <p className={styles.cardDescription}>
                    Requests escalated into governance because timing, verification, or complexity requires intervention.
                  </p>
                </div>
                <span className={styles.badge} data-tone={unverifiedDsars.length > 0 ? "warning" : "info"}>
                  {formatNumber(unverifiedDsars.length)} unverified
                </span>
              </div>
              {escalatedDsars.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyTitle}>No escalated DSARs</p>
                  <p className={styles.emptyDescription}>
                    There are no escalated data-subject requests visible in the current live dataset.
                  </p>
                </div>
              ) : (
                <div className={styles.list}>
                  {escalatedDsars.slice(0, 6).map((row) => (
                    <div key={row.id} className={styles.listItem}>
                      <div className={styles.splitRow}>
                        <div>
                          <p className={styles.rowTitle}>{row.requester_name?.trim() || row.requester_email}</p>
                          <p className={styles.rowMeta}>
                            {humanizeToken(row.request_type)} | Status {humanizeToken(row.status)} | Escalated{" "}
                            {formatDate(row.escalated_at)}
                          </p>
                        </div>
                        <span
                          className={styles.badge}
                          data-tone={row.identity_verified ? "info" : "warning"}
                        >
                          {row.identity_verified ? "Verified" : "Verify identity"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Consent Withdrawal Watchlist</h2>
                  <p className={styles.cardDescription}>
                    Recent consent withdrawals help the grievance lane spot potential dissatisfaction, objection, or
                    downstream contact-risk patterns.
                  </p>
                </div>
                <span className={styles.badge} data-tone={withdrawnConsents.length > 0 ? "warning" : "info"}>
                  {formatNumber(withdrawnConsents.length)} withdrawals
                </span>
              </div>
              {withdrawnConsents.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyTitle}>No consent withdrawals</p>
                  <p className={styles.emptyDescription}>
                    The live schema does not currently show any consent withdrawals requiring grievance follow-up.
                  </p>
                </div>
              ) : (
                <div className={styles.list}>
                  {withdrawnConsents.slice(0, 6).map((row) => (
                    <div key={row.id} className={styles.listItem}>
                      <div className={styles.splitRow}>
                        <div>
                          <p className={styles.rowTitle}>{humanizeToken(row.consent_type)}</p>
                          <p className={styles.rowMeta}>
                            Lawful basis {humanizeToken(row.lawful_basis)} | Withdrawn {formatDate(row.withdrawn_at)}
                          </p>
                        </div>
                        <span className={styles.badge} data-tone="warning">
                          Withdrawn
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
