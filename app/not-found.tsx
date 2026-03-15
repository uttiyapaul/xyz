import Link from "next/link";

import styles from "@/app/AppState.module.css";

// Rule FE-001: MANDATORY custom 404.
// Must NOT reveal: route paths, stack traces, framework version, or whether route exists.
export default function NotFound() {
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
