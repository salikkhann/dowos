/**
 * Cost rates for all AI models + services
 * Units: $ per 1K tokens (or per call for fixed-cost services)
 * Last updated: 2026-02-06
 *
 * Reference: docs/tech-stack-audit.md §3 "API Cost Summary"
 */

export const RATE_LIMITS = {
  gemini_flash: {
    input: 0.075, // $ per 1K input tokens
    output: 0.3, // $ per 1K output tokens
    model: "gemini-2.5-flash",
    tier: "interactive",
  },
  gemini_flash_lite: {
    input: 0.05, // $ per 1K input tokens
    output: 0.2, // $ per 1K output tokens
    model: "gemini-2.5-flash-lite",
    tier: "batch",
  },
  gemini_pro: {
    input: 3.0, // $ per 1M input tokens
    output: 6.0, // $ per 1M output tokens
    model: "gemini-2.5-pro",
    tier: "extraction",
  },
  deepseek_r1: {
    input: 0.55, // $ per 1M input tokens (cache-write)
    output: 2.19, // $ per 1M output tokens
    model: "deepseek-reasoner",
    tier: "reasoning",
  },
  gemini_embedding: {
    input: 0.0002, // $ per 1K input tokens (for embedding requests)
    output: 0, // No output cost
    model: "text-embedding-004",
    tier: "embedding",
  },
  groq_whisper: {
    per_minute: 0.0033, // $0.2/hour = $0.0033 per minute
    model: "whisper-large-v3-turbo",
    tier: "stt",
  },
  google_tts: {
    per_char: 0.0000135, // $4 per 1M characters
    model: "google-cloud-tts",
    tier: "tts",
  },
  google_geocoding: {
    per_call: 0.005, // $5 per 1000 calls ($.005 each)
    model: "google-geocoding",
    tier: "maps",
  },
};

/**
 * Calculate cost for a single API call
 *
 * @param model - Model key from RATE_LIMITS (e.g., "gemini_flash")
 * @param inputTokens - Number of input tokens (optional, depends on model type)
 * @param outputTokens - Number of output tokens (optional, depends on model type)
 * @returns Cost in USD
 */
export function calculateCost(
  model: keyof typeof RATE_LIMITS,
  inputTokens?: number,
  outputTokens?: number
): number {
  const rate = RATE_LIMITS[model];
  if (!rate) throw new Error(`Unknown model: ${model}`);

  switch (rate.tier) {
    case "interactive":
    case "batch":
    case "extraction":
    case "embedding": {
      const rateWithTokens = rate as { input: number; output: number };
      const input = (inputTokens ?? 0) * (rateWithTokens.input / 1000);
      const output = (outputTokens ?? 0) * (rateWithTokens.output / 1000);
      return input + output;
    }

    case "stt": {
      // For Groq Whisper: pass duration in seconds as inputTokens
      const rateWithMinute = rate as { per_minute: number };
      const minutes = (inputTokens ?? 0) / 60;
      return minutes * (rateWithMinute.per_minute ?? 0);
    }

    case "tts": {
      // For Google TTS: pass character count as inputTokens
      const rateWithChar = rate as { per_char: number };
      const chars = inputTokens ?? 0;
      return chars * (rateWithChar.per_char ?? 0);
    }

    case "maps": {
      // For Google Geocoding: fixed cost per call
      const rateWithCall = rate as { per_call: number };
      return rateWithCall.per_call ?? 0;
    }

    default:
      return 0;
  }
}

/**
 * Summary of all rate limits for reference
 */
export const RATE_SUMMARY = {
  daily_budget_soft_limit: 0, // $0 — soft limit on API costs per day (informational)
  monthly_budget_estimate: 95, // ~$95–130 at 500 DAU (from tech-stack-audit.md)
  free_tier_ai_calls: { soft: 2, hard: 4 }, // Soft/hard AI limits per day (from tech-stack-audit.md)
  pro_tier_ai_calls: { soft: Infinity, hard: Infinity }, // Unlimited (from tech-stack-audit.md)
};
