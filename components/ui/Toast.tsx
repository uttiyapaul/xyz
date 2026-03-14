"use client";

import { useEffect } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import styles from "@/components/ui/Toast.module.css";
import type { AppDispatch } from "@/store";
import { removeToast, selectToasts, type Toast } from "@/store/slices/ui.slice";

const TYPE_STYLES: Record<Toast["type"], string> = {
  success: styles.success,
  error: styles.error,
  warning: styles.warning,
  info: styles.info,
};

const TYPE_ICONS: Record<Toast["type"], React.ComponentType<{ size?: number }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

/**
 * ToastContainer renders the Redux toast queue for shared authenticated shells.
 * Notification styling now lives in a CSS module so shell UI stays consistent
 * with the repo-wide no-inline-styles rule.
 */
function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useDispatch<AppDispatch>();
  const Icon = TYPE_ICONS[toast.type];

  useEffect(() => {
    const timeoutId = setTimeout(() => dispatch(removeToast(toast.id)), toast.duration ?? 4000);
    return () => clearTimeout(timeoutId);
  }, [toast.id, toast.duration, dispatch]);

  return (
    <div role="alert" aria-live="polite" className={`${styles.item} ${TYPE_STYLES[toast.type]}`}>
      <span className={styles.icon}>
        <Icon size={16} />
      </span>
      <div className={styles.content}>
        <div className={styles.title}>{toast.title}</div>
        {toast.message && <div className={styles.message}>{toast.message}</div>}
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        aria-label="Dismiss notification"
        className={styles.dismiss}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useSelector(selectToasts);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={styles.container} role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
