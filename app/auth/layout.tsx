import styles from "@/features/auth/AuthScreen.module.css";

/**
 * Auth routes share one shell so login, registration, and recovery pages stay
 * visually consistent without duplicating inline layout styles.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.brand}>
        <div className={styles.brandMark}>*</div>
        <div className={styles.brandTitle}>A2Z Carbon Solutions</div>
        <div className={styles.brandTagline}>YOUR A2Z CARBON SOLUTIONS</div>
      </div>

      <div className={styles.card}>{children}</div>

      <div className={styles.footerNote}>
        (c) 2026 XYZ-for-now. A2Z Carbon Solutions. Built for secure, compliant carbon data workflows.
      </div>
    </div>
  );
}
