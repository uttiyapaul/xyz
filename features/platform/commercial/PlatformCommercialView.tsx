import { createServerSupabaseClient } from "@/lib/supabase/admin";

import styles from "@/features/platform/shared/PlatformWorkspace.module.css";
import { requirePlatformStaffActor } from "@/features/platform/shared/platformWorkspaceAccess";

interface LeadRow {
  email: string;
  sector: string | null;
  product_label: string | null;
  cn_code: string | null;
  tonnage_per_year: number | null;
  created_at: string | null;
}

interface OrganizationRow {
  id: string;
  legal_name: string;
  trade_name: string | null;
  subscription_tier: string | null;
  is_active: boolean | null;
  country: string | null;
  erp_sync_enabled: boolean | null;
}

interface SubmissionRow {
  organization_id: string;
  status: string;
  updated_at: string | null;
}

interface PaymentRow {
  organization_id: string;
  transaction_type: string;
  amount_inr: number | null;
  status: string;
  payment_processor: string | null;
  created_at: string | null;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  const visiblePrefix = localPart.slice(0, 2);
  return `${visiblePrefix}${"*".repeat(Math.max(localPart.length - 2, 2))}@${domain}`;
}

/**
 * Platform commercial workspace for CRM, sales, and finance staff.
 *
 * Why this route exists:
 * - Commercial platform roles need a live tenant and demand picture without
 *   being pushed into client operational or admin-control surfaces.
 * - The page keeps PII exposure minimal by masking lead emails while still
 *   showing real demand, reporting activity, and subscription-payment posture.
 */
export async function PlatformCommercialView() {
  let errorMessage: string | null = null;
  let leads: LeadRow[] = [];
  let organizations: OrganizationRow[] = [];
  let submissions: SubmissionRow[] = [];
  let payments: PaymentRow[] = [];

  try {
    await requirePlatformStaffActor(["platform_crm", "platform_sales", "platform_finance"]);

    const admin = createServerSupabaseClient();
    const [leadResponse, organizationResponse, submissionResponse, paymentResponse] = await Promise.all([
      admin
        .from("leads")
        .select("email, sector, product_label, cn_code, tonnage_per_year, created_at")
        .order("created_at", { ascending: false })
        .limit(120),
      admin
        .from("client_organizations")
        .select("id, legal_name, trade_name, subscription_tier, is_active, country, erp_sync_enabled")
        .is("deleted_at", null)
        .order("legal_name"),
      admin
        .from("ghg_submissions")
        .select("organization_id, status, updated_at")
        .order("updated_at", { ascending: false })
        .limit(240),
      admin
        .from("payment_transactions")
        .select("organization_id, transaction_type, amount_inr, status, payment_processor, created_at")
        .order("created_at", { ascending: false })
        .limit(240),
    ]);

    if (
      leadResponse.error ||
      organizationResponse.error ||
      submissionResponse.error ||
      paymentResponse.error
    ) {
      throw new Error("PLATFORM_COMMERCIAL_DATA_UNAVAILABLE");
    }

    leads = (leadResponse.data ?? []) as LeadRow[];
    organizations = (organizationResponse.data ?? []) as OrganizationRow[];
    submissions = (submissionResponse.data ?? []) as SubmissionRow[];
    payments = (paymentResponse.data ?? []) as PaymentRow[];
  } catch (error) {
    console.error("Failed to load platform commercial workspace:", error);
    errorMessage =
      "Commercial platform data is unavailable right now. Verify service-role access and reload the page.";
  }

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentLeads = leads.filter((lead) => {
    if (!lead.created_at) {
      return false;
    }

    return new Date(lead.created_at).getTime() >= thirtyDaysAgo;
  });
  const activeOrganizations = organizations.filter((organization) => organization.is_active !== false);
  const recentSubmissionOrgIds = new Set(
    submissions
      .filter((row) => row.updated_at && new Date(row.updated_at).getTime() >= thirtyDaysAgo)
      .map((row) => row.organization_id),
  );
  const completedSubscriptionPayments = payments.filter(
    (row) => row.transaction_type === "subscription_payment" && row.status === "completed",
  );
  const subscriptionRevenue = completedSubscriptionPayments.reduce(
    (sum, row) => sum + Number(row.amount_inr ?? 0),
    0,
  );
  const latestSubmissionByOrg = new Map<string, SubmissionRow>();

  submissions.forEach((submission) => {
    if (!latestSubmissionByOrg.has(submission.organization_id)) {
      latestSubmissionByOrg.set(submission.organization_id, submission);
    }
  });

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Platform Commercial</p>
        <h1 className={styles.title}>Demand, Tenant, And Revenue Pulse</h1>
        <p className={styles.subtitle}>
          Review masked lead demand, tenant readiness, reporting activity, and subscription-payment posture from one
          commercial workspace. This route stays read-focused and does not grant client-operational authority.
        </p>
      </header>

      {errorMessage ? (
        <div className={styles.alert} data-tone="warning">
          {errorMessage}
        </div>
      ) : null}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Fresh Leads</p>
          <p className={styles.metricValue}>{recentLeads.length}</p>
          <p className={styles.metricHint}>Lead rows created in the last 30 days.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Active Tenants</p>
          <p className={styles.metricValue}>{activeOrganizations.length}</p>
          <p className={styles.metricHint}>Organizations still marked active in the live registry.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Subscription Revenue</p>
          <p className={styles.metricValue}>{formatCurrency(subscriptionRevenue)}</p>
          <p className={styles.metricHint}>Completed subscription-payment value recorded in INR.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Reporting-Active Tenants</p>
          <p className={styles.metricValue}>{recentSubmissionOrgIds.size}</p>
          <p className={styles.metricHint}>Organizations with recent submission activity in the last 30 days.</p>
        </article>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Commercial Guardrails</h2>
            <div className={styles.ruleList}>
              <div className={styles.ruleItem}>
                <p className={styles.ruleTitle}>Masked lead contact data</p>
                <p className={styles.ruleMeta}>
                  Lead emails stay partially masked here so the route remains useful for pipeline work without
                  overexposing personal data in the UI.
                </p>
              </div>
              <div className={styles.ruleItem}>
                <p className={styles.ruleTitle}>Tenant-readiness posture</p>
                <p className={styles.ruleMeta}>
                  Reporting activity and ERP sync are shown as commercial readiness indicators, not as permission to
                  inspect the tenant&apos;s operational workflows.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Payment Processors In Flight</h2>
            <div className={styles.ruleList}>
              {completedSubscriptionPayments.slice(0, 5).map((payment, index) => (
                <div key={`payment-${index}`} className={styles.ruleItem}>
                  <p className={styles.ruleTitle}>
                    {payment.payment_processor ?? "Processor not recorded"}
                  </p>
                  <p className={styles.ruleMeta}>
                    {payment.transaction_type} | INR {formatCurrency(Number(payment.amount_inr ?? 0))} |{" "}
                    {formatDateTime(payment.created_at)}
                  </p>
                </div>
              ))}
              {completedSubscriptionPayments.length === 0 ? (
                <div className={styles.ruleItem}>
                  <p className={styles.ruleMeta}>
                    No completed subscription-payment rows are visible in the current environment yet.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </aside>

        <div className={styles.mainStack}>
          <section className={styles.tableCard}>
            <h2 className={styles.cardTitle}>Lead Pipeline</h2>
            {leads.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No leads are visible yet.</h3>
                <p className={styles.emptyCopy}>
                  The live commercial intake is connected, but this environment is not carrying lead rows right now.
                </p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeaderCell}>Lead</th>
                      <th className={styles.tableHeaderCell}>Interest</th>
                      <th className={styles.tableHeaderCell}>Volume / Timing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.slice(0, 8).map((lead, index) => (
                      <tr key={`${lead.email}-${lead.created_at ?? index}`}>
                        <td className={styles.tableCell}>
                          <p className={styles.tableName}>{maskEmail(lead.email)}</p>
                          <p className={styles.tableMeta}>{lead.sector ?? "Sector not captured"}</p>
                        </td>
                        <td className={styles.tableCell}>
                          <p className={styles.tableMeta}>{lead.product_label ?? "Product not captured"}</p>
                          <p className={styles.tableMeta}>CN code {lead.cn_code ?? "not supplied"}</p>
                        </td>
                        <td className={styles.tableCell}>
                          <p className={styles.tableMeta}>
                            {lead.tonnage_per_year != null
                              ? `${formatCurrency(Number(lead.tonnage_per_year))} t/year`
                              : "Volume not captured"}
                          </p>
                          <p className={styles.tableMeta}>{formatDateTime(lead.created_at)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={styles.tableCard}>
            <h2 className={styles.cardTitle}>Tenant Commercial Readiness</h2>
            {organizations.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No tenant rows are visible yet.</h3>
                <p className={styles.emptyCopy}>
                  The tenant registry is currently empty or unavailable in this environment snapshot.
                </p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeaderCell}>Tenant</th>
                      <th className={styles.tableHeaderCell}>Commercial Posture</th>
                      <th className={styles.tableHeaderCell}>Reporting Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.slice(0, 10).map((organization) => {
                      const latestSubmission = latestSubmissionByOrg.get(organization.id);
                      const completedPayments = payments.filter(
                        (payment) =>
                          payment.organization_id === organization.id && payment.status === "completed",
                      );

                      return (
                        <tr key={organization.id}>
                          <td className={styles.tableCell}>
                            <p className={styles.tableName}>
                              {organization.trade_name?.trim() || organization.legal_name}
                            </p>
                            <p className={styles.tableMeta}>{organization.country ?? "Country not captured"}</p>
                          </td>
                          <td className={styles.tableCell}>
                            <div className={styles.stackedBadges}>
                              <span className={styles.badge} data-tone={organization.is_active !== false ? "success" : "neutral"}>
                                {organization.is_active !== false ? "Active" : "Inactive"}
                              </span>
                              <span className={styles.badge} data-tone="info">
                                {organization.subscription_tier ?? "starter"}
                              </span>
                              <span
                                className={styles.badge}
                                data-tone={organization.erp_sync_enabled ? "success" : "warning"}
                              >
                                {organization.erp_sync_enabled ? "ERP sync on" : "ERP sync off"}
                              </span>
                            </div>
                          </td>
                          <td className={styles.tableCell}>
                            <p className={styles.tableMeta}>
                              Latest submission {latestSubmission ? latestSubmission.status : "not yet submitted"}
                            </p>
                            <p className={styles.tableMeta}>
                              Completed payments {completedPayments.length}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
