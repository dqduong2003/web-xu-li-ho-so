import { getAuthenticatedUser, type AdminRole, type AuthUser } from "@/lib/auth";

export type { AdminRole };

// proxy.ts already redirects requests without an admin/nhan_vien role away
// from /admin before they reach a page, so this is a defensive fallback.
export async function getAuthenticatedAdmin(): Promise<AuthUser | null> {
  const user = await getAuthenticatedUser();
  if (!user || !user.role) return null;
  return user;
}
