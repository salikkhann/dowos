import { createBrowserClient, createServerClient } from "@supabase/ssr";

// ── types (will be replaced by generated types later) ──
export type Database = Record<string, never>;

// ── browser client (use in Client Components / hooks) ──
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
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
  return createServerClient<Database>(
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
