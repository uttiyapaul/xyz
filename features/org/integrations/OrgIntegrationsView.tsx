"use client";

import { ApiKeyManagerPanel } from "@/features/org/integrations/ApiKeyManagerPanel";
import styles from "@/features/org/integrations/IntegrationConsole.module.css";
import { WebhookManagerPanel } from "@/features/org/integrations/WebhookManagerPanel";
import { useAuth } from "@/context/AuthContext";

/**
 * Organization integrations workspace.
 *
 * This replaces the old skeleton route with a real, scope-aware surface for
 * API keys and webhook operations. The backend can harden ERP and device flows
 * later without forcing another route restructure.
 */
export function OrgIntegrationsView() {
  const { primaryOrgId, roles, siteScopeIds, legalEntityScopeIds } = useAuth();

  if (!primaryOrgId) {
    return (
      <section className={styles.page}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Organization Workspace</p>
          <h1 className={styles.title}>Integrations unavailable</h1>
          <p className={styles.subtitle}>
            No organization is attached to the current session yet, so integration credentials cannot be managed.
          </p>
        </header>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Organization Workspace</p>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>Data Integrations & Secrets</h1>
            <p className={styles.subtitle}>
              Manage API keys, webhook endpoints, and integration hygiene for the active organization. Secrets stay
              masked by default, and reveal flows are explicit to match the 2026 audit guidance.
            </p>
          </div>
        </div>
      </header>

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Primary Org</p>
          <p className={styles.metricValue}>{primaryOrgId.slice(0, 8)}</p>
          <p className={styles.metricHint}>The current integration workspace is bound to the active organization scope.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Site Scope</p>
          <p className={styles.metricValue}>{siteScopeIds.length}</p>
          <p className={styles.metricHint}>Visible site assignments inherited from the active session claims.</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Legal Entities</p>
          <p className={styles.metricValue}>{legalEntityScopeIds.length}</p>
          <p className={styles.metricHint}>Legal-entity scope stays visible here so admins avoid over-broad assumptions.</p>
        </article>
      </section>

      <section className={styles.contentGrid}>
        <aside className={styles.sidebarStack}>
          <div className={styles.card}>
            <div>
              <h2 className={styles.cardTitle}>Guardrails</h2>
              <p className={styles.cardDescription}>
                Integration screens must stay within organization scope and should never bypass operational approval or
                verifier independence controls.
              </p>
            </div>
            <div className={styles.alert} data-tone="info">
              Current roles: {roles.length > 0 ? roles.join(", ") : "No resolved roles yet"}.
            </div>
            <div className={styles.alert} data-tone="warning">
              Secrets are masked by default, and copied values are cleared from the clipboard on a best-effort basis
              after 60 seconds.
            </div>
            <div className={styles.alert} data-tone="info">
              ERP credential storage and expiry workflows will land in the backend phase. This screen focuses only on
              frontend-safe credential handling.
            </div>
          </div>
        </aside>

        <div className={styles.mainStack}>
          <ApiKeyManagerPanel orgId={primaryOrgId} />
          <WebhookManagerPanel orgId={primaryOrgId} />
        </div>
      </section>
    </section>
  );
}
