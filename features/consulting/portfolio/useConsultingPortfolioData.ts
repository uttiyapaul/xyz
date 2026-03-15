"use client";

import { useEffect, useEffectEvent, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

interface ConsultantProfileRow {
  id: string;
  full_name: string;
  email: string;
  designation: string | null;
  qualification: string | null;
  is_active: boolean;
}

interface ClientOrganizationRow {
  id: string;
  legal_name: string;
  trade_name: string | null;
  country: string | null;
  industry_segment_id: string | null;
  reporting_currency: string | null;
  brsr_required: boolean | null;
  brsr_core_required: boolean | null;
  erp_sync_enabled: boolean | null;
  is_active: boolean | null;
  onboarded_at: string | null;
}

interface SiteRow {
  id: string;
  organization_id: string;
}

interface ScenarioRow {
  organization_id: string;
  status: string;
  is_approved_for_display: boolean | null;
  ai_confidence_score: number | null;
}

interface TargetRow {
  organization_id: string;
  is_on_track: boolean | null;
}

export interface ConsultingPortfolioClient {
  id: string;
  name: string;
  country: string;
  industrySegment: string;
  reportingCurrency: string;
  siteCount: number;
  scenarioCount: number;
  approvedScenarioCount: number;
  avgConfidencePct: number | null;
  onTrackTargets: number;
  brsrRequired: boolean;
  brsrCoreRequired: boolean;
  erpSyncEnabled: boolean;
  isActive: boolean;
  onboardedAt: string | null;
}

export interface ConsultingPortfolioState {
  loading: boolean;
  error: string | null;
  consultantProfile: ConsultantProfileRow | null;
  clients: ConsultingPortfolioClient[];
}

function normalizePercent(value: number | null): number | null {
  if (value == null) {
    return null;
  }

  return value <= 1 ? value * 100 : value;
}

/**
 * Consultant portfolio data pulls only the current session's authorized client
 * organizations. That keeps advisory users inside their granted org scope while
 * still showing cross-client posture in one view.
 */
export function useConsultingPortfolioData(): ConsultingPortfolioState {
  const { user, orgIds, primaryOrgId, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<ConsultingPortfolioState>({
    loading: true,
    error: null,
    consultantProfile: null,
    clients: [],
  });

  async function loadPortfolio() {
    if (!user?.id) {
      setState({
        loading: false,
        error: null,
        consultantProfile: null,
        clients: [],
      });
      return;
    }

    const consultantResponse = await supabase
      .from("consultants")
      .select("id, full_name, email, designation, qualification, is_active")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (consultantResponse.error) {
      setState({
        loading: false,
        error: "Consultant portfolio could not be loaded right now.",
        consultantProfile: null,
        clients: [],
      });
      return;
    }

    const consultantProfile = (consultantResponse.data ?? null) as ConsultantProfileRow | null;
    const scopedOrgIds = orgIds.length > 0 ? orgIds : primaryOrgId ? [primaryOrgId] : [];

    let organizationsResponse;

    if (scopedOrgIds.length > 0) {
      organizationsResponse = await supabase
        .from("client_organizations")
        .select(
          "id, legal_name, trade_name, country, industry_segment_id, reporting_currency, brsr_required, brsr_core_required, erp_sync_enabled, is_active, onboarded_at",
        )
        .in("id", scopedOrgIds)
        .eq("is_active", true)
        .order("legal_name");
    } else if (consultantProfile?.id) {
      organizationsResponse = await supabase
        .from("client_organizations")
        .select(
          "id, legal_name, trade_name, country, industry_segment_id, reporting_currency, brsr_required, brsr_core_required, erp_sync_enabled, is_active, onboarded_at",
        )
        .eq("assigned_consultant_id", consultantProfile.id)
        .eq("is_active", true)
        .order("legal_name");
    } else {
      setState({
        loading: false,
        error: null,
        consultantProfile,
        clients: [],
      });
      return;
    }

    if (organizationsResponse.error) {
      setState({
        loading: false,
        error: "Assigned client organizations could not be loaded right now.",
        consultantProfile,
        clients: [],
      });
      return;
    }

    const organizations = (organizationsResponse.data ?? []) as ClientOrganizationRow[];

    if (organizations.length === 0) {
      setState({
        loading: false,
        error: null,
        consultantProfile,
        clients: [],
      });
      return;
    }

    const organizationIds = organizations.map((organization) => organization.id);
    const [sitesResponse, scenariosResponse, targetsResponse] = await Promise.all([
      supabase
        .from("v_active_sites")
        .select("id, organization_id")
        .in("organization_id", organizationIds),
      supabase
        .from("ghg_scenarios")
        .select("organization_id, status, is_approved_for_display, ai_confidence_score")
        .in("organization_id", organizationIds),
      supabase
        .from("mv_targets_progress")
        .select("organization_id, is_on_track")
        .in("organization_id", organizationIds),
    ]);

    if (sitesResponse.error || scenariosResponse.error || targetsResponse.error) {
      setState({
        loading: false,
        error: "Supporting portfolio insights could not be loaded from the live schema.",
        consultantProfile,
        clients: [],
      });
      return;
    }

    const sites = (sitesResponse.data ?? []) as SiteRow[];
    const scenarios = (scenariosResponse.data ?? []) as ScenarioRow[];
    const targets = (targetsResponse.data ?? []) as TargetRow[];

    const clients: ConsultingPortfolioClient[] = organizations.map((organization) => {
      const siteCount = sites.filter((site) => site.organization_id === organization.id).length;
      const organizationScenarios = scenarios.filter((scenario) => scenario.organization_id === organization.id);
      const confidenceRows = organizationScenarios
        .map((scenario) => normalizePercent(scenario.ai_confidence_score))
        .filter((score): score is number => score != null);

      return {
        id: organization.id,
        name: organization.trade_name?.trim() || organization.legal_name,
        country: organization.country ?? "Unspecified",
        industrySegment: organization.industry_segment_id ?? "Unspecified",
        reportingCurrency: organization.reporting_currency ?? "INR",
        siteCount,
        scenarioCount: organizationScenarios.length,
        approvedScenarioCount: organizationScenarios.filter((scenario) => scenario.is_approved_for_display).length,
        avgConfidencePct:
          confidenceRows.length > 0
            ? confidenceRows.reduce((sum, score) => sum + score, 0) / confidenceRows.length
            : null,
        onTrackTargets: targets.filter((target) => target.organization_id === organization.id && target.is_on_track).length,
        brsrRequired: Boolean(organization.brsr_required),
        brsrCoreRequired: Boolean(organization.brsr_core_required),
        erpSyncEnabled: Boolean(organization.erp_sync_enabled),
        isActive: Boolean(organization.is_active),
        onboardedAt: organization.onboarded_at,
      };
    });

    setState({
      loading: false,
      error: null,
      consultantProfile,
      clients,
    });
  }

  const schedulePortfolioLoad = useEffectEvent(() => {
    void loadPortfolio();
  });

  useEffect(() => {
    if (!authLoading) {
      setState((current) => ({ ...current, loading: true }));
      queueMicrotask(schedulePortfolioLoad);
    }
  }, [authLoading, user?.id, primaryOrgId, orgIds.join("|")]);

  return state;
}
