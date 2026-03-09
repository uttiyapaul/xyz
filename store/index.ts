/**
 * CarbonIQ Platform — store/index.ts
 * Redux Toolkit store — enterprise configuration.
 * Features: RTK Query, audit middleware, error boundary middleware,
 *           session sync, selective persistence.
 */

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { authReducer }    from "./slices/auth.slice";
import { ghgReducer }     from "./slices/ghg.slice";
import { uiReducer }      from "./slices/ui.slice";
import { aiReducer }      from "./slices/ai.slice";
import { ghgApi }         from "./api/ghg.api";
import { auditMiddleware } from "./middleware/audit.middleware";
import { securityMiddleware } from "./middleware/security.middleware";

// ---------------------------------------------------------------------------
// Root reducer
// ---------------------------------------------------------------------------
const rootReducer = combineReducers({
  auth:       authReducer,
  ghg:        ghgReducer,
  ui:         uiReducer,
  ai:         aiReducer,
  [ghgApi.reducerPath]: ghgApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// ---------------------------------------------------------------------------
// Store factory — allows creating isolated instances for testing
// ---------------------------------------------------------------------------
export function createStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore non-serializable values in specific action paths
          ignoredActions: [
            "auth/setSession",
            "ghg/setRealtimeSubscription",
          ],
          ignoredPaths: [
            "auth.session.expires_at",
          ],
        },
        thunk: {
          extraArgument: {
            // Inject shared dependencies into thunks
            supabaseUrl: typeof window !== "undefined"
              ? process.env.NEXT_PUBLIC_SUPABASE_URL
              : "",
          },
        },
      })
        .concat(ghgApi.middleware)
        .concat(auditMiddleware)
        .concat(securityMiddleware),

    devTools: process.env.NODE_ENV !== "production"
      ? {
          name:            "CarbonIQ Platform",
          maxAge:          50,
          latency:         500,
          actionsBlacklist: [
            "ui/setToast",     // Too noisy
            ghgApi.reducerPath + "/executeQuery",
          ],
        }
      : false,  // CRITICAL: Disable Redux DevTools in production
  });
}

// Singleton store for the app
export const store = createStore();

export type AppStore    = typeof store;
export type AppDispatch = typeof store.dispatch;
