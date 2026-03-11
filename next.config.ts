import type { NextConfig } from "next";

/**
 * A2Z Carbon Solutions — next.config.ts
 * Banking-level security: CSP nonces, HSTS, X-Frame-Options, etc.
 * All headers follow OWASP Security Headers Project guidelines.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_HOST = SUPABASE_URL ? new URL(SUPABASE_URL).hostname : "*.supabase.co";
const IS_PROD = process.env.NODE_ENV === "production";

// ---------------------------------------------------------------------------
// CSP Directive builder
// Nonce is injected at runtime via middleware — here we define the policy.
// ---------------------------------------------------------------------------
function buildCspHeader(nonce?: string): string {
  const n = nonce ? `'nonce-${nonce}'` : "";

  const directives: Record<string, string[]> = {
    "default-src":     ["'self'"],
    "script-src":      ["'self'", n, IS_PROD ? "" : "'unsafe-eval'"].filter(Boolean),
    "style-src":       ["'self'", n, "https://fonts.googleapis.com"],
    "font-src":        ["'self'", "https://fonts.gstatic.com", "data:"],
    "img-src":         ["'self'", "data:", "blob:", "https:"],
    "connect-src":     [
      "'self'",
      `https://${SUPABASE_HOST}`,
      `wss://${SUPABASE_HOST}`,
      "https://api.anthropic.com",
    ],
    "worker-src":      ["'self'", "blob:"],
    "frame-ancestors": ["'none'"],
    "form-action":     ["'self'"],
    "base-uri":        ["'self'"],
    "object-src":      ["'none'"],
    "manifest-src":    ["'self'"],
    ...(IS_PROD ? { "upgrade-insecure-requests": [] } : {}),
  };

  return Object.entries(directives)
    .map(([key, values]) =>
      values.length === 0 ? key : `${key} ${values.join(" ")}`
    )
    .join("; ");
}

// ---------------------------------------------------------------------------
// Security Headers — applied globally
// ---------------------------------------------------------------------------
const SECURITY_HEADERS = [
  // Strict-Transport-Security (2 years, include sub-domains)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Prevent content-type sniffing
  { key: "X-Content-Type-Options",  value: "nosniff" },
  // Prevent clickjacking
  { key: "X-Frame-Options",         value: "DENY" },
  // XSS filter (legacy browsers)
  { key: "X-XSS-Protection",        value: "1; mode=block" },
  // Referrer policy
  { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
  // Permissions policy — disable unused browser APIs
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "bluetooth=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
    ].join(", "),
  },
  // Cross-origin isolation
  { key: "Cross-Origin-Opener-Policy",   value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // Remove powered-by
  { key: "X-Powered-By",                 value: "" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,           // Remove X-Powered-By: Next.js

  // ---------------------------------------------------------------------------
  // Experimental — required for nonce-based CSP in App Router
  // ---------------------------------------------------------------------------
  experimental: {
    optimizePackageImports: ["@reduxjs/toolkit", "react-redux"],
  },

  // ---------------------------------------------------------------------------
  // HTTP Headers
  // ---------------------------------------------------------------------------
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          ...SECURITY_HEADERS.filter((h) => h.value !== ""),
          {
            // CSP without nonce here — middleware injects nonce per-request
            key: "Content-Security-Policy",
            value: buildCspHeader(),
          },
        ],
      },
      {
        // API routes — stricter; no framing, no caching
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control",      value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
          { key: "Pragma",             value: "no-cache" },
          { key: "Expires",            value: "0" },
          { key: "Surrogate-Control",  value: "no-store" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        // Static assets — aggressive caching
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // ---------------------------------------------------------------------------
  // Redirects
  // ---------------------------------------------------------------------------
  async redirects() {
    return [];
  },

  // ---------------------------------------------------------------------------
  // Image optimization domains
  // ---------------------------------------------------------------------------
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // ---------------------------------------------------------------------------
  // TypeScript and ESLint
  // ---------------------------------------------------------------------------
  typescript: { ignoreBuildErrors: false },
  eslint:     { ignoreDuringBuilds: false },
};

export default nextConfig;
export { buildCspHeader };
