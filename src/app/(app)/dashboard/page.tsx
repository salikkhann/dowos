/**
 * Dashboard Page (authenticated landing page)
 * Displays:
 * - Time-aware greeting
 * - 6 skeleton widget stubs (will be wired with data in later phases)
 *   1. Exam Countdown
 *   2. Timetable (mini)
 *   3. Attendance (quick-mark)
 *   4. Announcements
 *   5. Prayers
 *   6. Lost & Found
 *
 * Reference: docs/decisions/ui-page-structure.md §3, docs/decisions/profile-card-ux.md §1
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  // Get user for greeting
  let firstName = "Student";

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
      const { data: profile } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        firstName = profile.full_name.split(" ")[0];
      }
    }
  } catch (err) {
    console.error("[Dashboard] Error fetching user:", err);
  }

  // Time-aware greeting
  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  else if (hour >= 17) greeting = "Good evening";
  else if (hour >= 21 || hour < 6) greeting = "Good night";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white">
          {greeting}, {firstName}
        </h1>
        <p className="text-navy-400 dark:text-navy-300 text-sm">
          Welcome back to DowOS
        </p>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Widget 1: Exam Countdown */}
        <Card className="p-4">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-navy-700 dark:text-white">
              Exam Countdown
            </h2>
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
          </div>
        </Card>

        {/* Widget 2: Timetable Mini */}
        <Card className="p-4">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-navy-700 dark:text-white">
              Today's Classes
            </h2>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded" />
              <Skeleton className="h-10 w-full rounded" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </div>
        </Card>

        {/* Widget 3: Attendance Quick-Mark */}
        <Card className="p-4">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-navy-700 dark:text-white">
              Attendance
            </h2>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1 rounded" />
                <Skeleton className="h-8 flex-1 rounded" />
              </div>
            </div>
          </div>
        </Card>

        {/* Widget 4: Announcements */}
        <Card className="p-4">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-navy-700 dark:text-white">
              Announcements
            </h2>
            <div className="space-y-2">
              <Skeleton className="h-8 w-full rounded" />
              <Skeleton className="h-8 w-3/4 rounded" />
              <Skeleton className="h-8 w-4/5 rounded" />
            </div>
          </div>
        </Card>

        {/* Widget 5: Prayers */}
        <Card className="p-4">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-navy-700 dark:text-white">
              Prayer Times
            </h2>
            <div className="space-y-2">
              <Skeleton className="h-6 w-full rounded" />
              <Skeleton className="h-6 w-full rounded" />
              <Skeleton className="h-6 w-full rounded" />
            </div>
          </div>
        </Card>

        {/* Widget 6: Lost & Found */}
        <Card className="p-4">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-navy-700 dark:text-white">
              Lost & Found
            </h2>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded" />
              <Skeleton className="h-12 w-full rounded" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
