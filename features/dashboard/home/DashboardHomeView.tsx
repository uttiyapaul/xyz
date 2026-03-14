"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { useAuth } from "@/context/AuthContext";
import styles from "@/features/portal/WorkspaceShell.module.css";
import {
  getDashboardProfile,
  getDashboardShortcutCards,
  type DashboardProfile,
} from "@/lib/auth/dashboardRegistry";
import { getUserPrimaryRole, type PlatformRole } from "@/lib/auth/roles";

/**
 * The dashboard hub now acts as the canonical role-aware launchpad.
 * Every role gets an intentional description, preferred path, and guardrail
 * note from the shared registry instead of depending on partial grouped
 * component fallbacks.
 */

function NoticeCard({
  role,
  profile,
}: {
  role: PlatformRole;
  profile: DashboardProfile;
}) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Dashboard Home</p>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{profile.title}</h1>
          <p className={styles.subtitle}>
            You are currently signed in as <span className={styles.emphasis}>{role.replace(/_/g, " ")}</span>.{" "}
            {profile.summary}
          </p>
        </div>
      </header>
      <main className={styles.body}>
        <div className={styles.alert} data-tone="warning">
          {profile.guardrail}
        </div>
      </main>
    </div>
  );
}

function DashboardLaunchpad({
  profile,
  orgCount,
  siteScopeCount,
  legalEntityScopeCount,
}: {
  profile: DashboardProfile;
  orgCount: number;
  siteScopeCount: number;
  legalEntityScopeCount: number;
}) {
  const shortcuts = getDashboardShortcutCards(profile.role);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Dashboard Home</p>
        <div className={styles.headerRow}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>{profile.title}</h1>
            <p className={styles.subtitle}>{profile.summary}</p>
          </div>
        </div>
        <div className={styles.scopeNote}>
          <span className={styles.emphasis}>Guardrail:</span> {profile.guardrail}
        </div>
      </header>

      <main className={styles.body}>
        <section className={styles.metricsGrid}>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Organizations</p>
            <p className={styles.metricValue}>{orgCount}</p>
            <p className={styles.metricHint}>Organizations available in the current session scope.</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Site Scope</p>
            <p className={styles.metricValue}>{siteScopeCount === 0 ? "All" : siteScopeCount}</p>
            <p className={styles.metricHint}>
              Site-level constraints are active when this value is numeric instead of "All".
            </p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>Entity Scope</p>
            <p className={styles.metricValue}>{legalEntityScopeCount === 0 ? "All" : legalEntityScopeCount}</p>
            <p className={styles.metricHint}>
              Legal-entity scope remains relevant even when the route looks organization-wide.
            </p>
          </article>
        </section>

        <section className={styles.contentGrid}>
          <aside className={styles.sidebarStack}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Primary Destination</h2>
                  <p className={styles.cardDescription}>
                    This is the route the current role should prefer when starting work from the dashboard shell.
                  </p>
                </div>
              </div>
              <div className={styles.cardSection}>
                <Link href={profile.preferredPath} className={styles.linkCard}>
                  <h3 className={styles.linkCardTitle}>{profile.preferredPath}</h3>
                  <p className={styles.linkCardDescription}>
                    Open the primary workspace aligned to this role's current frontend contract.
                  </p>
                  <p className={styles.linkCardCta}>Open route</p>
                </Link>
              </div>
            </div>
          </aside>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Recommended Workspaces</h2>
                <p className={styles.cardDescription}>
                  These shortcuts stay aligned with the shared route-access matrix, so the hub and sidebar do not drift
                  apart.
                </p>
              </div>
            </div>

            {shortcuts.length === 0 ? (
              <div className={styles.emptyState}>
                <h3 className={styles.emptyTitle}>No interactive shortcuts for this role.</h3>
                <p className={styles.emptyDescription}>
                  This role currently relies on the shared dashboard shell and account posture until dedicated modules
                  are connected.
                </p>
              </div>
            ) : (
              <div className={styles.cardSection}>
                <div className={styles.linkGrid}>
                  {shortcuts.map((shortcut) => (
                    <Link key={shortcut.href} href={shortcut.href} className={styles.linkCard}>
                      <h3 className={styles.linkCardTitle}>{shortcut.label}</h3>
                      <p className={styles.linkCardDescription}>{shortcut.description}</p>
                      <p className={styles.linkCardCta}>Open workspace</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export function DashboardHomeView() {
  const { user, orgIds, siteScopeIds, legalEntityScopeIds, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return <DashboardSkeleton />;
  }

  const primaryRole = getUserPrimaryRole(user);
  const profile = getDashboardProfile(primaryRole);

  if (!profile.interactive) {
    return <NoticeCard role={primaryRole} profile={profile} />;
  }

  return (
    <DashboardLaunchpad
      profile={profile}
      orgCount={orgIds.length}
      siteScopeCount={siteScopeIds.length}
      legalEntityScopeCount={legalEntityScopeIds.length}
    />
  );
}
