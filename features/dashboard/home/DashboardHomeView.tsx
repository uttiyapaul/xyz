import Link from "next/link";

import styles from "@/features/portal/WorkspaceShell.module.css";
import { getDashboardShortcutCards } from "@/lib/auth/dashboardRegistry";
import { loadDashboardHomeSnapshot } from "@/features/dashboard/home/loadDashboardHomeSnapshot";

function RoleNotice({
  roleLabel,
  summary,
  guardrail,
}: {
  roleLabel: string;
  summary: string;
  guardrail: string;
}) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Dashboard Home</p>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{roleLabel}</h1>
          <p className={styles.subtitle}>{summary}</p>
        </div>
        <div className={styles.scopeNote}>
          <span className={styles.emphasis}>Guardrail:</span> {guardrail}
        </div>
      </header>
      <main className={styles.body}>
        <div className={styles.alert} data-tone="warning">
          This role does not open an interactive workspace in the portal. Use curated report delivery or lifecycle
          handling instead of operational dashboard navigation.
        </div>
      </main>
    </div>
  );
}

/**
 * Dashboard home is now server-rendered and data-backed.
 *
 * Why this matters:
 * - users land on a real scoped home instead of a client-only launchpad
 * - the first render uses live database reads and request-cookie auth
 * - empty states stay explicit when the role has access but no visible data yet
 */
export async function DashboardHomeView() {
  const snapshot = await loadDashboardHomeSnapshot();
  const shortcuts = getDashboardShortcutCards(snapshot.role);
  const roleLabel = snapshot.role.replace(/_/g, " ");

  if (!snapshot.profile.interactive) {
    return (
      <RoleNotice
        roleLabel={snapshot.profile.title}
        summary={`You are currently signed in as ${roleLabel}. ${snapshot.profile.summary}`}
        guardrail={snapshot.profile.guardrail}
      />
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Dashboard Home</p>
        <div className={styles.headerRow}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>{snapshot.profile.title}</h1>
            <p className={styles.subtitle}>{snapshot.profile.summary}</p>
          </div>
        </div>
        <div className={styles.scopeNote}>
          <span className={styles.emphasis}>Guardrail:</span> {snapshot.profile.guardrail}
        </div>
      </header>

      <main className={styles.body}>
        {snapshot.dataMessage ? (
          <div className={styles.alert} data-tone="info">
            {snapshot.dataMessage}
          </div>
        ) : null}

        <section className={styles.metricsGrid}>
          {snapshot.metrics.map((metric) => (
            <article key={metric.label} className={styles.metricCard}>
              <p className={styles.metricLabel}>{metric.label}</p>
              <p className={styles.metricValue}>{metric.value}</p>
              <p className={styles.metricHint}>{metric.hint}</p>
            </article>
          ))}
        </section>

        <section className={styles.contentGrid}>
          <aside className={styles.sidebarStack}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Scope Posture</h2>
                  <p className={styles.cardDescription}>
                    This home only summarizes the organizations and scope arrays attached to the current authenticated
                    session.
                  </p>
                </div>
              </div>
              <div className={styles.cardSection}>
                <div className={styles.stack}>
                  <p className={styles.smallText}>
                    <span className={styles.emphasis}>Organizations:</span>{" "}
                    {snapshot.organizationNames.length > 0 ? snapshot.organizationNames.join(", ") : "No scoped organizations visible"}
                  </p>
                  <p className={styles.smallText}>
                    <span className={styles.emphasis}>Site scope:</span>{" "}
                    {snapshot.siteScopeCount === 0 ? "All visible sites" : `${snapshot.siteScopeCount} scoped site(s)`}
                  </p>
                  <p className={styles.smallText}>
                    <span className={styles.emphasis}>Legal entities:</span>{" "}
                    {snapshot.legalEntityScopeCount === 0
                      ? "All visible legal entities"
                      : `${snapshot.legalEntityScopeCount} scoped legal entity(ies)`}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Primary Destination</h2>
                  <p className={styles.cardDescription}>
                    Use the role registry route below when starting work from the shared dashboard shell.
                  </p>
                </div>
              </div>
              <div className={styles.cardSection}>
                <Link href={snapshot.profile.preferredPath} className={styles.linkCard}>
                  <h3 className={styles.linkCardTitle}>{snapshot.profile.preferredPath}</h3>
                  <p className={styles.linkCardDescription}>
                    Open the main workspace registered for this role in the route matrix.
                  </p>
                  <p className={styles.linkCardCta}>Open route</p>
                </Link>
              </div>
            </div>
          </aside>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Live Signals</h2>
                <p className={styles.cardDescription}>
                  These signals come from the live database contract for the current role family. If the role has access
                  but no data yet, the message stays explicit instead of inventing records.
                </p>
              </div>
            </div>
            {snapshot.signals.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No live signals available yet.</h3>
                <p className={styles.emptyDescription}>
                  This role currently has route access but no visible live summary rows in the active scope.
                </p>
              </div>
            ) : (
              <div className={styles.list}>
                {snapshot.signals.map((signal) => (
                  <article key={`${signal.badge}-${signal.title}`} className={styles.listItem}>
                    <div className={styles.splitRow}>
                      <div>
                        <p className={styles.rowTitle}>{signal.title}</p>
                        <p className={styles.rowMeta}>{signal.meta}</p>
                      </div>
                      <span className={styles.badge} data-tone={signal.tone}>
                        {signal.badge}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>

        <section className={styles.contentGrid}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Current Work Queue</h2>
                <p className={styles.cardDescription}>
                  A lightweight live queue helps the role feel operational for demo and pre-production flows without
                  pretending to replace the deeper feature workspaces.
                </p>
              </div>
            </div>
            {snapshot.queue.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No queue items visible yet.</h3>
                <p className={styles.emptyDescription}>
                  There are no live items in the current role scope right now, or the connected workflow has not started
                  producing rows yet.
                </p>
              </div>
            ) : (
              <div className={styles.list}>
                {snapshot.queue.map((item) => (
                  <article key={`${item.badge}-${item.title}-${item.meta}`} className={styles.listItem}>
                    <div className={styles.splitRow}>
                      <div>
                        <p className={styles.rowTitle}>{item.title}</p>
                        <p className={styles.rowMeta}>{item.meta}</p>
                      </div>
                      <span className={styles.badge} data-tone={item.tone}>
                        {item.badge}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Recommended Workspaces</h2>
                <p className={styles.cardDescription}>
                  These shortcuts stay aligned with the shared route-access matrix, so the home, sidebar, and proxy keep
                  telling the same access story.
                </p>
              </div>
            </div>
            {shortcuts.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No interactive shortcuts for this role.</h3>
                <p className={styles.emptyDescription}>
                  This role currently uses the shared dashboard shell until a more dedicated workspace is ready.
                </p>
              </div>
            ) : (
              <div className={styles.cardSection}>
                <div className={styles.linkGrid}>
                  {shortcuts.map((shortcut) => (
                    <Link key={shortcut.href} href={shortcut.href} className={styles.linkCard}>
                      <h3 className={styles.linkCardTitle}>{shortcut.label}</h3>
                      <p className={styles.linkCardDescription}>{shortcut.description}</p>
                      <p className={styles.linkCardCta}>Open workspace</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
