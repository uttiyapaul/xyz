import Link from "next/link";

import { LegalDocumentLayout } from "@/features/legal/LegalDocumentLayout";
import styles from "@/features/legal/LegalPage.module.css";

/**
 * Public privacy notice linked from the landing experience and auth pages.
 *
 * This is a frontend legal surface, not legal advice. It explains how the
 * product handles data at a high level and points users to the live DSAR form.
 */
export default function PrivacyPage() {
  return (
    <LegalDocumentLayout
      eyebrow="Privacy"
      title="Privacy Policy"
      summary="This page explains the main categories of data the platform handles, why the data is used, and how individuals can exercise privacy rights through the live request workflow."
      lastUpdated="15 March 2026"
      aside={
        <>
          <section className={styles.card}>
            <div className={styles.cardSection}>
              <h2 className={styles.sectionTitle}>Need to make a request?</h2>
              <p className={styles.sectionBody}>
                Use the live privacy request form if you want to access, correct, delete, or otherwise
                exercise rights over personal data.
              </p>
              <div className={styles.linkRow}>
                <Link href="/privacy/request" className={styles.link}>
                  Open request form
                </Link>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardSection}>
              <h2 className={styles.sectionTitle}>Related documents</h2>
              <div className={styles.linkRow}>
                <Link href="/cookies" className={styles.link}>
                  Cookie Policy
                </Link>
                <Link href="/terms" className={styles.link}>
                  Terms of Use
                </Link>
              </div>
            </div>
          </section>
        </>
      }
    >
      <section className={styles.card}>
        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>Data We Process</h2>
          <div className={styles.itemGrid}>
            <article className={styles.item}>
              <p className={styles.itemTitle}>Account and access data</p>
              <p className={styles.itemBody}>
                We process identity, role, session, and organization-assignment data so the platform can
                authenticate users, enforce access scope, and keep audit trails.
              </p>
            </article>
            <article className={styles.item}>
              <p className={styles.itemTitle}>Operational emissions data</p>
              <p className={styles.itemBody}>
                We process activity data, source registers, emissions readings, evidence documents, and
                filing data so customers can operate compliance and reporting workflows.
              </p>
            </article>
            <article className={styles.item}>
              <p className={styles.itemTitle}>Integration and telemetry data</p>
              <p className={styles.itemBody}>
                We process API, webhook, ERP, and device data when customers enable integrations or
                telemetry-backed ingestion flows.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>Why We Process Personal Data</h2>
          <p className={styles.sectionBody}>
            Personal data is processed to run the product securely, maintain customer accounts, support
            reporting workflows, investigate incidents, and meet legal or regulatory obligations.
          </p>
          <ul className={styles.list}>
            <li>To authenticate users and maintain scoped, role-aware access.</li>
            <li>To support customer onboarding, support, governance, and audit workflows.</li>
            <li>To record lawful consents, policy acknowledgements, and related retention context.</li>
            <li>To manage security incidents, access investigations, and platform abuse prevention.</li>
          </ul>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>Rights and Requests</h2>
          <p className={styles.sectionBody}>
            Individuals can request access, correction, deletion, portability, restriction, objection,
            or opt-out handling through the live privacy request workflow.
          </p>
          <div className={styles.linkRow}>
            <Link href="/privacy/request" className={styles.link}>
              Submit a data rights request
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>Security and Governance</h2>
          <p className={styles.sectionBody}>
            The frontend enforces session-aware routing, masked secret handling, AI disclosure cues,
            and inactivity-lock preparation. Additional control enforcement continues on the backend and
            infrastructure layers.
          </p>
          <div className={styles.alert}>
            This notice describes the live frontend surface. It does not replace contract terms, DPA
            language, or formal legal advice.
          </div>
        </div>
      </section>
    </LegalDocumentLayout>
  );
}
