// components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[]; // if undefined = show to all
}

// Role groups for readability
const ADMIN_ROLES = ["platform_superadmin", "platform_admin", "platform_support"];
const CONSULTANT_ROLES = ["consultant_lead", "consultant_analyst", "consultant_viewer"];
const CLIENT_WRITE_ROLES = ["client_admin", "client_sustainability_manager", "client_data_entry"];
const CLIENT_APPROVE_ROLES = ["client_approver"];
const VERIFIER_ROLES = ["verifier_lead", "verifier_member"];
const AUDITOR_ROLES = ["auditor_readonly"];

const ALL_AUTH = [...ADMIN_ROLES, ...CONSULTANT_ROLES, ...CLIENT_WRITE_ROLES,
  ...CLIENT_APPROVE_ROLES, ...VERIFIER_ROLES, ...AUDITOR_ROLES];

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",         href: "/dashboard",              icon: "◈",  roles: ALL_AUTH },
  { label: "GHG Inventory",     href: "/dashboard/inventory",    icon: "⊞",  roles: [...ADMIN_ROLES, ...CONSULTANT_ROLES, ...CLIENT_WRITE_ROLES, ...CLIENT_APPROVE_ROLES] },
  { label: "Emission Sources",  href: "/dashboard/sources",      icon: "⊡",  roles: [...ADMIN_ROLES, ...CONSULTANT_ROLES, ...CLIENT_WRITE_ROLES] },
  { label: "Activity Data",     href: "/dashboard/activity",     icon: "⊟",  roles: [...ADMIN_ROLES, ...CONSULTANT_ROLES, ...CLIENT_WRITE_ROLES] },
  { label: "AI Validation",     href: "/dashboard/ai",           icon: "✦",  roles: [...ADMIN_ROLES, ...CONSULTANT_ROLES, ...CLIENT_WRITE_ROLES] },
  { label: "Emission Factors",  href: "/dashboard/factors",      icon: "⊛",  roles: ALL_AUTH },
  { label: "Reports",           href: "/dashboard/reports",      icon: "≡",  roles: ALL_AUTH },
  { label: "CBAM Calculator",   href: "/dashboard/cbam",         icon: "⊕",  roles: ALL_AUTH },
  // Admin only
  { label: "Admin Panel",       href: "/admin",                  icon: "⚙",  roles: ADMIN_ROLES },
  // Bottom
  { label: "Settings",          href: "/dashboard/settings",     icon: "◎",  roles: ALL_AUTH },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { roles, isPlatformAdmin } = useAuth();

  function canSee(item: NavItem): boolean {
    if (!item.roles) return true;
    if (isPlatformAdmin) return true;
    return item.roles.some(r => roles.includes(r));
  }

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const mainItems = NAV_ITEMS.filter(i => i.href !== "/dashboard/settings" && canSee(i));
  const settingsItem = NAV_ITEMS.find(i => i.href === "/dashboard/settings");

  return (
    <aside style={{
      width: collapsed ? 56 : 220, minHeight: "100vh",
      background: "#07070E", borderRight: "1px solid #111120",
      display: "flex", flexDirection: "column",
      transition: "width 0.2s ease", flexShrink: 0, overflow: "hidden",
    }}>
      {/* Logo area */}
      <div style={{
        height: 56, display: "flex", alignItems: "center",
        padding: collapsed ? "0 16px" : "0 20px",
        borderBottom: "1px solid #111120", gap: 10, flexShrink: 0,
      }}>
        <span style={{ fontSize: "20px", color: "#F59E0B", flexShrink: 0 }}>◈</span>
        {!collapsed && (
          <span style={{ fontSize: "14px", fontWeight: "700", color: "#FAFAF8",
            whiteSpace: "nowrap", overflow: "hidden" }}>
            CarbonIQ
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}
        aria-label="Main navigation">
        {mainItems.map(item => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              style={{
                display: "flex", alignItems: "center",
                gap: 10, padding: collapsed ? "10px 18px" : "10px 16px",
                textDecoration: "none",
                color: active ? "#F59E0B" : "#9CA3AF",
                background: active ? "rgba(245,158,11,0.08)" : "transparent",
                borderLeft: active ? "2px solid #F59E0B" : "2px solid transparent",
                transition: "all 0.15s", fontSize: "13px", fontWeight: active ? "600" : "400",
                whiteSpace: "nowrap",
              }}>
              <span style={{ fontSize: "14px", flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      {settingsItem && canSee(settingsItem) && (
        <div style={{ borderTop: "1px solid #111120", padding: "4px 0" }}>
          <Link href={settingsItem.href}
            aria-current={isActive(settingsItem.href) ? "page" : undefined}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: collapsed ? "10px 18px" : "10px 16px",
              textDecoration: "none",
              color: isActive(settingsItem.href) ? "#F59E0B" : "#9CA3AF",
              background: isActive(settingsItem.href) ? "rgba(245,158,11,0.08)" : "transparent",
              borderLeft: isActive(settingsItem.href) ? "2px solid #F59E0B" : "2px solid transparent",
              fontSize: "13px", fontWeight: isActive(settingsItem.href) ? "600" : "400",
              whiteSpace: "nowrap",
            }}>
            <span style={{ fontSize: "14px", flexShrink: 0 }}>◎</span>
            {!collapsed && "Settings"}
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