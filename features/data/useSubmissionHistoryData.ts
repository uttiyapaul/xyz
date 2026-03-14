"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { filterRowsByScopeId } from "@/lib/auth/sessionScope";
import { supabase } from "@/lib/supabase/client";

interface SiteRow {
  id: string;
  site_name: string;
}

interface ActivityRow {
  id: string;
  facility_id: string | null;
  activity_type: string;
  quantity: number | string;
  unit: string;
  reporting_period: string;
  status: string;
  fy_year: string | null;
  field_key: string | null;
  created_by: string;
}

interface DocumentRow {
  id: string;
  site_id: string | null;
  file_name: string;
  document_type: string;
  review_status: string | null;
  verifier_review_comment: string | null;
  uploaded_at: string;
  uploaded_by: string;
}

export interface PersonalActivityItem {
  id: string;
  reportingPeriod: string;
  siteName: string;
  activityType: string;
  quantityLabel: string;
  status: string;
  fyYear: string | null;
}

export interface PersonalDocumentItem {
  id: string;
  uploadedAt: string;
  siteName: string;
  fileName: string;
  documentType: string;
  reviewStatus: string;
  verifierComment: string | null;
}

export interface SubmissionHistoryState {
  loading: boolean;
  error: string | null;
  activities: PersonalActivityItem[];
  documents: PersonalDocumentItem[];
  openItems: number;
  acceptedItems: number;
}

export function useSubmissionHistoryData(): SubmissionHistoryState {
  const { primaryOrgId, siteScopeIds, user, isLoading: authLoading } = useAuth();
  const [activities, setActivities] = useState<PersonalActivityItem[]>([]);
  const [documents, setDocuments] = useState<PersonalDocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orgId = primaryOrgId ?? "";
  const scopeKey = siteScopeIds.join("|");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!orgId || !user?.id) {
      setActivities([]);
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      supabase.from("v_active_sites").select("id, site_name").eq("organization_id", orgId).order("site_name"),
      supabase
        .from("activity_data")
        .select("id, facility_id, activity_type, quantity, unit, reporting_period, status, fy_year, field_key, created_by")
        .eq("organization_id", orgId)
        .eq("created_by", user.id)
        .order("reporting_period", { ascending: false })
        .limit(160),
      supabase
        .from("ghg_documents")
        .select("id, site_id, file_name, document_type, review_status, verifier_review_comment, uploaded_at, uploaded_by")
        .eq("organization_id", orgId)
        .eq("uploaded_by", user.id)
        .order("uploaded_at", { ascending: false })
        .limit(160),
    ])
      .then(([siteResponse, activityResponse, documentResponse]) => {
        if (siteResponse.error) {
          throw siteResponse.error;
        }

        if (activityResponse.error) {
          throw activityResponse.error;
        }

        if (documentResponse.error) {
          throw documentResponse.error;
        }

        const sites = filterRowsByScopeId((siteResponse.data ?? []) as SiteRow[], siteScopeIds, (site) => site.id);
        const siteMap = new Map(sites.map((site) => [site.id, site.site_name]));
        const activityRows = filterRowsByScopeId(
          (activityResponse.data ?? []) as ActivityRow[],
          siteScopeIds,
          (activity) => activity.facility_id,
          { includeRowsWithoutScope: true },
        );
        const documentRows = filterRowsByScopeId(
          (documentResponse.data ?? []) as DocumentRow[],
          siteScopeIds,
          (document) => document.site_id,
          { includeRowsWithoutScope: true },
        );

        setActivities(
          activityRows.map((activity) => ({
            id: activity.id,
            reportingPeriod: activity.reporting_period,
            siteName: activity.facility_id ? siteMap.get(activity.facility_id) ?? "Unassigned" : "Unassigned",
            activityType: activity.activity_type.replace(/_/g, " "),
            quantityLabel: `${Number(activity.quantity).toLocaleString("en-IN")} ${activity.unit}`,
            status: activity.status,
            fyYear: activity.fy_year,
          })),
        );
        setDocuments(
          documentRows.map((document) => ({
            id: document.id,
            uploadedAt: document.uploaded_at,
            siteName: document.site_id ? siteMap.get(document.site_id) ?? "Unassigned" : "Unassigned",
            fileName: document.file_name,
            documentType: document.document_type,
            reviewStatus: document.review_status ?? "pending",
            verifierComment: document.verifier_review_comment,
          })),
        );
      })
      .catch((loadError) => {
        console.error("Failed to load personal submission history:", loadError);
        setActivities([]);
        setDocuments([]);
        setError("Your submission history could not be loaded from the live schema.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authLoading, orgId, scopeKey, user?.id]);

  const openItems =
    activities.filter((activity) => activity.status !== "accepted").length +
    documents.filter((document) => document.reviewStatus !== "accepted").length;
  const acceptedItems =
    activities.filter((activity) => activity.status === "accepted").length +
    documents.filter((document) => document.reviewStatus === "accepted").length;

  return {
    loading,
    error,
    activities,
    documents,
    openItems,
    acceptedItems,
  };
}
