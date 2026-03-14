"use client";

import styles from "@/features/portal/WorkspaceShell.module.css";
import { useEmissionFactorCoverageData } from "@/features/accounting/useAccountingWorkspaceData";

export function EmissionFactorsView() {
  const { loading, error, factors, factorLibrary, linkedSources, missingSources } = useEmissionFactorCoverageData();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Accounting Workspace</p>
          <h1 className={styles.title}>Loading factor library...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Accounting Workspace</p>
        <div className={styles.headerRow}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Emission Factor Library</h1>
            <p className={styles.subtitle}>
              Live coverage view showing which registered sources already link to a current factor and which ones still
              need mapping before downstream calculations can stay complete.
            </p>
          </div>
        </div>
      </header>

      <main className={styles.body}>
        {error ? (
          <div className={styles.alert} data-tone="danger">
            {error}
          </div>
        ) : null}

        <section className={styles.metricsGrid}>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Current Factors</p>
            <p className={styles.metricValue}>{factorLibrary.length}</p>
            <p className={styles.metricHint}>Reference factors currently exposed by the live schema.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Linked Sources</p>
            <p className={styles.metricValue}>{linkedSources}</p>
            <p className={styles.metricHint}>Source register rows already mapped to a live emission factor.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Missing Coverage</p>
            <p className={styles.metricValue}>{missingSources}</p>
            <p className={styles.metricHint}>Sources still missing a factor assignment and therefore needing follow-up.</p>
          </article>
        </section>

        <section className={styles.contentGrid}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Source Coverage</h2>
                <p className={styles.cardDescription}>
                  Source register linkage matters because downstream readings and reports depend on the factor mapping
                  staying current.
                </p>
              </div>
            </div>

            {factors.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No sources are visible in the current scope.</h3>
                <p className={styles.emptyDescription}>
                  Either the source register is empty or the active assignment scope does not expose any rows.
                </p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeaderCell}>Source</th>
                      <th className={styles.tableHeaderCell}>Site</th>
                      <th className={styles.tableHeaderCell}>Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {factors.map((factor) => (
                      <tr key={factor.id}>
                        <td className={styles.tableCell}>
                          <div className={styles.rowTitle}>{factor.sourceName}</div>
                          <div className={styles.rowMeta}>
                            Scope {factor.scope} | {factor.sourceCategory}
                          </div>
                        </td>
                        <td className={styles.tableCell}>{factor.siteName}</td>
                        <td className={styles.tableCell}>
                          <div className={styles.badgeRow}>
                            <span
                              className={styles.badge}
                              data-tone={factor.coverageStatus === "linked" ? "success" : "warning"}
                            >
                              {factor.coverageStatus}
                            </span>
                          </div>
                          <div className={styles.rowMeta}>
                            {factor.factorName
                              ? `${factor.factorName} (${factor.factorCode} ${factor.factorVersion})`
                              : "No factor assigned yet"}
                          </div>
                          {factor.factorUnit ? (
                            <div className={styles.rowMeta}>
                              {factor.factorUnit} | Region {factor.factorRegion ?? "IN"}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className={styles.sidebarStack}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Library Snapshot</h2>
                  <p className={styles.cardDescription}>
                    Current factors are globally readable, but only the linked subset is actually active for your source
                    register today.
                  </p>
                </div>
              </div>
              <div className={styles.list}>
                {factorLibrary.slice(0, 8).map((factor) => (
                  <div key={factor.id} className={styles.listItem}>
                    <div className={styles.rowTitle}>{factor.factor_name}</div>
                    <div className={styles.rowMeta}>
                      {factor.factor_code} {factor.factor_version} | Scope {factor.scope}
                    </div>
                    <div className={styles.rowMeta}>
                      {Number(factor.kgco2e_per_unit).toLocaleString("en-IN", { maximumFractionDigits: 6 })} kgCO2e per{" "}
                      {factor.activity_unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
