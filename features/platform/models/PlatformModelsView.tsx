import { createServerSupabaseClient } from "@/lib/supabase/admin";

import styles from "@/features/platform/shared/PlatformWorkspace.module.css";
import { requirePlatformStaffActor } from "@/features/platform/shared/platformWorkspaceAccess";

interface TwinModelRow {
  id: string;
  model_name: string;
  model_type: string;
  model_version: string;
  algorithm: string | null;
  framework: string | null;
  accuracy_metric: string | null;
  accuracy_value: number | null;
  is_active: boolean;
  requires_approval: boolean;
  approved_at: string | null;
  deprecated_at: string | null;
  allowed_scenario_types: string[] | null;
  created_at: string | null;
}

interface ScenarioRow {
  id: string;
  organization_id: string;
  scenario_name: string;
  scenario_type: string;
  base_fy_year: string;
  status: string;
  is_reportable: boolean;
  is_approved_for_display: boolean;
  ai_confidence_score: number | null;
  updated_at: string | null;
}

interface PublicModelRow {
  id: string;
  model_name: string;
  model_type: string;
  version: string;
  accuracy_metric: string | null;
  accuracy_value: number | null;
  is_active: boolean | null;
  deprecated_at: string | null;
  created_at: string | null;
}

interface ValidationSummaryRow {
  organization_id: string;
  table_name: string;
  validation_status: string;
  risk_level: string | null;
  record_count: number;
  avg_trust: number | null;
  avg_anomaly_score: number | null;
  flagged_count: number | null;
}

interface OrganizationRow {
  id: string;
  legal_name: string;
  trade_name: string | null;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function formatToken(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPercent(value: number | null): string {
  if (value == null) {
    return "Not scored";
  }

  const normalized = value <= 1 ? value * 100 : value;
  return `${normalized.toFixed(1)}%`;
}

/**
 * Platform models workspace for digital twin and data-science roles.
 *
 * Why this route exists:
 * - These roles need a dedicated surface for synthetic scenarios, model
 *   posture, and AI validation signals.
 * - The route keeps the regulatory boundary explicit: scenario data stays
 *   non-reportable and separate from actual emissions records.
 */
export async function PlatformModelsView() {
  let errorMessage: string | null = null;
  let models: TwinModelRow[] = [];
  let scenarios: ScenarioRow[] = [];
  let publicModels: PublicModelRow[] = [];
  let validationSummary: ValidationSummaryRow[] = [];
  let organizations: OrganizationRow[] = [];

  try {
    await requirePlatformStaffActor(["digital_twin_engineer", "platform_data_scientist"]);

    const admin = createServerSupabaseClient();
    const digitalTwin = admin.schema("digital_twin");
    const [
      modelResponse,
      scenarioResponse,
      publicModelResponse,
      validationResponse,
      organizationResponse,
    ] = await Promise.all([
      digitalTwin
        .from("dt_models")
        .select(
          "id, model_name, model_type, model_version, algorithm, framework, accuracy_metric, accuracy_value, is_active, requires_approval, approved_at, deprecated_at, allowed_scenario_types, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(80),
      digitalTwin
        .from("dt_scenarios")
        .select(
          "id, organization_id, scenario_name, scenario_type, base_fy_year, status, is_reportable, is_approved_for_display, ai_confidence_score, updated_at",
        )
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(120),
      admin
        .from("v_ai_models_safe")
        .select("id, model_name, model_type, version, accuracy_metric, accuracy_value, is_active, deprecated_at, created_at")
        .order("created_at", { ascending: false })
        .limit(80),
      admin
        .from("mv_ai_validation_summary")
        .select("organization_id, table_name, validation_status, risk_level, record_count, avg_trust, avg_anomaly_score, flagged_count")
        .order("record_count", { ascending: false })
        .limit(120),
      admin
        .from("client_organizations")
        .select("id, legal_name, trade_name")
        .is("deleted_at", null)
        .order("legal_name"),
    ]);

    if (
      modelResponse.error ||
      scenarioResponse.error ||
      publicModelResponse.error ||
      validationResponse.error ||
      organizationResponse.error
    ) {
      throw new Error("PLATFORM_MODELS_DATA_UNAVAILABLE");
    }

    models = (modelResponse.data ?? []) as TwinModelRow[];
    scenarios = (scenarioResponse.data ?? []) as ScenarioRow[];
    publicModels = (publicModelResponse.data ?? []) as PublicModelRow[];
    validationSummary = (validationResponse.data ?? []) as ValidationSummaryRow[];
    organizations = (organizationResponse.data ?? []) as OrganizationRow[];
  } catch (error) {
    console.error("Failed to load platform models workspace:", error);
    errorMessage =
      "Model and digital twin data is unavailable right now. Verify schema access and reload the page.";
  }

  const organizationNameById = new Map(
    organizations.map((organization) => [
      organization.id,
      organization.trade_name?.trim() || organization.legal_name,
    ]),
  );

  const activeTwinModels = models.filter((model) => model.is_active).length;
  const scenariosApprovedForDisplay = scenarios.filter((scenario) => scenario.is_approved_for_display).length;
  const flaggedValidationRows = validationSummary.reduce(
    (sum, row) => sum + Number(row.flagged_count ?? 0),
    0,
  );
  const scoredScenarioCount = scenarios.filter((scenario) => scenario.ai_confidence_score != null).length;
  const averageScenarioConfidence =
    scoredScenarioCount === 0
      ? null
      : scenarios.reduce((sum, scenario) => sum + Number(scenario.ai_confidence_score ?? 0), 0) /
        scoredScenarioCount;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Platform Models</p>
        <h1 className={styles.title}>Digital Twin And AI Validation Workspace</h1>
        <p className={styles.subtitle}>
          Track synthetic scenario posture, model registry health, and AI validation pressure from one dedicated lane.
          This workspace keeps the non-reportable digital-twin boundary visible so modeling does not blur into actual
          disclosure data.
        </p>
      </header>

      {errorMessage ? (
        <div className={styles.alert} data-tone="warning">
          {errorMessage}
        </div>
      ) : null}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Active Twin Models</p>
          <p className={styles.metricValue}>{activeTwinModels}</p>
          <p className={styles.metricHint}>Digital twin models currently marked active in the model registry.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Scenario Runs</p>
          <p className={styles.metricValue}>{scenarios.length}</p>
          <p className={styles.metricHint}>Synthetic scenario rows currently visible in the platform model lane.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Display Approved</p>
          <p className={styles.metricValue}>{scenariosApprovedForDisplay}</p>
          <p className={styles.metricHint}>Scenario rows approved for display while remaining non-reportable.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Flagged AI Records</p>
          <p className={styles.metricValue}>{flaggedValidationRows}</p>
          <p className={styles.metricHint}>Validation rows currently flagged for audit in the summary view.</p>
        </article>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Regulatory Guardrails</h2>
            <div className={styles.ruleList}>
              <div className={styles.ruleItem}>
                <p className={styles.ruleTitle}>Scenario boundary</p>
                <p className={styles.ruleMeta}>
                  Digital-twin scenarios remain synthetic and non-reportable. They support analysis, not direct
                  insertion into actual emissions disclosures.
                </p>
              </div>
              <div className={styles.ruleItem}>
                <p className={styles.ruleTitle}>Average scenario confidence</p>
                <p className={styles.ruleMeta}>
                  {averageScenarioConfidence == null
                    ? "No scenario confidence scores are visible yet."
                    : `Visible scenarios currently average ${formatPercent(averageScenarioConfidence)} confidence.`}
                </p>
              </div>
              <div className={styles.ruleItem}>
                <p className={styles.ruleTitle}>Public AI model lane</p>
                <p className={styles.ruleMeta}>
                  The safe AI model view excludes deployment endpoints while still exposing model-card and accuracy
                  posture for frontend auditability.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>AI Validation Pressure</h2>
            <div className={styles.ruleList}>
              {validationSummary.slice(0, 5).map((row, index) => (
                <div key={`${row.table_name}-${row.validation_status}-${index}`} className={styles.ruleItem}>
                  <p className={styles.ruleTitle}>{row.table_name}</p>
                  <p className={styles.ruleMeta}>
                    {formatToken(row.validation_status)} | {row.record_count} row(s) | avg trust{" "}
                    {row.avg_trust != null ? row.avg_trust.toFixed(2) : "n/a"} | flagged {row.flagged_count ?? 0}
                  </p>
                </div>
              ))}
              {validationSummary.length === 0 ? (
                <div className={styles.ruleItem}>
                  <p className={styles.ruleMeta}>
                    No AI validation summary rows are visible in the current environment snapshot yet.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </aside>

        <div className={styles.mainStack}>
          <section className={styles.tableCard}>
            <h2 className={styles.cardTitle}>Digital Twin Model Registry</h2>
            {models.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No digital twin models are visible yet.</h3>
                <p className={styles.emptyCopy}>
                  The platform model registry is currently empty or inaccessible in this environment.
                </p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeaderCell}>Model</th>
                      <th className={styles.tableHeaderCell}>Accuracy / Approval</th>
                      <th className={styles.tableHeaderCell}>Allowed Scenario Types</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.slice(0, 8).map((model) => (
                      <tr key={model.id}>
                        <td className={styles.tableCell}>
                          <p className={styles.tableName}>
                            {model.model_name} <span className={styles.mono}>v{model.model_version}</span>
                          </p>
                          <p className={styles.tableMeta}>
                            {formatToken(model.model_type)} | {model.framework ?? "Framework not recorded"} |{" "}
                            {model.algorithm ?? "Algorithm not recorded"}
                          </p>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.stackedBadges}>
                            <span className={styles.badge} data-tone={model.is_active ? "success" : "neutral"}>
                              {model.is_active ? "Active" : "Inactive"}
                            </span>
                            <span
                              className={styles.badge}
                              data-tone={model.requires_approval ? "warning" : "info"}
                            >
                              {model.requires_approval ? "Approval gate" : "Direct use"}
                            </span>
                          </div>
                          <p className={styles.tableMeta}>
                            {model.accuracy_metric ?? "Accuracy metric not recorded"} |{" "}
                            {model.accuracy_value != null ? model.accuracy_value.toFixed(3) : "n/a"} | approved{" "}
                            {formatDateTime(model.approved_at)}
                          </p>
                        </td>
                        <td className={styles.tableCell}>
                          <p className={styles.tableMeta}>
                            {model.allowed_scenario_types?.length
                              ? model.allowed_scenario_types.map(formatToken).join(", ")
                              : "Scenario types not recorded"}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={styles.tableCard}>
            <h2 className={styles.cardTitle}>Scenario Execution Ledger</h2>
            {scenarios.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No synthetic scenarios are visible yet.</h3>
                <p className={styles.emptyCopy}>
                  Scenario rows will appear here once the digital-twin lane starts producing runs in this environment.
                </p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeaderCell}>Scenario</th>
                      <th className={styles.tableHeaderCell}>Status</th>
                      <th className={styles.tableHeaderCell}>Boundary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.slice(0, 10).map((scenario) => (
                      <tr key={scenario.id}>
                        <td className={styles.tableCell}>
                          <p className={styles.tableName}>{scenario.scenario_name}</p>
                          <p className={styles.tableMeta}>
                            {organizationNameById.get(scenario.organization_id) ?? "Unknown organization"} | FY{" "}
                            {scenario.base_fy_year}
                          </p>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.stackedBadges}>
                            <span
                              className={styles.badge}
                              data-tone={
                                scenario.status === "completed"
                                  ? "success"
                                  : scenario.status === "failed"
                                    ? "danger"
                                    : "warning"
                              }
                            >
                              {formatToken(scenario.status)}
                            </span>
                            <span
                              className={styles.badge}
                              data-tone={scenario.is_approved_for_display ? "info" : "neutral"}
                            >
                              {scenario.is_approved_for_display ? "Display approved" : "Display pending"}
                            </span>
                          </div>
                          <p className={styles.tableMeta}>
                            {formatToken(scenario.scenario_type)} | confidence {formatPercent(scenario.ai_confidence_score)}
                          </p>
                        </td>
                        <td className={styles.tableCell}>
                          <p className={styles.tableMeta}>
                            {scenario.is_reportable ? "Reportable" : "Synthetic only"} | updated{" "}
                            {formatDateTime(scenario.updated_at)}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={styles.tableCard}>
            <h2 className={styles.cardTitle}>Public AI Model Registry</h2>
            {publicModels.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No safe AI model rows are visible.</h3>
                <p className={styles.emptyCopy}>
                  The safe AI registry view will appear here once public AI model metadata is available.
                </p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeaderCell}>AI Model</th>
                      <th className={styles.tableHeaderCell}>Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {publicModels.slice(0, 6).map((model) => (
                      <tr key={model.id}>
                        <td className={styles.tableCell}>
                          <p className={styles.tableName}>
                            {model.model_name} <span className={styles.mono}>v{model.version}</span>
                          </p>
                          <p className={styles.tableMeta}>{formatToken(model.model_type)}</p>
                        </td>
                        <td className={styles.tableCell}>
                          <p className={styles.tableMeta}>
                            {model.accuracy_metric ?? "Accuracy metric not recorded"} |{" "}
                            {model.accuracy_value != null ? model.accuracy_value.toFixed(3) : "n/a"}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
