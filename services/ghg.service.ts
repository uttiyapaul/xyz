/**
 * CarbonIQ Platform — services/ghg.service.ts
 * GHG data microservice client.
 * Extends BaseService — inherits circuit breaker, retry, CSRF, auth.
 */

import { BaseService } from "./base.service";
import type {
  GhgReading,
  GhgReadingCreate,
  EmissionFactor,
  DashboardMetrics,
  GhgScope,
} from "../types/ghg.types";
import type { ApiResponse, PaginationParams, DateRangeParams } from "../types/api.types";

// Service singleton
let _instance: GhgService | null = null;

export class GhgService extends BaseService {
  constructor() {
    super(
      {
        base_url:    "",           // Relative — same Next.js origin
        timeout_ms:  15_000,
        retry_count: 2,
        api_version: "v1",
      },
      "GhgService"
    );
  }

  static getInstance(): GhgService {
    if (!_instance) _instance = new GhgService();
    return _instance;
  }

  // ── Readings ────────────────────────────────────────────────────────────

  async getReadings(
    orgId:  string,
    params: PaginationParams & DateRangeParams & { scope?: GhgScope } = {}
  ): Promise<ApiResponse<GhgReading[]>> {
    const q = new URLSearchParams({ org_id: orgId });
    if (params.page)       q.set("page",      String(params.page));
    if (params.page_size)  q.set("page_size", String(params.page_size));
    if (params.from)       q.set("from",      params.from);
    if (params.to)         q.set("to",        params.to);
    if (params.scope)      q.set("scope",     String(params.scope));
    return this.get(`/ghg/readings?${q.toString()}`);
  }

  async getReading(id: string): Promise<ApiResponse<GhgReading>> {
    return this.get(`/ghg/readings/${id}`);
  }

  async createReading(data: GhgReadingCreate): Promise<ApiResponse<GhgReading>> {
    return this.post("/ghg/readings", data);
  }

  async updateReading(id: string, data: Partial<GhgReading>): Promise<ApiResponse<GhgReading>> {
    return this.patch(`/ghg/readings/${id}`, data);
  }

  async deleteReading(id: string): Promise<ApiResponse<void>> {
    return this.delete(`/ghg/readings/${id}`);
  }

  // ── Dashboard ────────────────────────────────────────────────────────────

  async getDashboardMetrics(orgId: string): Promise<ApiResponse<DashboardMetrics>> {
    return this.get(`/ghg/metrics?org_id=${orgId}`);
  }

  // ── Emission Factors ─────────────────────────────────────────────────────

  async getEmissionFactors(filters: {
    scope?:    GhgScope;
    region?:   string;
    category?: string;
    current?:  boolean;
  } = {}): Promise<ApiResponse<EmissionFactor[]>> {
    const q = new URLSearchParams();
    if (filters.scope)    q.set("scope",    String(filters.scope));
    if (filters.region)   q.set("region",   filters.region);
    if (filters.category) q.set("category", filters.category);
    if (filters.current != null) q.set("current", String(filters.current));
    return this.get(`/ghg/factors?${q.toString()}`);
  }

  async getEmissionFactorByCode(code: string): Promise<ApiResponse<EmissionFactor>> {
    return this.get(`/ghg/factors/${code}`);
  }
}

// Export singleton for use in components / thunks
export const ghgService = GhgService.getInstance();
