import type { ReactNode } from "react";

import styles from "@/features/legal/LegalPage.module.css";

interface LegalDocumentLayoutProps {
  eyebrow: string;
  title: string;
  summary: string;
  lastUpdated: string;
  children: ReactNode;
  aside?: ReactNode;
}

/**
 * Shared layout for public legal and compliance documents.
 *
 * Why this exists:
 * - The landing experience links to multiple policy pages and they should feel
 *   like one coherent public-facing compliance surface.
 * - Keeping the layout shared avoids subtle drift between policy pages.
 */
export function LegalDocumentLayout({
  eyebrow,
  title,
  summary,
  lastUpdated,
  children,
  aside,
}: LegalDocumentLayoutProps) {
  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.summary}>{summary}</p>
        <div className={styles.metaRow}>
          <span className={styles.metaBadge}>Last updated {lastUpdated}</span>
          <span className={styles.metaBadge}>Frontend legal surface</span>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.content}>{children}</div>
        <aside className={styles.aside}>{aside}</aside>
      </div>
    </section>
  );
}
