"use client";

import { AlertCircle, Clock, FileText, UploadCloud } from "lucide-react";

import { AIDataPoint } from "@/components/ai/AIDataPoint";
import styles from "@/components/dashboard/roles/DataEntryDashboard.module.css";

const MOCK_METRICS = [
  { label: "Pending Upload Tasks", value: "12", tone: "warning", color: "var(--status-warning)", icon: Clock },
  { label: "Data Completion (Feb)", value: "68%", tone: "info", color: "var(--status-info)", icon: FileText },
  { label: "Rework / Rejected", value: "3", tone: "danger", color: "var(--status-danger)", icon: AlertCircle },
] as const;

const MOCK_SUBMISSIONS = [
  { id: "SUB-1049", type: "Electricity Consumption", facility: "Site B - Mumbai", date: "2026-03-10", status: "Under Review" },
  { id: "SUB-1048", type: "Diesel Generator Fuel", facility: "Site A - Pune", date: "2026-03-09", status: "Approved" },
  { id: "SUB-1047", type: "Company Travel Logs", facility: "Headquarters", date: "2026-03-08", status: "Rejected" },
  { id: "SUB-1046", type: "Refrigerant Top-up", facility: "Site B - Mumbai", date: "2026-03-05", status: "Draft" },
] as const;

function getSubmissionTone(status: (typeof MOCK_SUBMISSIONS)[number]["status"]) {
  if (status === "Approved") {
    return "approved";
  }

  if (status === "Rejected") {
    return "rejected";
  }

  if (status === "Draft") {
    return "draft";
  }

  return "review";
}

/**
 * Data-entry users stop at capture and submission. This dashboard keeps that
 * boundary obvious by showing AI extraction as a suggestion flow and leaving
 * review/approval states visible but outside the operator's control surface.
 */
export function DataEntryDashboard() {
  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Operations & Data Entry</h1>
          <p className={styles.subtitle}>
            Manage facility data collection tasks and submit evidence without crossing into reviewer or approver work.
          </p>
        </div>
        <button type="button" className={styles.heroAction}>
          + New Manual Entry
        </button>
      </header>

      <div className={styles.metricsGrid}>
        {MOCK_METRICS.map((metric) => (
          <article key={metric.label} className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <metric.icon size={48} color={metric.color} />
            </div>
            <p className={styles.metricLabel}>{metric.label}</p>
            <p className={styles.metricValue} data-tone={metric.tone}>
              {metric.value}
            </p>
          </article>
        ))}
      </div>

      <div className={styles.contentGrid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Recent Submissions</h2>
              <p className={styles.cardText}>
                Submission statuses stay visible here so operators can respond to reviewer feedback without bypassing SoD.
              </p>
            </div>
            <button type="button" className={styles.ghostButton}>
              View All
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeaderCell}>ID</th>
                  <th className={styles.tableHeaderCell}>Record Type</th>
                  <th className={styles.tableHeaderCell}>Facility</th>
                  <th className={styles.tableHeaderCell}>Date</th>
                  <th className={styles.tableHeaderCell}>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SUBMISSIONS.map((submission) => (
                  <tr key={submission.id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.submissionId}`}>{submission.id}</td>
                    <td className={`${styles.tableCell} ${styles.submissionType}`}>{submission.type}</td>
                    <td className={`${styles.tableCell} ${styles.submissionMeta}`}>{submission.facility}</td>
                    <td className={`${styles.tableCell} ${styles.submissionDate}`}>{submission.date}</td>
                    <td className={styles.tableCell}>
                      <span className={styles.badge} data-tone={getSubmissionTone(submission.status)}>
                        {submission.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <div className={styles.stack}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Quick AI Extraction</h2>
            <p className={styles.cardText}>
              Upload support will connect later. The frontend surface already shows how AI suggestions must remain
              reviewable rather than silently posting into the ledger.
            </p>

            <AIDataPoint
              label="Expected utility-bill parse"
              value="12,450 kWh from March electricity invoice"
              confidence="medium"
              source="OCR invoice parsing, unit normalization, and historical account matching."
              reviewState="pending"
              description="Operators can stage the extracted suggestion, but a human reviewer must still confirm the parsed values before acceptance."
            />

            <div className={styles.dropzone}>
              <UploadCloud size={40} color="var(--text-soft)" />
              <p className={styles.dropzoneTitle}>Click to upload or drag and drop</p>
              <p className={styles.dropzoneText}>PDF, PNG, JPG up to 20 MB once document-ingestion wiring is enabled.</p>
            </div>
          </article>

          <div className={styles.notice}>
            Data-entry users create and submit records only. Review, approval, and exception resolution remain in later
            control lanes and are intentionally not actioned from this dashboard.
          </div>
        </div>
      </div>
    </section>
  );
}
