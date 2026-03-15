"use client";

import { AlertTriangle, CheckSquare, Database, Layers } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";

import { AIDataPoint, type AIConfidenceLevel, type AIReviewState } from "@/components/ai/AIDataPoint";
import styles from "@/components/dashboard/roles/CarbonAccountantDashboard.module.css";

const MOCK_METRICS = [
  { label: "Awaiting Calculation", value: "34", color: "var(--status-warning)", tone: "warning", icon: Database },
  { label: "EF Coverage", value: "98.2%", color: "var(--status-success)", tone: "success", icon: CheckSquare },
  { label: "Anomalies Detected", value: "2", color: "var(--status-danger)", tone: "danger", icon: AlertTriangle },
  { label: "Calculated Ratio", value: "85%", color: "var(--status-info)", tone: "info", icon: Layers },
] as const;

const MOCK_APPROVAL_QUEUE = [
  {
    id: "ACT-2091",
    type: "Grid Electricity",
    facility: "Site B",
    submittedBy: "Raj P.",
    amount: "12,450 kWh",
    lane: "review" as const,
  },
  {
    id: "ACT-2090",
    type: "Diesel Mobile",
    facility: "Fleet cars",
    submittedBy: "Amit K.",
    amount: "400 L",
    lane: "approval" as const,
  },
  {
    id: "ACT-2089",
    type: "Natural Gas",
    facility: "Site A",
    submittedBy: "Sonia T.",
    amount: "1,200 m3",
    lane: "review" as const,
  },
] as const;

const MOCK_AI_ALERTS: Array<{
  id: string;
  title: string;
  summary: string;
  confidence: AIConfidenceLevel;
  reviewState: AIReviewState;
  source: string;
}> = [
  {
    id: "alert-1",
    title: "Site A Electricity",
    summary: "Usage is 42% higher year-over-year compared with the prior February baseline.",
    confidence: "medium",
    reviewState: "pending",
    source: "Historical site consumption baseline and seasonal variance checks.",
  },
  {
    id: "alert-2",
    title: "Fleet Diesel",
    summary: "Three expected transport logs are missing for the current quarter.",
    confidence: "high",
    reviewState: "pending",
    source: "Fuel-log completeness checks against expected trip cadence and prior-period submissions.",
  },
] as const;

const UNCERTAINTY_DATA = [
  { name: "Scope 1", emissions: 120 },
  { name: "Scope 2", emissions: 450 },
  { name: "Scope 3", emissions: 2100 },
] as const;

function UncertaintyTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>{String(payload[0]?.value ?? 0)} tCO2e</p>
    </div>
  );
}

/**
 * Carbon-accountant landing surface keeps approval lanes and AI disclosure
 * visible in the shared dashboard layer. That prevents the role shell from
 * drifting away from the audit-required SoD and AI transparency rules.
 */
export function CarbonAccountantDashboard() {
  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Carbon Accounting</h1>
          <p className={styles.subtitle}>
            Calculate emissions, manage emission factors, and keep reviewer versus approver responsibilities visible.
          </p>
        </div>
        <button type="button" className={styles.heroAction}>
          Run Calculation Engine
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
          <h2 className={styles.cardTitle}>Emissions Uncertainty (tCO2e)</h2>
          <p className={styles.cardText}>Confidence intervals based on data quality scores and emission-factor variance.</p>
          <div className={styles.chartShell}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={UNCERTAINTY_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.45)" axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255, 255, 255, 0.45)" axisLine={false} tickLine={false} />
                <Tooltip content={UncertaintyTooltip} />
                <Bar dataKey="emissions" fill="var(--status-info)" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <div className={styles.stack}>
          <article className={styles.alertCard}>
            <div className={styles.alertHeader}>
              <AlertTriangle color="var(--status-warning)" size={22} />
              <h2 className={styles.alertTitle}>AI anomaly alerts</h2>
            </div>
            <p className={styles.alertText}>
              These anomaly signals are advisory only. Reviewers must inspect evidence first, and approvers remain a
              separate control lane before any downstream filing or sign-off.
            </p>
            <div className={styles.alertList}>
              {MOCK_AI_ALERTS.map((alert) => (
                <AIDataPoint
                  key={alert.id}
                  label={alert.title}
                  value={alert.summary}
                  confidence={alert.confidence}
                  source={alert.source}
                  reviewState={alert.reviewState}
                  description="AI output is not a final compliance decision. Human accounting review is required before any acceptance."
                />
              ))}
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.queueHeader}>
              <div>
                <h2 className={styles.cardTitle}>Approval Queue</h2>
                <p className={styles.cardText}>
                  Review and approval lanes stay distinct so the same person is not silently performing both controls.
                </p>
              </div>
            </div>

            <div className={styles.queueWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderCell}>ID</th>
                    <th className={styles.tableHeaderCell}>Type</th>
                    <th className={styles.tableHeaderCell}>Amount</th>
                    <th className={styles.tableHeaderCell}>Lane</th>
                    <th className={styles.tableHeaderCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_APPROVAL_QUEUE.map((item) => (
                    <tr key={item.id} className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.queueId}`}>{item.id}</td>
                      <td className={styles.tableCell}>
                        {item.type}
                        <span className={styles.queueMeta}>
                          {item.facility} | Submitted by {item.submittedBy}
                        </span>
                      </td>
                      <td className={`${styles.tableCell} ${styles.queueAmount}`}>{item.amount}</td>
                      <td className={styles.tableCell}>
                        <span className={styles.badge} data-tone={item.lane}>
                          {item.lane === "review" ? "Reviewer lane" : "Approver lane"}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <button type="button" className={styles.reviewButton}>
                          {item.lane === "review" ? "Open review" : "Open approval"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
