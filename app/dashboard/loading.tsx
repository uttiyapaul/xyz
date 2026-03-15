import styles from "@/features/portal/WorkspaceShell.module.css";

/**
 * Dashboard loading state avoids skeletons on purpose.
 *
 * The dashboard home is server-rendered from live data, so the fallback should
 * stay honest: loading the scoped workspace rather than faking shape blocks.
 */
export default function DashboardLoading() {
  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Dashboard Home</p>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Loading live dashboard context</h1>
          <p className={styles.subtitle}>
            The portal is resolving your scoped role home from the live database and current request session.
          </p>
        </div>
      </header>
      <main className={styles.body}>
        <div className={styles.alert} data-tone="info">
          Loading role-aware workspace data. If the current role has no visible rows yet, the next screen will say so
          explicitly.
        </div>
      </main>
    </section>
  );
}
