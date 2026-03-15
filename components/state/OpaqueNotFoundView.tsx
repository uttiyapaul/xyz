import Link from "next/link";

import styles from "@/app/AppState.module.css";

/**
 * Shared 404 surface used for both real misses and intentionally opaque
 * authorization misses. The copy stays generic so callers cannot infer whether
 * a route exists behind the scenes.
 */
export function OpaqueNotFoundView() {
  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.notFoundMark}>A2Z</div>
        <div className={styles.notFoundCode}>404</div>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.body}>
          The page you requested does not exist or you don&apos;t have permission to access it.
        </p>
        <div className={styles.actions}>
          <Link href="/dashboard" className={styles.primaryLink}>
            Go to Dashboard
          </Link>
          <Link href="/auth/login" className={styles.secondaryLink}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
