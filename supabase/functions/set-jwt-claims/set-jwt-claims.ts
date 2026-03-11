import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface PlatformRole {
  role_name: string | null;
  role_level: string | null;
}

interface OrgRoleRow {
  organization_id: string;
  role_id: string;
  platform_roles: PlatformRole | null;
}

interface SupabaseHookPayload {
  user_id: string;
  claims: {
    aud: string;
    exp: number;
    iat: number;
    sub: string;
    email: string;
    phone: string;
    role: string;
    aal: string;
    session_id: string;
    is_anonymous: boolean;
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

// Verify Standard Webhooks signature sent by Supabase Auth
// Spec: https://www.standardwebhooks.com/
async function verifySignature(
  secret: string,
  headers: Headers,
  body: string
): Promise<boolean> {
  try {
    // Secret format: "v1,whsec_<base64>"
    // Strip the "v1,whsec_" prefix to get raw base64
    const base64Secret = secret.replace(/^v1,whsec_/, "");
    const keyBytes = Uint8Array.from(atob(base64Secret), (c) => c.charCodeAt(0));

    const msgId        = headers.get("webhook-id") ?? "";
    const msgTimestamp = headers.get("webhook-timestamp") ?? "";
    const msgSignature = headers.get("webhook-signature") ?? "";

    // Reject if headers missing
    if (!msgId || !msgTimestamp || !msgSignature) return false;

    // Reject if timestamp is > 5 minutes old (replay attack protection)
    const ts = parseInt(msgTimestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - ts) > 300) return false;

    // Compute expected signature: HMAC-SHA256 of "msgId.msgTimestamp.body"
    const signedContent = `${msgId}.${msgTimestamp}.${body}`;
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(signedContent)
    );
    const computedSig = "v1," + btoa(String.fromCharCode(...new Uint8Array(sigBytes)));

    // Supabase may send multiple signatures — check each one
    const receivedSigs = msgSignature.split(" ");
    return receivedSigs.some((s) => s === computedSig);
  } catch (e) {
    console.error("verifySignature error:", String(e));
    return false;
  }
}

serve(async (req: Request) => {
  try {
    const hookSecret = Deno.env.get("HOOK_SECRET") ?? "";
    const rawBody    = await req.text();

    // Verify signature if secret is configured
    if (hookSecret) {
      const valid = await verifySignature(hookSecret, req.headers, rawBody);
      if (!valid) {
        console.error("set-jwt-claims: invalid webhook signature");
        return new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const body    = JSON.parse(rawBody) as SupabaseHookPayload;
    const userId  = body?.user_id;
    const claims  = body?.claims;

    if (!claims || !userId) {
      console.error("set-jwt-claims: missing user_id or claims", rawBody);
      return new Response(JSON.stringify({ error: "missing payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: rows, error } = await supabase
      .from("user_organization_roles")
      .select(`organization_id, role_id, platform_roles ( role_name, role_level )`)
      .eq("user_id", userId)
      .eq("is_active", true) as {
        data: OrgRoleRow[] | null;
        error: { message: string } | null;
      };

    if (error) {
      console.error("set-jwt-claims DB error:", error.message);
      // Return original claims unchanged — don't break login on DB error
      return new Response(JSON.stringify({ claims }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const safeRows: OrgRoleRow[] = rows ?? [];

    const orgIds: string[] = [
      ...new Set(
        safeRows
          .map((r: OrgRoleRow) => r.organization_id)
          .filter((id: string) => typeof id === "string")
      ),
    ];

    const roleNames: string[] = [
      ...new Set(
        safeRows
          .map((r: OrgRoleRow) => r.platform_roles?.role_name ?? "")
          .filter((name: string) => name.length > 0)
      ),
    ];

    const isPlatformAdmin = roleNames.some((r: string) =>
      ["platform_superadmin", "platform_admin"].includes(r)
    );
    const isConsultant = roleNames.some((r: string) => r.includes("consultant"));
    const primaryRole  = roleNames[0] ?? "client_viewer";

    // Write claims back to auth.users.raw_app_meta_data so that
    // session.user.app_metadata is also correct (not just the JWT).
    // This keeps the DB row in sync with the JWT on every login.
    const { error: updateError } = await supabase.rpc("update_user_app_metadata", {
      p_user_id: userId,
      p_metadata: {
        org_ids:           orgIds,
        roles:             roleNames,
        is_platform_admin: isPlatformAdmin,
        is_consultant:     isConsultant,
        primary_role:      primaryRole,
      },
    });
    if (updateError) {
      // Non-fatal — JWT will still be correct, log and continue
      console.warn("set-jwt-claims: failed to update raw_app_meta_data:", updateError.message);
    }

    // Return FULL original claims with custom fields merged into app_metadata
    return new Response(
      JSON.stringify({
        claims: {
          ...claims,
          app_metadata: {
            ...(claims.app_metadata ?? {}),
            org_ids:           orgIds,
            roles:             roleNames,
            is_platform_admin: isPlatformAdmin,
            is_consultant:     isConsultant,
            primary_role:      primaryRole,
          },
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("set-jwt-claims fatal:", String(err));
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
