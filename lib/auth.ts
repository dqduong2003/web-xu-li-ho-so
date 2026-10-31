import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// Admin-dashboard role. Only settable via the Supabase Admin API (service
// role), so a signed-in user can never grant it to themselves — unlike
// user_metadata, app_metadata is trusted and also readable from RLS policies
// via auth.jwt(), which is what public.auth_role() reads in the database.
export type AdminRole = "admin" | "nhan_vien";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  role: AdminRole | null;
}

function parseAdminRole(value: unknown): AdminRole | null {
  return value === "admin" || value === "nhan_vien" ? value : null;
}

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const metadata = user.user_metadata as Record<string, unknown> | null;
  const name =
    (typeof metadata?.full_name === "string" && metadata.full_name) ||
    (typeof metadata?.name === "string" && metadata.name) ||
    null;

  return {
    id: user.id,
    email: user.email ?? null,
    name,
    role: parseAdminRole(user.app_metadata?.role),
  };
}
