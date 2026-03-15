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
  document_type: string | null;
  review_status: string | null;
  extraction_status: string | null;
  uploaded_at: string | null;
  field_keys_justified: string[] | null;
}

interface ReadingRow {
  id: string;
  site_id: string | null;
  reporting_period: string | null;
  status: string | null;
  human_reviewed: boolean | null;
  is_ai_generated: boolean | null;
  trust_score: number | null;
  anomaly_flag: boolean | null;
  updated_at: string | null;
}

interface ValidationSummaryRow {
  table_name: string;
  validation_status: string;
  risk_level: string | null;
  record_count: number;
  avg_trust: number | null;
  flagged_count: number | null;
}

export interface AIExtractionEvidenceItem {
  id: string;
  siteName: string;
  fileName: string;
  documentType: string;
  reviewStatus: string;
  extractionStatus: string;
  uploadedAt: string | null;
  justifiedFieldCount: number;
}

export interface AIExtractionReadingItem {
  id: string;
  siteName: string;
  reportingPeriod: string | null;
  status: string;
  humanReviewed: boolean;
  isAiGenerated: boolean;
  trustScore: number | null;
  anomalyFlag: boolean;
  updatedAt: string | null;
}

export interface AIValidationSummaryItem {
  tableName: string;
  validationStatus: string;
  riskLevel: string | null;
  recordCount: number;
  avgTrust: number | null;
  flaggedCount: number;
}

export interface AIExtractionWorkspaceState {
  loading: boolean;
  error: string | null;
  evidence: AIExtractionEvidenceItem[];
  readings: AIExtractionReadingItem[];
  validationSummary: AIValidationSummaryItem[];
}

/**
 * Live AI extraction workspace data.
 *
 * The workbench intentionally stays inside the current checked-in schema: it
 * uses document extraction posture, AI-generated reading review state, and the
 * AI validation summary view instead of inventing a future ingestion model.
 */
export function useAIExtractionWorkspaceData(): AIExtractionWorkspaceState {
  const { primaryOrgId, siteScopeIds, isLoading: authLoading } = useAuth();
  const siteScopeKey = siteScopeIds.join("|");
  const [state, setState] = useState<AIExtractionWorkspaceState>({
    loading: true,
    error: null,
    evidence: [],
    readings: [],
    validationSummary: [],
  });

  async function loadWorkspace() {
    setState((current) => ({ ...current, loading: true, error: null }));

    if (!primaryOrgId) {
      setState({
        loading: false,
        error: null,
        evidence: [],
        readings: [],
        validationSummary: [],
      });
      return;
    }

    const [sitesResponse, documentsResponse, readingsResponse, validationResponse] = await Promise.all([
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
        .from("ghg_monthly_readings")
        .select("id, site_id, reporting_period, status, human_reviewed, is_ai_generated, trust_score, anomaly_flag, updated_at")
        .eq("organization_id", primaryOrgId)
        .order("updated_at", { ascending: false })
        .limit(120),
      supabase
        .from("mv_ai_validation_summary")
        .select("table_name, validation_status, risk_level, record_count, avg_trust, flagged_count")
        .eq("organization_id", primaryOrgId)
        .order("record_count", { ascending: false })
        .limit(20),
    ]);

    if (
      sitesResponse.error ||
      documentsResponse.error ||
      readingsResponse.error ||
      validationResponse.error
    ) {
      setState({
        loading: false,
        error: "The AI extraction workspace could not load its current document, review, and validation posture.",
        evidence: [],
        readings: [],
        validationSummary: [],
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
    const readingRows = filterRowsByScopeId(
      (readingsResponse.data ?? []) as ReadingRow[],
      siteScopeIds,
      (reading) => reading.site_id,
      { includeRowsWithoutScope: true },
    );

    setState({
      loading: false,
      error: null,
      evidence: evidenceRows.map((document) => ({
        id: document.id,
        siteName: document.site_id ? siteMap.get(document.site_id) ?? "Unassigned" : "Unassigned",
        fileName: document.file_name,
        documentType: document.document_type ?? "unspecified",
        reviewStatus: document.review_status ?? "pending",
        extractionStatus: document.extraction_status ?? "pending",
        uploadedAt: document.uploaded_at,
        justifiedFieldCount: document.field_keys_justified?.length ?? 0,
      })),
      readings: readingRows.map((reading) => ({
        id: reading.id,
        siteName: reading.site_id ? siteMap.get(reading.site_id) ?? "Unassigned" : "Unassigned",
        reportingPeriod: reading.reporting_period,
        status: reading.status ?? "pending",
        humanReviewed: Boolean(reading.human_reviewed),
        isAiGenerated: Boolean(reading.is_ai_generated),
        trustScore: reading.trust_score,
        anomalyFlag: Boolean(reading.anomaly_flag),
        updatedAt: reading.updated_at,
      })),
      validationSummary: ((validationResponse.data ?? []) as ValidationSummaryRow[]).map((row) => ({
        tableName: row.table_name,
        validationStatus: row.validation_status,
        riskLevel: row.risk_level,
        recordCount: row.record_count,
        avgTrust: row.avg_trust,
        flaggedCount: Number(row.flagged_count ?? 0),
      })),
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
