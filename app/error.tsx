"use client";

import { useEffect } from "react";

import styles from "@/app/AppState.module.css";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[GlobalError]", error);
    }
  }, [error]);

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={`${styles.icon} ${styles.errorIcon}`.trim()}>!</div>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.body}>
          An unexpected error occurred. Our team has been notified.
          {process.env.NODE_ENV === "development" ? (
            <span className={styles.devMessage}>{error.message}</span>
          ) : null}
        </p>
        <button onClick={reset} className={styles.button}>
          Try again
        </button>
      </div>
    </div>
  );
}
