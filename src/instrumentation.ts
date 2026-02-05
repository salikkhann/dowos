/**
 * Sentry initialization for error tracking + monitoring
 * Called automatically by Next.js on app startup
 *
 * Configuration reference: https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NODE_ENV === "development") {
    return; // Disable Sentry in local development
  }

  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn("[Sentry] No DSN configured, error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || "production",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
}
