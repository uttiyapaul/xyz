// app/dashboard/settings/layout.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Profile",   href: "/dashboard/settings/profile" },
  { label: "Security",  href: "/dashboard/settings/security" },
  { label: "API Keys",  href: "/dashboard/settings/api-keys" },
  { label: "Sessions",  href: "/dashboard/settings/sessions" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#FAFAF8",
          margin: "0 0 4px" }}>Settings</h1>
        <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
          Manage your account and security preferences
        </p>
      </div>

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid #1A1A24",
        marginBottom: "28px" }}>
        {TABS.map(tab => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link key={tab.href} href={tab.href} style={{
              padding: "10px 16px", fontSize: "13px", textDecoration: "none",
              color: active ? "#F59E0B" : "#6B7280",
              borderBottom: active ? "2px solid #F59E0B" : "2px solid transparent",
              fontWeight: active ? "600" : "400",
              transition: "color 0.15s", marginBottom: "-1px",
            }}>
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}