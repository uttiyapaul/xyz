import { createClient } from "@supabase/supabase-js";

// These values come from your .env.local file (see STEP 2b below)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!supabaseAnonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage so users stay logged in on refresh
    persistSession: true,
    autoRefreshToken: true,
    // Required for JWT custom claims to propagate correctly
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      // Identifies your app in Supabase logs
      "x-application-name": "ghg-platform",
    },
  },
});

// Typed helper for server-side calls (Next.js Server Components / API Routes)
// Do NOT use this in browser code — it uses the service role key
export function createServerSupabaseClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}