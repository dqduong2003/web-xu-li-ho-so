import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

// Auth-aware, RLS-scoped Supabase client for Server Components / Server
// Actions / Route Handlers. Unlike lib/supabase/admin.ts (the privileged
// service-role client used for server-trusted writes), this client carries
// the signed-in user's own session, so any query against it is subject to
// Row Level Security — e.g. student_profiles' "view own row" policy.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Components can't write cookies — proxy.ts already
            // refreshed the session cookie before this ran.
          }
        },
      },
    },
  );
}
