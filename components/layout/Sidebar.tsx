"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Beaker,
  Briefcase,
  Building2,
  CheckCircle,
  Database,
  FileScan,
  FileSpreadsheet,
  FileText,
  History,
  LayoutDashboard,
  Leaf,
  LineChart,
  Link as LinkIcon,
  MessageSquare,
  Server,
  Settings,
  Settings2,
  ShieldCheck,
  ShieldUser,
  ShoppingCart,
  Target,
  TrendingDown,
  UploadCloud,
  Users,
  Vault,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import styles from "@/components/layout/Sidebar.module.css";
import { useAuth } from "@/context/AuthContext";
import { getUserPrimaryRole } from "@/lib/auth/roles";
import { canAnyRoleAccessPath } from "@/lib/auth/routeAccess";

/**
 * Sidebar visibility now follows the shared route-access matrix used by the
 * request proxy. That keeps navigation honest: if a role cannot reach a route,
 * the sidebar should not advertise it either.
 */

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  group: string;
}

const NAV_ITEMS: NavItem[] = [
  { group: "Core", label: "Dashboard Hub", href: "/dashboard", icon: LayoutDashboard },

  { group: "Platform Admin", label: "Tenants & Billing", href: "/admin/tenants", icon: Server },
  { group: "Platform Admin", label: "RBAC Controls", href: "/admin/rbac", icon: ShieldUser },
  { group: "Platform Admin", label: "Global Audit Logs", href: "/admin/logs", icon: ShieldCheck },
  { group: "Platform Admin", label: "System Health", href: "/admin/health", icon: Activity },
  { group: "Platform Admin", label: "Global Config", href: "/admin/features", icon: Settings2 },

  { group: "Platform Staff", label: "Platform Ops", href: "/dashboard/platform/operations", icon: Activity },
  { group: "Platform Staff", label: "Commercial Pulse", href: "/dashboard/platform/commercial", icon: Briefcase },
  { group: "Platform Staff", label: "Models & Twins", href: "/dashboard/platform/models", icon: Beaker },

  { group: "Organization", label: "Team Management", href: "/org/users", icon: Users },
  { group: "Organization", label: "Facilities & Sites", href: "/org/facilities", icon: Building2 },
  { group: "Organization", label: "Data Integrations", href: "/org/integrations", icon: LinkIcon },

  { group: "Governance", label: "Privacy Operations", href: "/governance/privacy", icon: ShieldCheck },
  { group: "Governance", label: "Incident Escalations", href: "/governance/grievances", icon: AlertTriangle },

  { group: "Sustainability", label: "Emissions Targets", href: "/sustainability/targets", icon: Target },
  { group: "Sustainability", label: "Disclosure Hub", href: "/sustainability/disclosures", icon: FileText },
  { group: "Sustainability", label: "CBAM Declarations", href: "/sustainability/cbam-reports", icon: FileSpreadsheet },
  { group: "Sustainability", label: "Carbon Offsets", href: "/sustainability/offsets", icon: Leaf },

  { group: "Data Pipeline", label: "Data Approvals", href: "/accounting/approvals", icon: CheckCircle },
  { group: "Data Pipeline", label: "Emission Factors", href: "/accounting/factors", icon: Beaker },
  { group: "Data Pipeline", label: "Anomalies", href: "/accounting/anomalies", icon: AlertTriangle },

  { group: "Data Input", label: "Bulk Upload", href: "/data/upload", icon: UploadCloud },
  { group: "Data Input", label: "AI Invoice Parse", href: "/data/ai-extract", icon: FileScan },
  { group: "Data Input", label: "My Submissions", href: "/data/history", icon: History },

  { group: "Executive", label: "Carbon Liability", href: "/finance/liability", icon: TrendingDown },
  { group: "Executive", label: "Credit Market", href: "/finance/carbon-credits", icon: ShoppingCart },
  { group: "Executive", label: "Board Packs", href: "/finance/reports", icon: FileText },

  { group: "Verification", label: "Data Sampling", href: "/audit/sampling", icon: Database },
  { group: "Verification", label: "Active RFIs", href: "/audit/rfis", icon: MessageSquare },
  { group: "Verification", label: "Assurance Vault", href: "/audit/vault", icon: Vault },

  { group: "Consulting", label: "Client Portfolio", href: "/consulting/portfolio", icon: Briefcase },
  { group: "Consulting", label: "Scenario Modeler", href: "/consulting/scenario", icon: LineChart },

  { group: "Settings", label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

function joinClasses(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { roles, user } = useAuth();
  const effectiveRoles = roles.length > 0 ? roles : user ? [getUserPrimaryRole(user)] : [];

  function canSee(item: NavItem): boolean {
    return canAnyRoleAccessPath(effectiveRoles, item.href);
  }

  function isActive(href: string): boolean {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  }

  const visibleItems = NAV_ITEMS.filter((item) => canSee(item));
  const settingsItem = visibleItems.find((item) => item.href === "/dashboard/settings");
  const mainItems = visibleItems.filter((item) => item.href !== "/dashboard/settings");

  const groupedItems = mainItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }

    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <aside className={joinClasses(styles.sidebar, collapsed ? styles.collapsed : styles.expanded)}>
      <div className={joinClasses(styles.header, collapsed ? styles.headerCollapsed : styles.headerExpanded)}>
        <span className={styles.brandMark}>*</span>
        {!collapsed && <span className={styles.brandTitle}>A2Z Carbon Solutions</span>}
      </div>

      <nav className={styles.nav} aria-label="Main navigation">
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <div key={groupName} className={styles.navSection}>
            {!collapsed && groupName !== "Core" && (
              <div className={styles.sectionLabel}>{groupName}</div>
            )}
            {items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  data-active={active ? "true" : "false"}
                  className={joinClasses(
                    styles.navLink,
                    collapsed ? styles.navLinkCollapsed : styles.navLinkExpanded,
                  )}
                >
                  <span className={styles.navIcon}>
                    <Icon size={16} />
                  </span>
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {settingsItem && (
        <div className={styles.settingsSection}>
          <Link
            href={settingsItem.href}
            aria-current={isActive(settingsItem.href) ? "page" : undefined}
            data-active={isActive(settingsItem.href) ? "true" : "false"}
            className={joinClasses(
              styles.navLink,
              collapsed ? styles.navLinkCollapsed : styles.navLinkExpanded,
            )}
          >
            <span className={styles.navIcon}>
              <settingsItem.icon size={16} />
            </span>
            {!collapsed && settingsItem.label}
          </Link>
        </div>
      )}

      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className={styles.toggle}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      )}
    </aside>
  );
}
