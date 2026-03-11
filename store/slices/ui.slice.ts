/**
 * A2Z Carbon Solutions — store/slices/ui.slice.ts
 * Global UI state: toasts, modals, sidebar, theme, loading overlays.
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ToastType = "success" | "error" | "warning" | "info";
export type ModalId   =
  | "create_reading"
  | "delete_reading"
  | "verify_reading"
  | "export_report"
  | "manage_sites"
  | "invite_user"
  | "audit_trail"
  | null;

export interface Toast {
  id:        string;
  type:      ToastType;
  title:     string;
  message:   string;
  duration?: number;    // ms; null = persistent
}

export interface UiState {
  toasts:          Toast[];
  activeModal:     ModalId;
  modalData:       Record<string, unknown>;
  sidebarCollapsed: boolean;
  theme:           "dark" | "light";
  globalLoading:   boolean;
  loadingMessage:  string;
  breadcrumbs:     Breadcrumb[];
}

export interface Breadcrumb {
  label: string;
  href:  string | null;
}

const initialState: UiState = {
  toasts:           [],
  activeModal:      null,
  modalData:        {},
  sidebarCollapsed: false,
  theme:            "dark",
  globalLoading:    false,
  loadingMessage:   "",
  breadcrumbs:      [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    addToast(state, action: PayloadAction<Omit<Toast, "id">>) {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      state.toasts.push({ ...action.payload, id });
      // Cap at 5 toasts
      if (state.toasts.length > 5) state.toasts.shift();
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts(state) {
      state.toasts = [];
    },
    openModal(state, action: PayloadAction<{ id: ModalId; data?: Record<string, unknown> }>) {
      state.activeModal = action.payload.id;
      state.modalData   = action.payload.data ?? {};
    },
    closeModal(state) {
      state.activeModal = null;
      state.modalData   = {};
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    setGlobalLoading(state, action: PayloadAction<{ loading: boolean; message?: string }>) {
      state.globalLoading  = action.payload.loading;
      state.loadingMessage = action.payload.message ?? "";
    },
    setBreadcrumbs(state, action: PayloadAction<Breadcrumb[]>) {
      state.breadcrumbs = action.payload;
    },
    setTheme(state, action: PayloadAction<"dark" | "light">) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
  },
});

export const {
  addToast, removeToast, clearToasts,
  openModal, closeModal,
  toggleSidebar, setSidebarCollapsed,
  setGlobalLoading, setBreadcrumbs,
  setTheme, toggleTheme,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;

// Selectors
export const selectToasts          = (s: { ui: UiState }) => s.ui.toasts;
export const selectActiveModal     = (s: { ui: UiState }) => s.ui.activeModal;
export const selectModalData       = (s: { ui: UiState }) => s.ui.modalData;
export const selectSidebarCollapsed = (s: { ui: UiState }) => s.ui.sidebarCollapsed;
export const selectGlobalLoading   = (s: { ui: UiState }) => s.ui.globalLoading;
export const selectBreadcrumbs     = (s: { ui: UiState }) => s.ui.breadcrumbs;
export const selectTheme           = (s: { ui: UiState }) => s.ui.theme;
