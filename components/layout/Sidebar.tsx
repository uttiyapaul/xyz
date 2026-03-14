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
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
  CARBON_ACCOUNTING_WORKSPACE_ROLES,
  CLIENT_ADMIN_WORKSPACE_ROLES,
  CONSULTANT_WORKSPACE_ROLES,
  DATA_PIPELINE_WORKSPACE_ROLES,
  EXECUTIVE_WORKSPACE_ROLES,
  INTERACTIVE_DASHBOARD_ROLES,
  PLATFORM_WORKSPACE_ROLES,
  SUSTAINABILITY_WORKSPACE_ROLES,
  VERIFICATION_WORKSPACE_ROLES,
  type PlatformRole,
} from "@/lib/auth/roles";

/**
 * Sidebar visibility is intentionally narrower than the full role catalog.
 * We reuse shared workspaces where they exist today, while keeping sensitive or
 * not-yet-built modules hidden instead of pretending those pages are ready.
 */

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  roles: readonly PlatformRole[];
  group: string;
}

const DASHBOARD_NAV_ROLES: PlatformRole[] = [...INTERACTIVE_DASHBOARD_ROLES];

const PLATFORM_ADMIN_NAV_ROLES: PlatformRole[] = [...PLATFORM_WORKSPACE_ROLES];

const CLIENT_ORG_ADMIN_ROLES: PlatformRole[] = CLIENT_ADMIN_WORKSPACE_ROLES.filter(
  (role) => role !== "api_key_manager"
);

const CLIENT_INTEGRATION_ROLES: PlatformRole[] = [
  ...CLIENT_ADMIN_WORKSPACE_ROLES,
  "iot_device_manager",
];

const SUSTAINABILITY_NAV_ROLES: PlatformRole[] = [...SUSTAINABILITY_WORKSPACE_ROLES];

const ACCOUNTING_NAV_ROLES: PlatformRole[] = [
  ...CARBON_ACCOUNTING_WORKSPACE_ROLES,
  "data_reviewer",
  "data_approver",
];

const DATA_CAPTURE_NAV_ROLES: PlatformRole[] = DATA_PIPELINE_WORKSPACE_ROLES.filter(
  (role) => role !== "data_reviewer" && role !== "data_approver" && role !== "iot_device_manager"
);

const EXECUTIVE_NAV_ROLES: PlatformRole[] = [...EXECUTIVE_WORKSPACE_ROLES];

const VERIFICATION_NAV_ROLES: PlatformRole[] = [...VERIFICATION_WORKSPACE_ROLES];

const CONSULTING_NAV_ROLES: PlatformRole[] = [...CONSULTANT_WORKSPACE_ROLES];

const NAV_ITEMS: NavItem[] = [
  { group: "Core", label: "Dashboard Hub", href: "/dashboard", icon: LayoutDashboard, roles: DASHBOARD_NAV_ROLES },

  { group: "Platform Admin", label: "Tenants & Billing", href: "/admin/tenants", icon: Server, roles: PLATFORM_ADMIN_NAV_ROLES },
  { group: "Platform Admin", label: "RBAC Controls", href: "/admin/rbac", icon: ShieldUser, roles: PLATFORM_ADMIN_NAV_ROLES },
  { group: "Platform Admin", label: "Global Audit Logs", href: "/admin/logs", icon: ShieldCheck, roles: PLATFORM_ADMIN_NAV_ROLES },
  { group: "Platform Admin", label: "System Health", href: "/admin/health", icon: Activity, roles: PLATFORM_ADMIN_NAV_ROLES },
  { group: "Platform Admin", label: "Global Config", href: "/admin/features", icon: Settings2, roles: PLATFORM_ADMIN_NAV_ROLES },

  { group: "Organization", label: "Team Management", href: "/org/users", icon: Users, roles: CLIENT_ORG_ADMIN_ROLES },
  { group: "Organization", label: "Facilities & Sites", href: "/org/facilities", icon: Building2, roles: CLIENT_ORG_ADMIN_ROLES },
  { group: "Organization", label: "Data Integrations", href: "/org/integrations", icon: LinkIcon, roles: CLIENT_INTEGRATION_ROLES },

  { group: "Sustainability", label: "Emissions Targets", href: "/sustainability/targets", icon: Target, roles: SUSTAINABILITY_NAV_ROLES },
  { group: "Sustainability", label: "CBAM Declarations", href: "/sustainability/cbam-reports", icon: FileSpreadsheet, roles: SUSTAINABILITY_NAV_ROLES },
  { group: "Sustainability", label: "Carbon Offsets", href: "/sustainability/offsets", icon: Leaf, roles: SUSTAINABILITY_NAV_ROLES },

  { group: "Data Pipeline", label: "Data Approvals", href: "/accounting/approvals", icon: CheckCircle, roles: ACCOUNTING_NAV_ROLES },
  { group: "Data Pipeline", label: "Emission Factors", href: "/accounting/factors", icon: Beaker, roles: ACCOUNTING_NAV_ROLES },
  { group: "Data Pipeline", label: "Anomalies", href: "/accounting/anomalies", icon: AlertTriangle, roles: ACCOUNTING_NAV_ROLES },

  { group: "Data Input", label: "Bulk Upload", href: "/data/upload", icon: UploadCloud, roles: DATA_CAPTURE_NAV_ROLES },
  { group: "Data Input", label: "AI Invoice Parse", href: "/data/ai-extract", icon: FileScan, roles: DATA_CAPTURE_NAV_ROLES },
  { group: "Data Input", label: "My Submissions", href: "/data/history", icon: History, roles: DATA_CAPTURE_NAV_ROLES },

  { group: "Executive", label: "Carbon Liability", href: "/finance/liability", icon: TrendingDown, roles: EXECUTIVE_NAV_ROLES },
  { group: "Executive", label: "Credit Market", href: "/finance/carbon-credits", icon: ShoppingCart, roles: EXECUTIVE_NAV_ROLES },
  { group: "Executive", label: "Board Packs", href: "/finance/reports", icon: FileText, roles: EXECUTIVE_NAV_ROLES },

  { group: "Verification", label: "Data Sampling", href: "/audit/sampling", icon: Database, roles: VERIFICATION_NAV_ROLES },
  { group: "Verification", label: "Active RFIs", href: "/audit/rfis", icon: MessageSquare, roles: VERIFICATION_NAV_ROLES },
  { group: "Verification", label: "Assurance Vault", href: "/audit/vault", icon: Vault, roles: VERIFICATION_NAV_ROLES },

  { group: "Consulting", label: "Client Portfolio", href: "/consulting/portfolio", icon: Briefcase, roles: CONSULTING_NAV_ROLES },
  { group: "Consulting", label: "Scenario Modeler", href: "/consulting/scenario", icon: LineChart, roles: CONSULTING_NAV_ROLES },

  { group: "Settings", label: "Settings", href: "/dashboard/settings", icon: Settings, roles: DASHBOARD_NAV_ROLES },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { roles, isPlatformAdmin } = useAuth();

  function canSee(item: NavItem): boolean {
    if (isPlatformAdmin) {
      return true;
    }

    return item.roles.some((role) => roles.includes(role));
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
    <aside
      style={{
        width: collapsed ? 56 : 240,
        minHeight: "100vh",
        background: "#07070E",
        borderRight: "1px solid #111120",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease",
        flexShrink: 0,
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0 16px" : "0 20px",
          borderBottom: "1px solid #111120",
          gap: 10,
          flexShrink: 0,
          background: "#050508",
        }}
      >
        <span style={{ fontSize: "20px", color: "#F59E0B", flexShrink: 0 }}>*</span>
        {!collapsed && (
          <span
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#FAFAF8",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            A2Z Carbon Solutions
          </span>
        )}
      </div>

      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }} aria-label="Main navigation">
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <div key={groupName} style={{ marginBottom: "16px" }}>
            {!collapsed && groupName !== "Core" && (
              <div
                style={{
                  padding: "0 20px",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#4B5563",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "8px",
                }}
              >
                {groupName}
              </div>
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: collapsed ? "10px 18px" : "10px 20px",
                    textDecoration: "none",
                    color: active ? "#F59E0B" : "#9CA3AF",
                    background: active ? "rgba(245,158,11,0.08)" : "transparent",
                    borderLeft: active ? "2px solid #F59E0B" : "2px solid transparent",
                    transition: "all 0.15s",
                    fontSize: "13px",
                    fontWeight: active ? "600" : "400",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ display: "flex", flexShrink: 0, opacity: active ? 1 : 0.7 }}>
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
        <div style={{ borderTop: "1px solid #111120", padding: "8px 0" }}>
          <Link
            href={settingsItem.href}
            aria-current={isActive(settingsItem.href) ? "page" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: collapsed ? "10px 18px" : "10px 20px",
              textDecoration: "none",
              color: isActive(settingsItem.href) ? "#F59E0B" : "#9CA3AF",
              background: isActive(settingsItem.href) ? "rgba(245,158,11,0.08)" : "transparent",
              borderLeft: isActive(settingsItem.href) ? "2px solid #F59E0B" : "2px solid transparent",
              fontSize: "13px",
              fontWeight: isActive(settingsItem.href) ? "600" : "400",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ display: "flex", flexShrink: 0, opacity: isActive(settingsItem.href) ? 1 : 0.7 }}>
              <settingsItem.icon size={16} />
            </span>
            {!collapsed && settingsItem.label}
          </Link>
        </div>
      )}

      {onToggle && (
        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            padding: "12px",
            background: "transparent",
            border: "none",
            borderTop: "1px solid #111120",
            color: "#4B5563",
            cursor: "pointer",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {collapsed ? ">" : "<"}
        </button>
      )}
    </aside>
  );
}
