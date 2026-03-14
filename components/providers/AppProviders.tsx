"use client";

import { Component, type ErrorInfo, type ReactNode, useEffect } from "react";
import { Provider } from "react-redux";

import { AuthProvider } from "@/context/AuthContext";
import { getUserPrimaryRole } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase/client";
import { store } from "@/store";
import { setCsrfToken, setSession, setUser } from "@/store/slices/auth.slice";
import { setTheme } from "@/store/slices/ui.slice";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

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
    if (process.env.NODE_ENV === "development") {
      console.error("[GlobalErrorBoundary]", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#04040A",
            fontFamily: "system-ui, sans-serif",
            padding: "40px",
          }}
        >
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>[!]</div>
            <h1
              style={{
                color: "#FF2D55",
                fontWeight: 700,
                marginBottom: 8,
                fontSize: "1.5rem",
              }}
            >
              Unexpected Error
            </h1>
            <p
              style={{
                color: "rgba(221, 221, 239, 0.5)",
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
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

function AuthSync({ children }: { children: ReactNode }) {
  useEffect(() => {
    const csrf =
      document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith("__csrf_token="))
        ?.split("=")[1] ?? null;

    const savedTheme = localStorage.getItem("app-theme") as
      | "dark"
      | "light"
      | null;

    if (csrf) {
      store.dispatch(setCsrfToken(csrf));
    }

    if (savedTheme) {
      store.dispatch(setTheme(savedTheme));
      document.documentElement.dataset.theme = savedTheme;
    }

    let isMounted = true;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted || !session?.user) {
        return;
      }

      const role = getUserPrimaryRole(session.user);

      store.dispatch(
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          full_name: (session.user.user_metadata?.full_name as string) ?? "",
          avatar_url: (session.user.user_metadata?.avatar_url as string) ?? null,
          role: role as any,
          org_id: null,
          org_name: null,
          is_active: true,
          last_login: session.user.last_sign_in_at ?? null,
          mfa_enabled: false,
          created_at: session.user.created_at,
        }),
      );

      store.dispatch(
        setSession({
          user: session.user as any,
          access_token: session.access_token,
          refresh_token: session.refresh_token ?? "",
          expires_at: new Date(session.expires_at ?? 0).getTime(),
        }),
      );
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) {
        return;
      }

      if (event === "SIGNED_OUT" || !session) {
        store.dispatch(setUser(null));
        store.dispatch(setSession(null));
        return;
      }

      const role = getUserPrimaryRole(session.user);

      store.dispatch(
        setSession({
          user: session.user as any,
          access_token: session.access_token,
          refresh_token: session.refresh_token ?? "",
          expires_at: new Date(session.expires_at ?? 0).getTime(),
        }),
      );

      store.dispatch(
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          full_name: (session.user.user_metadata?.full_name as string) ?? "",
          avatar_url: (session.user.user_metadata?.avatar_url as string) ?? null,
          role: role as any,
          org_id: null,
          org_name: null,
          is_active: true,
          last_login: session.user.last_sign_in_at ?? null,
          mfa_enabled: false,
          created_at: session.user.created_at,
        }),
      );
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GlobalErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <AuthSync>{children}</AuthSync>
        </AuthProvider>
      </Provider>
    </GlobalErrorBoundary>
  );
}
