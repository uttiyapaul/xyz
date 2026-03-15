import { AIDataPoint } from "@/components/ai/AIDataPoint";
import styles from "@/features/data/ai-extract/AIExtractionWorkbench.module.css";

const EXTRACTION_STEPS = [
  {
    label: "Secure intake",
    copy: "Documents are expected to pass malware screening and basic file validation before any parsing begins.",
  },
  {
    label: "Model extraction",
    copy: "The parser proposes supplier, invoice period, activity quantities, and line-item totals from uploaded evidence.",
  },
  {
    label: "Human review",
    copy: "Every extracted result still requires human confirmation before it can influence ledgers, reports, or regulatory filings.",
  },
] as const;

const SUPPORTED_FIELDS = [
  {
    field: "Supplier and invoice identifiers",
    source: "PDF OCR + invoice layout heuristics",
    status: "Human review required",
  },
  {
    field: "Consumption quantities and units",
    source: "Line-item extraction + historical unit normalization",
    status: "Human review required",
  },
  {
    field: "Emission factor hints",
    source: "Document context + factor catalog matching",
    status: "Advisory only",
  },
] as const;

/**
 * AI extraction remains disclosure-first even before the upload backend is wired.
 * The UI explains how suggested fields, confidence, and human review fit into
 * the regulated workflow so future ingestion features do not skip compliance cues.
 */
export function AIExtractionWorkbench() {
  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>AI Intake Workspace</p>
        <h1 className={styles.title}>AI Invoice Parsing</h1>
        <p className={styles.subtitle}>
          Upload and extraction wiring will arrive in a later backend phase. This frontend workbench already reflects
          the required compliance contract: malware-aware intake, human-reviewed parsing, and transparent AI disclosure.
        </p>
      </header>

      <div className={styles.alert}>
        AI extraction suggestions are never authoritative by default. Every proposed value must show confidence,
        source attribution, and review state before it reaches operational or compliance workflows.
      </div>

      <div className={styles.grid}>
        <div className={styles.stack}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Processing contract</h2>
            <p className={styles.cardDescription}>
              This screen sets the expectations for the later ingestion flow so teams know where automation ends and
              accountable review begins.
            </p>

            <ul className={styles.list}>
              {EXTRACTION_STEPS.map((step) => (
                <li key={step.label} className={styles.listItem}>
                  <span className={styles.listLabel}>{step.label}</span>
                  <span className={styles.listCopy}>{step.copy}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Expected extracted fields</h2>
            <p className={styles.cardDescription}>
              These are the first field families the parser should propose once upload wiring is connected.
            </p>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeaderCell}>Field</th>
                  <th className={styles.tableHeaderCell}>Source</th>
                  <th className={styles.tableHeaderCell}>Status</th>
                </tr>
              </thead>
              <tbody>
                {SUPPORTED_FIELDS.map((row) => (
                  <tr key={row.field}>
                    <td className={styles.tableCell}>{row.field}</td>
                    <td className={styles.tableCell}>{row.source}</td>
                    <td className={styles.tableCell}>
                      <span className={styles.badge} data-tone={row.status === "Advisory only" ? "info" : "warning"}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </div>

        <div className={styles.stack}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Disclosure example</h2>
            <p className={styles.cardDescription}>
              Every extracted AI suggestion should render through the shared disclosure primitive below.
            </p>

            <AIDataPoint
              label="Detected consumption quantity"
              value="12,450 kWh"
              confidence="medium"
              source="Invoice OCR, layout parsing, and historical utility-bill pattern matching."
              reviewState="pending"
              description="Suggested from line-item parsing only. A human reviewer must confirm units, billing period, and supplier identity before posting."
            />

            <p className={styles.notice}>
              Backend document parsing, upload quarantine, and ledger posting will be connected later. This screen keeps
              the user-facing contract ready now so those capabilities land inside the correct guardrails.
            </p>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Security expectations</h2>
            <p className={styles.cardDescription}>
              Frontend copy must keep these guardrails visible once uploads go live.
            </p>

            <ul className={styles.list}>
              <li className={styles.listItem}>
                <span className={styles.listLabel}>No raw parser errors</span>
                <span className={styles.listCopy}>
                  Provider and token failures should resolve to safe guidance, not internal error detail.
                </span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listLabel}>No silent posting</span>
                <span className={styles.listCopy}>
                  Extracted values must move into a reviewer-controlled staging surface before any ledger write.
                </span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.listLabel}>No hidden provenance</span>
                <span className={styles.listCopy}>
                  Users need to see which document and parsing path produced a suggested value before approving it.
                </span>
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
