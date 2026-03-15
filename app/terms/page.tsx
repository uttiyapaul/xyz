import Link from "next/link";

import { LegalDocumentLayout } from "@/features/legal/LegalDocumentLayout";
import styles from "@/features/legal/LegalPage.module.css";

/**
 * Public terms-of-use page for the pre-production portal.
 */
export default function TermsPage() {
  return (
    <LegalDocumentLayout
      eyebrow="Terms"
      title="Terms of Use"
      summary="These terms describe the high-level rules for using the public site and authenticated product experience."
      lastUpdated="15 March 2026"
      aside={
        <section className={styles.card}>
          <div className={styles.cardSection}>
            <h2 className={styles.sectionTitle}>Related pages</h2>
            <div className={styles.linkRow}>
              <Link href="/privacy" className={styles.link}>
                Privacy Policy
              </Link>
              <Link href="/cookies" className={styles.link}>
                Cookie Policy
              </Link>
            </div>
          </div>
        </section>
      }
    >
      <section className={styles.card}>
        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>Permitted Use</h2>
          <ul className={styles.list}>
            <li>Use the site and product only for lawful and authorized business purposes.</li>
            <li>Do not attempt to bypass access controls, role fences, or security protections.</li>
            <li>Do not upload malicious, unlawful, or deceptive content into operational workflows.</li>
          </ul>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>Pre-Production Notice</h2>
          <p className={styles.sectionBody}>
            This environment is still moving toward pre-production readiness. Features, data posture, and
            workflows may change as product, database, and control implementation continue to mature.
          </p>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>Security and Responsibility</h2>
          <p className={styles.sectionBody}>
            Users remain responsible for safeguarding credentials, using the product inside authorized scope,
            and reporting suspected misuse or security concerns through the appropriate support channels.
          </p>
        </div>
      </section>
    </LegalDocumentLayout>
  );
}
