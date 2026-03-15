"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import styles from "./CBAMCalculator.module.css";

interface LeadCaptureFormProps {
  sector: string;
  productLabel: string;
  cnCode: string;
  tonnage: number;
  euaPrice: number;
  cost2026: number;
  cost2034: number;
  saving2034: number;
  cumulativeSaving: number;
}

/**
 * Public calculator lead capture.
 *
 * Why this exists:
 * - Keeps the public calculator connected to the live `leads` table instead of
 *   falling back to demo-only submission behavior.
 * - Captures explicit contact consent so the public request flow stays closer
 *   to audit expectations.
 */
export function LeadCaptureForm({
  sector,
  productLabel,
  cnCode,
  tonnage,
  euaPrice,
  cost2026,
  cost2034,
  saving2034,
  cumulativeSaving,
}: LeadCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<{ tone: "info" | "warning"; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!emailLooksValid) {
      setMessage({
        tone: "warning",
        text: "Enter a valid work email so the CBAM advisory team can contact you.",
      });
      return;
    }

    if (!consentAccepted) {
      setMessage({
        tone: "warning",
        text: "Confirm contact consent before sending the scoping request.",
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const { error } = await supabase.from("leads").insert({
      email: trimmedEmail,
      sector,
      product_label: productLabel,
      cn_code: cnCode,
      tonnage_per_year: tonnage,
      eua_price: euaPrice,
      cost_2026_eur: cost2026,
      cost_2034_eur: cost2034,
      saving_2034_eur: saving2034,
      cumulative_saving_eur: cumulativeSaving,
      consent_accepted: true,
      source: "cbam-calculator",
    });

    setSubmitting(false);

    if (error) {
      setMessage({
        tone: "warning",
        text: "The request could not be saved right now. Please retry in a moment or contact the team from the main site.",
      });
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className={styles.leadSuccess}>
        <p className={`${styles.leadEyebrow} ${styles.leadEyebrowSuccess}`}>Received</p>
        <h2 className={styles.leadTitle}>We&apos;ll be in touch within 24 hours.</h2>
        <p className={styles.helperText}>
          Your estimate remains on screen and the scoping request is now stored in the live leads pipeline.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.leadCard}>
      <div className={styles.leadGrid}>
        <div>
          <p className={styles.leadEyebrow}>Next step</p>
          <h2 className={styles.leadTitle}>Get your facility&apos;s actual emission baseline</h2>
          <p className={styles.leadBody}>
            The saving shown above becomes more defensible once your facility has a verified emissions baseline. This
            route creates a live scoping lead tied to the product, tonnage, and estimate currently visible in the
            calculator.
          </p>
        </div>

        <form className={styles.formStack} onSubmit={handleSubmit}>
          <div className={styles.formIntro}>Get a free scoping assessment</div>

          {message ? (
            <div
              className={`${styles.alert} ${message.tone === "warning" ? styles.alertWarning : styles.alertInfo}`}
              role="status"
            >
              {message.text}
            </div>
          ) : null}

          <label className={styles.visuallyHidden} htmlFor="cbam-lead-email">
            Work email address
          </label>
          <input
            id="cbam-lead-email"
            type="email"
            placeholder="your.email@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`${styles.input} ${message?.tone === "warning" && email.trim().length === 0 ? styles.inputInvalid : ""}`}
            autoComplete="email"
            inputMode="email"
          />

          <label className={styles.consentRow}>
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(event) => setConsentAccepted(event.target.checked)}
              className={styles.checkbox}
            />
            <span>
              I consent to being contacted about this CBAM estimate and understand the request will be stored in the
              lead intake table for follow-up.
            </span>
          </label>

          <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} disabled={submitting}>
            {submitting ? "Saving request..." : "Request free scoping call"}
          </button>

          <div className={styles.helperText}>We respond within 24 hours. No raw error details are ever shown here.</div>
        </form>
      </div>
    </section>
  );
}
