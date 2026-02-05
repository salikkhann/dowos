# DowOS — Tech Stack Audit

**Date:** 2026-02-05 | **Scope:** Full stack, APIs, models | **Verdict:** Is this the best way to build DowOS?

---

## 1. Executive Summary

| Verdict | Assessment |
|---------|------------|
| **Overall** | **Yes** — the stack is well-suited for DowOS. Decisions are coherent, cost-conscious, and appropriate for a 3-person team building a campus super-app on a tight timeline. |
| **Strengths** | Single vendor for most backend (Supabase), cost-optimized AI tiering, hybrid RAG, Pakistan-specific choices (Groq STT, manual payment). |
| **Risks** | Content dependency, manual payment ops, multi-vendor AI (Gemini + DeepSeek + Groq). No critical showstoppers. |
| **Recommendation** | Proceed as locked. No stack changes needed before build. Revisit TTS and payment automation in Phase 2. |

---

## 2. Layer-by-Layer Audit

### 2.1 Framework: Next.js 16 + React 19 + TypeScript

| Criterion | Assessment |
|-----------|------------|
| **Fit** | ✅ Excellent. App Router, Server Components, route groups for auth — all align with DowOS structure. |
| **Alternatives** | Remix, SvelteKit, Nuxt — none offer the Supabase + Vercel ecosystem maturity Next.js has. |
| **Package versions** | `next@16.1.6`, `react@19.2.3` — latest stable. Good. |
| **Concern** | Next.js 16 is very new; minor bugs possible. Mitigated by lockfile. |

**Verdict:** Correct choice. Do not change.

---

### 2.2 Backend & Database: Supabase (PostgreSQL + Realtime + Auth + Storage)

| Criterion | Assessment |
|-----------|------------|
| **Fit** | ✅ Excellent. One provider for auth, DB, realtime, storage. Reduces ops surface. |
| **pgvector** | ✅ Chosen for RAG. Benchmarks show 1185% more QPS than Pinecone at lower cost for ~1M vectors. Corpus is 2–5M chunks — within pgvector comfort zone. |
| **RLS** | ✅ Required on every table. Security-first. |
| **Alternatives** | Firebase (weaker query + no pgvector), PlanetScale (no Realtime), self-hosted Postgres (ops overhead). Supabase wins for this stack. |
| **Cost** | $25/mo tier — reasonable for 500–2000 DAU. |

**Verdict:** Correct choice. Do not change.

---

### 2.3 AI / LLM Stack

#### Tier 1 — Interactive: Gemini 2.5 Flash

| Criterion | Assessment |
|-----------|------------|
| **Why Flash** | Search grounding (Google), streaming, sub-500ms first token, $0.30/$2.50 per 1M tokens. |
| **Alternatives** | GPT-4o (no Search grounding), Claude (no native web grounding). Gemini Flash is the only model that combines grounding + low cost + streaming. |
| **Risk** | Google API changes. Mitigated by abstraction layer (`logApiCall`, model router). |

**Verdict:** Correct for interactive tutor.

#### Tier 2 — Reasoning: DeepSeek V3.2 Reasoner (R1)

| Criterion | Assessment |
|-----------|------------|
| **Why R1** | $0.28/$0.42 per 1M tokens — cheapest reasoning model. Matches o1-class on STEM benchmarks. |
| **Alternatives** | o1-mini (2–4× cost), Claude Opus (5×+ cost). R1 is the clear value play. |
| **Risk** | DeepSeek availability in Pakistan, rate limits. Fallback: downgrade to Flash (already specced). |

**Verdict:** Correct for complex medical reasoning.

#### Tier 3 — Batch: Gemini 2.5 Flash-Lite

| Criterion | Assessment |
|-----------|------------|
| **Why Flash-Lite** | $0.05/$0.20 per 1M tokens. No grounding needed for ingestion, classifiers, memory summarisation. |
| **Alternatives** | GPT-4o-mini — similar cost, but adds vendor. Sticking with Gemini keeps vendor count down. |

**Verdict:** Correct for batch jobs.

#### Embeddings: gemini-embedding-001 (768 dims)

| Criterion | Assessment |
|-----------|------------|
| **Why** | MTEB multilingual leaderboard, task-type aware (RETRIEVAL_DOCUMENT vs RETRIEVAL_QUERY), single vendor with Flash. |
| **Alternatives** | OpenAI text-embedding-3-small (adds vendor, no clear advantage), Cohere (similar). |

**Verdict:** Correct. Do not change.

#### PDF Extraction: Gemini 2.5 Pro Files API

| Criterion | Assessment |
|-----------|------------|
| **Why** | Native PDF ingestion — no OCR preprocessing. Preserves tables, multi-column layout. |
| **Alternatives** | pdf.js (no layout understanding), Unstructured.io (extra cost). Gemini Pro is the right call for medical textbooks. |

**Verdict:** Correct.

---

### 2.4 Speech: STT + TTS

#### STT: Groq Whisper Large v3 Turbo

| Criterion | Assessment |
|-----------|------------|
| **Why** | $20/mo at 500 DAU. Identical weights to OpenAI Whisper Large v3 at 9× lower cost. Best code-switching (Urdu–English) in the comparison. |
| **Gemini correction pass** | ✅ Smart. Fixes medical terminology errors at negligible cost (~$0.90/mo). |
| **Alternatives** | OpenAI Whisper ($180/mo) — too expensive. Deepgram Nova-3 Medical ($108–231/mo) — best accuracy but out of budget. Upgrade path documented. |
| **Risk** | Groq batch-only (no streaming). Acceptable for Viva Bot (student speaks, then evaluate). |

**Verdict:** Correct for budget and accent. Do not change.

#### TTS: Google Cloud TTS

| Criterion | Assessment |
|-----------|------------|
| **Why** | $5–10/mo. Good quality, low latency. Fits stack (Gemini already Google). |
| **Alternatives** | ElevenLabs (premium quality, higher cost), Azure TTS (adds vendor). |
| **Risk** | None significant. Pakistani accent handling may vary — test with real users. |

**Verdict:** Correct. Revisit only if quality complaints.

---

### 2.5 Maps: MapLibre GL JS + PMTiles + Google Geocoding

| Criterion | Assessment |
|-----------|------------|
| **Why MapLibre** | WebGL rendering, performant on Android WebView. Open-source, no per-load tile cost. |
| **Why PMTiles** | Offline-capable tiles. Campus Wi-Fi patchy — critical for Point Routes. |
| **Why Google Geocoding** | Karachi coverage. Scoped to place-search only — not tiles. Keeps cost bounded. |
| **Alternatives** | Google Maps SDK ($350/mo at 2K DAU for tiles alone) — rejected. OpenLayers (Canvas, Android flicker) — rejected. |
| **Cost** | Geocoding ~$5–20/mo depending on search volume. Tiles: self-hosted, near-zero. |

**Verdict:** Correct. Best cost/quality for campus + bus routes.

---

### 2.6 Auth: Supabase Auth (Email/OTP)

| Criterion | Assessment |
|-----------|------------|
| **Why** | Built-in. OTP via Resend. No phone/SMS for MVP (avoids Pakistani carrier friction). |
| **Dow ID verification** | Manual approval — appropriate for campus-only, 2K users. |
| **Alternatives** | Clerk (adds vendor, cost). Auth0 (overkill). Supabase Auth is sufficient. |
| **Risk** | OTP delivery (Resend). Test with Pakistani emails (Gmail, Yahoo) before launch. |

**Verdict:** Correct. Add 2FA only if compliance requires it.

---

### 2.7 Payments: Dow Credits (Manual)

| Criterion | Assessment |
|-----------|------------|
| **Why** | Easypaisa/JazzCash receipt upload → manual verify 5–10 min. No Stripe/JazzCash API integration. |
| **Pros** | Zero integration cost. Works with Pakistani payment rails. No PCI scope. |
| **Cons** | Manual ops. Doesn't scale past ~100 top-ups/day. |
| **Alternatives** | Stripe (limited in Pakistan). JazzCash API (complex, approval). For MVP, manual is acceptable. |
| **Phase 2** | Document automation path (JazzCash merchant API, webhook) for when volume justifies it. |

**Verdict:** Correct for MVP. Plan automation for Phase 2.

---

### 2.8 Push Notifications: Firebase Cloud Messaging

| Criterion | Assessment |
|-----------|------------|
| **Why** | Industry standard. Works with Capacitor. Free tier generous. |
| **Alternatives** | OneSignal (adds vendor). Native FCM is sufficient. |
| **Risk** | None. Ensure FCM config in Capacitor build. |

**Verdict:** Correct.

---

### 2.9 Mobile: Capacitor.js

| Criterion | Assessment |
|-----------|------------|
| **Why** | Wraps Next.js in native shell. Play Store discoverability. FCM native. Camera/mic/geolocation via plugins. |
| **PWA rejected** | Correct. Discoverability and iOS push limitations make PWA a non-starter. |
| **Alternatives** | React Native / Flutter — full rewrite. Capacitor reuses web app. |
| **Risk** | WebView performance on low-end Android. Mitigated by skeleton loading, lazy routes. |

**Verdict:** Correct. iOS deferred to Phase 3 — acceptable.

---

### 2.10 Styling: Tailwind CSS v4 + shadcn/ui

| Criterion | Assessment |
|-----------|------------|
| **Why Tailwind v4** | CSS-first config, `@theme` for design tokens. Modern, performant. |
| **Why shadcn** | Copy-paste components, no runtime. Accessible (Radix). Matches design system. |
| **Components installed** | badge, button, card, input, label, sheet, skeleton, tooltip — sufficient for MVP. Add more as needed (dialog, select, tabs). |
| **Design tokens** | Navy, Offwhite, Teal, Gold, Red, dark-mode — locked. WCAG AA targeted. |
| **Risk** | Tailwind v4 is new. Migration from v3 patterns may surface edge cases. |

**Verdict:** Correct. Ensure `@theme` in globals.css matches `4_DESIGN_SYSTEM.md`.

---

### 2.11 State: Zustand + TanStack Query

| Criterion | Assessment |
|-----------|------------|
| **Zustand** | Global UI state (sidebar open, dark mode). Lightweight. |
| **TanStack Query** | Server state, caching, refetch. Correct for Supabase fetches. |
| **Alternatives** | Redux (overkill). Jotai (similar to Zustand). Current choice is sound. |

**Verdict:** Correct. No change needed.

---

### 2.12 Missing Dependencies (to add)

From `package.json` and todo:

| Package | Purpose | When |
|---------|---------|------|
| `@sentry/nextjs` | Error tracking | Day 10 |
| `adhan` | Prayer times (Karachi) | Day 10 |
| `hijri-converter` | Hijri date | Day 10 |
| `@capacitor/core` + `@capacitor/android` | Mobile build | Phase 6 |
| `maplibre-gl` | Maps | Phase 5 |
| `groq` | STT | Phase 4 |
| `@google-cloud/text-to-speech` (or REST) | TTS | Phase 4 |
| `@google/generative-ai` | Gemini | Phase 3 |
| `sonner` (or similar) | Toasts | Phase 2 |

---

## 3. API Cost Summary (500 DAU)

| Provider | Estimated Monthly Cost |
|----------|------------------------|
| Supabase | $25 |
| Gemini (Flash + Flash-Lite + Pro extraction) | ~$35 |
| DeepSeek R1 | ~$5 |
| Groq Whisper | ~$20 |
| Google Cloud TTS | ~$5–10 |
| Google Geocoding | ~$5–15 |
| Vercel | $0–20 |
| **Total** | **~$95–130** |

At PKR 3K Pro × 125 converts = PKR 375K/mo revenue, infra cost is ~PKR 30K — sustainable.

---

## 4. Strengths of Current Stack

1. **Single backend** — Supabase for auth, DB, realtime, storage. One login, one dashboard.
2. **Cost-optimized AI** — Tiered routing (Flash / R1 / Flash-Lite) keeps cost at ~$41/mo for AI at 500 DAU.
3. **Pakistan-aware** — Groq STT (accent), manual payment (Easypaisa/JazzCash), Resend (email deliverability).
4. **RAG done right** — Hybrid pgvector + BM25, Google Search grounding, parent-document indexing. Not overbuilt.
5. **Mobile path clear** — Capacitor from day one. No PWA false start.
6. **Upgrade paths documented** — Deepgram for STT, payment automation, Supabase Edge Functions.

---

## 5. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Content delay (Azfar) | Prioritise 1st year, AI templates for MCQ, recruit 2–3 friends. |
| Manual payment bottleneck | 5–10 min SLA. Phase 2: JazzCash API or similar. |
| Groq/DeepSeek availability | Fallback to Flash. Monitor status pages. |
| MapLibre on low-end Android | Test on 2–3 devices. Reduce tile density if needed. |
| Resend deliverability (Pakistani inboxes) | Warm up domain. Test Gmail, Yahoo, Outlook. |

---

## 6. What Would Make It "Not the Best"?

Stack would need reconsideration if:

- **Scale** — 10K+ DAU. Then: separate vector DB, CDN for tiles, payment automation mandatory.
- **Regulation** — HIPAA/FDA-style compliance. Then: BAA with Supabase, audit logging, encryption at rest.
- **Budget collapse** — Then: cut R1, use Flash-only; cut TTS, text-only Viva.
- **DeepSeek blocked in Pakistan** — Then: Flash-only for reasoning (quality drop but works).

None of these apply at MVP scale.

---

## 7. Final Verdict

**The DowOS tech stack is the best possible way to build this product given:**

- 3-person team (Salik dev, Ammaar ops, Azfar content)
- 2K target users, 500 DAU at launch
- PKR 2.25M Year 1 revenue target
- 4-week MVP + 6-week Phase 2 timeline
- Pakistan-specific constraints (payment rails, accents, campus Wi-Fi)

**No stack changes recommended before build.** Execute the locked decisions. Revisit TTS quality and payment automation post-beta.
