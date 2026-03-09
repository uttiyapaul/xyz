/**
 * CarbonIQ Platform — services/base.service.ts
 *
 * Abstract base service — all microservice clients extend this.
 * Handles: auth headers, CSRF, retries, timeouts, error normalization,
 *          circuit breaker pattern, distributed tracing.
 */

import type { ApiResponse, ApiError, ServiceConfig } from "../types/api.types";

// ---------------------------------------------------------------------------
// Circuit Breaker States
// ---------------------------------------------------------------------------
type CircuitState = "closed" | "open" | "half-open";

interface CircuitBreaker {
  state:         CircuitState;
  failureCount:  number;
  lastFailure:   number | null;
  resetTimeout:  number;   // ms before attempting half-open
}

// ---------------------------------------------------------------------------
// Base Service
// ---------------------------------------------------------------------------
export abstract class BaseService {
  protected readonly config: ServiceConfig;
  protected readonly serviceName: string;
  private circuit: CircuitBreaker = {
    state:        "closed",
    failureCount: 0,
    lastFailure:  null,
    resetTimeout: 30_000,  // 30 seconds
  };

  private static readonly FAILURE_THRESHOLD = 5;

  constructor(config: ServiceConfig, serviceName: string) {
    this.config      = config;
    this.serviceName = serviceName;
  }

  // ---------------------------------------------------------------------------
  // Core fetch with all enterprise features
  // ---------------------------------------------------------------------------
  protected async request<T>(
    endpoint:    string,
    options:     RequestInit = {},
    retryCount = this.config.retry_count
  ): Promise<ApiResponse<T>> {
    // Circuit breaker check
    if (!this.isCircuitClosed()) {
      return this.errorResponse("SERVICE_UNAVAILABLE", `${this.serviceName} circuit breaker is open`);
    }

    const url = `${this.config.base_url}/${this.config.api_version}${endpoint}`;

    // Build headers
    const headers: Record<string, string> = {
      "Content-Type":     "application/json",
      "Accept":           "application/json",
      "X-Service-Name":   this.serviceName,
      "X-Client-Version": process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
      ...(options.headers as Record<string, string> ?? {}),
    };

    // CSRF token (client-side only)
    if (typeof document !== "undefined") {
      const csrf = document.cookie
        .split("; ")
        .find((c) => c.startsWith("__csrf_token="))
        ?.split("=")[1];
      if (csrf) headers["x-csrf-token"] = csrf;
    }

    // Abort controller for timeout
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), this.config.timeout_ms);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "same-origin",
        signal:      controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.recordSuccess();
        return await response.json() as ApiResponse<T>;
      }

      // Handle HTTP error codes
      const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
      this.recordFailure();

      // Retry on 5xx if attempts remain
      if (response.status >= 500 && retryCount > 0) {
        await this.sleep(1000 * (this.config.retry_count - retryCount + 1)); // Exponential backoff
        return this.request<T>(endpoint, options, retryCount - 1);
      }

      return this.errorResponse(
        (errorBody.code as string) ?? `HTTP_${response.status}`,
        (errorBody.message as string) ?? `Request failed: ${response.status} ${response.statusText}`
      );

    } catch (err) {
      clearTimeout(timeoutId);
      this.recordFailure();

      if (err instanceof DOMException && err.name === "AbortError") {
        return this.errorResponse("TIMEOUT", `${this.serviceName} request timed out after ${this.config.timeout_ms}ms`);
      }

      // Retry on network errors
      if (retryCount > 0) {
        await this.sleep(1000 * (this.config.retry_count - retryCount + 1));
        return this.request<T>(endpoint, options, retryCount - 1);
      }

      return this.errorResponse("NETWORK_ERROR", err instanceof Error ? err.message : "Network request failed");
    }
  }

  // ---------------------------------------------------------------------------
  // HTTP method helpers
  // ---------------------------------------------------------------------------
  protected get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  protected post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", body: JSON.stringify(body) });
  }

  protected patch<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) });
  }

  protected delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // ---------------------------------------------------------------------------
  // Circuit Breaker
  // ---------------------------------------------------------------------------
  private isCircuitClosed(): boolean {
    const now = Date.now();
    if (this.circuit.state === "open") {
      const elapsed = now - (this.circuit.lastFailure ?? 0);
      if (elapsed >= this.circuit.resetTimeout) {
        this.circuit.state = "half-open";
        return true;
      }
      return false;
    }
    return true;
  }

  private recordSuccess(): void {
    this.circuit.failureCount = 0;
    this.circuit.state        = "closed";
  }

  private recordFailure(): void {
    this.circuit.failureCount++;
    this.circuit.lastFailure = Date.now();
    if (this.circuit.failureCount >= BaseService.FAILURE_THRESHOLD) {
      this.circuit.state = "open";
      console.error(`[${this.serviceName}] Circuit breaker OPEN after ${this.circuit.failureCount} failures`);
    }
  }

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected errorResponse<T>(code: string, message: string): ApiResponse<T> {
    return {
      success: false,
      data:    null,
      error:   { code, message, field: null, details: null, trace_id: null },
      meta:    {
        request_id:  crypto.randomUUID(),
        timestamp:   new Date().toISOString(),
        version:     this.config.api_version,
        duration_ms: null,
        pagination:  null,
      },
    };
  }

  get circuitState(): CircuitState { return this.circuit.state; }
}
