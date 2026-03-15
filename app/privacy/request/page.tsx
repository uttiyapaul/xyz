import Link from "next/link";

import { DataSubjectRequestForm } from "@/features/legal/DataSubjectRequestForm";
import { LegalDocumentLayout } from "@/features/legal/LegalDocumentLayout";
import styles from "@/features/legal/LegalPage.module.css";

/**
 * Public DSAR intake route backed by the live privacy request table.
 */
export default function PrivacyRequestPage() {
  return (
    <LegalDocumentLayout
      eyebrow="Privacy"
      title="Data Rights Request"
      summary="Use this form to submit an access, correction, deletion, portability, objection, or related privacy request into the live intake queue."
      lastUpdated="15 March 2026"
      aside={
        <>
          <section className={styles.card}>
            <div className={styles.cardSection}>
              <h2 className={styles.sectionTitle}>What happens next</h2>
              <ul className={styles.list}>
                <li>Your request is written to the live privacy intake queue.</li>
                <li>A reviewer checks jurisdiction, identity, and lawful response path.</li>
                <li>You may be contacted if more context or identity verification is required.</li>
              </ul>
            </div>
          </section>

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
        </>
      }
    >
      <section className={styles.card}>
        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>Submit Your Request</h2>
          <p className={styles.sectionBody}>
            Provide enough context for the privacy team to understand what right you want to exercise.
            Avoid submitting secrets or payment credentials through this form.
          </p>
          <DataSubjectRequestForm />
        </div>
      </section>
    </LegalDocumentLayout>
  );
}
