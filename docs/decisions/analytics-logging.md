# Decision: Analytics & API Cost Logging

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Day 10 pre-build decisions

---

## 1. What we track — three categories

| Category | What | Why |
|---|---|---|
| **API usage** | Every call to an external AI/ML provider: model, tokens in/out, latency, cost in PKR | Budget control. The $41/mo cost model (from `model-selection.md`) is built on estimates — we need actuals. |
| **App events** | User actions: login, MCQ attempted, Viva started, etc. | DAU / MAU, feature adoption, retention. Tells us what's working before soft launch feedback arrives. |
| **Errors** | Unhandled exceptions, failed API calls | Sentry free tier (5 K events/mo). Catches production bugs before users report them. |

---

## 2. Database tables

### 2.1 `api_usage_log`

Every external AI / ML API call is logged here. Written **server-side only** — never from client code.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, auto-gen |
| `user_id` | uuid (FK → users) | Who triggered this call. `NULL` for admin-triggered batch jobs (citation enrichment, explanation-fix). |
| `feature` | text | `ai_tutor` · `mcq_solver` · `viva_bot` · `tts` · `stt` · `pdf_extraction` · `citation_enrichment` · `explanation_fix` |
| `provider` | text | `gemini` · `deepseek` · `groq` · `google_tts` · `google_geocoding` |
| `model` | text | e.g. `gemini-2.5-flash`, `whisper-large-v3-turbo` |
| `input_tokens` | integer | Nullable for non-token APIs (TTS logs character count in `metadata` instead) |
| `output_tokens` | integer | Nullable |
| `cost_pkr` | numeric(10,4) | Calculated server-side at log time from the rate table (§3). Stored so the dashboard never has to recompute. |
| `latency_ms` | integer | Wall-clock time from request sent to first response byte |
| `status` | text | `success` · `error` · `rate_limited` |
| `metadata` | jsonb | Provider-specific extras. TTS: `{ chars: 1200 }`. STT: `{ audio_seconds: 45 }`. Error: `{ error_code, message }`. |
| `created_at` | timestamptz | Default `now()` |

**RLS:** Students cannot read or write this table. Admin (service-role) reads all rows.

### 2.2 `app_events`

Tracks user actions for product analytics. Lightweight — one row per action, no heavy payloads.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid (FK → users) | |
| `event_type` | text | See the full enum in §2.3 |
| `metadata` | jsonb | Event-specific payload. See §2.3. |
| `created_at` | timestamptz | Default `now()` |

**RLS:** Same as `api_usage_log` — admin only.

### 2.3 Event types and their payloads

| `event_type` | When it fires | `metadata` |
|---|---|---|
| `login` | Successful session created | `{}` |
| `logout` | User logs out | `{}` |
| `dow_id_uploaded` | Student uploads Dow ID photo | `{}` |
| `pro_upgrade` | Student upgrades to Pro | `{ amount_pkr: 3000 }` |
| `mcq_attempted` | Student answers an MCQ | `{ question_id, correct: bool, module_id, subject_id }` |
| `mcq_session_completed` | Student finishes a drill session | `{ total: N, correct: N, module_id, subject_id, source: "tested" \| "general" }` |
| `viva_session_started` | Student starts a Viva Bot session | `{ module_id, subject_id, mode: "strict" \| "friendly" \| "standard" }` |
| `viva_session_completed` | Viva session ends with score | `{ module_id, subject_id, score: 0–50, mode, questions_asked: N }` |
| `anki_card_flipped` | Student taps to reveal answer in Anki mode | `{ module_id, subject_id }` |
| `ai_chat_msg_sent` | Student sends a message in AI Tutor | `{ session_id, mode: "auto" \| "quick" \| "tutor" \| "socratic" }` |
| `prayer_page_viewed` | Student opens Prayer Times page | `{}` |
| `lost_found_posted` | Student posts a Lost & Found item | `{ type: "lost" \| "found" }` |
| `content_uploaded` | Admin uploads content | `{ content_type: "mcq" \| "viva" \| "pdf", module_id }` |

---

## 3. API cost rate table

Stored in `src/lib/api-rates.ts`. Updated manually when provider pricing changes. **All rates in USD first, converted to PKR at a fixed monthly exchange rate** — the rate is updated on the 1st of each month and stored in the same file.

```typescript
// src/lib/api-rates.ts
export const USD_TO_PKR = 278  // updated monthly

export const RATES = {
  gemini: {
    'gemini-2.5-flash':      { inputPer1M: 0.075,  outputPer1M: 0.30  },
    'gemini-flash-lite':     { inputPer1M: 0.0375, outputPer1M: 0.15  },
  },
  deepseek: {
    'deepseek-v3.2-reasoner':{ inputPer1M: 0.27,   outputPer1M: 1.10  },
  },
  groq: {
    'whisper-large-v3-turbo':{ flatMonthlyUSD: 20 },  // logged as one entry/month
  },
  google_tts: {
    'neural-en-gb':          { perMillionChars: 4.00 },
  },
  google_geocoding: {
    'geocode':               { per1KRequests: 5.00 },
  },
} as const
```

The `logApiCall()` helper (in `src/lib/api-logger.ts`) reads these rates, does the math, and writes `cost_pkr` to the DB. Developers never calculate costs manually — just call `logApiCall()` after every provider call.

---

## 4. Admin analytics dashboard

**Route:** `/admin/analytics`
**Built in:** Phase 6 (Days 36–41). Tables + logging wired in Phase 2–4.

### 4.1 Layout

```
┌─────────────────────────────────────────────────┐
│  Admin → Analytics                              │
├─────────────────────────────────────────────────┤
│  [Today] [This week] [This month] [Custom ▼]   │  ← time-range picker
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  DAU     │  │  MAU     │  │  Total Cost  │  │  ← headline cards
│  │  142     │  │  1,847   │  │  PKR 847     │  │     (JetBrains Mono)
│  └──────────┘  └──────────┘  └──────────────┘  │
│                                                 │
│  ┌─ API COST BREAKDOWN ─────────────────────┐   │
│  │  Gemini Flash:      PKR 612  ████████░░  │   │  ← bar chart by provider
│  │  Groq (flat/mo):    PKR 5,600             │   │     Groq shown as monthly flat
│  │  Google TTS:        PKR 230  ███░░░░░░░  │   │
│  │  DeepSeek:          PKR  5   █░░░░░░░░░  │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌─ FEATURE USAGE ──────────────────────────┐   │
│  │  AI Tutor messages:     1,204            │   │
│  │  MCQs attempted:        3,891            │   │
│  │  Viva sessions:           247            │   │
│  │  Anki cards flipped:    8,120            │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌─ COST PER USER ──────────────────────────┐   │
│  │  Average this month:  PKR 0.46           │   │  ← total cost ÷ DAU
│  │  Top 10 by spend:     [expandable table] │   │     useful for spotting abuse
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌─ RAW API LOG ────────────────────────────┐   │
│  │  Filter: [All features ▼] [Provider ▼]  │   │  ← last 500 rows, paginated
│  │  Sortable table of api_usage_log rows    │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### 4.2 Key metrics definitions

| Metric | How it's calculated |
|---|---|
| DAU | `COUNT(DISTINCT user_id) FROM app_events WHERE created_at > today` |
| MAU | Same, window = current calendar month |
| Total Cost | `SUM(cost_pkr) FROM api_usage_log WHERE created_at IN range` |
| Cost per user | Total Cost ÷ DAU |
| Feature usage counts | `COUNT(*) FROM app_events GROUP BY event_type WHERE created_at IN range` |

---

## 5. Error reporting — Sentry

**Tier:** Free (5 K events / month — plenty for beta with 20–50 users).

**Setup:** Install `@sentry/nextjs`. It auto-instruments:
- Next.js server errors (API routes, server components, middleware)
- Client-side errors (React error boundaries, unhandled promises)
- Performance traces (optional — enable if Lighthouse scores need investigation)

**Integration files:**
- `next.config.ts` — Sentry webpack plugin (auto-added by `npx @sentry/cli login`)
- `src/instrumentation.ts` — server-side SDK init (Next.js 15 pattern)
- `src/app/layout.tsx` — client-side SDK init (via `@sentry/nextjs` auto-setup)

**What it does NOT capture:** Business logic bugs (e.g. wrong MCQ marked correct). Those are QA bugs, not runtime errors.

**Upgrade path:** If event volume exceeds 5 K/mo at scale, move to Sentry Pro ($26/mo). Decision at Phase 7 review.

---

## 6. Build timeline

| Phase | Days | What ships |
|---|---|---|
| Phase 2 | 10–11 | Create `api_usage_log` + `app_events` tables + RLS. Install Sentry. Wire `app_events` into login / logout / upload flows. Write `src/lib/api-logger.ts` + `src/lib/api-rates.ts`. |
| Phase 3 | 17–23 | Wire `logApiCall()` into AI Tutor (Gemini + DeepSeek calls) and MCQ Solver. |
| Phase 4 | 24–30 | Wire `logApiCall()` into Viva Bot, TTS, STT. |
| Phase 6 | 36–41 | Build `/admin/analytics` dashboard UI. Polish cost breakdowns and charts. |

---

## 7. Sources consulted

- `docs/decisions/model-selection.md` — the $41/mo cost model that this logging validates
- `docs/decisions/voice-stt.md` — Groq + Google TTS pricing
- `docs/decisions/rag-architecture.md` — Gemini embedding costs
- `docs/decisions/upload-pipeline.md` — where enrichment jobs run
