import Link from "next/link";

import { LegalDocumentLayout } from "@/features/legal/LegalDocumentLayout";
import styles from "@/features/legal/LegalPage.module.css";

/**
 * Public cookie notice for the landing and marketing surface.
 */
export default function CookiesPage() {
  return (
    <LegalDocumentLayout
      eyebrow="Cookies"
      title="Cookie Policy"
      summary="This page explains the categories of cookies and similar technologies used on the public-facing site and how they support product operation, analytics, and consent choices."
      lastUpdated="15 March 2026"
      aside={
        <section className={styles.card}>
          <div className={styles.cardSection}>
            <h2 className={styles.sectionTitle}>Related pages</h2>
            <div className={styles.linkRow}>
              <Link href="/privacy" className={styles.link}>
                Privacy Policy
              </Link>
              <Link href="/terms" className={styles.link}>
                Terms of Use
              </Link>
            </div>
          </div>
        </section>
      }
    >
      <section className={styles.card}>
        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>Cookie Categories</h2>
          <div className={styles.itemGrid}>
            <article className={styles.item}>
              <p className={styles.itemTitle}>Essential cookies</p>
              <p className={styles.itemBody}>
                Required for navigation, session continuity, and security-sensitive product behaviors.
              </p>
            </article>
            <article className={styles.item}>
              <p className={styles.itemTitle}>Preference cookies</p>
              <p className={styles.itemBody}>
                Help remember visitor choices such as consent posture or non-critical UI preferences.
              </p>
            </article>
            <article className={styles.item}>
              <p className={styles.itemTitle}>Analytics cookies</p>
              <p className={styles.itemBody}>
                Help measure site usage trends so the public experience can be improved without guessing.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>How Consent Works</h2>
          <p className={styles.sectionBody}>
            Cookie choices should be captured and respected through consent-oriented controls. Essential
            product and security behavior may continue even when non-essential analytics preferences are declined.
          </p>
        </div>
      </section>
    </LegalDocumentLayout>
  );
}
