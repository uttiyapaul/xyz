import Link from "next/link";

import styles from "@/features/portal/WorkspaceShell.module.css";
import { requireGovernanceActor } from "@/features/governance/shared/governanceAccess";
import {
  loadGovernanceWorkspaceData,
  type DpiaRow,
  type DsarRow,
  type RopaRow,
  type TransferRow,
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

function getDpiaPriority(dpias: DpiaRow[]): DpiaRow[] {
  return dpias
    .filter((row) => row.dpia_required)
    .sort((left, right) => {
      const leftWeight =
        left.risk_level === "high" || left.residual_risk === "unacceptable"
          ? 2
          : left.residual_risk === "needs_review"
            ? 1
            : 0;
      const rightWeight =
        right.risk_level === "high" || right.residual_risk === "unacceptable"
          ? 2
          : right.residual_risk === "needs_review"
            ? 1
            : 0;

      return rightWeight - leftWeight;
    });
}

function getRopaPriority(ropaEntries: RopaRow[]): RopaRow[] {
  return ropaEntries
    .filter((row) => row.is_active)
    .sort((left, right) => {
      const leftDate = left.next_review_due ? new Date(left.next_review_due).getTime() : Number.MAX_SAFE_INTEGER;
      const rightDate = right.next_review_due ? new Date(right.next_review_due).getTime() : Number.MAX_SAFE_INTEGER;

      return leftDate - rightDate;
    });
}

function getTransferPriority(transfers: TransferRow[]): TransferRow[] {
  return transfers
    .filter((row) => row.is_active)
    .sort((left, right) => {
      const leftDate = left.next_review_due ? new Date(left.next_review_due).getTime() : Number.MAX_SAFE_INTEGER;
      const rightDate = right.next_review_due ? new Date(right.next_review_due).getTime() : Number.MAX_SAFE_INTEGER;

      return leftDate - rightDate;
    });
}

/**
 * DPO-facing privacy operations workspace.
 *
 * This page gives the DPO a live, regulation-oriented surface backed by the
 * privacy tables already present in the platform schema. It stays read-focused
 * until mutation workflows for privacy operations are finalized.
 */
export async function PrivacyGovernanceView() {
  let errorMessage: string | null = null;
  let dsars: DsarRow[] = [];
  let dpias: DpiaRow[] = [];
  let ropaEntries: RopaRow[] = [];
  let transfers: TransferRow[] = [];
  let incidentsCount = 0;
  let withdrawnConsentCount = 0;

  try {
    await requireGovernanceActor(["dpo"]);
    const governanceData = await loadGovernanceWorkspaceData();

    dsars = governanceData.dsars;
    dpias = governanceData.dpias;
    ropaEntries = governanceData.ropaEntries;
    transfers = governanceData.transfers;
    incidentsCount = governanceData.incidents.filter(
      (row) =>
        row.personal_data_involved &&
        !["resolved", "closed", "false_positive"].includes(row.status),
    ).length;
    withdrawnConsentCount = governanceData.consents.filter((row) => row.is_withdrawn).length;
  } catch (error) {
    console.error("Failed to load privacy governance workspace:", error);
    errorMessage =
      "Privacy operations data is unavailable right now. Verify governance access and reload the page.";
  }

  const now = Date.now();
  const openDsars = dsars.filter((row) => !["fulfilled", "rejected", "withdrawn"].includes(row.status));
  const overdueDsars = openDsars.filter((row) => row.due_at && new Date(row.due_at).getTime() < now);
  const unverifiedDsars = openDsars.filter((row) => !row.identity_verified);
  const priorityDpias = getDpiaPriority(dpias);
  const highRiskDpias = priorityDpias.filter(
    (row) =>
      row.risk_level === "high" ||
      row.residual_risk === "needs_review" ||
      row.residual_risk === "unacceptable",
  );
  const priorityRopa = getRopaPriority(ropaEntries);
  const reviewDueRopa = priorityRopa.filter(
    (row) => row.next_review_due && new Date(row.next_review_due).getTime() <= now + 30 * 24 * 60 * 60 * 1000,
  );
  const priorityTransfers = getTransferPriority(transfers);
  const activeTransfers = priorityTransfers.filter((row) => row.is_active);
  const transferGaps = activeTransfers.filter((row) => !row.tia_completed);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Governance Workspace</p>
        <h1 className={styles.title}>Privacy Operations</h1>
        <p className={styles.subtitle}>
          Review data-subject rights, processing records, DPIA posture, cross-border transfers, and
          privacy-linked incident exposure from one live workspace. This page stays intentionally
          read-focused until privacy workflow mutations are finalized.
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
            <p className={styles.metricLabel}>Open DSARs</p>
            <p className={styles.metricValue}>{formatNumber(openDsars.length)}</p>
            <p className={styles.metricHint}>Requests still awaiting closure, fulfillment, or rejection.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Overdue DSARs</p>
            <p className={styles.metricValue}>{formatNumber(overdueDsars.length)}</p>
            <p className={styles.metricHint}>Open requests whose due date has already passed.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>ROPA Reviews Due</p>
            <p className={styles.metricValue}>{formatNumber(reviewDueRopa.length)}</p>
            <p className={styles.metricHint}>Active processing activities due for review within 30 days.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>High-Risk DPIA</p>
            <p className={styles.metricValue}>{formatNumber(highRiskDpias.length)}</p>
            <p className={styles.metricHint}>DPIA rows needing elevated privacy attention.</p>
          </article>
        </section>

        <div className={styles.contentGrid}>
          <aside className={styles.sidebarStack}>
            <section className={styles.card}>
              <div className={styles.cardSection}>
                <h2 className={styles.cardTitle}>Oversight Signals</h2>
                <p className={styles.cardDescription}>
                  Privacy oversight remains independent from client administration and data approval lanes.
                </p>
                <div className={styles.stack}>
                  <div className={styles.alert} data-tone={unverifiedDsars.length > 0 ? "warning" : "info"}>
                    {formatNumber(unverifiedDsars.length)} open DSAR(s) still need identity verification.
                  </div>
                  <div className={styles.alert} data-tone={transferGaps.length > 0 ? "warning" : "info"}>
                    {formatNumber(transferGaps.length)} active transfer(s) still lack a completed transfer impact assessment.
                  </div>
                  <div className={styles.alert} data-tone={incidentsCount > 0 ? "warning" : "info"}>
                    {formatNumber(incidentsCount)} open privacy-linked incident(s) and {formatNumber(withdrawnConsentCount)} withdrawn consent record(s) are visible in the schema.
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardSection}>
                <h2 className={styles.cardTitle}>Governance Shortcuts</h2>
                <div className={styles.linkGrid}>
                  <Link href="/governance/grievances" className={styles.linkCard}>
                    <p className={styles.linkCardTitle}>Incident Escalations</p>
                    <p className={styles.linkCardDescription}>
                      Review grievance-linked incidents, escalated DSARs, and response pressure.
                    </p>
                    <p className={styles.linkCardCta}>Open queue</p>
                  </Link>
                  <Link href="/dashboard/settings" className={styles.linkCard}>
                    <p className={styles.linkCardTitle}>Account Settings</p>
                    <p className={styles.linkCardDescription}>
                      Review session posture while governance actions stay isolated from admin controls.
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
                  <h2 className={styles.cardTitle}>DSAR Queue</h2>
                  <p className={styles.cardDescription}>
                    Live subject-rights requests ordered by current urgency and due-date pressure.
                  </p>
                </div>
                <span className={styles.badge} data-tone={overdueDsars.length > 0 ? "warning" : "info"}>
                  {formatNumber(overdueDsars.length)} overdue
                </span>
              </div>
              {openDsars.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyTitle}>No open DSARs</p>
                  <p className={styles.emptyDescription}>
                    The live schema does not currently show any data-subject requests awaiting follow-up.
                  </p>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.tableHeaderCell}>Requester</th>
                        <th className={styles.tableHeaderCell}>Request</th>
                        <th className={styles.tableHeaderCell}>Verification</th>
                        <th className={styles.tableHeaderCell}>Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openDsars.slice(0, 8).map((row) => (
                        <tr key={row.id}>
                          <td className={styles.tableCell}>
                            <strong className={styles.emphasis}>{row.requester_name?.trim() || row.requester_email}</strong>
                            <div className={styles.smallText}>{row.requester_email}</div>
                          </td>
                          <td className={styles.tableCell}>
                            <div>{humanizeToken(row.request_type)}</div>
                            <div className={styles.smallText}>Status: {humanizeToken(row.status)}</div>
                          </td>
                          <td className={styles.tableCell}>
                            <span
                              className={styles.badge}
                              data-tone={row.identity_verified ? "success" : "warning"}
                            >
                              {row.identity_verified ? "Verified" : "Pending"}
                            </span>
                          </td>
                          <td className={styles.tableCell}>
                            <div>{formatDate(row.due_at)}</div>
                            <div className={styles.smallText}>Requested {formatDate(row.requested_at)}</div>
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
                  <h2 className={styles.cardTitle}>DPIA and ROPA Review</h2>
                  <p className={styles.cardDescription}>
                    Prioritize high-risk processing activities, overdue reviews, and automation-heavy records.
                  </p>
                </div>
                <div className={styles.badgeRow}>
                  <span className={styles.badge} data-tone={highRiskDpias.length > 0 ? "warning" : "success"}>
                    {formatNumber(highRiskDpias.length)} high-risk DPIA
                  </span>
                  <span className={styles.badge} data-tone={reviewDueRopa.length > 0 ? "warning" : "info"}>
                    {formatNumber(reviewDueRopa.length)} review due
                  </span>
                </div>
              </div>
              <div className={styles.list}>
                {priorityDpias.slice(0, 4).map((row) => (
                  <div key={row.id} className={styles.listItem}>
                    <div className={styles.splitRow}>
                      <div>
                        <p className={styles.rowTitle}>{row.processing_activity}</p>
                        <p className={styles.rowMeta}>
                          Risk {humanizeToken(row.risk_level)} | Residual {row.residual_risk ? humanizeToken(row.residual_risk) : "Not assessed"} | Approved{" "}
                          {row.approved_at ? formatDate(row.approved_at) : "Not yet"}
                        </p>
                      </div>
                      <span
                        className={styles.badge}
                        data-tone={
                          row.risk_level === "high" || row.residual_risk === "unacceptable"
                            ? "danger"
                            : row.residual_risk === "needs_review"
                              ? "warning"
                              : "info"
                        }
                      >
                        DPIA
                      </span>
                    </div>
                  </div>
                ))}
                {priorityDpias.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyTitle}>No DPIA rows visible</p>
                    <p className={styles.emptyDescription}>
                      The live schema does not currently show privacy impact assessments in scope.
                    </p>
                  </div>
                ) : null}
                {priorityRopa.slice(0, 4).map((row) => (
                  <div key={row.id} className={styles.listItem}>
                    <div className={styles.splitRow}>
                      <div>
                        <p className={styles.rowTitle}>{row.activity_name}</p>
                        <p className={styles.rowMeta}>
                          Legal basis {humanizeToken(row.legal_basis)} | Review due {formatDate(row.next_review_due)} | Last reviewed{" "}
                          {formatDate(row.last_reviewed_at)}
                        </p>
                      </div>
                      <div className={styles.badgeRow}>
                        {row.automated_decision_making ? (
                          <span className={styles.badge} data-tone="warning">
                            Automated
                          </span>
                        ) : null}
                        {row.profiling_involved ? (
                          <span className={styles.badge} data-tone="warning">
                            Profiling
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
                {priorityRopa.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyTitle}>No ROPA entries visible</p>
                    <p className={styles.emptyDescription}>
                      The live schema does not currently show any processing records for review.
                    </p>
                  </div>
                ) : null}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Transfers and Consent Posture</h2>
                  <p className={styles.cardDescription}>
                    Review cross-border safeguards and consent withdrawals without leaving the governance lane.
                  </p>
                </div>
                <span className={styles.badge} data-tone={transferGaps.length > 0 ? "warning" : "success"}>
                  {formatNumber(activeTransfers.length)} active transfers
                </span>
              </div>
              {activeTransfers.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyTitle}>No active transfers visible</p>
                  <p className={styles.emptyDescription}>
                    The transfer registry is currently empty or outside the visible governance dataset.
                  </p>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.tableHeaderCell}>Transfer</th>
                        <th className={styles.tableHeaderCell}>Mechanism</th>
                        <th className={styles.tableHeaderCell}>TIA</th>
                        <th className={styles.tableHeaderCell}>Review</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTransfers.slice(0, 6).map((row) => (
                        <tr key={row.id}>
                          <td className={styles.tableCell}>
                            <strong className={styles.emphasis}>{row.transfer_name}</strong>
                            <div className={styles.smallText}>Importer country {row.data_importer_country}</div>
                          </td>
                          <td className={styles.tableCell}>{humanizeToken(row.transfer_mechanism)}</td>
                          <td className={styles.tableCell}>
                            <span className={styles.badge} data-tone={row.tia_completed ? "success" : "warning"}>
                              {row.tia_completed ? "Complete" : "Pending"}
                            </span>
                          </td>
                          <td className={styles.tableCell}>{formatDate(row.next_review_due)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
