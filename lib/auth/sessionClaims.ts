import type { Session, User } from "@supabase/supabase-js";

/**
 * JWT claim helpers shared by client and server auth surfaces.
 *
 * Why this exists:
 * - `session.user.app_metadata` can lag behind the live JWT payload.
 * - The dashboard home is now server-rendered and must read the same role/scope
 *   truth as the client auth context.
 * - Keeping claim decoding here avoids multiple slightly-different parsers.
 */

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf-8");
  }

  return atob(padded);
}

export function decodeJwtClaims(accessToken: string): Record<string, unknown> {
  try {
    const payload = accessToken.split(".")[1];

    if (!payload) {
      return {};
    }

    return JSON.parse(decodeBase64Url(payload)) as Record<string, unknown>;
  } catch (error) {
    console.error("Failed to decode JWT claims:", error);
    return {};
  }
}

export function getPatchedUserFromSession(session: Session): User {
  const jwtClaims = decodeJwtClaims(session.access_token);
  const liveMetadata = (jwtClaims.app_metadata as Record<string, unknown>) ?? {};

  return {
    ...session.user,
    app_metadata: {
      ...session.user.app_metadata,
      ...liveMetadata,
    },
  };
}

