"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { filterRowsByScopeId } from "@/lib/auth/sessionScope";
import { getUserPrimaryRole, type PlatformRole } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase/client";

interface SiteRow {
  id: string;
  site_name: string;
}

interface SourceRow {
  id: string;
  source_name: string;
  scope: number;
  source_category: string;
  site_id: string | null;
  field_key: string | null;
  emission_factor_id: string | null;
}

interface ActivityRow {
  id: string;
  facility_id: string | null;
  activity_type: string;
  field_key: string | null;
  quantity: number | string;
  unit: string;
  reporting_period: string;
  fy_year: string | null;
  source_ref: string | null;
  document_id: string | null;
  trust_score: number | string | null;
  risk_level: string | null;
  status: string;
  created_by: string;
}

interface DocumentRow {
  id: string;
  site_id: string | null;
  submission_id: string | null;
  file_name: string;
  document_type: string;
  uploaded_at: string;
  uploaded_by: string;
  review_status: string | null;
  field_keys_justified: string[] | null;
}

interface SubmissionRow {
  id: string;
  fy_year: string;
  status: string;
  submitted_at: string | null;
  locked_at: string | null;
  verified_at: string | null;
}

interface EmissionFactorRow {
  id: string;
  factor_code: string;
  factor_version: string;
  factor_name: string;
  activity_category: string;
  scope: number;
  activity_unit: string;
  applicable_region: string;
  kgco2e_per_unit: number | string;
  is_current: boolean;
}

export interface ApprovalQueueItem {
  id: string;
  reportingPeriod: string;
  fyYear: string | null;
  status: string;
  activityType: string;
  sourceName: string;
  siteName: string;
  quantity: number;
  unit: string;
  trustScore: number | null;
  riskLevel: string;
  createdBy: string;
  evidenceLabel: string;
  evidenceStatus: string;
  submissionStatus: string;
  sourceScope: number | null;
  sodBlockReason: string | null;
}

export interface AccountingApprovalsState {
  loading: boolean;
  error: string | null;
  role: PlatformRole;
  queueItems: ApprovalQueueItem[];
  queueLabel: string;
  pendingCount: number;
  flaggedCount: number;
  blockedCount: number;
  savingId: string | null;
  updateActivityStatus: (item: ApprovalQueueItem, nextStatus: string) => Promise<void>;
}

export interface AnomalyQueueItem {
  id: string;
  detectedAt: string;
  sourceName: string;
  siteName: string;
  fieldKey: string;
  anomalyScore: number | null;
  flaggedValue: number | null;
  expectedRangeLow: number | null;
  expectedRangeHigh: number | null;
  isConfirmed: boolean;
  resolution: string | null;
  relatedActivityStatus: string;
  relatedRiskLevel: string;
}

export interface AccountingAnomaliesState {
  loading: boolean;
  error: string | null;
  anomalies: AnomalyQueueItem[];
  unresolvedCount: number;
  confirmedCount: number;
  criticalCount: number;
}

export interface FactorCoverageItem {
  id: string;
  sourceName: string;
  sourceCategory: string;
  scope: number;
  siteName: string;
  factorName: string | null;
  factorCode: string | null;
  factorVersion: string | null;
  factorUnit: string | null;
  factorRegion: string | null;
  coverageStatus: "linked" | "missing";
}

export interface EmissionFactorCoverageState {
  loading: boolean;
  error: string | null;
  factors: FactorCoverageItem[];
  factorLibrary: EmissionFactorRow[];
  linkedSources: number;
  missingSources: number;
}

function getRole(currentRole: PlatformRole | null): PlatformRole {
  return currentRole ?? "pending_approval";
}

function getQueueRoleLabel(role: PlatformRole): string {
  if (role === "data_reviewer") {
    return "review";
  }

  if (role === "data_approver") {
    return "approval";
  }

  return "accounting";
}

function formatSourceName(source: SourceRow | undefined, activityType: string): string {
  return source?.source_name ?? activityType.replace(/_/g, " ");
}

function findLinkedDocument(activity: ActivityRow, documents: DocumentRow[]): DocumentRow | undefined {
  if (activity.document_id) {
    const byDirectId = documents.find((document) => document.id === activity.document_id);

    if (byDirectId) {
      return byDirectId;
    }
  }

  if (!activity.field_key) {
    return undefined;
  }

  return documents.find((document) => document.field_keys_justified?.includes(activity.field_key ?? ""));
}

function getSubmissionStatus(activity: ActivityRow, submissionsByYear: Map<string, SubmissionRow>): string {
  if (!activity.fy_year) {
    return "draft";
  }

  return submissionsByYear.get(activity.fy_year)?.status ?? "draft";
}

function canTransitionActivity(
  role: PlatformRole,
  item: ApprovalQueueItem,
  nextStatus: string,
  currentUserId: string | null,
): boolean {
  if (role === "data_reviewer") {
    return ["validated", "flagged", "rejected"].includes(nextStatus);
  }

  if (role === "carbon_accountant") {
    return ["validated", "flagged", "rejected"].includes(nextStatus);
  }

  if (role === "data_approver") {
    if (!["accepted", "rejected"].includes(nextStatus)) {
      return false;
    }

    if (nextStatus === "accepted" && item.status !== "validated") {
      return false;
    }

    return item.createdBy !== currentUserId;
  }

  return false;
}

async function loadApprovalQueue(
  orgId: string,
  siteScopeIds: readonly string[],
  currentUserId: string | null,
  role: PlatformRole,
): Promise<ApprovalQueueItem[]> {
  const [siteResponse, sourceResponse, activityResponse, documentResponse, submissionResponse] = await Promise.all([
    supabase.from("v_active_sites").select("id, site_name").eq("organization_id", orgId).order("site_name"),
    supabase
      .from("ghg_emission_source_register")
      .select("id, source_name, scope, source_category, site_id, field_key, emission_factor_id")
      .eq("organization_id", orgId)
      .is("deleted_at", null),
    supabase
      .from("activity_data")
      .select(
        "id, facility_id, activity_type, field_key, quantity, unit, reporting_period, fy_year, source_ref, document_id, trust_score, risk_level, status, created_by",
      )
      .eq("organization_id", orgId)
      .order("reporting_period", { ascending: false })
      .limit(120),
    supabase
      .from("ghg_documents")
      .select("id, site_id, submission_id, file_name, document_type, uploaded_at, uploaded_by, review_status, field_keys_justified")
      .eq("organization_id", orgId)
      .order("uploaded_at", { ascending: false })
      .limit(200),
    supabase
      .from("ghg_submissions")
      .select("id, fy_year, status, submitted_at, locked_at, verified_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
  ]);

  if (siteResponse.error) {
    throw siteResponse.error;
  }

  if (sourceResponse.error) {
    throw sourceResponse.error;
  }

  if (activityResponse.error) {
    throw activityResponse.error;
  }

  if (documentResponse.error) {
    throw documentResponse.error;
  }

  if (submissionResponse.error) {
    throw submissionResponse.error;
  }

  const sites = filterRowsByScopeId((siteResponse.data ?? []) as SiteRow[], siteScopeIds, (site) => site.id);
  const siteMap = new Map(sites.map((site) => [site.id, site.site_name]));
  const sources = filterRowsByScopeId(
    (sourceResponse.data ?? []) as SourceRow[],
    siteScopeIds,
    (source) => source.site_id,
    { includeRowsWithoutScope: true },
  );
  const sourceMap = new Map(sources.map((source) => [source.id, source]));
  const documents = filterRowsByScopeId(
    (documentResponse.data ?? []) as DocumentRow[],
    siteScopeIds,
    (document) => document.site_id,
    { includeRowsWithoutScope: true },
  );
  const submissionsByYear = new Map(
    ((submissionResponse.data ?? []) as SubmissionRow[]).map((submission) => [submission.fy_year, submission]),
  );

  const baseQueue = filterRowsByScopeId(
    (activityResponse.data ?? []) as ActivityRow[],
    siteScopeIds,
    (activity) => activity.facility_id,
    { includeRowsWithoutScope: true },
  ).map((activity) => {
    const linkedSource =
      (activity.source_ref ? sourceMap.get(activity.source_ref) : undefined) ??
      sources.find((source) => source.field_key && source.field_key === activity.field_key);
    const linkedDocument = findLinkedDocument(activity, documents);
    const sodBlockReason =
      role === "data_approver" && activity.created_by === currentUserId
        ? "You cannot accept a record you originated yourself."
        : null;

    return {
      id: activity.id,
      reportingPeriod: activity.reporting_period,
      fyYear: activity.fy_year,
      status: activity.status,
      activityType: activity.activity_type,
      sourceName: formatSourceName(linkedSource, activity.activity_type),
      siteName: activity.facility_id ? siteMap.get(activity.facility_id) ?? "Unassigned" : "Unassigned",
      quantity: Number(activity.quantity),
      unit: activity.unit,
      trustScore: activity.trust_score == null ? null : Number(activity.trust_score),
      riskLevel: activity.risk_level ?? "unscored",
      createdBy: activity.created_by,
      evidenceLabel: linkedDocument?.file_name ?? "No linked evidence",
      evidenceStatus: linkedDocument?.review_status ?? "pending",
      submissionStatus: getSubmissionStatus(activity, submissionsByYear),
      sourceScope: linkedSource?.scope ?? null,
      sodBlockReason,
    } satisfies ApprovalQueueItem;
  });

  if (role === "data_reviewer") {
    return baseQueue.filter((item) => item.status === "pending" || item.status === "flagged");
  }

  if (role === "data_approver") {
    return baseQueue.filter((item) => item.status === "validated" || item.status === "flagged");
  }

  return baseQueue;
}

async function loadAnomalies(orgId: string, siteScopeIds: readonly string[]): Promise<AnomalyQueueItem[]> {
  const [siteResponse, sourceResponse, activityResponse, anomalyResponse] = await Promise.all([
    supabase.from("v_active_sites").select("id, site_name").eq("organization_id", orgId).order("site_name"),
    supabase
      .from("ghg_emission_source_register")
      .select("id, source_name, site_id, field_key")
      .eq("organization_id", orgId)
      .is("deleted_at", null),
    supabase
      .from("activity_data")
      .select("id, facility_id, field_key, status, risk_level, source_ref")
      .eq("organization_id", orgId),
    supabase
      .from("ghg_anomaly_flags")
      .select(
        "id, activity_data_id, field_key, anomaly_score, flagged_value, expected_range_low, expected_range_high, is_confirmed, resolution, detected_at",
      )
      .eq("organization_id", orgId)
      .order("detected_at", { ascending: false })
      .limit(120),
  ]);

  if (siteResponse.error) {
    throw siteResponse.error;
  }

  if (sourceResponse.error) {
    throw sourceResponse.error;
  }

  if (activityResponse.error) {
    throw activityResponse.error;
  }

  if (anomalyResponse.error) {
    throw anomalyResponse.error;
  }

  const sites = filterRowsByScopeId((siteResponse.data ?? []) as SiteRow[], siteScopeIds, (site) => site.id);
  const siteMap = new Map(sites.map((site) => [site.id, site.site_name]));
  const sources = filterRowsByScopeId(
    (sourceResponse.data ?? []) as SourceRow[],
    siteScopeIds,
    (source) => source.site_id,
    { includeRowsWithoutScope: true },
  );
  const sourceMap = new Map(sources.map((source) => [source.id, source]));
  const activities = filterRowsByScopeId(
    ((activityResponse.data ?? []) as ActivityRow[]).map((activity) => ({
      ...activity,
      risk_level: activity.risk_level ?? "unscored",
    })),
    siteScopeIds,
    (activity) => activity.facility_id,
    { includeRowsWithoutScope: true },
  );
  const activityMap = new Map(activities.map((activity) => [activity.id, activity]));

  return ((anomalyResponse.data ?? []) as Array<{
    id: string;
    activity_data_id: string | null;
    field_key: string;
    anomaly_score: number | string | null;
    flagged_value: number | string | null;
    expected_range_low: number | string | null;
    expected_range_high: number | string | null;
    is_confirmed: boolean;
    resolution: string | null;
    detected_at: string;
  }>)
    .map((anomaly) => {
      const relatedActivity = anomaly.activity_data_id ? activityMap.get(anomaly.activity_data_id) : undefined;

      if (!relatedActivity && siteScopeIds.length > 0) {
        return null;
      }

      const linkedSource =
        (relatedActivity?.source_ref ? sourceMap.get(relatedActivity.source_ref) : undefined) ??
        sources.find((source) => source.field_key && source.field_key === anomaly.field_key);

      return {
        id: anomaly.id,
        detectedAt: anomaly.detected_at,
        sourceName: linkedSource?.source_name ?? anomaly.field_key,
        siteName: relatedActivity?.facility_id
          ? siteMap.get(relatedActivity.facility_id) ?? "Unassigned"
          : "Unassigned",
        fieldKey: anomaly.field_key,
        anomalyScore: anomaly.anomaly_score == null ? null : Number(anomaly.anomaly_score),
        flaggedValue: anomaly.flagged_value == null ? null : Number(anomaly.flagged_value),
        expectedRangeLow: anomaly.expected_range_low == null ? null : Number(anomaly.expected_range_low),
        expectedRangeHigh: anomaly.expected_range_high == null ? null : Number(anomaly.expected_range_high),
        isConfirmed: anomaly.is_confirmed,
        resolution: anomaly.resolution,
        relatedActivityStatus: relatedActivity?.status ?? "unknown",
        relatedRiskLevel: relatedActivity?.risk_level ?? "unscored",
      } satisfies AnomalyQueueItem;
    })
    .filter((item): item is AnomalyQueueItem => item !== null);
}

async function loadFactorCoverage(orgId: string, siteScopeIds: readonly string[]) {
  const [siteResponse, sourceResponse, factorResponse] = await Promise.all([
    supabase.from("v_active_sites").select("id, site_name").eq("organization_id", orgId).order("site_name"),
    supabase
      .from("ghg_emission_source_register")
      .select("id, source_name, source_category, scope, site_id, emission_factor_id")
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("emission_factors")
      .select(
        "id, factor_code, factor_version, factor_name, activity_category, scope, activity_unit, applicable_region, kgco2e_per_unit, is_current",
      )
      .is("deleted_at", null)
      .eq("is_current", true)
      .order("factor_name"),
  ]);

  if (siteResponse.error) {
    throw siteResponse.error;
  }

  if (sourceResponse.error) {
    throw sourceResponse.error;
  }

  if (factorResponse.error) {
    throw factorResponse.error;
  }

  const sites = filterRowsByScopeId((siteResponse.data ?? []) as SiteRow[], siteScopeIds, (site) => site.id);
  const siteMap = new Map(sites.map((site) => [site.id, site.site_name]));
  const factors = (factorResponse.data ?? []) as EmissionFactorRow[];
  const factorMap = new Map(factors.map((factor) => [factor.id, factor]));
  const sources = filterRowsByScopeId(
    (sourceResponse.data ?? []) as SourceRow[],
    siteScopeIds,
    (source) => source.site_id,
    { includeRowsWithoutScope: true },
  );

  const coverage = sources.map((source) => {
    const linkedFactor = source.emission_factor_id ? factorMap.get(source.emission_factor_id) : undefined;

    return {
      id: source.id,
      sourceName: source.source_name,
      sourceCategory: source.source_category,
      scope: source.scope,
      siteName: source.site_id ? siteMap.get(source.site_id) ?? "Unassigned" : "Unassigned",
      factorName: linkedFactor?.factor_name ?? null,
      factorCode: linkedFactor?.factor_code ?? null,
      factorVersion: linkedFactor?.factor_version ?? null,
      factorUnit: linkedFactor?.activity_unit ?? null,
      factorRegion: linkedFactor?.applicable_region ?? null,
      coverageStatus: linkedFactor ? "linked" : "missing",
    } satisfies FactorCoverageItem;
  });

  return { coverage, factors };
}

export function useAccountingApprovalsData(): AccountingApprovalsState {
  const { primaryOrgId, siteScopeIds, user, roles, isLoading: authLoading } = useAuth();
  const [queueItems, setQueueItems] = useState<ApprovalQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const currentRole = getRole(roles[0] ?? (user ? getUserPrimaryRole(user) : null));
  const orgId = primaryOrgId ?? "";
  const scopeKey = siteScopeIds.join("|");

  async function refresh() {
    if (!orgId) {
      setQueueItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextItems = await loadApprovalQueue(orgId, siteScopeIds, user?.id ?? null, currentRole);
      setQueueItems(nextItems);
    } catch (loadError) {
      console.error("Failed to load accounting approval queue:", loadError);
      setQueueItems([]);
      setError("The approval queue could not be loaded from the live schema.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void refresh();
  }, [authLoading, orgId, scopeKey, user?.id, currentRole]);

  async function updateActivityStatus(item: ApprovalQueueItem, nextStatus: string) {
    if (!orgId || !user?.id) {
      return;
    }

    if (!canTransitionActivity(currentRole, item, nextStatus, user.id)) {
      setError("That state transition is blocked by the current role or SoD rules.");
      return;
    }

    setSavingId(item.id);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("activity_data")
        .update({ status: nextStatus })
        .eq("organization_id", orgId)
        .eq("id", item.id);

      if (updateError) {
        throw updateError;
      }

      await refresh();
    } catch (updateFailure) {
      console.error("Failed to update activity status:", updateFailure);
      setError("The activity status could not be updated. Check permissions and try again.");
    } finally {
      setSavingId(null);
    }
  }

  return {
    loading,
    error,
    role: currentRole,
    queueItems,
    queueLabel: getQueueRoleLabel(currentRole),
    pendingCount: queueItems.filter((item) => item.status === "pending").length,
    flaggedCount: queueItems.filter((item) => item.status === "flagged").length,
    blockedCount: queueItems.filter((item) => item.sodBlockReason != null).length,
    savingId,
    updateActivityStatus,
  };
}

export function useAccountingAnomaliesData(): AccountingAnomaliesState {
  const { primaryOrgId, siteScopeIds, isLoading: authLoading } = useAuth();
  const [anomalies, setAnomalies] = useState<AnomalyQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orgId = primaryOrgId ?? "";
  const scopeKey = siteScopeIds.join("|");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!orgId) {
      setAnomalies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    loadAnomalies(orgId, siteScopeIds)
      .then((nextAnomalies) => {
        setAnomalies(nextAnomalies);
      })
      .catch((loadError) => {
        console.error("Failed to load anomalies:", loadError);
        setAnomalies([]);
        setError("The anomaly queue could not be loaded from the live schema.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authLoading, orgId, scopeKey]);

  return {
    loading,
    error,
    anomalies,
    unresolvedCount: anomalies.filter((item) => !item.isConfirmed).length,
    confirmedCount: anomalies.filter((item) => item.isConfirmed).length,
    criticalCount: anomalies.filter((item) => (item.anomalyScore ?? 0) >= 0.9).length,
  };
}

export function useEmissionFactorCoverageData(): EmissionFactorCoverageState {
  const { primaryOrgId, siteScopeIds, isLoading: authLoading } = useAuth();
  const [factors, setFactors] = useState<FactorCoverageItem[]>([]);
  const [factorLibrary, setFactorLibrary] = useState<EmissionFactorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orgId = primaryOrgId ?? "";
  const scopeKey = siteScopeIds.join("|");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!orgId) {
      setFactors([]);
      setFactorLibrary([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    loadFactorCoverage(orgId, siteScopeIds)
      .then(({ coverage, factors: liveLibrary }) => {
        setFactors(coverage);
        setFactorLibrary(liveLibrary);
      })
      .catch((loadError) => {
        console.error("Failed to load emission factor coverage:", loadError);
        setFactors([]);
        setFactorLibrary([]);
        setError("The factor library could not be loaded from the live schema.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authLoading, orgId, scopeKey]);

  return {
    loading,
    error,
    factors,
    factorLibrary,
    linkedSources: factors.filter((factor) => factor.coverageStatus === "linked").length,
    missingSources: factors.filter((factor) => factor.coverageStatus === "missing").length,
  };
}
