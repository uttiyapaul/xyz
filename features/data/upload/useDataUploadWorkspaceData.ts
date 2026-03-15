"use client";

import { useEffect, useEffectEvent, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { filterRowsByScopeId } from "@/lib/auth/sessionScope";
import { supabase } from "@/lib/supabase/client";

interface SiteRow {
  id: string;
  site_name: string;
}

interface DocumentRow {
  id: string;
  site_id: string | null;
  file_name: string;
  document_type: string;
  review_status: string | null;
  extraction_status: string | null;
  uploaded_at: string;
  field_keys_justified: string[] | null;
}

interface Scope3Row {
  id: string;
  scope3_category_id: number;
  reporting_period_start: string;
  reporting_period_end: string;
  fy_year: string | null;
  method_used: string;
  client_attributed_tco2e: number;
  status: string;
  verification_status: string | null;
  data_quality_score: number | null;
  needs_client_mapping: boolean | null;
}

interface DisclosureRow {
  id: string;
  framework_id: string;
  fy_year: string;
  status: string;
  data_source: string | null;
  is_assured: boolean | null;
  assurance_level: string | null;
  submitted_at: string | null;
}

export interface DataUploadEvidenceItem {
  id: string;
  siteName: string;
  fileName: string;
  documentType: string;
  reviewStatus: string;
  extractionStatus: string;
  uploadedAt: string;
  justifiedFieldCount: number;
}

export interface DataUploadSiteOption {
  id: string;
  siteName: string;
}

export interface DataUploadScope3Item {
  id: string;
  scope3CategoryId: number;
  reportingWindow: string;
  fyYear: string | null;
  methodUsed: string;
  tco2e: number;
  status: string;
  verificationStatus: string;
  dataQualityScore: number | null;
  needsClientMapping: boolean;
}

export interface DataUploadDisclosureItem {
  id: string;
  frameworkId: string;
  fyYear: string;
  status: string;
  dataSource: string;
  isAssured: boolean;
  assuranceLevel: string | null;
  submittedAt: string | null;
}

export interface DataUploadWorkspaceState {
  loading: boolean;
  error: string | null;
  sites: DataUploadSiteOption[];
  evidence: DataUploadEvidenceItem[];
  scope3Submissions: DataUploadScope3Item[];
  disclosures: DataUploadDisclosureItem[];
  reload: () => void;
}

/**
 * Data upload workspace data reads the current evidence, scope 3, and
 * disclosure queues so the frontend can support a real intake board even before
 * the final file-storage/write flows are wired.
 */
export function useDataUploadWorkspaceData(): DataUploadWorkspaceState {
  const { primaryOrgId, siteScopeIds, isLoading: authLoading } = useAuth();
  const siteScopeKey = siteScopeIds.join("|");
  const [state, setState] = useState<DataUploadWorkspaceState>({
    loading: true,
    error: null,
    sites: [],
    evidence: [],
    scope3Submissions: [],
    disclosures: [],
    reload: () => undefined,
  });

  async function loadWorkspace() {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
      reload: scheduleWorkspaceLoad,
    }));

    if (!primaryOrgId) {
      setState({
        loading: false,
        error: null,
        sites: [],
        evidence: [],
        scope3Submissions: [],
        disclosures: [],
        reload: scheduleWorkspaceLoad,
      });
      return;
    }

    const [sitesResponse, documentsResponse, scope3Response, disclosuresResponse] = await Promise.all([
      supabase
        .from("v_active_sites")
        .select("id, site_name")
        .eq("organization_id", primaryOrgId)
        .order("site_name"),
      supabase
        .from("ghg_documents")
        .select("id, site_id, file_name, document_type, review_status, extraction_status, uploaded_at, field_keys_justified")
        .eq("organization_id", primaryOrgId)
        .order("uploaded_at", { ascending: false })
        .limit(80),
      supabase
        .from("scope3_submissions")
        .select(
          "id, scope3_category_id, reporting_period_start, reporting_period_end, fy_year, method_used, client_attributed_tco2e, status, verification_status, data_quality_score, needs_client_mapping",
        )
        .eq("client_org_id", primaryOrgId)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(40),
      supabase
        .from("framework_disclosures")
        .select("id, framework_id, fy_year, status, data_source, is_assured, assurance_level, submitted_at")
        .eq("organization_id", primaryOrgId)
        .order("updated_at", { ascending: false })
        .limit(40),
    ]);

    if (sitesResponse.error || documentsResponse.error || scope3Response.error || disclosuresResponse.error) {
      setState({
        loading: false,
        error: "The upload workspace could not load its current evidence and disclosure queues.",
        sites: [],
        evidence: [],
        scope3Submissions: [],
        disclosures: [],
        reload: scheduleWorkspaceLoad,
      });
      return;
    }

    const sites = filterRowsByScopeId((sitesResponse.data ?? []) as SiteRow[], siteScopeIds, (site) => site.id);
    const siteMap = new Map(sites.map((site) => [site.id, site.site_name]));
    const evidenceRows = filterRowsByScopeId(
      (documentsResponse.data ?? []) as DocumentRow[],
      siteScopeIds,
      (document) => document.site_id,
      { includeRowsWithoutScope: true },
    );

    setState({
      loading: false,
      error: null,
      sites: sites.map((site) => ({
        id: site.id,
        siteName: site.site_name,
      })),
      evidence: evidenceRows.map((document) => ({
        id: document.id,
        siteName: document.site_id ? siteMap.get(document.site_id) ?? "Unassigned" : "Unassigned",
        fileName: document.file_name,
        documentType: document.document_type,
        reviewStatus: document.review_status ?? "pending",
        extractionStatus: document.extraction_status ?? "pending",
        uploadedAt: document.uploaded_at,
        justifiedFieldCount: document.field_keys_justified?.length ?? 0,
      })),
      scope3Submissions: ((scope3Response.data ?? []) as Scope3Row[]).map((submission) => ({
        id: submission.id,
        scope3CategoryId: submission.scope3_category_id,
        reportingWindow: `${submission.reporting_period_start} to ${submission.reporting_period_end}`,
        fyYear: submission.fy_year,
        methodUsed: submission.method_used,
        tco2e: Number(submission.client_attributed_tco2e),
        status: submission.status,
        verificationStatus: submission.verification_status ?? "unverified",
        dataQualityScore: submission.data_quality_score,
        needsClientMapping: Boolean(submission.needs_client_mapping),
      })),
      disclosures: ((disclosuresResponse.data ?? []) as DisclosureRow[]).map((disclosure) => ({
        id: disclosure.id,
        frameworkId: disclosure.framework_id,
        fyYear: disclosure.fy_year,
        status: disclosure.status,
        dataSource: disclosure.data_source ?? "unspecified",
        isAssured: Boolean(disclosure.is_assured),
        assuranceLevel: disclosure.assurance_level,
        submittedAt: disclosure.submitted_at,
      })),
      reload: scheduleWorkspaceLoad,
    });
  }

  const scheduleWorkspaceLoad = useEffectEvent(() => {
    void loadWorkspace();
  });

  useEffect(() => {
    if (!authLoading) {
      queueMicrotask(scheduleWorkspaceLoad);
    }
  }, [authLoading, primaryOrgId, siteScopeKey]);

  return state;
}
