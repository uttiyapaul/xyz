"use client";

import Link from "next/link";
import { useState } from "react";

import shellStyles from "@/features/portal/WorkspaceShell.module.css";
import styles from "@/features/consulting/ConsultingWorkspace.module.css";
import { useConsultingPortfolioData } from "@/features/consulting/portfolio/useConsultingPortfolioData";

function getPortfolioTone(client: {
  isActive: boolean;
  scenarioCount: number;
  approvedScenarioCount: number;
  erpSyncEnabled: boolean;
  onTrackTargets: number;
}): "success" | "warning" | "info" {
  if (!client.isActive) {
    return "warning";
  }

  if (client.approvedScenarioCount > 0 && client.onTrackTargets > 0) {
    return "success";
  }

  if (!client.erpSyncEnabled || client.scenarioCount === 0) {
    return "warning";
  }

  return "info";
}

function getPortfolioStatus(client: {
  isActive: boolean;
  scenarioCount: number;
  approvedScenarioCount: number;
  erpSyncEnabled: boolean;
  onTrackTargets: number;
}): string {
  if (!client.isActive) {
    return "Inactive";
  }

  if (client.approvedScenarioCount > 0 && client.onTrackTargets > 0) {
    return "Advisory live";
  }

  if (!client.erpSyncEnabled) {
    return "Needs systems follow-up";
  }

  if (client.scenarioCount === 0) {
    return "Baseline only";
  }

  return "Engaged";
}

/**
 * Consulting portfolio workspace.
 *
 * This view replaces the old switchboard placeholder with a real portfolio
 * board grounded in consultant scope, assigned organizations, and live
 * scenario/target posture.
 */
export function ConsultingPortfolioView() {
  const { loading, error, consultantProfile, clients } = useConsultingPortfolioData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const visibleClients = clients.filter((client) => {
    const matchesSearch =
      searchTerm.trim().length === 0 ||
      `${client.name} ${client.country} ${client.industrySegment}`.toLowerCase().includes(searchTerm.trim().toLowerCase());
    const derivedStatus = getPortfolioStatus(client);
    const matchesStatus = statusFilter === "all" || derivedStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalScenarios = clients.reduce((sum, client) => sum + client.scenarioCount, 0);
  const approvedScenarios = clients.reduce((sum, client) => sum + client.approvedScenarioCount, 0);
  const clientsNeedingFollowUp = clients.filter((client) => !client.erpSyncEnabled || client.scenarioCount === 0).length;

  if (loading) {
    return (
      <div className={shellStyles.page}>
        <header className={shellStyles.header}>
          <p className={shellStyles.eyebrow}>Consulting Workspace</p>
          <h1 className={shellStyles.title}>Loading client portfolio...</h1>
        </header>
      </div>
    );
  }

  return (
    <div className={shellStyles.page}>
      <header className={shellStyles.header}>
        <p className={shellStyles.eyebrow}>Consulting Workspace</p>
        <div className={shellStyles.headerRow}>
          <div className={shellStyles.titleBlock}>
            <h1 className={shellStyles.title}>Client Portfolio</h1>
            <p className={shellStyles.subtitle}>
              Advisory access stays inside assigned client scope. Portfolio health here is a working board for
              consultants, not a substitute for client-owned approvals or verifier independence.
            </p>
          </div>
        </div>
        <div className={shellStyles.scopeNote}>
          <span className={shellStyles.emphasis}>SoD guardrail:</span> consultants can advise, benchmark, and model,
          but the portal must still keep final approvals, signoff, and verifier decisions outside the consulting lane.
        </div>
      </header>

      <main className={shellStyles.body}>
        {error ? (
          <div className={shellStyles.alert} data-tone="danger">
            {error}
          </div>
        ) : null}

        <section className={shellStyles.metricsGrid}>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Assigned Clients</p>
            <p className={shellStyles.metricValue}>{clients.length}</p>
            <p className={shellStyles.metricHint}>Organizations visible through the active consulting assignment.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Scenario Rows</p>
            <p className={shellStyles.metricValue}>{totalScenarios}</p>
            <p className={shellStyles.metricHint}>Scenario records available for advisory and pathway review.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Display Approved</p>
            <p className={shellStyles.metricValue}>{approvedScenarios}</p>
            <p className={shellStyles.metricHint}>Scenario rows already approved for controlled display.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Needs Follow-up</p>
            <p className={shellStyles.metricValue}>{clientsNeedingFollowUp}</p>
            <p className={shellStyles.metricHint}>Clients with no live scenarios or incomplete ERP posture.</p>
          </article>
        </section>

        <section className={shellStyles.contentGrid}>
          <aside className={shellStyles.sidebarStack}>
            <section className={shellStyles.card}>
              <div className={shellStyles.cardHeader}>
                <div>
                  <h2 className={shellStyles.cardTitle}>Consultant Profile</h2>
                  <p className={shellStyles.cardDescription}>
                    Keep who is advising this portfolio explicit for audit and independence review.
                  </p>
                </div>
              </div>
              <div className={shellStyles.cardSection}>
                {consultantProfile ? (
                  <div className={styles.detailList}>
                    <div className={styles.detailRow}>
                      <span>Name</span>
                      <span className={styles.detailValue}>{consultantProfile.full_name}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Email</span>
                      <span className={styles.detailValue}>{consultantProfile.email}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Designation</span>
                      <span className={styles.detailValue}>{consultantProfile.designation ?? "Unspecified"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span>Qualification</span>
                      <span className={styles.detailValue}>{consultantProfile.qualification ?? "Unspecified"}</span>
                    </div>
                  </div>
                ) : (
                  <div className={shellStyles.alert} data-tone="warning">
                    No consultant profile row was found for this user yet. The portfolio still falls back to session org
                    scope when available.
                  </div>
                )}
              </div>
            </section>

            <section className={shellStyles.card}>
              <div className={shellStyles.cardHeader}>
                <div>
                  <h2 className={shellStyles.cardTitle}>Advisory Routes</h2>
                  <p className={shellStyles.cardDescription}>
                    These routes are the current consulting lane inside the portal.
                  </p>
                </div>
              </div>
              <div className={shellStyles.cardSection}>
                <div className={styles.routeList}>
                  <Link href="/consulting/scenario" className={styles.routeLink}>
                    <h3 className={styles.routeTitle}>Scenario Modeler</h3>
                    <p className={styles.routeDescription}>
                      Review synthetic pathways, AI confidence, and display approval posture.
                    </p>
                  </Link>
                  <Link href="/dashboard/reports" className={styles.routeLink}>
                    <h3 className={styles.routeTitle}>Annual Emissions</h3>
                    <p className={styles.routeDescription}>
                      Use the live annual inventory as the baseline for advisory planning.
                    </p>
                  </Link>
                </div>
              </div>
            </section>

            <section className={shellStyles.card}>
              <div className={shellStyles.cardHeader}>
                <div>
                  <h2 className={shellStyles.cardTitle}>Portfolio Guardrails</h2>
                </div>
              </div>
              <div className={shellStyles.cardSection}>
                <div className={styles.insightGrid}>
                  <div className={styles.insightCard}>
                    <p className={styles.insightLabel}>Approval Separation</p>
                    <p className={styles.insightHint}>
                      Client approvals, regulatory filing, and verifier opinion must remain outside this workspace.
                    </p>
                  </div>
                  <div className={styles.insightCard}>
                    <p className={styles.insightLabel}>Scope Discipline</p>
                    <p className={styles.insightHint}>
                      Only assigned client organizations appear here. Cross-client switching should never widen scope
                      beyond active assignments.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </aside>

          <section className={shellStyles.card}>
            <div className={shellStyles.cardHeader}>
              <div>
                <h2 className={shellStyles.cardTitle}>Portfolio Board</h2>
                <p className={shellStyles.cardDescription}>
                  Search and filter assigned organizations to see where advisory support is active, stale, or waiting
                  for follow-up.
                </p>
              </div>
            </div>

            <div className={shellStyles.cardSection}>
              <div className={styles.filterBar}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="portfolio-search">
                    Search clients
                  </label>
                  <input
                    id="portfolio-search"
                    className={styles.input}
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by client, country, or segment"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="portfolio-status">
                    Status filter
                  </label>
                  <select
                    id="portfolio-status"
                    className={styles.select}
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="all">All statuses</option>
                    <option value="Advisory live">Advisory live</option>
                    <option value="Needs systems follow-up">Needs systems follow-up</option>
                    <option value="Baseline only">Baseline only</option>
                    <option value="Engaged">Engaged</option>
                  </select>
                </div>
              </div>
            </div>

            {visibleClients.length === 0 ? (
              <div className={shellStyles.emptyState}>
                <h3 className={shellStyles.emptyTitle}>No client portfolio rows matched this view.</h3>
                <p className={shellStyles.emptyDescription}>
                  Adjust the search or status filter, or confirm the current consultant assignment includes client
                  organizations.
                </p>
              </div>
            ) : (
              <div className={shellStyles.tableWrapper}>
                <table className={shellStyles.table}>
                  <thead>
                    <tr>
                      <th className={shellStyles.tableHeaderCell}>Client</th>
                      <th className={shellStyles.tableHeaderCell}>Operational Posture</th>
                      <th className={shellStyles.tableHeaderCell}>Scenario Coverage</th>
                      <th className={shellStyles.tableHeaderCell}>Reporting Context</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleClients.map((client) => (
                      <tr key={client.id}>
                        <td className={shellStyles.tableCell}>
                          <div className={shellStyles.rowTitle}>{client.name}</div>
                          <div className={shellStyles.rowMeta}>
                            {client.country} | {client.industrySegment}
                          </div>
                          <div className={shellStyles.rowMeta}>
                            Onboarded {client.onboardedAt ? new Date(client.onboardedAt).toLocaleDateString("en-IN") : "n/a"}
                          </div>
                        </td>
                        <td className={shellStyles.tableCell}>
                          <div className={shellStyles.badgeRow}>
                            <span className={shellStyles.badge} data-tone={getPortfolioTone(client)}>
                              {getPortfolioStatus(client)}
                            </span>
                            <span className={shellStyles.badge} data-tone={client.erpSyncEnabled ? "success" : "warning"}>
                              {client.erpSyncEnabled ? "ERP live" : "ERP pending"}
                            </span>
                          </div>
                          <div className={shellStyles.rowMeta}>{client.siteCount} active site(s) visible in scope</div>
                        </td>
                        <td className={shellStyles.tableCell}>
                          <div className={shellStyles.rowMeta}>{client.scenarioCount} scenario row(s)</div>
                          <div className={shellStyles.rowMeta}>{client.approvedScenarioCount} approved for display</div>
                          <div className={shellStyles.rowMeta}>
                            Avg AI confidence: {client.avgConfidencePct == null ? "n/a" : `${client.avgConfidencePct.toFixed(0)}%`}
                          </div>
                        </td>
                        <td className={shellStyles.tableCell}>
                          <div className={styles.pillRow}>
                            {client.brsrRequired ? <span className={styles.pill}>BRSR</span> : null}
                            {client.brsrCoreRequired ? <span className={styles.pill}>BRSR Core</span> : null}
                            <span className={styles.pill}>{client.reportingCurrency}</span>
                            <span className={styles.pill}>{client.onTrackTargets} on-track target(s)</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
