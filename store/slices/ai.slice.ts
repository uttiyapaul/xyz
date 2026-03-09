/**
 * CarbonIQ Platform — store/slices/ai.slice.ts
 * AI validation engine state — trust scores, anomalies, model registry.
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { AiValidation, RiskLevel } from "../../types/ghg.types";

export interface AiModel {
  id:          string;
  name:        string;
  version:     string;
  type:        "ocr" | "ef_matcher" | "anomaly" | "trust_scorer" | "llm";
  status:      "active" | "degraded" | "offline" | "training";
  accuracy:    number | null;     // 0–100
  latency_ms:  number | null;
  last_run:    string | null;
}

export interface AiState {
  validations:      AiValidation[];
  models:           AiModel[];
  platformTrust:    number;             // Overall platform trust score 0–100
  pendingReviews:   number;
  anomalyCount:     number;
  loading:          boolean;
  validating:       string | null;      // ID of reading being validated
  error:            string | null;
}

const initialState: AiState = {
  validations:   [],
  models:        [],
  platformTrust: 0,
  pendingReviews: 0,
  anomalyCount:  0,
  loading:       false,
  validating:    null,
  error:         null,
};

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------

export const fetchValidations = createAsyncThunk(
  "ai/fetchValidations",
  async (orgId: string, { rejectWithValue }) => {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data, error } = await sb
        .from("ai_validation")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) return rejectWithValue(error.message);
      return data as AiValidation[];
    } catch {
      return rejectWithValue("Failed to load validations");
    }
  }
);

export const triggerValidation = createAsyncThunk(
  "ai/triggerValidation",
  async (readingId: string, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/ai/validate", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": document.cookie
            .split("; ")
            .find((c) => c.startsWith("__csrf_token="))
            ?.split("=")[1] ?? "",
        },
        body: JSON.stringify({ reading_id: readingId }),
      });
      if (!res.ok) {
        const err = await res.json();
        return rejectWithValue(err.error ?? "Validation failed");
      }
      const result = await res.json();
      return result.data as AiValidation;
    } catch {
      return rejectWithValue("Validation service unavailable");
    }
  }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------
const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    setModels(state, action: PayloadAction<AiModel[]>) {
      state.models = action.payload;
    },
    setPlatformTrust(state, action: PayloadAction<number>) {
      state.platformTrust = action.payload;
    },
    setAnomalyCount(state, action: PayloadAction<number>) {
      state.anomalyCount = action.payload;
    },
    setPendingReviews(state, action: PayloadAction<number>) {
      state.pendingReviews = action.payload;
    },
    upsertValidation(state, action: PayloadAction<AiValidation>) {
      const idx = state.validations.findIndex((v) => v.id === action.payload.id);
      if (idx === -1) state.validations.unshift(action.payload);
      else state.validations[idx] = action.payload;
    },
    clearAiError(state) { state.error = null; },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchValidations.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchValidations.fulfilled, (s, a) => { s.loading = false; s.validations = a.payload; })
      .addCase(fetchValidations.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });

    builder
      .addCase(triggerValidation.pending,   (s, a) => { s.validating = a.meta.arg; s.error = null; })
      .addCase(triggerValidation.fulfilled, (s, a) => {
        s.validating = null;
        s.validations.unshift(a.payload);
      })
      .addCase(triggerValidation.rejected,  (s, a) => { s.validating = null; s.error = a.payload as string; });
  },
});

export const {
  setModels, setPlatformTrust, setAnomalyCount,
  setPendingReviews, upsertValidation, clearAiError,
} = aiSlice.actions;

export const aiReducer = aiSlice.reducer;

// Selectors
export const selectValidations   = (s: { ai: AiState }) => s.ai.validations;
export const selectAiModels      = (s: { ai: AiState }) => s.ai.models;
export const selectPlatformTrust = (s: { ai: AiState }) => s.ai.platformTrust;
export const selectAnomalyCount  = (s: { ai: AiState }) => s.ai.anomalyCount;
export const selectPendingReviews = (s: { ai: AiState }) => s.ai.pendingReviews;
export const selectAiLoading     = (s: { ai: AiState }) => s.ai.loading;
export const selectValidating    = (s: { ai: AiState }) => s.ai.validating;
