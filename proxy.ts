import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function hasAdminRole(user: { app_metadata?: Record<string, unknown> } | null): boolean {
  const role = user?.app_metadata?.role;
  return role === "admin" || role === "nhan_vien";
}

// Refreshes the Supabase Auth session cookie on every matched request (per
// @supabase/ssr's documented pattern — Server Components can't write
// cookies, so the refresh has to happen here), and gates:
// - /portal + its API routes behind a logged-in Google account
// - /admin behind a logged-in, email+password account that has an
//   admin/nhan_vien role in app_metadata (only settable via the Supabase
//   Admin API, so a user can never grant it to themselves)
// Proxy defaults to the Node.js runtime in this Next.js version, and a
// Server Function is handled as a POST to the route it's used on, so this
// also covers the admin Server Actions (delete/approve/reject), not just
// page loads.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPortalApi = pathname.startsWith("/api/portal/");

  if (!user && (pathname === "/portal" || isPortalApi)) {
    if (isPortalApi) {
      return NextResponse.json({ error: "Bạn cần đăng nhập để sử dụng tính năng này." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLogin = pathname === "/admin/login";

  if (isAdminRoute && !isAdminLogin) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (!hasAdminRole(user)) {
      return NextResponse.redirect(new URL("/admin/login?error=unauthorized", request.url));
    }
  }

  if (isAdminLogin && user && hasAdminRole(user)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/portal", "/api/portal/:path*", "/login", "/auth/callback", "/admin", "/admin/:path*"],
};
