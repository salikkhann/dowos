/**
 * App Layout (authenticated routes)
 * Uses NavShell to render BottomNav (mobile) + Sidebar (desktop)
 * Responsive at 1024px (lg: breakpoint)
 */

import { NavShell } from "@/components/nav/NavShell";
import { ThemeProvider } from "next-themes";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user info for sidebar (role, Pro status, name, avatar)
  let userRole = "student";
  let isPro = false;
  let userName = "Student";
  let userAvatar: string | undefined;

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignored
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Fetch user profile
      const { data: profile } = await supabase
        .from("users")
        .select("role, is_pro, full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        userRole = profile.role || "student";
        isPro = profile.is_pro || false;
        userName = profile.full_name || user.email?.split("@")[0] || "Student";
        userAvatar = profile.avatar_url || undefined;
      }
    }
  } catch (err) {
    console.error("[AppLayout] Error fetching user:", err);
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NavShell
        userRole={userRole}
        isPro={isPro}
        userName={userName}
        userAvatar={userAvatar}
      >
        <div className="p-4 md:p-6">
          {children}
        </div>
      </NavShell>
    </ThemeProvider>
  );
}
