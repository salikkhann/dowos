# DowOS – 45-Day Roadmap

Period: **2026-02-04** → **2026-03-20** (soft launch)

---

## Phase 1 – Foundation & Architecture Decisions (Feb 4–12, Days 1–9)

Wire up backend plumbing and auth gate. Run a focused architecture decision sprint
before any feature build begins — every open tech choice gets evaluated, compared,
and locked with a written rationale. No building on sand.

**Days 1–2 – Backend & Auth foundation:**
- `src/lib/supabase.ts` client (browser + server)
- Supabase migrations: `users`, `user_preferences` tables + RLS policies
- Auth flow end-to-end: email → OTP → profile form → Dow ID photo upload → pending-approval state
- Login / session middleware (route guard on `(app)/` group)

**Day 3 – RAG Architecture Decision**
Evaluate and lock: chunking strategy (fixed vs sentence vs paragraph), embedding model
(Gemini `text-embedding-004` vs OpenAI `text-embedding-3-small`), retrieval mode
(dense pgvector vs hybrid sparse+dense), re-ranking, and context-window budget per
query. Medical-domain specifics: terminology density, Q&A pair extraction from
textbooks, subtopic-scoped retrieval to keep prompts focused.
→ Output: `docs/decisions/rag-architecture.md`

**Day 4 – Maps Decision**
Google Maps JS SDK vs OpenStreetMap + OpenLayers. Compare: cost at 2 000 DAU,
offline-map possibility (students inside Dow campus with patchy Wi-Fi), rendering
performance on mid-range Android, custom overlay complexity for campus walking paths,
and vendor lock-in risk.
→ Output: `docs/decisions/maps-platform.md`

**Day 5 – Voice / STT Decision**
Web Speech API vs OpenAI Whisper vs Google Cloud Speech-to-Text. Compare on:
Pakistani-accent accuracy (test with 10 medical terms spoken in Urdu-inflected
English), latency, cost at scale, offline fallback feasibility, and integration
complexity.
→ Output: `docs/decisions/voice-stt.md`

**Day 6 – AI Routing & Fallback Decision**
When and how does the app switch from Gemini to DeepSeek R1? Define concrete
trigger criteria: latency threshold, error-rate threshold, cost-per-token budget,
or query-type classification. Benchmark both models on 20 sample medical-student
questions. Document the router logic.
→ Output: `docs/decisions/ai-routing-fallback.md`

**Day 7 – Mobile Delivery Decision**
Capacitor.js (hybrid native shell) vs pure PWA (install-to-homescreen, no Play
Store). Compare: Play Store discoverability for Karachi Android users, install
friction, push-notification reliability on each, maintenance overhead, and timeline
to first working build.
→ Output: `docs/decisions/mobile-delivery.md`

**Day 8 – Viva Bot Orchestration Decision**
LangGraph (multi-step agent workflow) vs hand-rolled state machine for the Viva
Bot's question → evaluate → follow-up → score loop. Compare: implementation time,
debugging ease, flexibility for 3 difficulty modes, and whether LangGraph overhead is
justified for an MVP.
→ Output: `docs/decisions/viva-bot-orchestration.md`

**Day 9 – Decision review & sign-off**
Read all 6 decision docs. Confirm every choice is consistent with each other and
with the existing locked decisions. Update `FINAL_LOCKED_DECISIONS.md`. Unblock
Phase 2.

---

## Phase 2 – Core Shell, Timetable & Admin Tools (Feb 13–19, Days 10–16)

Deliver the first screen a real student lands on after login, and give the content
team the tools they need to seed data before AI features are built.

- Dashboard shell: bottom-nav (mobile) / sidebar (desktop), dark-mode toggle
- Timetable page: week view, color-coded modules, viva toggle, 5-min ISR
  revalidation via Supabase
- Attendance page: one-tap check-in, per-module % breakdown, runway calculator
- **Admin dashboard (`/admin/` route group, service-role gated):**
  - Content upload pages: MCQ bulk upload (CSV/JSON), Viva sheet upload,
    textbook/PDF upload for RAG ingestion
  - Upload validation: preview before save, duplicate detection, required-field checks
  - Content management: list / edit / delete / archive per module & subject
  - Upload status indicators: processing (chunking + embedding), ready, errored
- **`docs/admin-content-upload.md`** — step-by-step guide for Azfar: how to format
  MCQ CSVs, tag questions with module/subject/subtopic/difficulty/high-yield, upload
  textbooks for RAG, create Viva sheets, and monitor ingestion status
- Supabase migrations: `modules`, `subjects`, `timetable_entries`, `attendance`, `api_usage_log`, `app_events`
- **Tooling setup (Day 10):** `.cursorrules` at project root (see `docs/cursor-guide.md`). Install + configure Sentry (`@sentry/nextjs`). Create Resend account, add `RESEND_API_KEY` to `.env.local` (use Resend default subdomain until custom domain is live). Write `src/lib/api-logger.ts` + `src/lib/api-rates.ts`.
- Wire `app_events` logging into: login, logout, Dow ID upload, content upload flows

---

## Phase 3 – AI & Learning Core (Feb 20–26, Days 17–23)

The highest-value features for student retention. RAG pipeline is live; content
team has already seeded initial data via admin dashboard.

- AI Tutor chat: text mode, Gemini streaming, RAG-backed context retrieval (using
  locked architecture from Phase 1), session + long-term memory (pgvector),
  rate-limit UI
- Wire `api_usage_log` into every AI Tutor + MCQ Solver API call (Gemini, DeepSeek). Cost calculated server-side at log time via `logApiCall()` (see `decisions/analytics-logging.md`).
- MCQ Solver: module → subject → subtopic drill, AI explanations, practice +
  review modes, high-yield filter
- Supabase migrations: `chat_sessions`, `chat_messages`, `user_knowledge_base`,
  `mcq_questions`, `mcq_attempts`
- Content seed: first 100 MCQs across 2–3 modules uploaded via admin dashboard
  (Azfar)
- First 2–3 textbook PDFs ingested and retrievable end-to-end

---

## Phase 4 – Viva Bot & Progress (Feb 27–Mar 5, Days 24–30)

Complete the learning loop and close the progress-tracking circle.

- Viva Bot: 3 examiner modes (Strict / Friendly / Standard), greeting on session start, voice Q&A (Grosto STT → Gemini → Google Cloud TTS), 50-point adaptive scoring, session report. State-machine orchestration (5 states: GREET → ASK → EVALUATE → FOLLOWUP → SCORE) per Day 8 decision.
- Wire `api_usage_log` into Viva Bot + STT + TTS calls.
- Progress Matrix: module/subject/subtopic mastery %, color-coded heatmap,
  annual-exam mode
- Supabase migrations: `viva_sheets`, `viva_bot_sessions`, `viva_bot_responses`,
  `progress_matrix`
- Voice pipeline integration test (latency target < 3 s round-trip)
- Viva sheets seeded via admin dashboard (target: all sheets for Batch 1 current
  modules)

---

## Phase 5 – Community & Maps (Mar 6–10, Days 31–35)

Fill out the non-academic features that drive daily habit. Maps platform already
locked in Phase 1 — build straight to the chosen stack.

- Lost & Found: post, search, contact (WhatsApp link), 30-day auto-archive
- Point Routes: campus map with walking paths, rendered on the locked maps platform
- Announcements: admin-posted, real-time push via Firebase + Supabase Realtime
- Supabase migrations: `lost_found_items`, `announcements`, `push_notifications`

---

## Phase 6 – Polish & QA (Mar 11–13, Days 36–38)

Compressed to 3 days so beta can hit Mar 14.  Critical-path items only; deferrable
work moves to Phase 8.

**Must-do before beta:**
- Full mobile-first QA pass (375 px viewport, touch targets, keyboard types)
- Pro tier paywall enforcement (Viva Bot gating, AI Tutor limit enforcement)
- Error-state + loading-state review (toasts, skeletons, network-error banners)
- Performance: Lighthouse run, bundle size check
- Mobile delivery build: package via Capacitor, test install + push on real Android

**Deferred to Phase 8 (pre-full-launch):**
- WCAG AA contrast audit — iterate during beta feedback window
- Build `/admin/analytics` dashboard (see `decisions/analytics-logging.md`)
- Bulk-seed remaining MCQ content (target 800+ questions)
- Final review of `docs/admin-content-upload.md`

---

## Phase 7 – Beta Launch (Mar 14, Day 39)

First real users.  Marketing goes live.  See `docs/marketing-launch.md` for the
full plan (Instagram Reel script, WhatsApp blast, teaser sequence).

- Deploy to Vercel production with production env vars
- Onboard first 20–50 beta testers from Batch 1
- Dow ID approval workflow live (manual review queue)
- Instagram beta-launch Reel goes live (pain-point hook + product reveal)
- WhatsApp blast to Dow student groups
- Monitor: error rates, API latency, Supabase usage, daily active users

---

## Phase 8 – Beta Feedback & Iteration (Mar 15–27, Days 40–52)

Two weeks to learn, fix, and polish before opening to everyone.

- Triage bugs daily — patch critical issues same-day
- Iterate on UX based on beta feedback (focus on Education + AI Tutor — the
  non-negotiables)
- Complete deferred Phase 6 items: WCAG audit, `/admin/analytics` dashboard,
  MCQ content seeding (800+ questions)
- Collect beta assets for full launch: student quotes, usage stats, screen
  recordings (see `docs/marketing-launch.md` §7)
- Instagram teaser Stories: beta progress, feature peeks
- LinkedIn draft prep: write the founder + vision + B2B post
- Internal retrospective + Phase 2 (DowEats / Merch / Marketplace) planning kickoff

---

## Phase 9 – Full Launch (Mar 28, Day 53)

Open to every Dow student.  Maximum visibility.  See `docs/marketing-launch.md`
for scripts and post outlines.

- Open self-serve signups to all Dow students
- Instagram full-launch Reel (beta proof + feature tour)
- LinkedIn post: founder story + ed-tech Pakistan vision + B2B university pitch
- WhatsApp blast to all Dow student groups
- Engage every comment and reply on launch day
- Monitor at scale: error rates, DAU, API costs, Pro conversion
- Collect feedback, triage bugs, patch critical issues same-day
