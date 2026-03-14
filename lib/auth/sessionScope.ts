/**
 * A2Z Carbon Solutions - lib/auth/sessionScope.ts
 *
 * Frontend auth claims currently arrive as loose app_metadata fields. This
 * helper turns them into a predictable scope object so screens can stop
 * guessing with `orgIds[0]` and start honoring site / legal-entity scope
 * whenever those claims are present.
 */

export interface SessionScope {
  orgIds: string[];
  primaryOrgId: string | null;
  siteScopeIds: string[];
  legalEntityScopeIds: string[];
}

function extractStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
}

export function buildSessionScope(metadata: Record<string, unknown>): SessionScope {
  const orgIds = extractStringArray(metadata.org_ids);
  const primaryOrgId = typeof metadata.primary_org_id === "string"
    ? metadata.primary_org_id
    : (orgIds[0] ?? null);

  return {
    orgIds,
    primaryOrgId,
    siteScopeIds: extractStringArray(metadata.scope_site_ids),
    legalEntityScopeIds: extractStringArray(metadata.scope_legal_entity_ids),
  };
}

/**
 * Many read models are org-wide while some rows also carry a site or legal
 * entity id. This helper narrows list data only when a scope array is present.
 */
export function filterRowsByScopeId<T>(
  rows: T[],
  scopedIds: readonly string[],
  getScopeId: (row: T) => string | null | undefined,
  options: { includeRowsWithoutScope?: boolean } = {},
): T[] {
  if (scopedIds.length === 0) {
    return rows;
  }

  const { includeRowsWithoutScope = false } = options;

  return rows.filter((row) => {
    const scopeId = getScopeId(row);

    if (!scopeId) {
      return includeRowsWithoutScope;
    }

    return scopedIds.includes(scopeId);
  });
}
