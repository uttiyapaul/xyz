import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Browser-only Supabase client for client components and hooks.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const browserSupabaseConfigError = !supabaseUrl
  ? "Missing NEXT_PUBLIC_SUPABASE_URL"
  : !supabaseAnonKey
    ? "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY"
    : null;

function createMissingConfigClient(message: string): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get() {
      throw new Error(message);
    },
  });
}

export const supabase =
  browserSupabaseConfigError == null
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : createMissingConfigClient(browserSupabaseConfigError);
