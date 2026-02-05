/**
 * API call logging helper
 * Server-only function to track all AI/API calls for cost monitoring + analytics
 *
 * Usage:
 *   import { logApiCall } from '@/lib/api-logger'
 *   await logApiCall('gemini_flash', 'mcq-solver', { input: 150, output: 450 })
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { calculateCost } from "./api-rates";

/**
 * Log an API call to the `api_usage_log` table
 *
 * @param model - Model key (must match RATE_LIMITS)
 * @param feature - Feature name (e.g., 'mcq-solver', 'viva-bot-stt', 'ai-tutor')
 * @param tokens - Token counts: { input?: number, output?: number }
 *
 * @returns Promise<{ success: boolean, cost?: number, error?: string }>
 */
export async function logApiCall(
  model: string,
  feature: string,
  tokens?: { input?: number; output?: number }
): Promise<{ success: boolean; cost?: number; error?: string }> {
  try {
    // Calculate cost
    const cost = calculateCost(
      model as keyof typeof import("./api-rates").RATE_LIMITS,
      tokens?.input,
      tokens?.output
    );

    // Get session user ID
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
              // The `setAll` method was called from a Server Component
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Insert log entry
    const { error } = await supabase.from("api_usage_log").insert({
      user_id: user.id,
      model,
      feature,
      input_tokens: tokens?.input ?? 0,
      output_tokens: tokens?.output ?? 0,
      cost_usd: cost,
    });

    if (error) {
      console.error("[logApiCall] DB error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      cost,
    };
  } catch (err) {
    console.error("[logApiCall] Unexpected error:", err);

    // Log to Sentry if available
    if (typeof window === "undefined") {
      try {
        const Sentry = await import("@sentry/nextjs");
        Sentry.captureException(err);
      } catch {
        // Sentry not available or not initialized
      }
    }

    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Log a user action event (login, logout, upload, etc.)
 *
 * @param event_type - Type of event (e.g., 'user_login', 'id_upload', 'content_upload')
 * @param metadata - Optional metadata object
 *
 * @returns Promise<{ success: boolean }>
 */
export async function logAppEvent(
  event_type: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
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
              // Middleware will handle session refresh
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const { error } = await supabase.from("app_events").insert({
      user_id: user.id,
      event_type,
      metadata: metadata ?? {},
    });

    if (error) {
      console.error("[logAppEvent] DB error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (err) {
    console.error("[logAppEvent] Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
