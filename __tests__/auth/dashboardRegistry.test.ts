/**
 * __tests__/auth/dashboardRegistry.test.ts
 *
 * Focused coverage for the dashboard registry so all 58 roles keep an explicit
 * landing contract and we do not silently drift back into partial role maps.
 */

import {
  DASHBOARD_PROFILES,
  getDashboardProfile,
  getDashboardShortcutCards,
} from "@/lib/auth/dashboardRegistry";
import { ALL_PLATFORM_ROLES } from "@/lib/auth/roles";

describe("dashboard registry", () => {
  it("covers every canonical role in the frontend role catalog", () => {
    expect(Object.keys(DASHBOARD_PROFILES).sort()).toEqual([...ALL_PLATFORM_ROLES].sort());
  });

  it("keeps board report recipients non-interactive", () => {
    expect(getDashboardProfile("board_report_recipient").interactive).toBe(false);
  });

  it("routes the data approver into the approval queue rather than data-entry routes", () => {
    expect(getDashboardProfile("data_approver").preferredPath).toBe("/accounting/approvals");
  });

  it("routes governance roles into dedicated governance workspaces", () => {
    expect(getDashboardProfile("dpo").preferredPath).toBe("/governance/privacy");
    expect(getDashboardProfile("grievance_officer").preferredPath).toBe("/governance/grievances");
  });

  it("keeps integration-only roles away from team-management shortcuts", () => {
    const apiKeyManagerShortcuts = getDashboardShortcutCards("api_key_manager").map((shortcut) => shortcut.href);

    expect(apiKeyManagerShortcuts).toEqual(
      expect.arrayContaining(["/org/integrations", "/dashboard/settings"]),
    );
    expect(apiKeyManagerShortcuts).not.toContain("/org/users");
  });

  it("gives the DPO governance shortcuts instead of only the generic platform home", () => {
    const dpoShortcuts = getDashboardShortcutCards("dpo").map((shortcut) => shortcut.href);

    expect(dpoShortcuts).toEqual(
      expect.arrayContaining([
        "/governance/privacy",
        "/governance/grievances",
        "/dashboard/settings",
      ]),
    );
  });
});
