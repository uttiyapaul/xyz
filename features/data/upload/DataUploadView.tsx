"use client";

import { useRef, useState, type DragEvent } from "react";
import Link from "next/link";

import { AIDataPoint } from "@/components/ai/AIDataPoint";
import shellStyles from "@/features/portal/WorkspaceShell.module.css";
import styles from "@/features/data/upload/DataUploadView.module.css";
import { useDataUploadWorkspaceData } from "@/features/data/upload/useDataUploadWorkspaceData";

interface LocalStageFile {
  id: string;
  name: string;
  sizeLabel: string;
  family: string;
  duplicateInLedger: boolean;
}

function formatFileSize(size: number): string {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(size / 1024, 0.1).toFixed(1)} KB`;
}

function classifyFileFamily(name: string): string {
  const lowerName = name.toLowerCase();

  if (lowerName.endsWith(".csv") || lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
    return "spreadsheet";
  }

  if (lowerName.endsWith(".pdf")) {
    return "invoice/pdf evidence";
  }

  if (lowerName.endsWith(".png") || lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
    return "image evidence";
  }

  return "evidence";
}

function getTone(status: string): "success" | "warning" | "danger" | "info" {
  if (status === "accepted" || status === "approved" || status === "completed") {
    return "success";
  }

  if (status === "rejected" || status === "failed") {
    return "danger";
  }

  if (status === "pending" || status === "draft" || status === "under_review" || status === "needs_revision") {
    return "warning";
  }

  return "info";
}

/**
 * Bulk upload workspace.
 *
 * The staging area is intentionally local-only until storage and quarantine
 * wiring is finalized. The surrounding evidence/disclosure board is real and
 * reads from the current live schema.
 */
export function DataUploadView() {
  const { loading, error, evidence, scope3Submissions, disclosures } = useDataUploadWorkspaceData();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stagedFiles, setStagedFiles] = useState<LocalStageFile[]>([]);
  const [reviewFilter, setReviewFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  function stageIncomingFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    const existingLedgerNames = new Set(evidence.map((document) => document.fileName.toLowerCase()));

    setStagedFiles((current) => [
      ...current,
      ...Array.from(files).map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        sizeLabel: formatFileSize(file.size),
        family: classifyFileFamily(file.name),
        duplicateInLedger: existingLedgerNames.has(file.name.toLowerCase()),
      })),
    ]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    stageIncomingFiles(event.dataTransfer.files);
  }

  const visibleEvidence = evidence.filter((document) => {
    const matchesSearch =
      searchTerm.trim().length === 0 ||
      `${document.fileName} ${document.documentType} ${document.siteName}`.toLowerCase().includes(searchTerm.trim().toLowerCase());
    const matchesReview = reviewFilter === "all" || document.reviewStatus === reviewFilter;

    return matchesSearch && matchesReview;
  });

  const pendingExtraction = evidence.filter((document) => document.extractionStatus !== "completed").length;
  const openScope3 = scope3Submissions.filter((submission) => submission.status !== "accepted").length;
  const draftDisclosures = disclosures.filter((disclosure) => disclosure.status === "draft").length;

  if (loading) {
    return (
      <div className={shellStyles.page}>
        <header className={shellStyles.header}>
          <p className={shellStyles.eyebrow}>Data Input Workspace</p>
          <h1 className={shellStyles.title}>Loading bulk upload board...</h1>
        </header>
      </div>
    );
  }

  return (
    <div className={shellStyles.page}>
      <header className={shellStyles.header}>
        <p className={shellStyles.eyebrow}>Data Input Workspace</p>
        <div className={shellStyles.headerRow}>
          <div className={shellStyles.titleBlock}>
            <h1 className={shellStyles.title}>Bulk Upload</h1>
            <p className={shellStyles.subtitle}>
              Stage files locally, inspect current evidence posture, and track scope 3 plus disclosure queues without
              hiding the fact that final storage and quarantine wiring is still a separate backend step.
            </p>
          </div>
        </div>
        <div className={shellStyles.scopeNote}>
          <span className={shellStyles.emphasis}>Evidence rule:</span> uploads and AI extraction suggestions are never
          authoritative by default. Human review and downstream SoD controls still decide what enters compliance flows.
        </div>
      </header>

      <main className={shellStyles.body}>
        {error ? (
          <div className={shellStyles.alert} data-tone="danger">
            {error}
          </div>
        ) : null}

        <section className={shellStyles.metricsGrid}>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Local Stage Queue</p>
            <p className={shellStyles.metricValue}>{stagedFiles.length}</p>
            <p className={shellStyles.metricHint}>Files queued locally in the browser before upload wiring is connected.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Evidence Ledger</p>
            <p className={shellStyles.metricValue}>{evidence.length}</p>
            <p className={shellStyles.metricHint}>Live `ghg_documents` rows visible in the current organization scope.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Scope 3 Open</p>
            <p className={shellStyles.metricValue}>{openScope3}</p>
            <p className={shellStyles.metricHint}>Supplier-facing submissions that are still progressing through review.</p>
          </article>
          <article className={shellStyles.metricCard}>
            <p className={shellStyles.metricLabel}>Disclosure Drafts</p>
            <p className={shellStyles.metricValue}>{draftDisclosures}</p>
            <p className={shellStyles.metricHint}>Framework disclosures still sitting in draft status.</p>
          </article>
        </section>

        <section className={shellStyles.contentGrid}>
          <aside className={shellStyles.sidebarStack}>
            <section className={shellStyles.card}>
              <div className={shellStyles.cardHeader}>
                <div>
                  <h2 className={shellStyles.cardTitle}>Stage Files</h2>
                  <p className={shellStyles.cardDescription}>
                    This local intake queue lets teams prepare batches before the final upload service is connected.
                  </p>
                </div>
              </div>
              <div className={shellStyles.cardSection}>
                <input
                  id="bulk-upload-input"
                  ref={fileInputRef}
                  className={styles.hiddenInput}
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg"
                  onChange={(event) => stageIncomingFiles(event.target.files)}
                />
                <div
                  className={styles.dropzone}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                >
                  <p className={styles.dropzoneTitle}>Drag evidence or spreadsheets here</p>
                  <p className={styles.dropzoneCopy}>
                    Use this to batch invoices, meter exports, and supporting spreadsheets. The browser stage helps
                    operators catch duplicates and file-family mix before backend upload is enabled.
                  </p>
                  <div className={styles.dropzoneActions}>
                    <button
                      type="button"
                      className={styles.buttonLike}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose files
                    </button>
                    <Link href="/data/ai-extract" className={styles.buttonLike}>
                      Open AI extract rules
                    </Link>
                  </div>
                  <p className={styles.helperText}>
                    Local-only staging keeps the UI honest: nothing is uploaded to Supabase storage from this page yet.
                  </p>
                </div>
              </div>

              <div className={shellStyles.cardSection}>
                {stagedFiles.length === 0 ? (
                  <div className={shellStyles.emptyState}>
                    <h3 className={shellStyles.emptyTitle}>No staged files yet.</h3>
                    <p className={shellStyles.emptyDescription}>
                      Add files to see duplicate warnings and document-family grouping before upload wiring goes live.
                    </p>
                  </div>
                ) : (
                  <div className={styles.stagedList}>
                    {stagedFiles.map((file) => (
                      <div key={file.id} className={styles.stagedItem}>
                        <div className={styles.stagedHeader}>
                          <div>
                            <h3 className={styles.stagedTitle}>{file.name}</h3>
                            <p className={styles.stagedMeta}>
                              {file.family} | {file.sizeLabel}
                            </p>
                          </div>
                          <button
                            type="button"
                            className={styles.ghostButton}
                            onClick={() => setStagedFiles((current) => current.filter((item) => item.id !== file.id))}
                          >
                            Remove
                          </button>
                        </div>
                        <div className={styles.tagRow}>
                          <span className={styles.tag} data-tone="info">
                            staged locally
                          </span>
                          {file.duplicateInLedger ? (
                            <span className={styles.tag} data-tone="warning">
                              duplicate name in ledger
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className={shellStyles.card}>
              <div className={shellStyles.cardHeader}>
                <div>
                  <h2 className={shellStyles.cardTitle}>AI Extraction Posture</h2>
                  <p className={shellStyles.cardDescription}>
                    Extraction suggestions must remain explicit, attributable, and human-reviewed.
                  </p>
                </div>
              </div>
              <div className={shellStyles.cardSection}>
                <AIDataPoint
                  label="Evidence extraction queue"
                  value={`${pendingExtraction} document(s) still awaiting completed extraction`}
                  confidence={pendingExtraction > 0 ? "medium" : "high"}
                  source="ghg_documents.extraction_status"
                  reviewState={pendingExtraction > 0 ? "pending" : "reviewed"}
                  description="Extraction output may help pre-fill fields, but operators and reviewers still confirm units, dates, and supplier context."
                />
              </div>
            </section>
          </aside>

          <section className={shellStyles.card}>
            <div className={shellStyles.cardHeader}>
              <div>
                <h2 className={shellStyles.cardTitle}>Evidence Ledger</h2>
                <p className={shellStyles.cardDescription}>
                  Search the current evidence rows before adding a new batch so duplicate files and stale review states
                  stay visible.
                </p>
              </div>
            </div>

            <div className={shellStyles.cardSection}>
              <div className={styles.filterBar}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="evidence-search">
                    Search evidence
                  </label>
                  <input
                    id="evidence-search"
                    className={styles.input}
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by file, site, or type"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="evidence-review-filter">
                    Review status
                  </label>
                  <select
                    id="evidence-review-filter"
                    className={styles.select}
                    value={reviewFilter}
                    onChange={(event) => setReviewFilter(event.target.value)}
                  >
                    <option value="all">All statuses</option>
                    {Array.from(new Set(evidence.map((document) => document.reviewStatus))).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {visibleEvidence.length === 0 ? (
              <div className={shellStyles.emptyState}>
                <h3 className={shellStyles.emptyTitle}>No evidence rows matched this view.</h3>
                <p className={shellStyles.emptyDescription}>
                  Adjust the search or status filter, or confirm the active scope includes evidence rows.
                </p>
              </div>
            ) : (
              <div className={shellStyles.tableWrapper}>
                <table className={shellStyles.table}>
                  <thead>
                    <tr>
                      <th className={shellStyles.tableHeaderCell}>Document</th>
                      <th className={shellStyles.tableHeaderCell}>Review</th>
                      <th className={shellStyles.tableHeaderCell}>Extraction</th>
                      <th className={shellStyles.tableHeaderCell}>Evidence Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleEvidence.map((document) => (
                      <tr key={document.id}>
                        <td className={shellStyles.tableCell}>
                          <div className={shellStyles.rowTitle}>{document.fileName}</div>
                          <div className={shellStyles.rowMeta}>
                            {document.siteName} | {document.documentType}
                          </div>
                          <div className={shellStyles.rowMeta}>
                            Uploaded {new Date(document.uploadedAt).toLocaleString("en-IN")}
                          </div>
                        </td>
                        <td className={shellStyles.tableCell}>
                          <span className={shellStyles.badge} data-tone={getTone(document.reviewStatus)}>
                            {document.reviewStatus}
                          </span>
                        </td>
                        <td className={shellStyles.tableCell}>
                          <span className={shellStyles.badge} data-tone={getTone(document.extractionStatus)}>
                            {document.extractionStatus}
                          </span>
                        </td>
                        <td className={shellStyles.tableCell}>
                          <div className={shellStyles.rowMeta}>
                            {document.justifiedFieldCount} justified field(s) linked to this evidence row
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className={shellStyles.cardSection}>
              <div className={shellStyles.linkGrid}>
                <div className={shellStyles.linkCard}>
                  <h3 className={shellStyles.linkCardTitle}>Scope 3 Queue</h3>
                  <p className={shellStyles.linkCardDescription}>
                    {scope3Submissions.length} submission row(s), {openScope3} still open. Supplier-specific intake and
                    mapping needs remain visible before acceptance.
                  </p>
                </div>
                <div className={shellStyles.linkCard}>
                  <h3 className={shellStyles.linkCardTitle}>Disclosure Queue</h3>
                  <p className={shellStyles.linkCardDescription}>
                    {disclosures.length} disclosure row(s), {draftDisclosures} still in draft. Assurance posture should
                    stay visible before board or regulator-facing use.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </section>

        <section className={shellStyles.contentGrid}>
          <section className={shellStyles.card}>
            <div className={shellStyles.cardHeader}>
              <div>
                <h2 className={shellStyles.cardTitle}>Scope 3 Submission Queue</h2>
                <p className={shellStyles.cardDescription}>
                  Supplier-facing disclosures and mapping posture stay visible here because bulk intake often spills into
                  scope 3 workflows.
                </p>
              </div>
            </div>
            {scope3Submissions.length === 0 ? (
              <div className={shellStyles.emptyState}>
                <h3 className={shellStyles.emptyTitle}>No scope 3 submissions are visible right now.</h3>
                <p className={shellStyles.emptyDescription}>
                  This queue will populate when suppliers or client teams submit category-specific data.
                </p>
              </div>
            ) : (
              <div className={shellStyles.tableWrapper}>
                <table className={shellStyles.table}>
                  <thead>
                    <tr>
                      <th className={shellStyles.tableHeaderCell}>Category</th>
                      <th className={shellStyles.tableHeaderCell}>Method</th>
                      <th className={shellStyles.tableHeaderCell}>Status</th>
                      <th className={shellStyles.tableHeaderCell}>Attributed tCO2e</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scope3Submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td className={shellStyles.tableCell}>
                          <div className={shellStyles.rowTitle}>Category {submission.scope3CategoryId}</div>
                          <div className={shellStyles.rowMeta}>
                            {submission.reportingWindow} | FY {submission.fyYear ?? "n/a"}
                          </div>
                        </td>
                        <td className={shellStyles.tableCell}>
                          <div className={shellStyles.rowMeta}>{submission.methodUsed}</div>
                          <div className={shellStyles.rowMeta}>
                            DQ score: {submission.dataQualityScore ?? "n/a"}
                          </div>
                        </td>
                        <td className={shellStyles.tableCell}>
                          <div className={shellStyles.badgeRow}>
                            <span className={shellStyles.badge} data-tone={getTone(submission.status)}>
                              {submission.status}
                            </span>
                            <span className={shellStyles.badge} data-tone={getTone(submission.verificationStatus)}>
                              {submission.verificationStatus}
                            </span>
                            {submission.needsClientMapping ? (
                              <span className={shellStyles.badge} data-tone="warning">
                                mapping needed
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className={shellStyles.tableCell}>
                          <div className={shellStyles.rowMeta}>{submission.tco2e.toFixed(2)} tCO2e</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className={shellStyles.sidebarStack}>
            <section className={shellStyles.card}>
              <div className={shellStyles.cardHeader}>
                <div>
                  <h2 className={shellStyles.cardTitle}>Framework Disclosures</h2>
                  <p className={shellStyles.cardDescription}>
                    Disclosure rows help bulk-upload teams see whether evidence still needs to back a reporting draft.
                  </p>
                </div>
              </div>
              {disclosures.length === 0 ? (
                <div className={shellStyles.emptyState}>
                  <h3 className={shellStyles.emptyTitle}>No disclosure rows are visible yet.</h3>
                  <p className={shellStyles.emptyDescription}>
                    Draft and submitted framework rows will appear here when they are recorded for the organization.
                  </p>
                </div>
              ) : (
                <div className={shellStyles.list}>
                  {disclosures.map((disclosure) => (
                    <div key={disclosure.id} className={shellStyles.listItem}>
                      <div className={shellStyles.splitRow}>
                        <div>
                          <div className={shellStyles.rowTitle}>{disclosure.frameworkId}</div>
                          <div className={shellStyles.rowMeta}>FY {disclosure.fyYear}</div>
                        </div>
                        <span className={shellStyles.badge} data-tone={getTone(disclosure.status)}>
                          {disclosure.status}
                        </span>
                      </div>
                      <div className={shellStyles.rowMeta}>{disclosure.dataSource}</div>
                      <div className={shellStyles.rowMeta}>
                        {disclosure.isAssured
                          ? `Assured (${disclosure.assuranceLevel ?? "level unspecified"})`
                          : "Not yet assured"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
