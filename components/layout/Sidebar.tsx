// components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, Server, ShieldUser, Activity, Settings2, ShieldCheck, 
  Users, Building2, Link as LinkIcon, Target, FileSpreadsheet, Leaf,
  CheckCircle, Beaker, AlertTriangle, UploadCloud, FileScan, History,
  TrendingDown, ShoppingCart, FileText, Database, MessageSquare, Vault,
  Briefcase, LineChart, Settings
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  roles?: string[]; // if undefined = show to all
  group: string;
}

// Role groups matching the Exhaustive Implementation Plan
const PLATFORM_ADMIN_ROLES = ["platform_superadmin", "platform_admin", "platform_support"];
const CLIENT_ADMIN_ROLES = ["client_superadmin", "client_admin", "client_it_admin"];
const SUSTAINABILITY_ROLES = ["sustainability_head", "esg_manager", "group_sustainability_head"];
const ACCOUNTING_ROLES = ["carbon_accountant"];
const DATA_ENTRY_ROLES = ["data_entry_operator", "facility_manager"];
const EXECUTIVE_ROLES = ["executive_viewer", "cfo_viewer", "board_report_recipient"];
const VERIFIER_ROLES = ["verifier_lead", "verifier_iso", "cbam_verifier"];
const CONSULTANT_ROLES = ["consultant_lead", "consultant_analyst"];

// Core Switchboard
const ALL_AUTH = undefined;

const NAV_ITEMS: NavItem[] = [
  // Dashboard Core Switchboard
  { group: "Core", label: "Dashboard Hub", href: "/dashboard", icon: LayoutDashboard, roles: ALL_AUTH },

  // 1. Platform Administration
  { group: "Platform Admin", label: "Tenants & Billing", href: "/admin/tenants", icon: Server, roles: PLATFORM_ADMIN_ROLES },
  { group: "Platform Admin", label: "RBAC Controls", href: "/admin/rbac", icon: ShieldUser, roles: PLATFORM_ADMIN_ROLES },
  { group: "Platform Admin", label: "Global Audit Logs", href: "/admin/logs", icon: ShieldCheck, roles: PLATFORM_ADMIN_ROLES },
  { group: "Platform Admin", label: "System Health", href: "/admin/health", icon: Activity, roles: PLATFORM_ADMIN_ROLES },
  { group: "Platform Admin", label: "Global Config", href: "/admin/features", icon: Settings2, roles: PLATFORM_ADMIN_ROLES },

  // 2. Client Administration
  { group: "Organization", label: "Team Management", href: "/org/users", icon: Users, roles: CLIENT_ADMIN_ROLES },
  { group: "Organization", label: "Facilities & Sites", href: "/org/facilities", icon: Building2, roles: CLIENT_ADMIN_ROLES },
  { group: "Organization", label: "Data Integrations", href: "/org/integrations", icon: LinkIcon, roles: CLIENT_ADMIN_ROLES },

  // 3. Sustainability & Compliance
  { group: "Sustainability", label: "Emissions Targets", href: "/sustainability/targets", icon: Target, roles: SUSTAINABILITY_ROLES },
  { group: "Sustainability", label: "CBAM Declarations", href: "/sustainability/cbam-reports", icon: FileSpreadsheet, roles: SUSTAINABILITY_ROLES },
  { group: "Sustainability", label: "Carbon Offsets", href: "/sustainability/offsets", icon: Leaf, roles: SUSTAINABILITY_ROLES },

  // 4. Carbon Accounting
  { group: "Data Pipeline", label: "Data Approvals", href: "/accounting/approvals", icon: CheckCircle, roles: ACCOUNTING_ROLES },
  { group: "Data Pipeline", label: "Emission Factors", href: "/accounting/factors", icon: Beaker, roles: ACCOUNTING_ROLES },
  { group: "Data Pipeline", label: "Anomalies", href: "/accounting/anomalies", icon: AlertTriangle, roles: ACCOUNTING_ROLES },

  // 5. Data Entry & Ground Ops
  { group: "Data Input", label: "Bulk Upload", href: "/data/upload", icon: UploadCloud, roles: DATA_ENTRY_ROLES },
  { group: "Data Input", label: "AI Invoice Parse", href: "/data/ai-extract", icon: FileScan, roles: DATA_ENTRY_ROLES },
  { group: "Data Input", label: "My Submissions", href: "/data/history", icon: History, roles: DATA_ENTRY_ROLES },

  // 6. Executive & Finance
  { group: "Executive", label: "Carbon Liability", href: "/finance/liability", icon: TrendingDown, roles: EXECUTIVE_ROLES },
  { group: "Executive", label: "Credit Market", href: "/finance/carbon-credits", icon: ShoppingCart, roles: EXECUTIVE_ROLES },
  { group: "Executive", label: "Board Packs", href: "/finance/reports", icon: FileText, roles: EXECUTIVE_ROLES },

  // 7. Third-Party Verifiers
  { group: "Verification", label: "Data Sampling", href: "/audit/sampling", icon: Database, roles: VERIFIER_ROLES },
  { group: "Verification", label: "Active RFIs", href: "/audit/rfis", icon: MessageSquare, roles: VERIFIER_ROLES },
  { group: "Verification", label: "Assurance Vault", href: "/audit/vault", icon: Vault, roles: VERIFIER_ROLES },

  // 8. Consultants
  { group: "Consulting", label: "Client Portfolio", href: "/consulting/portfolio", icon: Briefcase, roles: CONSULTANT_ROLES },
  { group: "Consulting", label: "Scenario Modeler", href: "/consulting/scenario", icon: LineChart, roles: CONSULTANT_ROLES },

  // Bottom Settings
  { group: "Settings", label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ALL_AUTH },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { roles, isPlatformAdmin } = useAuth();

  function canSee(item: NavItem): boolean {
    if (!item.roles) return true; // ALL_AUTH
    if (isPlatformAdmin) return true;
    return item.roles.some(r => roles.includes(r));
  }

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  // Filter and group items
  const visibleItems = NAV_ITEMS.filter(i => canSee(i));
  const settingsItem = visibleItems.find(i => i.href === "/dashboard/settings");
  const mainItems = visibleItems.filter(i => i.href !== "/dashboard/settings");

  // Group items by their 'group' property to render headers
  const groupedItems = mainItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <aside style={{
      width: collapsed ? 56 : 240, minHeight: "100vh",
      background: "#07070E", borderRight: "1px solid #111120",
      display: "flex", flexDirection: "column",
      transition: "width 0.2s ease", flexShrink: 0, overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* Logo area */}
      <div style={{
        height: 56, display: "flex", alignItems: "center",
        padding: collapsed ? "0 16px" : "0 20px",
        borderBottom: "1px solid #111120", gap: 10, flexShrink: 0,
        background: "#050508"
      }}>
        <span style={{ fontSize: "20px", color: "#F59E0B", flexShrink: 0 }}>◈</span>
        {!collapsed && (
          <span style={{ fontSize: "14px", fontWeight: "700", color: "#FAFAF8",
            whiteSpace: "nowrap", overflow: "hidden" }}>
            A2Z Carbon Solutions
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }} aria-label="Main navigation">
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <div key={groupName} style={{ marginBottom: "16px" }}>
            {!collapsed && groupName !== "Core" && (
              <div style={{ 
                padding: "0 20px", fontSize: "11px", fontWeight: "600", 
                color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.5px", 
                marginBottom: "8px" 
              }}>
                {groupName}
              </div>
            )}
            {items.map(item => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  style={{
                    display: "flex", alignItems: "center",
                    gap: 12, padding: collapsed ? "10px 18px" : "10px 20px",
                    textDecoration: "none",
                    color: active ? "#F59E0B" : "#9CA3AF",
                    background: active ? "rgba(245,158,11,0.08)" : "transparent",
                    borderLeft: active ? "2px solid #F59E0B" : "2px solid transparent",
                    transition: "all 0.15s", fontSize: "13px", fontWeight: active ? "600" : "400",
                    whiteSpace: "nowrap",
                  }}>
                  <span style={{ display: "flex", flexShrink: 0, opacity: active ? 1 : 0.7 }}><Icon size={16} /></span>
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Settings at bottom */}
      {settingsItem && (
        <div style={{ borderTop: "1px solid #111120", padding: "8px 0" }}>
          <Link href={settingsItem.href}
            aria-current={isActive(settingsItem.href) ? "page" : undefined}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: collapsed ? "10px 18px" : "10px 20px",
              textDecoration: "none",
              color: isActive(settingsItem.href) ? "#F59E0B" : "#9CA3AF",
              background: isActive(settingsItem.href) ? "rgba(245,158,11,0.08)" : "transparent",
              borderLeft: isActive(settingsItem.href) ? "2px solid #F59E0B" : "2px solid transparent",
              fontSize: "13px", fontWeight: isActive(settingsItem.href) ? "600" : "400",
              whiteSpace: "nowrap",
            }}>
            <span style={{ display: "flex", flexShrink: 0, opacity: isActive(settingsItem.href) ? 1 : 0.7 }}>
              <settingsItem.icon size={16} />
            </span>
            {!collapsed && settingsItem.label}
          </Link>
        </div>
      )}

      {/* Collapse toggle */}
      {onToggle && (
        <button onClick={onToggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            padding: "12px", background: "transparent",
            border: "none", borderTop: "1px solid #111120",
            color: "#4B5563", cursor: "pointer", fontSize: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
          {collapsed ? "→" : "←"}
        </button>
      )}
    </aside>
  );
}