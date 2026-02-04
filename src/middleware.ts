import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth middleware – runs on every request.
 *
 * Rules:
 *   1. Refresh the Supabase session cookie so it stays alive.
 *   2. /dashboard and any route under /(app)/* require:
 *        a) an authenticated session, AND
 *        b) a users row with verification_status = "verified"
 *      If not → redirect to /onboarding (or /login if no session at all).
 *   3. /onboarding requires an authenticated session only.
 *        If the user is already verified → redirect to /dashboard.
 *   4. /login and /signup: if already authenticated + verified → /dashboard.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: new Headers(request.headers) },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request: { headers: new Headers(request.headers) },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Always refresh session (keeps cookie alive)
  const { data: { session } } = await supabase.auth.getSession();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // ── public pages (no auth required) ──
  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    // If already fully verified, bounce to dashboard
    if (session) {
      const { data: user } = await supabase
        .from("users")
        .select("verification_status, onboarding_step")
        .eq("id", session.user.id)
        .single();

      if (user?.verification_status === "verified" && user?.onboarding_step === 4) {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
    return response;
  }

  // ── onboarding ──
  if (pathname === "/onboarding") {
    if (!session) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    // Already verified? Skip onboarding.
    const { data: user } = await supabase
      .from("users")
      .select("verification_status, onboarding_step")
      .eq("id", session.user.id)
      .single();

    if (user?.verification_status === "verified" && user?.onboarding_step === 4) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // ── protected routes (everything else: dashboard, education, ai, maps, community, admin …) ──
  if (!session) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const { data: user } = await supabase
    .from("users")
    .select("verification_status, onboarding_step")
    .eq("id", session.user.id)
    .single();

  if (!user || user.verification_status !== "verified" || user.onboarding_step !== 4) {
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static  (static files)
     *  - _next/image   (image optimisation)
     *  - favicon.ico   (browser icon)
     *  - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
