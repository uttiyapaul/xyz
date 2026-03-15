"use client";

import { useState } from "react";

import styles from "@/features/legal/LegalPage.module.css";
import { supabase } from "@/lib/supabase/client";

type RequestType =
  | "access"
  | "deletion"
  | "portability"
  | "correction"
  | "processing_restriction"
  | "objection"
  | "opt_out";

interface RequestFormState {
  requesterName: string;
  requesterEmail: string;
  requestType: RequestType;
  jurisdiction: string;
  description: string;
}

const INITIAL_STATE: RequestFormState = {
  requesterName: "",
  requesterEmail: "",
  requestType: "access",
  jurisdiction: "GDPR",
  description: "",
};

/**
 * Public DSAR intake form.
 *
 * This writes into the live `data_subject_access_requests` table using the
 * public insert policy already present in the schema. Errors stay user-safe
 * and do not expose raw provider messages in the UI.
 */
export function DataSubjectRequestForm() {
  const [form, setForm] = useState<RequestFormState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    tone: "success" | "warning";
    text: string;
  } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.requesterName.trim() || !form.requesterEmail.trim() || !form.description.trim()) {
      setMessage({
        tone: "warning",
        text: "Provide your name, email, and request details before submitting.",
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const { error } = await supabase.from("data_subject_access_requests").insert({
      requester_name: form.requesterName.trim(),
      requester_email: form.requesterEmail.trim().toLowerCase(),
      request_type: form.requestType,
      request_description: form.description.trim(),
      applicable_jurisdiction: form.jurisdiction.trim(),
    });

    setSubmitting(false);

    if (error) {
      setMessage({
        tone: "warning",
        text: "Your request could not be recorded right now. Please try again in a few minutes.",
      });
      return;
    }

    setForm(INITIAL_STATE);
    setMessage({
      tone: "success",
      text: "Your request has been recorded in the privacy intake queue. A reviewer will follow up using the details you provided.",
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {message ? (
        <div className={styles.message} data-tone={message.tone}>
          {message.text}
        </div>
      ) : null}

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span className={styles.label}>Full Name</span>
          <input
            className={styles.input}
            type="text"
            value={form.requesterName}
            onChange={(event) => setForm((current) => ({ ...current, requesterName: event.target.value }))}
            placeholder="Jane Smith"
            autoComplete="name"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            className={styles.input}
            type="email"
            value={form.requesterEmail}
            onChange={(event) => setForm((current) => ({ ...current, requesterEmail: event.target.value }))}
            placeholder="jane@company.com"
            autoComplete="email"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Request Type</span>
          <select
            className={styles.select}
            value={form.requestType}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                requestType: event.target.value as RequestType,
              }))
            }
          >
            <option value="access">Access</option>
            <option value="correction">Correction</option>
            <option value="deletion">Deletion</option>
            <option value="portability">Portability</option>
            <option value="processing_restriction">Processing Restriction</option>
            <option value="objection">Objection</option>
            <option value="opt_out">Opt Out</option>
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Jurisdiction</span>
          <select
            className={styles.select}
            value={form.jurisdiction}
            onChange={(event) => setForm((current) => ({ ...current, jurisdiction: event.target.value }))}
          >
            <option value="GDPR">GDPR</option>
            <option value="DPDP">DPDP</option>
            <option value="CCPA">CCPA</option>
            <option value="LGPD">LGPD</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Request Details</span>
        <textarea
          className={styles.textarea}
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          placeholder="Describe the data right you want to exercise and the context that will help the privacy team verify and process the request."
        />
        <p className={styles.helpText}>
          Do not include passwords, payment credentials, or highly sensitive data in this form.
        </p>
      </label>

      <div className={styles.buttonRow}>
        <button className={styles.primaryButton} type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
        <p className={styles.secondaryText}>
          This form writes to the live privacy request queue. It does not grant immediate account changes.
        </p>
      </div>
    </form>
  );
}
