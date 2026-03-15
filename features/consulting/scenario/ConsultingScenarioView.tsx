"use client";

import { useEffect, useState } from "react";

import { AIDataPoint, type AIConfidenceLevel, type AIReviewState } from "@/components/ai/AIDataPoint";
import shellStyles from "@/features/portal/WorkspaceShell.module.css";
import styles from "@/features/consulting/ConsultingWorkspace.module.css";
import { useConsultingScenarioData } from "@/features/consulting/scenario/useConsultingScenarioData";

function normalizePercent(value: number | null): number | null {
  if (value == null) {
    return null;
  }

  return value <= 1 ? value * 100 : value;
}

function getConfidenceLevel(value: number | null): AIConfidenceLevel {
  const normalized = normalizePercent(value);

  if (normalized == null) {
    return "low";
  }

  if (normalized >= 80) {
    return "high";
  }

  if (normalized >= 55) {
    return "medium";
  }

  return "low";
}

function getReviewState(isApprovedForDisplay: boolean): AIReviewState {
  return isApprovedForDisplay ? "reviewed" : "pending";
}

function getConfidenceTone(value: number | null): "success" | "warning" | "danger" {
  const confidence = getConfidenceLevel(value);

  if (confidence === "high") {
    return "success";
  }

  if (confidence === "medium") {
    return "warning";
  }

  return "danger";
}

/**
 * Scenario modeler workspace.
 *
 * The frontend uses the compatibility view from the dump so advisors can see
 * which scenarios are synthetic, reportable, or approved for display without
 * pretending modeled outputs are measured emissions.
 */
export function ConsultingScenarioView() {
  const { loading, error, scenarios } = useConsultingScenarioData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  const visibleScenarios = scenarios.filter((scenario) => {
    const matchesSearch =
      searchTerm.trim().length === 0 ||
      `${scenario.scenarioName} ${scenario.organizationName} ${scenario.type}`.toLowerCase().includes(searchTerm.trim().toLowerCase());
    const matchesStatus = statusFilter === "all" || scenario.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    if (visibleScenarios.length === 0) {
      setSelectedScenarioId(null);
      return;
    }

    if (!selectedScenarioId || !visibleScenarios.some((scenario) => scenario.id === selectedScenarioId)) {
      setSelectedScenarioId(visibleScenarios[0].id);
    }
  }, [selectedScenarioId, visibleScenarios]);

  const selectedScenario =
    visibleScenarios.find((scenario) => scenario.id === selectedScenarioId) ?? visibleScenarios[0] ?? null;

  if (loading) {
    return (
      <div className={shellStyles.page}>
        <header className={shellStyles.header}>
          <p className={shellStyles.eyebrow}>Consulting Workspace</p>
          <h1 className={shellStyles.title}>Loading scenario modeler...</h1>
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
            <h1 className={shellStyles.title}>Scenario Modeler</h1>
            <p className={shellStyles.subtitle}>
              Scenario rows in this view are synthetic planning outputs from the digital-twin pipeline. They support
              advisory decisions, but they do not replace approved reporting or verifier-led assurance.
            </p>
          </div>
        </div>
        <div className={shellStyles.scopeNote}>
          <span className={shellStyles.emphasis}>Modeling guardrail:</span> AI confidence, reportability, and display
          approval are shown explicitly so the portal never presents scenarios as silent facts.
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
            <p className={shellStyles.metricLabel}>Scenario Rows</p>
            <p className={shellStyles.metricValue}>{scenarios.length}</p>
            <p className={shellStyles.metricHint}>Synthetic pathway rows visible through current client scope.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Reportable</p>
            <p className={shellStyles.metricValue}>{scenarios.filter((scenario) => scenario.isReportable).length}</p>
            <p className={shellStyles.metricHint}>Rows explicitly marked reportable in the model layer.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Display Approved</p>
            <p className={shellStyles.metricValue}>{scenarios.filter((scenario) => scenario.isApprovedForDisplay).length}</p>
            <p className={shellStyles.metricHint}>Rows approved for controlled display to users.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Model Errors</p>
            <p className={shellStyles.metricValue}>{scenarios.filter((scenario) => Boolean(scenario.errorMessage)).length}</p>
            <p className={shellStyles.metricHint}>Rows where the model still carries an execution error or warning.</p>
          </article>
        </section>

        <section className={shellStyles.contentGrid}>
          <aside className={shellStyles.sidebarStack}>
            {selectedScenario ? (
              <section className={shellStyles.card}>
                <div className={shellStyles.cardHeader}>
                  <div>
                    <h2 className={shellStyles.cardTitle}>Selected Scenario</h2>
                    <p className={shellStyles.cardDescription}>
                      AI and display posture for the scenario you are currently reviewing.
                    </p>
                  </div>
                </div>
                <div className={shellStyles.cardSection}>
                  <div className={styles.scenarioCardGrid}>
                    <AIDataPoint
                      label={selectedScenario.scenarioName}
                      value={`${normalizePercent(selectedScenario.aiConfidenceScore)?.toFixed(0) ?? "0"}% confidence`}
                      confidence={getConfidenceLevel(selectedScenario.aiConfidenceScore)}
                      source="ghg_scenarios compatibility view"
                      reviewState={getReviewState(selectedScenario.isApprovedForDisplay)}
                      description="Model output remains advisory until it is approved for display and interpreted by a human reviewer."
                    />

                    <div className={styles.scenarioMetaList}>
                      <div className={styles.scenarioMetaRow}>
                        <span>Organization</span>
                        <span className={styles.detailValue}>{selectedScenario.organizationName}</span>
                      </div>
                      <div className={styles.scenarioMetaRow}>
                        <span>Status</span>
                        <span className={styles.detailValue}>{selectedScenario.status}</span>
                      </div>
                      <div className={styles.scenarioMetaRow}>
                        <span>Base FY</span>
                        <span className={styles.detailValue}>{selectedScenario.baseFyYear ?? "n/a"}</span>
                      </div>
                      <div className={styles.scenarioMetaRow}>
                        <span>Projection years</span>
                        <span className={styles.detailValue}>{selectedScenario.projectionYears ?? "n/a"}</span>
                      </div>
                      <div className={styles.scenarioMetaRow}>
                        <span>Run duration</span>
                        <span className={styles.detailValue}>
                          {selectedScenario.runDurationMs == null ? "n/a" : `${selectedScenario.runDurationMs} ms`}
                        </span>
                      </div>
                    </div>

                    {selectedScenario.description ? (
                      <p className={styles.scenarioDescription}>{selectedScenario.description}</p>
                    ) : null}

                    {selectedScenario.errorMessage ? (
                      <div className={shellStyles.alert} data-tone="warning">
                        {selectedScenario.errorMessage}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}

            <section className={shellStyles.card}>
              <div className={shellStyles.cardHeader}>
                <div>
                  <h2 className={shellStyles.cardTitle}>Scenario Rules</h2>
                </div>
              </div>
              <div className={shellStyles.cardSection}>
                <div className={styles.insightGrid}>
                  <div className={styles.insightCard}>
                    <p className={styles.insightLabel}>Synthetic Outputs</p>
                    <p className={styles.insightHint}>
                      The compatibility view itself declares these rows synthetic. Use them for planning, not as measured
                      emissions.
                    </p>
                  </div>
                  <div className={styles.insightCard}>
                    <p className={styles.insightLabel}>Display Approval</p>
                    <p className={styles.insightHint}>
                      `is_approved_for_display` stays visible because presentation approval is a separate control from
                      model generation.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </aside>

          <section className={shellStyles.card}>
            <div className={shellStyles.cardHeader}>
              <div>
                <h2 className={shellStyles.cardTitle}>Scenario Ledger</h2>
                <p className={shellStyles.cardDescription}>
                  Review modeled pathways across the currently assigned client scope.
                </p>
              </div>
            </div>

            <div className={shellStyles.cardSection}>
              <div className={styles.filterBar}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="scenario-search">
                    Search scenarios
                  </label>
                  <input
                    id="scenario-search"
                    className={styles.input}
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by scenario, org, or type"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="scenario-status">
                    Status filter
                  </label>
                  <select
                    id="scenario-status"
                    className={styles.select}
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="all">All statuses</option>
                    {Array.from(new Set(scenarios.map((scenario) => scenario.status))).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {visibleScenarios.length === 0 ? (
              <div className={shellStyles.emptyState}>
                <h3 className={shellStyles.emptyTitle}>No scenario rows matched this view.</h3>
                <p className={shellStyles.emptyDescription}>
                  Adjust the search or filter, or confirm the current consultant assignment includes modeled clients.
                </p>
              </div>
            ) : (
              <div className={shellStyles.tableWrapper}>
                <table className={shellStyles.table}>
                  <thead>
                    <tr>
                      <th className={shellStyles.tableHeaderCell}>Scenario</th>
                      <th className={shellStyles.tableHeaderCell}>Model Posture</th>
                      <th className={shellStyles.tableHeaderCell}>AI / Display</th>
                      <th className={shellStyles.tableHeaderCell}>Signals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleScenarios.map((scenario) => (
                      <tr key={scenario.id}>
                        <td className={shellStyles.tableCell}>
                          <button
                            type="button"
                            className={shellStyles.button}
                            onClick={() => setSelectedScenarioId(scenario.id)}
                          >
                            Inspect
                          </button>
                          <div className={shellStyles.rowTitle}>{scenario.scenarioName}</div>
                          <div className={shellStyles.rowMeta}>
                            {scenario.organizationName} | {scenario.type}
                          </div>
                          <div className={shellStyles.rowMeta}>Updated {new Date(scenario.updatedAt).toLocaleString("en-IN")}</div>
                        </td>
                        <td className={shellStyles.tableCell}>
                          <div className={shellStyles.badgeRow}>
                            <span className={shellStyles.badge} data-tone={scenario.errorMessage ? "warning" : "info"}>
                              {scenario.status}
                            </span>
                            {scenario.isReportable ? (
                              <span className={shellStyles.badge} data-tone="success">
                                Reportable
                              </span>
                            ) : null}
                          </div>
                          <div className={shellStyles.rowMeta}>Base FY {scenario.baseFyYear ?? "n/a"}</div>
                          <div className={shellStyles.rowMeta}>
                            {scenario.assumptionCount} assumption field(s) | {scenario.outputCount} output field(s)
                          </div>
                        </td>
                        <td className={shellStyles.tableCell}>
                          <div className={shellStyles.badgeRow}>
                            <span className={shellStyles.badge} data-tone={getConfidenceTone(scenario.aiConfidenceScore)}>
                              {normalizePercent(scenario.aiConfidenceScore)?.toFixed(0) ?? "0"}% confidence
                            </span>
                            <span
                              className={shellStyles.badge}
                              data-tone={scenario.isApprovedForDisplay ? "success" : "warning"}
                            >
                              {scenario.isApprovedForDisplay ? "Display approved" : "Needs approval"}
                            </span>
                          </div>
                          <div className={shellStyles.rowMeta}>{scenario.dataSource}</div>
                        </td>
                        <td className={shellStyles.tableCell}>
                          <div className={shellStyles.rowMeta}>
                            {scenario.runDurationMs == null ? "Run duration n/a" : `${scenario.runDurationMs} ms`}
                          </div>
                          <div className={shellStyles.rowMeta}>
                            {scenario.displayApprovedAt
                              ? `Approved ${new Date(scenario.displayApprovedAt).toLocaleDateString("en-IN")}`
                              : "Approval pending"}
                          </div>
                          {scenario.errorMessage ? (
                            <div className={shellStyles.rowMeta}>{scenario.errorMessage}</div>
                          ) : null}
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
