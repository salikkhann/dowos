import { createBrowserClient, createServerClient } from "@supabase/ssr";

// ── browser client (use in Client Components / hooks) ──
// Generic omitted intentionally: Next.js "use client" boundary + Turbopack
// prevent the Database type from flowing through createBrowserClient reliably.
// Use the User / UserPreferences types from @/types/database for assertions
// after each query (see onboarding page for the pattern).
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ── server client (use in Server Components / Route Handlers / middleware) ──
// Next.js 16: cookies() is async – caller must await it first.
//   import { cookies } from "next/headers";
//   const cookieStore = await cookies();
//   const supabase = createSupabaseServerClient(cookieStore);
export function createSupabaseServerClient(
  cookieStore: Awaited<ReturnType<typeof import("next/headers").cookies>>,
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
}
