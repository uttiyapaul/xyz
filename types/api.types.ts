/**
 * CarbonIQ Platform — types/api.types.ts
 * Standardized API response envelope — microservice-ready.
 * All services return ApiResponse<T> for consistent error handling.
 */

// ---------------------------------------------------------------------------
// Standard response envelope
// ---------------------------------------------------------------------------
export interface ApiResponse<T = unknown> {
  success:    boolean;
  data:       T | null;
  error:      ApiError | null;
  meta:       ApiMeta;
}

export interface ApiError {
  code:       string;        // Machine-readable e.g. "GHG_READING_NOT_FOUND"
  message:    string;        // Human-readable
  field:      string | null; // For validation errors
  details:    unknown | null;
  trace_id:   string | null;
}

export interface ApiMeta {
  request_id:  string;
  timestamp:   string;       // ISO 8601
  version:     string;       // API version e.g. "v1"
  duration_ms: number | null;
  pagination:  PaginationMeta | null;
}

export interface PaginationMeta {
  page:        number;
  page_size:   number;
  total_count: number;
  total_pages: number;
  has_next:    boolean;
  has_prev:    boolean;
}

// ---------------------------------------------------------------------------
// Query parameters
// ---------------------------------------------------------------------------
export interface PaginationParams {
  page?:      number;
  page_size?: number;
  sort_by?:   string;
  sort_dir?:  "asc" | "desc";
}

export interface DateRangeParams {
  from?: string;   // YYYY-MM-DD
  to?:   string;
}

// ---------------------------------------------------------------------------
// Service configuration
// ---------------------------------------------------------------------------
export interface ServiceConfig {
  base_url:    string;
  timeout_ms:  number;
  retry_count: number;
  api_version: string;
}

// Known error codes
export const API_ERROR_CODES = {
  // Auth
  AUTH_REQUIRED:          "AUTH_REQUIRED",
  AUTH_EXPIRED:           "AUTH_EXPIRED",
  AUTH_INVALID:           "AUTH_INVALID",
  MFA_REQUIRED:           "MFA_REQUIRED",
  PERMISSION_DENIED:      "PERMISSION_DENIED",
  // Validation
  VALIDATION_ERROR:       "VALIDATION_ERROR",
  SCHEMA_INVALID:         "SCHEMA_INVALID",
  // Resources
  NOT_FOUND:              "NOT_FOUND",
  CONFLICT:               "CONFLICT",
  // Rate limiting
  RATE_LIMITED:           "RATE_LIMITED",
  QUOTA_EXCEEDED:         "QUOTA_EXCEEDED",
  // Domain
  GHG_READING_INVALID:    "GHG_READING_INVALID",
  EF_NOT_FOUND:           "EF_NOT_FOUND",
  EF_SUPERSEDED:          "EF_SUPERSEDED",
  CBAM_CALC_ERROR:        "CBAM_CALC_ERROR",
  AI_SERVICE_UNAVAILABLE: "AI_SERVICE_UNAVAILABLE",
  // Infrastructure
  DB_ERROR:               "DB_ERROR",
  INTERNAL_ERROR:         "INTERNAL_ERROR",
  CSRF_INVALID:           "CSRF_INVALID",
} as const;

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];
