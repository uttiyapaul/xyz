// app/dashboard/layout.tsx
"use client";

import { useState } from "react";

import shellStyles from "@/components/layout/ShellLayout.module.css";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // The request proxy now owns route guarding, so this layout stays focused on shell UI.
  return (
    <div className={shellStyles.root}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={shellStyles.main}>
        {children}
      </main>
    </div>
  );
}
