"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { filterRowsByScopeId } from "@/lib/auth/sessionScope";
import { supabase } from "@/lib/supabase/client";

interface SiteRow {
  id: string;
  site_name: string;
}

interface VerificationRow {
  id: string;
  submission_id: string;
  fy_year: string;
  verifier_id: string;
  verifier_organization: string;
  verifier_accreditation_no: string | null;
  verifier_standard: string;
  verifier_independence_dec: string;
  assurance_level: string;
  scopes_verified: number[];
  materiality_threshold_pct: number | string;
  period_start: string;
  period_end: string;
  engagement_start_date: string | null;
  desktop_review_date: string | null;
  site_visit_dates: string[] | null;
  sites_visited: string[] | null;
  draft_statement_date: string | null;
  final_statement_date: string | null;
  verification_opinion: string | null;
  total_verified_tco2e: number | string | null;
  material_misstatement_found: boolean;
  status: string;
}

interface FindingRow {
  id: string;
  verification_id: string;
  finding_ref: string;
  finding_type: string;
  severity: string;
  scope_affected: number | null;
  field_key_affected: string | null;
  affected_reading_ids: string[] | null;
  finding_description: string;
  estimated_impact_tco2e: number | string | null;
  standard_clause_ref: string | null;
  raised_at: string;
  status: string;
  resolved_at: string | null;
}

interface ResponseRow {
  id: string;
  finding_id: string;
  response_text: string;
  corrective_action: string | null;
  responded_at: string;
  verifier_accepted: boolean | null;
  verifier_accepted_at: string | null;
}

interface SubmissionRow {
  id: string;
  fy_year: string;
  status: string;
  locked_at: string | null;
  verified_at: string | null;
}

interface DocumentRow {
  id: string;
  site_id: string | null;
  submission_id: string | null;
  file_name: string;
  document_type: string;
  review_status: string | null;
  verifier_reviewed: boolean | null;
  uploaded_at: string;
}

interface ActivityRow {
  id: string;
  facility_id: string | null;
  fy_year: string | null;
  status: string;
}

interface SignoffRow {
  id: string;
  submission_id: string;
  signoff_stage: string;
  signed_by_name: string;
  signed_by_designation: string;
  signed_by_role: string;
  signed_at: string;
  is_valid: boolean;
}

export interface AuditFindingItem {
  id: string;
  findingRef: string;
  fyYear: string;
  severity: string;
  findingType: string;
  status: string;
  description: string;
  verifierOrganization: string;
  responseCount: number;
  waitingForClient: boolean;
  scopeAffected: number | null;
  impactTco2e: number | null;
  standardClauseRef: string | null;
  affectedReadingCount: number;
  raisedAt: string;
  resolvedAt: string | null;
  latestResponseAt: string | null;
  latestResponseSummary: string | null;
  correctiveActionSummary: string | null;
  acceptedResponses: number;
}

export interface AuditRfisState {
  loading: boolean;
  error: string | null;
  findings: AuditFindingItem[];
  activeVerifications: number;
  openFindings: number;
  waitingForClient: number;
  closedFindings: number;
  acceptedResponses: number;
}

export interface AuditSamplingItem {
  id: string;
  fyYear: string;
  verifierOrganization: string;
  status: string;
  assuranceLevel: string;
  materialityThresholdPct: number;
  scopesVerifiedLabel: string;
  siteVisitCount: number;
  sitesVisitedLabel: string;
  latestVisitDate: string | null;
  candidateRecordCount: number;
  evidenceDocumentCount: number;
  unreviewedEvidenceCount: number;
  materialMisstatementFound: boolean;
}

export interface AuditSamplingState {
  loading: boolean;
  error: string | null;
  samplingRows: AuditSamplingItem[];
  activeEngagements: number;
  visitedSites: number;
  candidateRecords: number;
  evidenceDocuments: number;
  unreviewedEvidence: number;
}

export interface AuditVaultItem {
  id: string;
  fyYear: string;
  submissionStatus: string;
  verificationStatus: string;
  verifierOrganization: string;
  verifierStandard: string;
  verifierAccreditationNo: string | null;
  assuranceLevel: string;
  independenceDeclaration: string;
  opinion: string;
  draftStatementDate: string | null;
  finalStatementDate: string | null;
  totalVerifiedTco2e: number | null;
  materialMisstatementFound: boolean;
  lockedAt: string | null;
  verifiedAt: string | null;
  signoffCount: number;
  signoffStages: string[];
  latestSignoffAt: string | null;
  invalidSignoffCount: number;
  documentCount: number;
}

export interface AuditVaultState {
  loading: boolean;
  error: string | null;
  statements: AuditVaultItem[];
  finalStatements: number;
  verifiedSubmissions: number;
  lockedSubmissions: number;
  signoffEvents: number;
  invalidSignoffs: number;
  materialMisstatements: number;
}

function verificationMatchesScope(sitesVisited: string[] | null, siteScopeIds: readonly string[]): boolean {
  if (siteScopeIds.length === 0) {
    return true;
  }

  if (!sitesVisited || sitesVisited.length === 0) {
    return true;
  }

  return sitesVisited.some((siteId) => siteScopeIds.includes(siteId));
}

function toSentenceCase(value: string): string {
  return value.replace(/_/g, " ");
}

function summarizeText(value: string | null, maxLength = 140): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1)}...`;
}

async function loadAuditBase(orgId: string, siteScopeIds: readonly string[]) {
  const [siteResponse, verificationResponse, submissionResponse, documentResponse, activityResponse] =
    await Promise.all([
      supabase.from("v_active_sites").select("id, site_name").eq("organization_id", orgId).order("site_name"),
      supabase
        .from("ghg_verifications")
        .select(
          "id, submission_id, fy_year, verifier_id, verifier_organization, verifier_accreditation_no, verifier_standard, verifier_independence_dec, assurance_level, scopes_verified, materiality_threshold_pct, period_start, period_end, engagement_start_date, desktop_review_date, site_visit_dates, sites_visited, draft_statement_date, final_statement_date, verification_opinion, total_verified_tco2e, material_misstatement_found, status",
        )
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false }),
      supabase
        .from("ghg_submissions")
        .select("id, fy_year, status, locked_at, verified_at")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false }),
      supabase
        .from("ghg_documents")
        .select("id, site_id, submission_id, file_name, document_type, review_status, verifier_reviewed, uploaded_at")
        .eq("organization_id", orgId)
        .order("uploaded_at", { ascending: false })
        .limit(240),
      supabase
        .from("activity_data")
        .select("id, facility_id, fy_year, status")
        .eq("organization_id", orgId)
        .order("reporting_period", { ascending: false })
        .limit(240),
    ]);

  if (siteResponse.error) {
    throw siteResponse.error;
  }

  if (verificationResponse.error) {
    throw verificationResponse.error;
  }

  if (submissionResponse.error) {
    throw submissionResponse.error;
  }

  if (documentResponse.error) {
    throw documentResponse.error;
  }

  if (activityResponse.error) {
    throw activityResponse.error;
  }

  const sites = filterRowsByScopeId((siteResponse.data ?? []) as SiteRow[], siteScopeIds, (site) => site.id);
  const siteMap = new Map(sites.map((site) => [site.id, site.site_name]));
  const verifications = ((verificationResponse.data ?? []) as VerificationRow[]).filter((verification) =>
    verificationMatchesScope(verification.sites_visited, siteScopeIds),
  );
  const submissions = (submissionResponse.data ?? []) as SubmissionRow[];
  const submissionMap = new Map(submissions.map((submission) => [submission.id, submission]));
  const documents = filterRowsByScopeId(
    (documentResponse.data ?? []) as DocumentRow[],
    siteScopeIds,
    (document) => document.site_id,
    { includeRowsWithoutScope: true },
  );
  const activities = filterRowsByScopeId(
    (activityResponse.data ?? []) as ActivityRow[],
    siteScopeIds,
    (activity) => activity.facility_id,
    { includeRowsWithoutScope: true },
  );

  return {
    sites,
    siteMap,
    verifications,
    submissionMap,
    documents,
    activities,
  };
}

export function useAuditRfisData(): AuditRfisState {
  const { primaryOrgId, siteScopeIds, isLoading: authLoading } = useAuth();
  const [findings, setFindings] = useState<AuditFindingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVerifications, setActiveVerifications] = useState(0);
  const orgId = primaryOrgId ?? "";
  const scopeKey = siteScopeIds.join("|");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!orgId) {
      setFindings([]);
      setActiveVerifications(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      loadAuditBase(orgId, siteScopeIds),
      supabase
        .from("ghg_verification_findings")
        .select(
          "id, verification_id, finding_ref, finding_type, severity, scope_affected, field_key_affected, affected_reading_ids, finding_description, estimated_impact_tco2e, standard_clause_ref, raised_at, status, resolved_at",
        )
        .order("raised_at", { ascending: false })
        .limit(200),
      supabase
        .from("ghg_verification_responses")
        .select("id, finding_id, response_text, corrective_action, responded_at, verifier_accepted, verifier_accepted_at")
        .order("responded_at", { ascending: false })
        .limit(240),
    ])
      .then(([base, findingResponse, responseResponse]) => {
        if (findingResponse.error) {
          throw findingResponse.error;
        }

        if (responseResponse.error) {
          throw responseResponse.error;
        }

        const verificationMap = new Map(base.verifications.map((verification) => [verification.id, verification]));
        const responseRows = (responseResponse.data ?? []) as ResponseRow[];
        const responseCount = new Map<string, number>();
        const acceptedResponseCount = new Map<string, number>();
        const latestResponseByFinding = new Map<string, ResponseRow>();

        responseRows.forEach((response) => {
          responseCount.set(response.finding_id, (responseCount.get(response.finding_id) ?? 0) + 1);

          if (response.verifier_accepted) {
            acceptedResponseCount.set(
              response.finding_id,
              (acceptedResponseCount.get(response.finding_id) ?? 0) + 1,
            );
          }

          const currentLatest = latestResponseByFinding.get(response.finding_id);

          if (!currentLatest || new Date(response.responded_at) > new Date(currentLatest.responded_at)) {
            latestResponseByFinding.set(response.finding_id, response);
          }
        });

        const nextFindings = ((findingResponse.data ?? []) as FindingRow[])
          .map((finding) => {
            const verification = verificationMap.get(finding.verification_id);

            if (!verification) {
              return null;
            }

            const latestResponse = latestResponseByFinding.get(finding.id);

            return {
              id: finding.id,
              findingRef: finding.finding_ref,
              fyYear: verification.fy_year,
              severity: finding.severity,
              findingType: finding.finding_type,
              status: finding.status,
              description: finding.finding_description,
              verifierOrganization: verification.verifier_organization,
              responseCount: responseCount.get(finding.id) ?? 0,
              waitingForClient: finding.status === "open" && (responseCount.get(finding.id) ?? 0) === 0,
              scopeAffected: finding.scope_affected,
              impactTco2e:
                finding.estimated_impact_tco2e == null ? null : Number(finding.estimated_impact_tco2e),
              standardClauseRef: finding.standard_clause_ref,
              affectedReadingCount: finding.affected_reading_ids?.length ?? 0,
              raisedAt: finding.raised_at,
              resolvedAt: finding.resolved_at,
              latestResponseAt: latestResponse?.responded_at ?? null,
              latestResponseSummary: summarizeText(latestResponse?.response_text ?? null),
              correctiveActionSummary: summarizeText(latestResponse?.corrective_action ?? null),
              acceptedResponses: acceptedResponseCount.get(finding.id) ?? 0,
            } satisfies AuditFindingItem;
          })
          .filter((finding): finding is AuditFindingItem => finding !== null);

        setFindings(nextFindings);
        setActiveVerifications(base.verifications.length);
      })
      .catch((loadError) => {
        console.error("Failed to load audit RFI workspace:", loadError);
        setFindings([]);
        setActiveVerifications(0);
        setError("The verification findings workspace could not be loaded from the live schema.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authLoading, orgId, scopeKey]);

  return {
    loading,
    error,
    findings,
    activeVerifications,
    openFindings: findings.filter((finding) => finding.status === "open").length,
    waitingForClient: findings.filter((finding) => finding.waitingForClient).length,
    closedFindings: findings.filter((finding) => finding.status !== "open").length,
    acceptedResponses: findings.reduce((sum, finding) => sum + finding.acceptedResponses, 0),
  };
}

export function useAuditSamplingData(): AuditSamplingState {
  const { primaryOrgId, siteScopeIds, isLoading: authLoading } = useAuth();
  const [samplingRows, setSamplingRows] = useState<AuditSamplingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orgId = primaryOrgId ?? "";
  const scopeKey = siteScopeIds.join("|");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!orgId) {
      setSamplingRows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    loadAuditBase(orgId, siteScopeIds)
      .then((base) => {
        const evidenceCountBySubmission = new Map<string, number>();
        const unreviewedEvidenceCountBySubmission = new Map<string, number>();
        base.documents.forEach((document) => {
          if (document.submission_id) {
            evidenceCountBySubmission.set(
              document.submission_id,
              (evidenceCountBySubmission.get(document.submission_id) ?? 0) + 1,
            );

            if (!document.verifier_reviewed) {
              unreviewedEvidenceCountBySubmission.set(
                document.submission_id,
                (unreviewedEvidenceCountBySubmission.get(document.submission_id) ?? 0) + 1,
              );
            }
          }
        });

        const candidateCountByYear = new Map<string, number>();
        base.activities.forEach((activity) => {
          if (activity.fy_year && (activity.status === "validated" || activity.status === "accepted")) {
            candidateCountByYear.set(activity.fy_year, (candidateCountByYear.get(activity.fy_year) ?? 0) + 1);
          }
        });

        setSamplingRows(
          base.verifications.map((verification) => {
            const visitedSiteNames =
              verification.sites_visited?.map((siteId) => base.siteMap.get(siteId) ?? "Unassigned") ?? [];

            return {
              id: verification.id,
              fyYear: verification.fy_year,
              verifierOrganization: verification.verifier_organization,
              status: verification.status,
              assuranceLevel: verification.assurance_level,
              materialityThresholdPct: Number(verification.materiality_threshold_pct),
              scopesVerifiedLabel:
                verification.scopes_verified?.length > 0
                  ? verification.scopes_verified.map((scope) => `Scope ${scope}`).join(", ")
                  : "Scope coverage not recorded",
              siteVisitCount: verification.sites_visited?.length ?? 0,
              sitesVisitedLabel: visitedSiteNames.length > 0 ? visitedSiteNames.join(", ") : "No site visits logged",
              latestVisitDate: verification.site_visit_dates?.[verification.site_visit_dates.length - 1] ?? null,
              candidateRecordCount: candidateCountByYear.get(verification.fy_year) ?? 0,
              evidenceDocumentCount: evidenceCountBySubmission.get(verification.submission_id) ?? 0,
              unreviewedEvidenceCount:
                unreviewedEvidenceCountBySubmission.get(verification.submission_id) ?? 0,
              materialMisstatementFound: verification.material_misstatement_found,
            } satisfies AuditSamplingItem;
          }),
        );
      })
      .catch((loadError) => {
        console.error("Failed to load audit sampling workspace:", loadError);
        setSamplingRows([]);
        setError("The sampling workspace could not be loaded from the live schema.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authLoading, orgId, scopeKey]);

  return {
    loading,
    error,
    samplingRows,
    activeEngagements: samplingRows.length,
    visitedSites: samplingRows.reduce((sum, item) => sum + item.siteVisitCount, 0),
    candidateRecords: samplingRows.reduce((sum, item) => sum + item.candidateRecordCount, 0),
    evidenceDocuments: samplingRows.reduce((sum, item) => sum + item.evidenceDocumentCount, 0),
    unreviewedEvidence: samplingRows.reduce((sum, item) => sum + item.unreviewedEvidenceCount, 0),
  };
}

export function useAuditVaultData(): AuditVaultState {
  const { primaryOrgId, siteScopeIds, isLoading: authLoading } = useAuth();
  const [statements, setStatements] = useState<AuditVaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orgId = primaryOrgId ?? "";
  const scopeKey = siteScopeIds.join("|");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!orgId) {
      setStatements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      loadAuditBase(orgId, siteScopeIds),
      supabase
        .from("ghg_signoff_chain")
        .select("id, submission_id, signoff_stage, signed_by_name, signed_by_designation, signed_by_role, signed_at, is_valid")
        .eq("organization_id", orgId)
        .order("signed_at", { ascending: false })
        .limit(240),
    ])
      .then(([base, signoffResponse]) => {
        if (signoffResponse.error) {
          throw signoffResponse.error;
        }

        const signoffRows = (signoffResponse.data ?? []) as SignoffRow[];
        const signoffCountBySubmission = new Map<string, number>();
        const invalidSignoffCountBySubmission = new Map<string, number>();
        const signoffStagesBySubmission = new Map<string, Set<string>>();
        const latestSignoffAtBySubmission = new Map<string, string>();
        signoffRows.forEach((row) => {
          signoffCountBySubmission.set(
            row.submission_id,
            (signoffCountBySubmission.get(row.submission_id) ?? 0) + 1,
          );

          if (!row.is_valid) {
            invalidSignoffCountBySubmission.set(
              row.submission_id,
              (invalidSignoffCountBySubmission.get(row.submission_id) ?? 0) + 1,
            );
          }

          const currentStages = signoffStagesBySubmission.get(row.submission_id) ?? new Set<string>();
          currentStages.add(toSentenceCase(row.signoff_stage));
          signoffStagesBySubmission.set(row.submission_id, currentStages);

          const currentLatest = latestSignoffAtBySubmission.get(row.submission_id);
          if (!currentLatest || new Date(row.signed_at) > new Date(currentLatest)) {
            latestSignoffAtBySubmission.set(row.submission_id, row.signed_at);
          }
        });

        const documentCountBySubmission = new Map<string, number>();
        base.documents.forEach((document) => {
          if (document.submission_id) {
            documentCountBySubmission.set(
              document.submission_id,
              (documentCountBySubmission.get(document.submission_id) ?? 0) + 1,
            );
          }
        });

        setStatements(
          base.verifications.map((verification) => {
            const submission = base.submissionMap.get(verification.submission_id);

            return {
              id: verification.id,
              fyYear: verification.fy_year,
              submissionStatus: submission?.status ?? "draft",
              verificationStatus: verification.status,
              verifierOrganization: verification.verifier_organization,
              verifierStandard: verification.verifier_standard,
              verifierAccreditationNo: verification.verifier_accreditation_no,
              assuranceLevel: verification.assurance_level,
              independenceDeclaration: verification.verifier_independence_dec,
              opinion: verification.verification_opinion ?? "Pending opinion",
              draftStatementDate: verification.draft_statement_date,
              finalStatementDate: verification.final_statement_date,
              totalVerifiedTco2e:
                verification.total_verified_tco2e == null ? null : Number(verification.total_verified_tco2e),
              materialMisstatementFound: verification.material_misstatement_found,
              lockedAt: submission?.locked_at ?? null,
              verifiedAt: submission?.verified_at ?? null,
              signoffCount: signoffCountBySubmission.get(verification.submission_id) ?? 0,
              signoffStages: Array.from(signoffStagesBySubmission.get(verification.submission_id) ?? []),
              latestSignoffAt: latestSignoffAtBySubmission.get(verification.submission_id) ?? null,
              invalidSignoffCount: invalidSignoffCountBySubmission.get(verification.submission_id) ?? 0,
              documentCount: documentCountBySubmission.get(verification.submission_id) ?? 0,
            } satisfies AuditVaultItem;
          }),
        );
      })
      .catch((loadError) => {
        console.error("Failed to load audit vault workspace:", loadError);
        setStatements([]);
        setError("The assurance vault could not be loaded from the live schema.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authLoading, orgId, scopeKey]);

  return {
    loading,
    error,
    statements,
    finalStatements: statements.filter((item) => item.finalStatementDate != null).length,
    verifiedSubmissions: statements.filter((item) => item.verifiedAt != null).length,
    lockedSubmissions: statements.filter((item) => item.lockedAt != null).length,
    signoffEvents: statements.reduce((sum, item) => sum + item.signoffCount, 0),
    invalidSignoffs: statements.reduce((sum, item) => sum + item.invalidSignoffCount, 0),
    materialMisstatements: statements.filter((item) => item.materialMisstatementFound).length,
  };
}
