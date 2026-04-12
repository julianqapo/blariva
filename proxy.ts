import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = ["/", "/about"];

const AUTH_ROUTES = ["/admin", "/member", "/verify"];

const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.includes(pathname);

const isAuthRoute = (pathname: string) =>
  AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  // Block direct access to /verify without valid params
  if (pathname === "/verify") {
    const email = request.nextUrl.searchParams.get("email");
    const role = request.nextUrl.searchParams.get("role");

    const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidRole = role === "admin" || role === "member";

    if (!isValidEmail || !isValidRole) {
      const redirectTo = isValidRole ? `/${role}` : "/admin";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  // Public routes — no auth needed, skip getUser entirely
  if (isPublicRoute(pathname)) {
    return supabaseResponse;
  }

  // Fetch user for protected + auth route checks
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Logged-in user on auth pages → send to dashboard
  if (user && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Not logged in on protected pages → send to admin login
  if (!user && !isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};