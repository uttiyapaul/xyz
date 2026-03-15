"use client";

import { useEffect, useEffectEvent, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

interface OrganizationRow {
  id: string;
  legal_name: string;
  trade_name: string | null;
}

interface ScenarioRow {
  id: string;
  organization_id: string;
  scenario_name: string;
  description: string | null;
  type: string | null;
  status: string;
  is_reportable: boolean | null;
  is_approved_for_display: boolean | null;
  display_approved_at: string | null;
  base_fy_year: string | null;
  projection_years: number | null;
  assumptions_json: unknown;
  output_json: unknown;
  data_source_database: string | null;
  ai_confidence_score: number | null;
  run_duration_ms: number | null;
  error_message: string | null;
  updated_at: string;
}

export interface ScenarioWorkspaceItem {
  id: string;
  organizationId: string;
  organizationName: string;
  scenarioName: string;
  description: string | null;
  type: string;
  status: string;
  isReportable: boolean;
  isApprovedForDisplay: boolean;
  displayApprovedAt: string | null;
  baseFyYear: string | null;
  projectionYears: number | null;
  assumptionCount: number;
  outputCount: number;
  dataSource: string;
  aiConfidenceScore: number | null;
  runDurationMs: number | null;
  errorMessage: string | null;
  updatedAt: string;
}

export interface ConsultingScenarioState {
  loading: boolean;
  error: string | null;
  scenarios: ScenarioWorkspaceItem[];
}

function countJsonEntries(value: unknown): number {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).length;
  }

  return 0;
}

/**
 * Scenario workspace data stays read-first because the live platform already
 * has a scenario source of truth in `ghg_scenarios`. The frontend can still
 * make the AI and reportability posture visible before write flows are added.
 */
export function useConsultingScenarioData(): ConsultingScenarioState {
  const { orgIds, primaryOrgId, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<ConsultingScenarioState>({
    loading: true,
    error: null,
    scenarios: [],
  });

  async function loadScenarios() {
    const scopedOrgIds = orgIds.length > 0 ? orgIds : primaryOrgId ? [primaryOrgId] : [];

    if (scopedOrgIds.length === 0) {
      setState({
        loading: false,
        error: null,
        scenarios: [],
      });
      return;
    }

    const [organizationsResponse, scenariosResponse] = await Promise.all([
      supabase
        .from("client_organizations")
        .select("id, legal_name, trade_name")
        .in("id", scopedOrgIds),
      supabase
        .from("ghg_scenarios")
        .select(
          "id, organization_id, scenario_name, description, type, status, is_reportable, is_approved_for_display, display_approved_at, base_fy_year, projection_years, assumptions_json, output_json, data_source_database, ai_confidence_score, run_duration_ms, error_message, updated_at",
        )
        .in("organization_id", scopedOrgIds)
        .order("updated_at", { ascending: false }),
    ]);

    if (organizationsResponse.error || scenariosResponse.error) {
      setState({
        loading: false,
        error: "Scenario rows could not be loaded from the live modeling view.",
        scenarios: [],
      });
      return;
    }

    const organizationMap = new Map(
      ((organizationsResponse.data ?? []) as OrganizationRow[]).map((organization) => [
        organization.id,
        organization.trade_name?.trim() || organization.legal_name,
      ]),
    );
    const scenarios = ((scenariosResponse.data ?? []) as ScenarioRow[]).map((scenario) => ({
      id: scenario.id,
      organizationId: scenario.organization_id,
      organizationName: organizationMap.get(scenario.organization_id) ?? "Unknown organization",
      scenarioName: scenario.scenario_name,
      description: scenario.description,
      type: scenario.type ?? "unspecified",
      status: scenario.status,
      isReportable: Boolean(scenario.is_reportable),
      isApprovedForDisplay: Boolean(scenario.is_approved_for_display),
      displayApprovedAt: scenario.display_approved_at,
      baseFyYear: scenario.base_fy_year,
      projectionYears: scenario.projection_years,
      assumptionCount: countJsonEntries(scenario.assumptions_json),
      outputCount: countJsonEntries(scenario.output_json),
      dataSource: scenario.data_source_database ?? "synthetic",
      aiConfidenceScore: scenario.ai_confidence_score,
      runDurationMs: scenario.run_duration_ms,
      errorMessage: scenario.error_message,
      updatedAt: scenario.updated_at,
    }));

    setState({
      loading: false,
      error: null,
      scenarios,
    });
  }

  const scheduleScenarioLoad = useEffectEvent(() => {
    void loadScenarios();
  });

  useEffect(() => {
    if (!authLoading) {
      setState((current) => ({ ...current, loading: true }));
      queueMicrotask(scheduleScenarioLoad);
    }
  }, [authLoading, primaryOrgId, orgIds.join("|")]);

  return state;
}
