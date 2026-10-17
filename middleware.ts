import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "student_session";

export function middleware(request: NextRequest) {
  if (request.cookies.has(COOKIE_NAME)) {
    return NextResponse.next();
  }

  // Set on the forwarded request too, so the Route Handler / Server Component
  // that handles this same request already sees the cookie — setting it only
  // on the response would only take effect starting from the *next* request.
  const token = crypto.randomUUID();
  request.cookies.set(COOKIE_NAME, token);

  const response = NextResponse.next({ request });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: ["/portal", "/api/portal/:path*"],
};
