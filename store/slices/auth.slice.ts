/**
 * CarbonIQ Platform — store/slices/auth.slice.ts
 * Authentication & session state management.
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, UserProfile, AuthSession } from "../../types/auth.types";

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
const initialState: AuthState = {
  user:      null,
  session:   null,
  loading:   false,
  error:     null,
  csrfToken: null,
};

// ---------------------------------------------------------------------------
// Async thunks
// ---------------------------------------------------------------------------

/**
 * Initialize session from Supabase on app load.
 * Reads the CSRF token from cookie for subsequent requests.
 */
export const initializeSession = createAsyncThunk(
  "auth/initializeSession",
  async (_, { rejectWithValue }) => {
    try {
      // Read CSRF token from cookie (double-submit pattern)
      const csrfToken = typeof document !== "undefined"
        ? document.cookie
            .split("; ")
            .find((r) => r.startsWith("__csrf_token="))
            ?.split("=")[1] ?? null
        : null;

      return { csrfToken };
    } catch (err) {
      return rejectWithValue("Failed to initialize session");
    }
  }
);

/**
 * Sign out — clear session + CSRF cookie.
 */
export const signOut = createAsyncThunk(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase.auth.signOut();
      if (error) return rejectWithValue(error.message);
      return null;
    } catch (err) {
      return rejectWithValue("Sign out failed");
    }
  }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserProfile | null>) {
      state.user  = action.payload;
      state.error = null;
    },
    setSession(state, action: PayloadAction<AuthSession | null>) {
      state.session = action.payload;
      state.user    = action.payload?.user ?? null;
    },
    setCsrfToken(state, action: PayloadAction<string | null>) {
      state.csrfToken = action.payload;
    },
    setAuthError(state, action: PayloadAction<string | null>) {
      state.error   = action.payload;
      state.loading = false;
    },
    clearAuth(state) {
      state.user      = null;
      state.session   = null;
      state.error     = null;
      state.csrfToken = null;
    },
  },
  extraReducers(builder) {
    // initializeSession
    builder
      .addCase(initializeSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeSession.fulfilled, (state, action) => {
        state.loading   = false;
        state.csrfToken = action.payload.csrfToken;
      })
      .addCase(initializeSession.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // signOut
    builder
      .addCase(signOut.pending, (state) => { state.loading = true; })
      .addCase(signOut.fulfilled, (state) => {
        state.user      = null;
        state.session   = null;
        state.loading   = false;
        state.csrfToken = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });
  },
});

export const {
  setUser,
  setSession,
  setCsrfToken,
  setAuthError,
  clearAuth,
} = authSlice.actions;

export const authReducer = authSlice.reducer;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
export const selectUser       = (s: { auth: AuthState }) => s.auth.user;
export const selectSession    = (s: { auth: AuthState }) => s.auth.session;
export const selectCsrfToken  = (s: { auth: AuthState }) => s.auth.csrfToken;
export const selectAuthLoading = (s: { auth: AuthState }) => s.auth.loading;
export const selectAuthError  = (s: { auth: AuthState }) => s.auth.error;
export const selectIsAuthed   = (s: { auth: AuthState }) => !!s.auth.user;
export const selectUserRole   = (s: { auth: AuthState }) => s.auth.user?.role ?? null;
