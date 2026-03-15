"use client";

import { Component, type ErrorInfo, type ReactNode, useEffect } from "react";
import { Provider } from "react-redux";
import type { Session, User } from "@supabase/supabase-js";

import styles from "@/components/providers/AppProviders.module.css";
import { SessionLockBoundary } from "@/components/security/SessionLockBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { getUserPrimaryRole } from "@/lib/auth/roles";
import { browserSupabaseConfigError, supabase } from "@/lib/supabase/client";
import { store } from "@/store";
import { setCsrfToken, setSession, setUser } from "@/store/slices/auth.slice";
import { setTheme } from "@/store/slices/ui.slice";
import type { AuthSession, UserProfile } from "@/types/auth.types";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

function ProviderErrorState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className={styles.errorRoot}>
      <div className={styles.errorCard}>
        <p className={styles.errorIcon}>[!]</p>
        <h1 className={styles.errorTitle}>{title}</h1>
        <p className={styles.errorMessage}>{message}</p>
        <button type="button" className={styles.errorButton} onClick={onAction}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
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
        <ProviderErrorState
          title="Unexpected Error"
          message={this.state.error?.message ?? "An unexpected error occurred."}
          actionLabel="Reload Application"
          onAction={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}

function toUserProfile(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email ?? "",
    full_name: (user.user_metadata?.full_name as string) ?? "",
    avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
    role: getUserPrimaryRole(user),
    org_id: null,
    org_name: null,
    is_active: true,
    last_login: user.last_sign_in_at ?? null,
    mfa_enabled: false,
    created_at: user.created_at,
  };
}

function toAuthSession(session: Session): AuthSession {
  return {
    user: toUserProfile(session.user),
    access_token: session.access_token,
    refresh_token: session.refresh_token ?? "",
    expires_at: new Date(session.expires_at ?? 0).getTime(),
  };
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

      store.dispatch(setUser(toUserProfile(session.user)));
      store.dispatch(setSession(toAuthSession(session)));
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

      store.dispatch(setSession(toAuthSession(session)));
      store.dispatch(setUser(toUserProfile(session.user)));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  if (browserSupabaseConfigError) {
    return (
      <ProviderErrorState
        title="Supabase Configuration Missing"
        message={`The deployed app is missing ${browserSupabaseConfigError}. Add the public Supabase environment variables in Vercel and redeploy.`}
        actionLabel="Reload Application"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <GlobalErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <AuthSync>
            <SessionLockBoundary>{children}</SessionLockBoundary>
          </AuthSync>
        </AuthProvider>
      </Provider>
    </GlobalErrorBoundary>
  );
}
