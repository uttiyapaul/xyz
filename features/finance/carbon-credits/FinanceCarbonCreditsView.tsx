"use client";

import { useEffect, useEffectEvent, useState } from "react";

import styles from "@/features/sustainability/SustainabilityWorkspace.module.css";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

interface OffsetRow {
  id: string;
  project_name: string;
  quantity_tco2e: number;
  is_retired: boolean | null;
}

interface PaymentTransactionRow {
  id: string;
  transaction_type: string;
  amount_inr: number | null;
  amount_usd: number | null;
  currency: string;
  payment_method_type: string | null;
  payment_processor: string | null;
  status: string;
  carbon_offset_id: string | null;
  invoice_number: string | null;
  created_at: string;
}

const INITIAL_FORM = {
  transactionType: "carbon_credit_purchase",
  carbonOffsetId: "",
  amountInr: "",
  amountUsd: "",
  currency: "INR",
  paymentMethodType: "wire_transfer",
  paymentProcessor: "wise",
  invoiceNumber: "",
};

/**
 * Finance carbon-credit workspace.
 *
 * This route combines offset inventory with transaction logging so trading and
 * finance roles can track purchases without exposing secret payment details.
 */
export function FinanceCarbonCreditsView() {
  const { primaryOrgId, user, roles, isLoading: authLoading } = useAuth();
  const [offsets, setOffsets] = useState<OffsetRow[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "info" | "warning" | "success"; text: string } | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const canTradeCredits = roles.some((role) => ["carbon_credit_trader", "finance_analyst"].includes(role));
  const marketAudienceLabel = canTradeCredits ? "Trader-enabled" : "Read-only oversight";

  async function loadCarbonCreditWorkspace() {
    if (!primaryOrgId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [offsetResponse, transactionResponse] = await Promise.all([
      supabase
        .from("carbon_offsets")
        .select("id, project_name, quantity_tco2e, is_retired")
        .eq("organization_id", primaryOrgId)
        .order("created_at", { ascending: false }),
      supabase
        .from("payment_transactions")
        .select("id, transaction_type, amount_inr, amount_usd, currency, payment_method_type, payment_processor, status, carbon_offset_id, invoice_number, created_at")
        .eq("organization_id", primaryOrgId)
        .in("transaction_type", ["carbon_credit_purchase", "carbon_credit_sale", "offset_retirement", "marketplace_fee"])
        .order("created_at", { ascending: false }),
    ]);

    if (offsetResponse.error || transactionResponse.error) {
      setOffsets([]);
      setTransactions([]);
      setMessage({
        tone: "warning",
        text: "Carbon-credit transaction data is unavailable right now. Refresh the page or verify finance transaction access for this organization.",
      });
      setLoading(false);
      return;
    }

    setOffsets((offsetResponse.data ?? []) as OffsetRow[]);
    setTransactions((transactionResponse.data ?? []) as PaymentTransactionRow[]);
    setLoading(false);
  }

  const scheduleCarbonCreditLoad = useEffectEvent(() => {
    void loadCarbonCreditWorkspace();
  });

  useEffect(() => {
    if (!authLoading && primaryOrgId) {
      queueMicrotask(scheduleCarbonCreditLoad);
    }
  }, [authLoading, primaryOrgId]);

  async function handleCreateTransaction() {
    if (!primaryOrgId || !user) {
      return;
    }

    if (!canTradeCredits) {
      setMessage({
        tone: "warning",
        text: "This role can review market posture but cannot create trade tickets. Ticket creation is limited to trader-enabled finance roles.",
      });
      return;
    }

    const hasInrAmount = form.amountInr.trim().length > 0 && Number(form.amountInr) > 0;
    const hasUsdAmount = form.amountUsd.trim().length > 0 && Number(form.amountUsd) > 0;
    const needsOffsetLink = ["carbon_credit_sale", "offset_retirement"].includes(form.transactionType);

    if (!hasInrAmount && !hasUsdAmount) {
      setMessage({
        tone: "warning",
        text: "Enter a positive INR or USD amount before saving a market ticket.",
      });
      return;
    }

    if (needsOffsetLink && !form.carbonOffsetId) {
      setMessage({
        tone: "warning",
        text: "Sale and retirement tickets must point to a linked offset lot so the market trail stays auditable.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from("payment_transactions").insert({
      organization_id: primaryOrgId,
      transaction_type: form.transactionType,
      amount_inr: form.amountInr ? Number(form.amountInr) : null,
      amount_usd: form.amountUsd ? Number(form.amountUsd) : null,
      currency: form.currency,
      payment_method_type: form.paymentMethodType,
      payment_processor: form.paymentProcessor,
      status: "pending",
      carbon_offset_id: form.carbonOffsetId || null,
      invoice_number: form.invoiceNumber.trim() || null,
      initiated_by: user.id,
    });

    if (error) {
      setSaving(false);
      setMessage({
        tone: "warning",
        text: "The trade ticket could not be saved. Check the amount, offset reference, and finance access, then try again.",
      });
      return;
    }

    setSaving(false);
    setForm(INITIAL_FORM);
    setMessage({
      tone: "success",
      text: "Trade ticket saved. Payment processor tokens and full card data remain outside this UI by design.",
    });
    await loadCarbonCreditWorkspace();
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Finance Workspace</p>
        <h1 className={styles.title}>Carbon Credit Marketplace</h1>
        <p className={styles.subtitle}>
          Track carbon-credit inventory alongside purchase and sale tickets. The UI only records tokenized transaction
          context and never surfaces raw payment secrets.
        </p>
      </header>

      {message ? <div className={styles.alert} data-tone={message.tone}>{message.text}</div> : null}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Offset Lots</p><p className={styles.metricValue}>{offsets.length}</p><p className={styles.metricHint}>Portfolio lots available to tie against credit transactions.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Available Volume</p><p className={styles.metricValue}>{offsets.filter((offset) => !offset.is_retired).reduce((sum, offset) => sum + Number(offset.quantity_tco2e || 0), 0).toFixed(0)}</p><p className={styles.metricHint}>Unretired tCO2e volume still available in the current portfolio.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Completed Trades</p><p className={styles.metricValue}>{transactions.filter((transaction) => transaction.status === "completed").length}</p><p className={styles.metricHint}>Transactions already marked completed in the finance ledger.</p></article>
        <article className={styles.metricCard}><p className={styles.metricLabel}>Pending Tickets</p><p className={styles.metricValue}>{transactions.filter((transaction) => transaction.status === "pending" || transaction.status === "processing").length}</p><p className={styles.metricHint}>Trade tickets still waiting for settlement or processor completion.</p></article>
      </section>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Trade Guardrails</h2>
            <div className={styles.metaList}>
              <div className={styles.alert} data-tone="warning">This UI must never show full card details or processor tokens. Payment storage stays out of PCI scope by design.</div>
              <div className={styles.alert} data-tone="info">Marketplace tickets should still reference a real offset lot whenever a purchase or sale affects emissions claims.</div>
              <p className={styles.detailText}>Audience mode: {marketAudienceLabel}</p>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Log trade ticket</h2>
            {!canTradeCredits ? (
              <div className={styles.alert} data-tone="info">
                This role can review the market ledger and linked offsets, but ticket creation stays restricted to the trader-enabled finance lane.
              </div>
            ) : null}
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="trade-type">Transaction type</label><select id="trade-type" className={styles.select} value={form.transactionType} onChange={(event) => setForm((current) => ({ ...current, transactionType: event.target.value }))}><option value="carbon_credit_purchase">Credit purchase</option><option value="carbon_credit_sale">Credit sale</option><option value="offset_retirement">Offset retirement</option><option value="marketplace_fee">Marketplace fee</option></select></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="trade-offset">Offset lot</label><select id="trade-offset" className={styles.select} value={form.carbonOffsetId} onChange={(event) => setForm((current) => ({ ...current, carbonOffsetId: event.target.value }))}><option value="">No linked lot</option>{offsets.map((offset) => <option key={offset.id} value={offset.id}>{offset.project_name}</option>)}</select></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="trade-inr">Amount INR</label><input id="trade-inr" className={styles.input} value={form.amountInr} onChange={(event) => setForm((current) => ({ ...current, amountInr: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="trade-usd">Amount USD</label><input id="trade-usd" className={styles.input} value={form.amountUsd} onChange={(event) => setForm((current) => ({ ...current, amountUsd: event.target.value }))} /></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="trade-currency">Currency</label><select id="trade-currency" className={styles.select} value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}><option value="INR">INR</option><option value="USD">USD</option><option value="EUR">EUR</option></select></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="trade-method">Payment method</label><select id="trade-method" className={styles.select} value={form.paymentMethodType} onChange={(event) => setForm((current) => ({ ...current, paymentMethodType: event.target.value }))}><option value="wire_transfer">Wire transfer</option><option value="netbanking">Netbanking</option><option value="upi">UPI</option><option value="card">Card token</option></select></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="trade-processor">Processor</label><select id="trade-processor" className={styles.select} value={form.paymentProcessor} onChange={(event) => setForm((current) => ({ ...current, paymentProcessor: event.target.value }))}><option value="wise">Wise</option><option value="stripe">Stripe</option><option value="razorpay">Razorpay</option><option value="paypal">PayPal</option></select></div>
              <div className={styles.fieldGroup}><label className={styles.label} htmlFor="trade-invoice">Invoice number</label><input id="trade-invoice" className={styles.input} value={form.invoiceNumber} onChange={(event) => setForm((current) => ({ ...current, invoiceNumber: event.target.value }))} /></div>
              <div className={styles.actions}><button type="button" className={`${styles.button} ${styles.primaryButton}`} onClick={() => void handleCreateTransaction()} disabled={!canTradeCredits || saving}>{saving ? "Saving..." : "Create ticket"}</button><button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={() => setForm(INITIAL_FORM)}>Reset</button></div>
            </div>
          </section>
        </aside>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Credit Transactions</h2>
          {authLoading || loading ? (
            <div className={styles.alert} data-tone="info">Loading carbon-credit transactions...</div>
          ) : transactions.length === 0 ? (
            <div className={styles.emptyState}>No carbon-credit transaction rows are visible for the active organization yet.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderCell}>Transaction</th>
                    <th className={styles.tableHeaderCell}>Amounts</th>
                    <th className={styles.tableHeaderCell}>Settlement</th>
                    <th className={styles.tableHeaderCell}>Offset Link</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => {
                    const linkedOffset = offsets.find((offset) => offset.id === transaction.carbon_offset_id);

                    return (
                      <tr key={transaction.id}>
                        <td className={styles.tableCell}>
                          <div className={styles.name}>{transaction.transaction_type}</div>
                          <div className={styles.meta}>{new Date(transaction.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</div>
                          <div className={styles.meta}>{transaction.invoice_number ?? "Invoice not recorded"}</div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.meta}>INR {transaction.amount_inr ?? "n/a"}</div>
                          <div className={styles.meta}>USD {transaction.amount_usd ?? "n/a"}</div>
                          <div className={styles.meta}>{transaction.currency}</div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.badgeGroup}>
                            <span className={styles.badge} data-tone={transaction.status === "completed" ? "success" : transaction.status === "failed" ? "warning" : "info"}>{transaction.status}</span>
                          </div>
                          <div className={styles.meta}>{transaction.payment_method_type ?? "Method n/a"} | {transaction.payment_processor ?? "Processor n/a"}</div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.meta}>{linkedOffset?.project_name ?? "No linked offset lot"}</div>
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
    </section>
  );
}
