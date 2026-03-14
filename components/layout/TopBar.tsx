"use client";

import { useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

import styles from "@/components/layout/TopBar.module.css";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

interface TopBarProps {
  onSidebarToggle?: () => void;
}

function joinClasses(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

/**
 * TopBar owns the shared account menu for authenticated routes.
 * Dropdown styling lives in the CSS module so this shell component no longer
 * mutates inline presentation state on hover.
 */
export function TopBar({ onSidebarToggle }: TopBarProps) {
  const router = useRouter();
  const { user, roles } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signing, setSigning] = useState(false);

  async function handleSignOut() {
    setSigning(true);
    await supabase.auth.signOut();
    router.replace("/auth/login");
  }

  const displayName = (user?.user_metadata?.full_name as string) || user?.email || "User";
  const initials = displayName
    .split(" ")
    .map((name: string) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const primaryRole = roles[0] ?? "user";
  const roleLabel = primaryRole.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {onSidebarToggle && (
          <button onClick={onSidebarToggle} aria-label="Toggle sidebar" className={styles.iconButton}>
            <Menu size={16} />
          </button>
        )}
      </div>

      <div className={styles.menu}>
        <button
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="User menu"
          aria-expanded={menuOpen}
          className={styles.menuButton}
        >
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.meta}>
            <div className={styles.name}>{displayName}</div>
            <div className={styles.role}>{roleLabel}</div>
          </div>
          <span className={styles.chevron}>
            <ChevronDown size={14} />
          </span>
        </button>

        {menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} className={styles.backdrop} aria-hidden="true" />
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.email}>{user?.email}</div>
                <div className={styles.dropdownRole}>{roleLabel}</div>
              </div>

              {[
                { label: "Profile", href: "/dashboard/settings/profile" },
                { label: "Security", href: "/dashboard/settings/security" },
                { label: "Settings", href: "/dashboard/settings" },
              ].map(({ label, href }) => (
                <button
                  key={href}
                  onClick={() => {
                    setMenuOpen(false);
                    router.push(href);
                  }}
                  className={styles.dropdownAction}
                >
                  {label}
                </button>
              ))}

              <div className={styles.footer}>
                <button
                  onClick={handleSignOut}
                  disabled={signing}
                  className={joinClasses(
                    styles.dropdownAction,
                    styles.dangerAction,
                    signing && styles.disabledAction,
                  )}
                >
                  {signing ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
