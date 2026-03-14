import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Request-scoped Supabase client backed by the current browser cookies.
 *
 * Why this helper exists:
 * - Service-role clients are correct for privileged reads/writes, but they do
 *   not tell us who is performing the action.
 * - Admin assignment flows need the authenticated actor so we can enforce
 *   tier-based assignment limits and write `assigned_by` correctly.
 * - Keeping the cookie wiring here prevents every server action from
 *   re-implementing the fragile SSR cookie bridge.
 */
export async function createRequestSupabaseClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            /**
             * Server Components cannot always mutate cookies. That is fine for
             * read-mostly helpers like this one because the request proxy will
             * perform the durable auth cookie refresh on the next navigation.
             */
          }
        });
      },
    },
  });
}
