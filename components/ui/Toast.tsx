// components/ui/Toast.tsx
// Renders the Redux toast queue. Place this inside the dashboard layout.
"use client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectToasts, removeToast, type Toast } from "@/store/slices/ui.slice";
import type { AppDispatch } from "@/store";

const TYPE_STYLES: Record<Toast["type"], { bg: string; border: string; icon: string; color: string }> = {
  success: { bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.25)",  icon: "✓", color: "#22C55E" },
  error:   { bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.25)",  icon: "✕", color: "#EF4444" },
  warning: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", icon: "⚠", color: "#F59E0B" },
  info:    { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", icon: "ℹ", color: "#3B82F6" },
};

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useDispatch<AppDispatch>();
  const s = TYPE_STYLES[toast.type];

  useEffect(() => {
    const t = setTimeout(() => dispatch(removeToast(toast.id)), toast.duration ?? 4000);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, dispatch]);

  return (
    <div role="alert" aria-live="polite" style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "12px 16px", background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: "8px", boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
      maxWidth: 360, minWidth: 280, pointerEvents: "all",
    }}>
      <span style={{ fontSize: "14px", color: s.color, flexShrink: 0, marginTop: "1px" }}>
        {s.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#FAFAF8" }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "3px",
            lineHeight: "1.5" }}>
            {toast.message}
          </div>
        )}
      </div>
      <button onClick={() => dispatch(removeToast(toast.id))}
        aria-label="Dismiss notification"
        style={{ background: "none", border: "none", color: "#6B7280",
          cursor: "pointer", fontSize: "14px", padding: "0", flexShrink: 0 }}>
        ×
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useSelector(selectToasts);
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 8,
      pointerEvents: "none",
    }}
      role="region" aria-label="Notifications">
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}