import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/admin";

export interface DsarRow {
  id: string;
  requester_name: string | null;
  requester_email: string;
  request_type: string;
  status: string;
  due_at: string | null;
  requested_at: string;
  escalated_at: string | null;
  identity_verified: boolean;
}

export interface DpiaRow {
  id: string;
  processing_activity: string;
  risk_level: string;
  residual_risk: string | null;
  next_review_due: string | null;
  approved_at: string | null;
  dpia_required: boolean;
}

export interface RopaRow {
  id: string;
  activity_name: string;
  legal_basis: string;
  next_review_due: string | null;
  last_reviewed_at: string | null;
  automated_decision_making: boolean;
  profiling_involved: boolean;
  is_active: boolean;
}

export interface TransferRow {
  id: string;
  transfer_name: string;
  data_importer_country: string;
  transfer_mechanism: string;
  tia_completed: boolean;
  next_review_due: string | null;
  is_active: boolean;
}

export interface IncidentRow {
  id: string;
  incident_ref: string | null;
  title: string;
  incident_type: string;
  severity: string;
  status: string;
  detected_at: string;
  dpa_notification_required: boolean;
  dpa_notification_deadline: string | null;
  personal_data_involved: boolean;
  user_notification_required: boolean;
}

export interface ConsentRow {
  id: string;
  consent_type: string;
  lawful_basis: string;
  consented_at: string;
  is_withdrawn: boolean;
  withdrawn_at: string | null;
  applicable_jurisdictions: string[] | null;
}

export interface GovernanceWorkspaceData {
  dsars: DsarRow[];
  dpias: DpiaRow[];
  ropaEntries: RopaRow[];
  transfers: TransferRow[];
  incidents: IncidentRow[];
  consents: ConsentRow[];
}

/**
 * Shared governance data loader for privacy and grievance-facing workspaces.
 *
 * Why this exists:
 * - The current schema already contains live privacy, incident, and consent
 *   tables that multiple governance roles need to inspect.
 * - Centralizing the queries keeps DPO and grievance views aligned and makes
 *   future audit expansions easier to reason about.
 */
export async function loadGovernanceWorkspaceData(): Promise<GovernanceWorkspaceData> {
  const admin = createServerSupabaseClient();
  const [dsarResponse, dpiaResponse, ropaResponse, transferResponse, incidentResponse, consentResponse] =
    await Promise.all([
      admin
        .from("data_subject_access_requests")
        .select(
          "id, requester_name, requester_email, request_type, status, due_at, requested_at, escalated_at, identity_verified",
        )
        .order("requested_at", { ascending: false })
        .limit(200),
      admin
        .from("dpia_register")
        .select(
          "id, processing_activity, risk_level, residual_risk, next_review_due, approved_at, dpia_required",
        )
        .order("updated_at", { ascending: false })
        .limit(160),
      admin
        .from("ropa_entries")
        .select(
          "id, activity_name, legal_basis, next_review_due, last_reviewed_at, automated_decision_making, profiling_involved, is_active",
        )
        .order("next_review_due", { ascending: true })
        .limit(160),
      admin
        .from("international_data_transfers")
        .select(
          "id, transfer_name, data_importer_country, transfer_mechanism, tia_completed, next_review_due, is_active",
        )
        .order("next_review_due", { ascending: true })
        .limit(160),
      admin
        .from("security_incidents")
        .select(
          "id, incident_ref, title, incident_type, severity, status, detected_at, dpa_notification_required, dpa_notification_deadline, personal_data_involved, user_notification_required",
        )
        .order("detected_at", { ascending: false })
        .limit(200),
      admin
        .from("consent_records")
        .select(
          "id, consent_type, lawful_basis, consented_at, is_withdrawn, withdrawn_at, applicable_jurisdictions",
        )
        .order("updated_at", { ascending: false })
        .limit(200),
    ]);

  if (
    dsarResponse.error ||
    dpiaResponse.error ||
    ropaResponse.error ||
    transferResponse.error ||
    incidentResponse.error ||
    consentResponse.error
  ) {
    throw new Error("GOVERNANCE_DATA_UNAVAILABLE");
  }

  return {
    dsars: (dsarResponse.data ?? []) as DsarRow[],
    dpias: (dpiaResponse.data ?? []) as DpiaRow[],
    ropaEntries: (ropaResponse.data ?? []) as RopaRow[],
    transfers: (transferResponse.data ?? []) as TransferRow[],
    incidents: (incidentResponse.data ?? []) as IncidentRow[],
    consents: (consentResponse.data ?? []) as ConsentRow[],
  };
}
