/**
 * CarbonIQ Platform — store/slices/ghg.slice.ts
 * GHG data state — readings, metrics, anomalies, filters.
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type {
  GhgReading,
  GhgReadingCreate,
  DashboardMetrics,
  MonthlyTrend,
  EmissionFactor,
  GhgScope,
} from "../../types/ghg.types";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------
export interface GhgFilters {
  scope:       GhgScope | "all";
  site_id:     string | null;
  org_id:      string | null;
  from_period: string | null;   // YYYY-MM-DD
  to_period:   string | null;
  category:    string | null;
}

export interface GhgState {
  readings:          GhgReading[];
  selectedReading:   GhgReading | null;
  metrics:           DashboardMetrics | null;
  trends:            MonthlyTrend[];
  emissionFactors:   EmissionFactor[];
  filters:           GhgFilters;
  loadingReadings:   boolean;
  loadingMetrics:    boolean;
  loadingFactors:    boolean;
  submitting:        boolean;
  error:             string | null;
  realtimeConnected: boolean;
  lastSynced:        string | null;
}

const DEFAULT_FILTERS: GhgFilters = {
  scope:       "all",
  site_id:     null,
  org_id:      null,
  from_period: null,
  to_period:   null,
  category:    null,
};

const initialState: GhgState = {
  readings:          [],
  selectedReading:   null,
  metrics:           null,
  trends:            [],
  emissionFactors:   [],
  filters:           DEFAULT_FILTERS,
  loadingReadings:   false,
  loadingMetrics:    false,
  loadingFactors:    false,
  submitting:        false,
  error:             null,
  realtimeConnected: false,
  lastSynced:        null,
};

// ---------------------------------------------------------------------------
// Async thunks
// ---------------------------------------------------------------------------

export const fetchReadings = createAsyncThunk(
  "ghg/fetchReadings",
  async (filters: Partial<GhgFilters>, { rejectWithValue }) => {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      let query = supabase
        .from("ghg_monthly_readings")
        .select("*")
        .order("reporting_period", { ascending: false })
        .limit(200);

      if (filters.scope && filters.scope !== "all") {
        query = query.eq("scope", filters.scope);
      }
      if (filters.site_id)   query = query.eq("site_id", filters.site_id);
      if (filters.from_period) query = query.gte("reporting_period", filters.from_period);
      if (filters.to_period)   query = query.lte("reporting_period", filters.to_period);

      const { data, error } = await query;
      if (error) return rejectWithValue(error.message);
      return data as GhgReading[];
    } catch (err) {
      return rejectWithValue("Failed to fetch readings");
    }
  }
);

export const createReading = createAsyncThunk(
  "ghg/createReading",
  async (payload: GhgReadingCreate, { rejectWithValue }) => {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from("ghg_monthly_readings")
        .insert(payload)
        .select()
        .single();

      if (error) return rejectWithValue(error.message);
      return data as GhgReading;
    } catch (err) {
      return rejectWithValue("Failed to create reading");
    }
  }
);

export const fetchEmissionFactors = createAsyncThunk(
  "ghg/fetchEmissionFactors",
  async (_, { rejectWithValue }) => {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from("emission_factors")
        .select("*")
        .eq("is_current", true)
        .order("scope")
        .order("factor_code");

      if (error) return rejectWithValue(error.message);
      return data as EmissionFactor[];
    } catch (err) {
      return rejectWithValue("Failed to fetch emission factors");
    }
  }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------
const ghgSlice = createSlice({
  name: "ghg",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<GhgFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = DEFAULT_FILTERS;
    },
    selectReading(state, action: PayloadAction<GhgReading | null>) {
      state.selectedReading = action.payload;
    },
    addReading(state, action: PayloadAction<GhgReading>) {
      // Deduplicate — used by real-time subscriptions
      const exists = state.readings.findIndex((r) => r.id === action.payload.id);
      if (exists === -1) {
        state.readings.unshift(action.payload);
      } else {
        state.readings[exists] = action.payload;
      }
    },
    updateReading(state, action: PayloadAction<GhgReading>) {
      const idx = state.readings.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) state.readings[idx] = action.payload;
    },
    removeReading(state, action: PayloadAction<string>) {
      state.readings = state.readings.filter((r) => r.id !== action.payload);
    },
    setMetrics(state, action: PayloadAction<DashboardMetrics>) {
      state.metrics = action.payload;
    },
    setTrends(state, action: PayloadAction<MonthlyTrend[]>) {
      state.trends = action.payload;
    },
    setRealtimeStatus(state, action: PayloadAction<boolean>) {
      state.realtimeConnected = action.payload;
    },
    setLastSynced(state, action: PayloadAction<string>) {
      state.lastSynced = action.payload;
    },
    clearGhgError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    // fetchReadings
    builder
      .addCase(fetchReadings.pending, (s) => { s.loadingReadings = true; s.error = null; })
      .addCase(fetchReadings.fulfilled, (s, a) => {
        s.loadingReadings = false;
        s.readings        = a.payload;
        s.lastSynced      = new Date().toISOString();
      })
      .addCase(fetchReadings.rejected, (s, a) => {
        s.loadingReadings = false;
        s.error           = a.payload as string;
      });

    // createReading
    builder
      .addCase(createReading.pending, (s) => { s.submitting = true; s.error = null; })
      .addCase(createReading.fulfilled, (s, a) => {
        s.submitting = false;
        s.readings.unshift(a.payload);
      })
      .addCase(createReading.rejected, (s, a) => {
        s.submitting = false;
        s.error      = a.payload as string;
      });

    // fetchEmissionFactors
    builder
      .addCase(fetchEmissionFactors.pending, (s) => { s.loadingFactors = true; })
      .addCase(fetchEmissionFactors.fulfilled, (s, a) => {
        s.loadingFactors  = false;
        s.emissionFactors = a.payload;
      })
      .addCase(fetchEmissionFactors.rejected, (s, a) => {
        s.loadingFactors = false;
        s.error          = a.payload as string;
      });
  },
});

export const {
  setFilters, resetFilters, selectReading,
  addReading, updateReading, removeReading,
  setMetrics, setTrends, setRealtimeStatus,
  setLastSynced, clearGhgError,
} = ghgSlice.actions;

export const ghgReducer = ghgSlice.reducer;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
export const selectReadings         = (s: { ghg: GhgState }) => s.ghg.readings;
export const selectMetrics          = (s: { ghg: GhgState }) => s.ghg.metrics;
export const selectTrends           = (s: { ghg: GhgState }) => s.ghg.trends;
export const selectEmissionFactors  = (s: { ghg: GhgState }) => s.ghg.emissionFactors;
export const selectGhgFilters       = (s: { ghg: GhgState }) => s.ghg.filters;
export const selectGhgLoading       = (s: { ghg: GhgState }) => s.ghg.loadingReadings;
export const selectGhgSubmitting    = (s: { ghg: GhgState }) => s.ghg.submitting;
export const selectGhgError         = (s: { ghg: GhgState }) => s.ghg.error;
export const selectRealtimeStatus   = (s: { ghg: GhgState }) => s.ghg.realtimeConnected;
export const selectLastSynced       = (s: { ghg: GhgState }) => s.ghg.lastSynced;
export const selectSelectedReading  = (s: { ghg: GhgState }) => s.ghg.selectedReading;

// Derived selectors
export const selectTotalTco2e = (s: { ghg: GhgState }): number =>
  s.ghg.readings.reduce((sum, r) => sum + (r.kgco2e_total ?? 0) / 1000, 0);

export const selectScopeBreakdown = (s: { ghg: GhgState }) => ({
  scope1: s.ghg.readings.filter((r) => r.scope === 1).reduce((sum, r) => sum + (r.kgco2e_total ?? 0) / 1000, 0),
  scope2: s.ghg.readings.filter((r) => r.scope === 2).reduce((sum, r) => sum + (r.kgco2e_total ?? 0) / 1000, 0),
  scope3: s.ghg.readings.filter((r) => r.scope === 3).reduce((sum, r) => sum + (r.kgco2e_total ?? 0) / 1000, 0),
});
