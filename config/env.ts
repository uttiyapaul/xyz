/**
 * Type-safe environment variable access with validation.
 * Fails fast at startup if required vars are missing.
 */

interface EnvConfig {
  // Supabase
  SUPABASE_URL:      string;
  SUPABASE_ANON_KEY: string;

  // App
  APP_VERSION:       string;
  APP_ENV:           "development" | "staging" | "production";

  // AI
  ANTHROPIC_API_KEY: string | null;

  // Feature flags
  FEATURES: {
    AI_VALIDATION:    boolean;
    CBAM_CALCULATOR:  boolean;
    REALTIME_SYNC:    boolean;
    AUDIT_LOG:        boolean;
    MFA_REQUIRED:     boolean;
  };
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Add it to your .env.local file.`
    );
  }
  return value;
}

function optionalEnv(key: string): string | null {
  return process.env[key] ?? null;
}

export const env: EnvConfig = {
  SUPABASE_URL:      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  SUPABASE_ANON_KEY: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),

  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
  APP_ENV:     (process.env.NODE_ENV as EnvConfig["APP_ENV"]) ?? "development",

  ANTHROPIC_API_KEY: optionalEnv("ANTHROPIC_API_KEY"),

  FEATURES: {
    AI_VALIDATION:   process.env.NEXT_PUBLIC_FEATURE_AI     !== "false",
    CBAM_CALCULATOR: process.env.NEXT_PUBLIC_FEATURE_CBAM   !== "false",
    REALTIME_SYNC:   process.env.NEXT_PUBLIC_FEATURE_RT      !== "false",
    AUDIT_LOG:       process.env.NEXT_PUBLIC_FEATURE_AUDIT   !== "false",
    MFA_REQUIRED:    process.env.NEXT_PUBLIC_MFA_REQUIRED    === "true",
  },
};

/**
 * config/constants.ts
 * Application-wide constants — never hardcode these inline.
 */
export const APP_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE:  50,
  MAX_PAGE_SIZE:      200,

  // GHG
  REPORTING_CURRENCY: "INR",
  BASE_YEAR:          2023,
  GWP_BASIS:          "AR6" as const,
  EASTERN_GRID_EF:    0.779,       // kgCO2e/kWh — West Bengal / Midnapore

  // Security
  SESSION_TIMEOUT_MS: 3600 * 1000,   // 1 hour
  CSRF_EXPIRY_SEC:    3600,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000,   // 15 minutes

  // RTK Query cache lifetimes (seconds)
  CACHE: {
    METRICS:    30,
    READINGS:   60,
    EF_FACTORS: 3600,
    GWP:        86400,
  },

  // Routes
  ROUTES: {
    HOME:       "/dashboard",
    LOGIN:      "/auth/login",
    REGISTER:   "/auth/register",
    DASHBOARD:  "/dashboard",
    INVENTORY:  "/inventory",
    AI:         "/ai",
    FACTORS:    "/factors",
    REPORTS:    "/reports",
    CBAM:       "/cbam",
    SETTINGS:   "/settings",
  },

  // Toast durations
  TOAST: {
    SUCCESS: 4000,
    ERROR:   8000,
    WARNING: 6000,
    INFO:    4000,
  },
} as const;
