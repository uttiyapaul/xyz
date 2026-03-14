/**
 * __tests__/auth/sessionScope.test.ts
 *
 * Scope helpers sit underneath AuthContext and the live data-entry views.
 * These checks keep session claims predictable as we move more screens away
 * from manual `orgIds[0]` lookups.
 */

import { buildSessionScope, filterRowsByScopeId } from "@/lib/auth/sessionScope";

describe("session scope helpers", () => {
  it("builds typed session scope from JWT app metadata", () => {
    expect(
      buildSessionScope({
        org_ids: ["org-a", "org-b"],
        scope_site_ids: ["site-1"],
        scope_legal_entity_ids: ["le-1", "le-2"],
      }),
    ).toEqual({
      orgIds: ["org-a", "org-b"],
      primaryOrgId: "org-a",
      siteScopeIds: ["site-1"],
      legalEntityScopeIds: ["le-1", "le-2"],
    });
  });

  it("falls back to null and empty arrays when scope claims are absent", () => {
    expect(buildSessionScope({})).toEqual({
      orgIds: [],
      primaryOrgId: null,
      siteScopeIds: [],
      legalEntityScopeIds: [],
    });
  });

  it("filters rows by scoped ids only when a scope list exists", () => {
    const rows = [{ id: "site-1" }, { id: "site-2" }];

    expect(filterRowsByScopeId(rows, ["site-2"], (row) => row.id)).toEqual([{ id: "site-2" }]);
    expect(filterRowsByScopeId(rows, [], (row) => row.id)).toEqual(rows);
  });

  it("can keep org-level rows visible while still filtering scoped rows", () => {
    const rows = [{ site_id: "site-1" }, { site_id: null }, { site_id: "site-3" }];

    expect(
      filterRowsByScopeId(rows, ["site-1"], (row) => row.site_id, {
        includeRowsWithoutScope: true,
      }),
    ).toEqual([{ site_id: "site-1" }, { site_id: null }]);
  });
});
