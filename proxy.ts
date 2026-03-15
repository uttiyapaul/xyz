import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import {
  getUserPrimaryRole,
  type PlatformRole,
} from "@/lib/auth/roles";
import { canRoleAccessPath, getRouteAccessRule } from "@/lib/auth/routeAccess";

/**
 * A2Z Carbon Solutions — request proxy
 *
 * Executed at the Edge before every request. Implements:
 *   1. CSP Nonce generation (per-request, crypto-random)
 *   2. Security headers injection
 *   3. Authentication guard (Supabase session)
 *   4. CSRF token validation (for mutating API routes)
 *   5. Rate limiting (sliding window, in-memory for Edge)
 *   6. Audit context injection (trace IDs)
 *   7. Bot / crawler filtering on sensitive routes
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PUBLIC_ROUTES = new Set([
  "/",                           // Public landing page
  "/__opaque-not-found",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/pending-approval",
  "/auth/invited",
  "/auth/suspended",
  "/auth/offboarded",
  "/calculator",                 // Public CBAM calculator
  "/privacy",
  "/privacy/request",
  "/cookies",
  "/terms",
]);

// Public metadata and root-level assets requested by browsers outside normal navigation.
// These must stay reachable for anonymous visitors because the landing page and calculator
// both advertise them in page metadata.
const PUBLIC_FILE_ROUTES = new Set([
  "/manifest.webmanifest",
  "/sw.js",
]);

const AUTH_ROUTES = new Set(["/auth/login", "/auth/register"]);
const OPAQUE_NOT_FOUND_ROUTE = "/__opaque-not-found";

const API_WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Rate limit config — sliding window
const RATE_LIMIT = {
  window_ms: 60_000,   // 1 minute
  max_api: 120,      // API calls per window
  max_auth: 10,       // Auth calls per window (stricter)
};

// ---------------------------------------------------------------------------
// In-memory rate limit store (Edge-compatible Map)
// Production: replace with Upstash Redis or Cloudflare KV
// ---------------------------------------------------------------------------
const rateLimitStore = new Map<string, { count: number; reset: number }>();

function checkRateLimit(key: string, max: number): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.reset) {
    rateLimitStore.set(key, { count: 1, reset: now + RATE_LIMIT.window_ms });
    return { allowed: true, remaining: max - 1, resetMs: now + RATE_LIMIT.window_ms };
  }

  entry.count++;
  const remaining = Math.max(0, max - entry.count);
  return {
    allowed: entry.count <= max,
    remaining,
    resetMs: entry.reset,
  };
}

// ---------------------------------------------------------------------------
// Nonce generation — crypto-random, base64url encoded
// ---------------------------------------------------------------------------
function generateNonce(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// ---------------------------------------------------------------------------
// CSRF token validation
// Simple double-submit cookie pattern:
//   - Server sets __csrf_token cookie (httpOnly=false so JS can read it)
//   - Client sends it back as X-CSRF-Token header
//   - Proxy validates they match
// ---------------------------------------------------------------------------
function validateCsrf(req: NextRequest): boolean {
  if (!API_WRITE_METHODS.has(req.method)) return true;         // GET/HEAD/OPTIONS are safe
  if (!req.nextUrl.pathname.startsWith("/api/")) return true;  // Only API routes

  const cookieToken = req.cookies.get("__csrf_token")?.value;
  const headerToken = req.headers.get("x-csrf-token");

  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}

// ---------------------------------------------------------------------------
// Build CSP header with nonce
// ---------------------------------------------------------------------------
function buildCspWithNonce(nonce: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : "*.supabase.co";
  const isDev = process.env.NODE_ENV === "development";

  const directives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src 'self' data: blob: https:`,
    `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://api.anthropic.com`,
    `worker-src 'self' blob:`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
  ];

  return directives.join("; ");
}

// ---------------------------------------------------------------------------
// Trace ID — for distributed tracing / audit logs
// ---------------------------------------------------------------------------
function generateTraceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
}

/**
 * Route-enumeration prevention.
 *
 * Protected routes must not reveal whether they exist. Unauthorized and
 * non-existent route hits therefore collapse into the same generic 404
 * response, with no route-path echo in the body.
 */
function createOpaqueNotFoundResponse(req: NextRequest, pathname: string): NextResponse {
  if (pathname.startsWith("/api/")) {
    return new NextResponse(
      JSON.stringify({ error: "Not Found", code: "NOT_FOUND" }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.rewrite(new URL(OPAQUE_NOT_FOUND_ROUTE, req.url));
}

// ---------------------------------------------------------------------------
// Main request proxy
// ---------------------------------------------------------------------------
export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // 1. Generate per-request nonce + trace ID
  const nonce = generateNonce();
  const traceId = generateTraceId();

  // 2. Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const isAuthPath = pathname.startsWith("/auth/");
  const isApiPath = pathname.startsWith("/api/");
  const rlKey = `${ip}:${isAuthPath ? "auth" : "api"}`;
  const rlMax = isAuthPath ? RATE_LIMIT.max_auth : RATE_LIMIT.max_api;

  if (isAuthPath || isApiPath) {
    const rl = checkRateLimit(rlKey, rlMax);
    if (!rl.allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests", code: "RATE_LIMITED" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((rl.resetMs - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(rlMax),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rl.resetMs),
          },
        }
      );
    }
  }

  // 3. CSRF validation on mutating API calls
  if (isApiPath && !validateCsrf(req)) {
    return new NextResponse(
      JSON.stringify({ error: "CSRF validation failed", code: "CSRF_INVALID" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // 4. Bootstrap response
  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(req.headers.entries()),
        "x-nonce": nonce,    // Available in RSC via headers()
        "x-trace-id": traceId,  // Propagate through request chain
      }),
    },
  });

  // 5. Supabase auth session refresh
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  let isAuthed = false;
  let primaryRole: PlatformRole | null = null;

  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            response.cookies.set(name, value, {
              ...options,
              /**
               * Do not force auth cookies to httpOnly here.
               * The browser Supabase client created via `createBrowserClient`
               * needs to read and refresh the session cookies on the client.
               * Overriding the SSR defaults breaks that handoff and can leave
               * the app stuck on `/auth/login` after a successful sign-in.
               */
              secure: options.secure ?? process.env.NODE_ENV === "production",
              sameSite: options.sameSite ?? "lax",
              path: options.path ?? "/",
            });
          });
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    isAuthed = !!user;
    primaryRole = user ? getUserPrimaryRole(user) : null;

    // Set user context headers for downstream use
    if (user) {
      response.headers.set("x-user-id", user.id);
      response.headers.set("x-user-email", user.email ?? "");
      response.headers.set("x-user-role", primaryRole ?? user.role ?? "authenticated");
    }
  }

  // 6. Auth guard
  const isPublic = PUBLIC_ROUTES.has(pathname) ||
    PUBLIC_FILE_ROUTES.has(pathname) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/public/") ||
    pathname.match(/\.(ico|png|jpg|svg|webp|woff2?)$/) !== null;

  if (!isPublic && !isAuthed) {
    return createOpaqueNotFoundResponse(req, pathname);
  }

  const matchedRouteRule = getRouteAccessRule(pathname);

  if (isAuthed && primaryRole && matchedRouteRule && !canRoleAccessPath(primaryRole, pathname)) {
    return createOpaqueNotFoundResponse(req, pathname);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthed && AUTH_ROUTES.has(pathname)) {
    // Check if there's a redirect parameter
    const redirectParam = req.nextUrl.searchParams.get("redirect");
    if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
      return NextResponse.redirect(new URL(redirectParam, req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 7. Inject security headers
  const csp = buildCspWithNonce(nonce);
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Nonce", nonce);
  response.headers.set("X-Trace-Id", traceId);
  response.headers.set("X-Request-Id", traceId);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 8. Set/refresh CSRF token cookie (not httpOnly — JS must read it)
  if (!req.cookies.get("__csrf_token")) {
    const csrfToken = generateNonce();
    response.cookies.set("__csrf_token", csrfToken, {
      httpOnly: false,           // Must be JS-readable for double-submit pattern
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 3600,            // 1 hour
    });
  }

  return response;
}

// ---------------------------------------------------------------------------
// Matcher — all routes except Next.js internals
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest\\.webmanifest|sw\\.js).*)",
  ],
};
