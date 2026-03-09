/**
 * CarbonIQ Platform — store/api/ghg.api.ts
 *
 * RTK Query API slice — microservice-ready BFF (Backend for Frontend) layer.
 * All data fetching goes through this single API definition.
 * Features: automatic caching, tag-based invalidation, optimistic updates.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";
import type { GhgReading, EmissionFactor, DashboardMetrics, GwpFactor } from "../../types/ghg.types";
import type { ApiResponse, PaginationParams } from "../../types/api.types";

// ---------------------------------------------------------------------------
// Base query with CSRF + Auth headers
// ---------------------------------------------------------------------------
const baseQuery = fetchBaseQuery({
  baseUrl: "/api/v1",

  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;

    // CSRF double-submit cookie
    const csrfToken = state.auth?.csrfToken ??
      (typeof document !== "undefined"
        ? document.cookie
            .split("; ")
            .find((c) => c.startsWith("__csrf_token="))
            ?.split("=")[1]
        : null);

    if (csrfToken) headers.set("x-csrf-token", csrfToken);

    // Content type
    headers.set("Content-Type",     "application/json");
    headers.set("Accept",           "application/json");
    headers.set("X-Client-Version", process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0");

    return headers;
  },

  // Banking-level: credentials included for session cookies
  credentials: "same-origin",
});

// ---------------------------------------------------------------------------
// GHG API
// ---------------------------------------------------------------------------
export const ghgApi = createApi({
  reducerPath: "ghgApi",
  baseQuery,
  tagTypes: [
    "GhgReading",
    "EmissionFactor",
    "DashboardMetrics",
    "AiValidation",
    "GwpFactor",
    "Organization",
    "Site",
  ],

  endpoints: (builder) => ({

    // ── Dashboard Metrics ──
    getDashboardMetrics: builder.query<DashboardMetrics, string>({
      query: (orgId) => `/ghg/metrics?org_id=${orgId}`,
      transformResponse: (r: ApiResponse<DashboardMetrics>) => r.data!,
      providesTags:      ["DashboardMetrics"],
      keepUnusedDataFor: 30,   // 30 seconds — metrics change frequently
    }),

    // ── Readings ──
    getReadings: builder.query<GhgReading[], { orgId: string } & PaginationParams>({
      query:             ({ orgId, page = 1, page_size = 50 }) =>
        `/ghg/readings?org_id=${orgId}&page=${page}&page_size=${page_size}`,
      transformResponse: (r: ApiResponse<GhgReading[]>) => r.data ?? [],
      providesTags:      (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "GhgReading" as const, id })),
              { type: "GhgReading", id: "LIST" },
            ]
          : [{ type: "GhgReading", id: "LIST" }],
      keepUnusedDataFor: 60,
    }),

    getReadingById: builder.query<GhgReading, string>({
      query:             (id) => `/ghg/readings/${id}`,
      transformResponse: (r: ApiResponse<GhgReading>) => r.data!,
      providesTags:      (_, __, id) => [{ type: "GhgReading", id }],
    }),

    createReading: builder.mutation<GhgReading, Partial<GhgReading>>({
      query: (body) => ({ url: "/ghg/readings", method: "POST", body }),
      transformResponse: (r: ApiResponse<GhgReading>) => r.data!,
      invalidatesTags: [
        { type: "GhgReading",       id: "LIST" },
        { type: "DashboardMetrics" },
      ],
    }),

    updateReading: builder.mutation<GhgReading, { id: string; data: Partial<GhgReading> }>({
      query: ({ id, data }) => ({ url: `/ghg/readings/${id}`, method: "PATCH", body: data }),
      transformResponse: (r: ApiResponse<GhgReading>) => r.data!,
      invalidatesTags: (_, __, { id }) => [
        { type: "GhgReading", id },
        { type: "DashboardMetrics" },
      ],
      // Optimistic update
      onQueryStarted: async ({ id, data }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          ghgApi.util.updateQueryData("getReadingById", id, (draft) => {
            Object.assign(draft, data);
          })
        );
        try { await queryFulfilled; }
        catch  { patchResult.undo(); }
      },
    }),

    deleteReading: builder.mutation<void, string>({
      query: (id) => ({ url: `/ghg/readings/${id}`, method: "DELETE" }),
      invalidatesTags: (_, __, id) => [
        { type: "GhgReading", id },
        { type: "GhgReading", id: "LIST" },
        { type: "DashboardMetrics" },
      ],
    }),

    // ── Emission Factors ──
    getEmissionFactors: builder.query<EmissionFactor[], { scope?: 1|2|3; region?: string }>({
      query: ({ scope, region } = {}) => {
        const p = new URLSearchParams();
        if (scope)  p.set("scope",  String(scope));
        if (region) p.set("region", region);
        return `/ghg/factors?${p.toString()}`;
      },
      transformResponse: (r: ApiResponse<EmissionFactor[]>) => r.data ?? [],
      providesTags:      ["EmissionFactor"],
      keepUnusedDataFor: 3600,  // EFs change rarely — cache 1 hour
    }),

    // ── GWP Factors ──
    getGwpFactors: builder.query<GwpFactor[], void>({
      query:             () => "/ghg/gwp",
      transformResponse: (r: ApiResponse<GwpFactor[]>) => r.data ?? [],
      providesTags:      ["GwpFactor"],
      keepUnusedDataFor: 86400, // Cache 24h — GWPs are very stable
    }),

  }),
});

// Auto-generated hooks
export const {
  useGetDashboardMetricsQuery,
  useGetReadingsQuery,
  useGetReadingByIdQuery,
  useCreateReadingMutation,
  useUpdateReadingMutation,
  useDeleteReadingMutation,
  useGetEmissionFactorsQuery,
  useGetGwpFactorsQuery,
} = ghgApi;
