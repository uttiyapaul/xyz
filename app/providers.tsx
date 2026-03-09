"use client";

/**
 * app/providers.tsx
 * Client-side providers: Redux, error boundary, Supabase auth listener.
 * Wrapped around (dashboard) layout to provide store access.
 */

import { useRef, useEffect } from "react";
import { Provider }          from "react-redux";
import { createStore }       from "../store";
import type { AppStore }     from "../store";
import { setUser, setSession, setCsrfToken } from "../store/slices/auth.slice";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Redux provider — creates a store per server render (for SSR compat)
// ---------------------------------------------------------------------------
function ReduxProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = createStore();
  return <Provider store={storeRef.current}>{children}</Provider>;
}

// ---------------------------------------------------------------------------
// Supabase auth listener — syncs session to Redux
// ---------------------------------------------------------------------------
function SupabaseAuthSync({ children }: { children: React.ReactNode }) {
  // This component only runs in ReduxProvider context
  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Error Boundary — catches uncaught render errors
// ---------------------------------------------------------------------------
import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryState { hasError: boolean; error: Error | null }

class GlobalErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production: send to monitoring (Sentry, etc.)
    if (process.env.NODE_ENV === "development") {
      console.error("[GlobalErrorBoundary]", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#04040A",
          fontFamily: "system-ui, sans-serif",
          padding: "40px",
        }}>
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>⬡</div>
            <h1 style={{ color: "#FF2D55", fontWeight: 700, marginBottom: 8, fontSize: "1.5rem" }}>
              Unexpected Error
            </h1>
            <p style={{ color: "rgba(221,221,239,.5)", marginBottom: 24, lineHeight: 1.6 }}>
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 24px",
                background: "rgba(0,255,136,.08)",
                border: "1px solid rgba(0,255,136,.2)",
                borderRadius: 8,
                color: "#00FF88",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Root Providers — compose all providers here
// ---------------------------------------------------------------------------
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GlobalErrorBoundary>
      <ReduxProvider>
        <AuthSync>
          {children}
        </AuthSync>
      </ReduxProvider>
    </GlobalErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// AuthSync — inside Redux context, syncs Supabase → Redux
// ---------------------------------------------------------------------------
function AuthSync({ children }: { children: React.ReactNode }) {
  // Dynamically import store hooks to avoid circular deps
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read CSRF token from cookie
    const csrf = document.cookie
      .split("; ")
      .find((c) => c.startsWith("__csrf_token="))
      ?.split("=")[1] ?? null;

    // Initial session sync — import store dynamically to avoid SSR issues
    import("../store").then(({ store }) => {
      if (csrf) store.dispatch(setCsrfToken(csrf));

      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          store.dispatch(setUser({
            id:         user.id,
            email:      user.email ?? "",
            full_name:  (user.user_metadata?.full_name as string) ?? "",
            avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
            role:       "client_admin",     // Default; override from DB profile
            org_id:     null,
            org_name:   null,
            is_active:  true,
            last_login: user.last_sign_in_at ?? null,
            mfa_enabled: false,
            created_at: user.created_at,
          }));
        }
      });

      // Auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          store.dispatch(setUser(null));
          store.dispatch(setSession(null));
        } else if (session?.user) {
          store.dispatch(setUser({
            id:         session.user.id,
            email:      session.user.email ?? "",
            full_name:  (session.user.user_metadata?.full_name as string) ?? "",
            avatar_url: (session.user.user_metadata?.avatar_url as string) ?? null,
            role:       "client_admin",
            org_id:     null,
            org_name:   null,
            is_active:  true,
            last_login: session.user.last_sign_in_at ?? null,
            mfa_enabled: false,
            created_at: session.user.created_at,
          }));
        }
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  return <>{children}</>;
}
