# DowOS – Feature Build Todo

Last updated: 2026-02-05 (Session 5). Covers Phases 1–9.
Tick items off as you go. Re-create when the list drains.

---

## ✓ Phase 1 – Foundation & Decisions (Days 1–9) — ALL DONE

### ✓ Backend & Auth (Days 1–2)
- [x] Create `src/lib/supabase.ts` — `createBrowserClient` + `createServerClient`
- [x] Write Supabase migration: `users` table + RLS policies
- [x] Write Supabase migration: `user_preferences` table
- [x] Build signup flow: email input → OTP send → OTP verify
- [x] Build profile step: roll number, batch year, lab group (A–F), learning style
- [x] Build Dow ID upload step: photo upload to Supabase Storage, pending-approval state
- [x] Build login flow: email → OTP → session cookie
- [x] Write middleware route guard on `(app)/` group (redirects unauthenticated users)
- [x] Smoke-test the full auth loop locally (signup → login → guarded page → logout)
- [x] Merge `feature/auth-onboarding` → `main`

### ✓ Architecture Decisions (Days 3–9)
- [x] Day 3 – RAG: `rag-architecture.md` LOCKED. Three-tier model routing (Flash / DeepSeek R1 / Flash-Lite). Hybrid pgvector retrieval. Gemini 2.5 Pro for PDF extraction via Files API.
- [x] Day 4 – Maps: `maps-platform.md` LOCKED. MapLibre GL JS + PMTiles. Point map (bus routes) + Campus indoor map (floor-plan gated). Google Geocoding scoped to place-search only.
- [x] Day 5 – Voice/STT: `voice-stt.md` LOCKED. Groq Whisper Large v3 Turbo. Gemini medical-term correction pass. Upgrade path to Deepgram Nova-3 Medical documented.
- [x] Day 6 – AI Routing: `ai-routing-fallback.md` LOCKED. Complexity router triggers locked. 3-attempt fallback chain Tier 1, 2-attempt downgrade Tier 2.
- [x] Day 7 – Mobile: `mobile-delivery.md` LOCKED. Capacitor.js. Android Play Store immediate, iOS Phase 3. PWA rejected (discoverability + iOS Safari push).
- [x] Day 8 – Viva Orchestration: `viva-bot-orchestration.md` LOCKED. 5-state machine (GREET → ASK → EVALUATE → FOLLOWUP → SCORE). Adaptive difficulty 1–5. LangGraph rejected.
- [x] Day 9 – Sign-off: All conflicts resolved. Rate limits locked at soft 2 / hard 4. `FINAL_LOCKED_DECISIONS.md` rewritten as 17-decision index.

### ✓ UI & Product Decisions (Days 4–5, extended)
- [x] Education tab structure: Browse Q&A (Free, expandable list), Viva Bot (Pro), Saved Questions (Phase 1), MCQ with analytics + AMBOSS drill filters. `education-tab.md` LOCKED.
- [x] Mobile vs Web UI: One component tree, two layout wrappers. 5-item bottom nav / grouped sidebar. Config-driven nav via `nav.ts`. `mobile-web-ui.md` LOCKED.
- [x] All-pages UI structure: Every screen wireframed — Dashboard (6 widgets + timetable sub-page), AI Chat, Education cards, Maps, Campus cards, L&F, Prayer Times, Announcements, Profile. Full route tree. `ui-page-structure.md` LOCKED.
- [x] Profile card + UX conventions: Glassmorphic student card (Gold ring if Pro), sidebar avatar mini-card, time-aware greeting, skeleton-first loading, touch targets, focus rings, contrast rules, reduced-motion. `profile-card-ux.md` LOCKED.

### ✓ Product & Operational Decisions
- [x] Dow Credits + Pro upgrade flow: Full UX flow specced. `credits-payment.md` LOCKED.
- [x] Dow ID approval workflow: Admin queue + reject reason picker. `dow-id-approval.md` LOCKED.
- [x] Push notification permission strategy: Day 2 ask, priming card, max 2 asks. `push-notifications.md` LOCKED.
- [x] DowEats operational spec: Item-first menu, 6-digit code, gate delivery. `doweats-ops.md` LOCKED.
- [x] Marketplace ops: Withdrawal + disputes specced. `marketplace-ops.md` LOCKED.
- [x] Viva Bot scoring: 3-mode weights + LLM prompt + report format. `viva-scoring.md` LOCKED.

### ✓ Stale Docs Reconciled
- [x] Rate limit conflict resolved — locked at soft 2 / hard 4. Pre-cost-model placeholders removed.
- [x] `5_UXUI_GUIDELINES.md` nav updated: IA tree matches locked route tree (Dashboard / Education / AI Tutor / Campus / Maps).
- [x] `00_DISCOVERY_RESOLVED.md` maps block updated: MapLibre GL JS + PMTiles. Superseded note added.
- [x] `FINAL_LOCKED_DECISIONS.md` rewritten: clean 17-decision index with one-line summaries + resolved-conflicts table.

### ✓ Cursor Handoff Docs
- [x] `.cursorrules` created at project root — Cursor reads it automatically every turn.
- [x] `docs/cursor-guide.md` written — read before first Cursor session.
- [x] `docs/decisions/upload-pipeline.md` LOCKED — Vercel Route Handlers + SSE.
- [x] `docs/decisions/analytics-logging.md` LOCKED — api_usage_log + app_events.
- [x] `docs/admin-content-upload.md` written — step-by-step guide for Azfar.

---

## Phase 2 – Core Shell, Timetable & Admin (Days 10–16)

### 2A – Tooling & Infra (Day 10)
- [ ] Read `docs/cursor-guide.md` before first Cursor session
- [ ] Install + configure Sentry: `npx @sentry/cli login`, add `@sentry/nextjs`, wire `src/instrumentation.ts`
- [ ] Create Resend account → add `RESEND_API_KEY` to `.env.local`
- [ ] Write `src/lib/api-rates.ts` — cost-rate table (per-model $/1 K tokens)
- [ ] Write `src/lib/api-logger.ts` — `logApiCall()` helper
- [ ] Write Supabase migrations: `api_usage_log` + `app_events` + RLS (admin-only read)
- [ ] Write Supabase migrations: `modules`, `subjects`
- [ ] Install `adhan` + `hijri-converter` npm packages (prayer calc — client-side, no API)

### 2B – NavShell + Dashboard (Days 10–11)
- [ ] Build `<BottomNav />` — 5 items, active-route highlight, 44 px tall, safe-area inset
- [ ] Build `<Sidebar />` — config-driven from `nav.ts`, section headers, active highlight, role-gated items (Admin)
- [ ] Build `<NavShell />` — `'use client'` leaf, media-query switch at 1024 px. Wire into `(app)/layout.tsx`
- [ ] Build sidebar avatar mini-card (Identity section) — see `profile-card-ux.md` §2.5
- [ ] Build mobile avatar tap → bottom sheet (Settings / Profile / Help / Logout)
- [ ] Wire dark-mode toggle (`next-themes` already installed)
- [ ] Stub all nav links to their route pages
- [ ] Build Dashboard page: time-aware greeting + skeleton widget stack (static first, live data in 2C)
- [ ] Build Profile page: glassmorphic student card + photo upload — see `profile-card-ux.md` §2

### 2C – Timetable, Attendance & Dashboard Widgets (Days 12–14)
- [ ] Write Supabase migrations: `timetable_entries`, `attendance`
- [ ] Build timetable week-view component (Mon–Fri, color-coded by module)
- [ ] Add viva toggle + roll-number display on timetable
- [ ] Build attendance check-in button + per-module % breakdown
- [ ] Build runway calculator card (% attendance vs required threshold)
- [ ] Wire live Dashboard widgets: next-class card, mark present/absent, attendance-warning banner, exam countdown, current module
- [ ] Wire Dashboard **Prayer Times mini-card**: next upcoming prayer name + time + live countdown. Calculated client-side via `adhan` (Karachi coords, Umm al-Qura method). Always visible — never hidden. See `ui-page-structure.md` §3.

### 2D – Admin Dashboard (Days 13–14)
- [ ] Create `/admin/` route group (service-role gated middleware)
- [ ] Build Dow ID approval queue — pending list → approve / reject + reason picker (see `dow-id-approval.md`)
- [ ] Build MCQ bulk-upload page: CSV/JSON → preview table → duplicate detection → required-field validation → save
- [ ] Build Viva sheet upload page: CSV → preview → validate columns → save
- [ ] Build textbook/PDF upload page: drag-drop → triggers Gemini 2.5 Pro extraction → chunk → embed pipeline
- [ ] Build content-list view: list / edit / delete / archive, filterable by module & subject
- [ ] Add upload-status indicators: `Processing` → `Ready` / `Errored` (with retry)
- [ ] Wire `app_events` logging into: login, logout, Dow ID upload, content upload flows

---

## Phase 3 – AI & Learning Core (Days 17–23)

### 3A – Education Landing + MCQ Solver (Days 17–19)
- [ ] Build `education/page.tsx` — cards grid landing screen. Phase 1 cards: MCQ, Viva Bot + Browse Q&A, Saved Questions, Progress Matrix. Server Component, parallel data fetch for badges.
- [ ] Build MCQ source picker: **Tested Questions** vs **General Questions** toggle
- [ ] Build Tested Questions drill flow: year picker → module → subject → drill
- [ ] Build General Questions drill flow: module → subject → topic. Toggle: subject-wise (default) / topic-wise
- [ ] Build shared drill screen: question → options (A–E) → select → reveal correct + AI explanation → next
- [ ] Wire AI explanations: Gemini streaming, RAG-backed context (module/subject scoped)
- [ ] Build drill-entry analytics bar: `📊 % correct · N done` + `🔥 streak` (scope = current selection, shown in breadcrumb)
- [ ] Build filter pills: `[All]` `[Incorrects]` `[Undone]` — updates question list + count in real time
- [ ] Add `🔖` bookmark icon on every drill question → taps save to Saved Questions (filled = saved, tap again to unsave)
- [ ] Add **"Ask AI →"** button on every MCQ explanation bar → pre-loads question + explanation into AI Tutor chat at `/ai` (Free for all — see `education-tab.md` §5.5)
- [ ] Wire `api_usage_log` into every MCQ Solver API call via `logApiCall()`
- [ ] Write Supabase migrations: `mcq_questions`, `past_paper_questions`, `mcq_attempts`

### 3B – AI Tutor Chat (Days 17–19, parallel with 3A)
- [ ] Build `/ai` chat screen: message list (assistant + user bubbles), input bar, send button
- [ ] Wire Gemini Flash streaming — typing indicator while response streams
- [ ] Wire RAG context retrieval: hybrid pgvector (dense + BM25 sparse) → re-rank → inject top-K chunks into prompt
- [ ] Include module/subject context tag in every prompt for medical accuracy
- [ ] Build session memory: persist `chat_sessions` + `chat_messages` to Supabase
- [ ] Build long-term memory: `user_knowledge_base` (pgvector) — topics student has studied, weak areas
- [ ] Build rate-limit UI: soft warning toast at 5 msgs/day (Free), hard block + upgrade CTA at 6 msgs. Pro = unlimited.
- [ ] Wire Tier 2 fallback: if Flash errors 3×, route to DeepSeek R1 (see `ai-routing-fallback.md`)
- [ ] Wire `api_usage_log` into every AI Tutor call
- [ ] Write Supabase migrations: `chat_sessions`, `chat_messages`, `user_knowledge_base`

### 3C – Content Seed Checkpoint (Day 20)
- [ ] Confirm Azfar has first 100 MCQs uploaded via admin dashboard
- [ ] Confirm 2–3 textbook PDFs ingested end-to-end: upload → extract → chunk → embed → retrievable by AI Tutor

---

## Phase 4 – Viva Bot & Browse Q&A & Progress (Days 24–30)

### 4A – Viva Bot Voice Drill (Days 24–27)
- [ ] Build Viva entry: module → subject picker (shared component with Browse Q&A)
- [ ] Build mode picker card: Strict / Friendly / Standard — show description of each
- [ ] Build **GREET** state: examiner greeting via Google Cloud TTS, session setup
- [ ] Build **ASK** state: question delivery via TTS, mic-button for student answer
- [ ] Build **EVALUATE** state: capture student speech via Groq Whisper STT → LLM score against model answer
- [ ] Build **FOLLOWUP** state: adaptive follow-up question if answer was weak; skip if strong
- [ ] Build **SCORE** state: session report card — 50-point total, per-dimension breakdown, suggested topics
- [ ] Build **1 free session taste** for Free users: first Viva session plays fully → ends with "That's your free session. Upgrade to Pro for 180 min / month." Subsequent sessions → Pro paywall modal
- [ ] Wire `api_usage_log` into Viva Bot + STT (Groq) + TTS (Google Cloud) calls
- [ ] Integration test: full voice round-trip latency target < 3 s
- [ ] Write Supabase migrations: `viva_sheets`, `viva_bot_sessions`, `viva_bot_responses`

### 4B – Browse Q&A (Day 28)
- [ ] Build Browse Q&A page at `/education/viva/browse` — expandable question list
- [ ] **Collapsed row:** question number + text + `[▼ Show answer]` cue
- [ ] **Expanded row:** question → `── Answer ──` (model_answer) → `── Key points ──` (bullet list from key_points) → `[🔖 Save]` `[▲ Collapse]`
- [ ] Wire to same viva sheet data as Viva Bot (same module → subject picker upstream)
- [ ] Save button → adds question to Saved Questions collection
- [ ] Free for all — no paywall

### 4C – Progress Matrix + AI Study Plan + Saved Questions (Days 29–30)
- [ ] Build Progress Matrix heatmap page: rows = modules, columns = subjects, cells = subject mastery %
- [ ] Colour-code cells: 🟩 Strong (≥ 70 %), 🟨 Progressing (40–69 %), 🟥 Needs Work (< 40 %), ⬜ Not Attempted (0 attempts)
- [ ] Add colour legend strip (always visible on heatmap — see `education-tab.md` §6.2)
- [ ] Add attempt-count badge on every cell (bottom-right corner — disambiguates high-accuracy-low-volume)
- [ ] Wire multi-source data feed: MCQ attempts (full weight), Browse Q&A reads (low weight — "touched"), Viva Bot session scores (full weight)
- [ ] Build tap-to-drill-down: mini stats panel (attempts, correct, incorrect, week-on-week trend ↑↓) + "Drill this topic →" CTA
- [ ] Build **Top 3 Weak Topics** card: auto-detects subjects with most attempts + lowest accuracy. Tap → MCQ drill filtered to that subject
- [ ] Build **Exam Readiness score** per module: `(% subjects attempted) × (avg accuracy)`. Shown next to each module name on the heatmap
- [ ] Build **AI Study Plan** card (Pro-gated): reads heatmap data → Gemini Flash generates weekly 3-topic plan with time estimates. Free users see blurred preview + upgrade CTA. Refresh every 7 days (max 1 manual refresh / day)
- [ ] Wire `logApiCall()` into every AI Study Plan Gemini call
- [ ] Write Supabase migrations: `progress_matrix`, `ai_study_plans`
- [ ] Build Saved Questions page at `/education/saved` — list of saved questions
- [ ] Add source filter pills on Saved Questions: `[All]` `[MCQ]` `[Browse Q&A]`
- [ ] Wire **20-question cap** for Free users on Saved Questions (server-side enforcement). Show "Upgrade to Pro — save unlimited" CTA when cap reached
- [ ] Wire live saved-count badge on Education landing Saved Questions card (hidden if 0)
- [ ] Coordinate with Azfar: all Viva sheets for Batch 1 current modules seeded

---

## Phase 5 – Community, Prayers & Maps (Days 31–35)

### 5A – Lost & Found (Days 31–32)
- [ ] Build post form: item type (lost / found), title, description, photo upload (optional), contact method (phone / WhatsApp)
- [ ] Build browse list: card grid, search bar, filters by type + date
- [ ] Add WhatsApp contact link on each listing card
- [ ] Build 30-day auto-archive: Supabase scheduled function or Edge cron — status flips to `archived`, removed from default view
- [ ] Write Supabase migration: `lost_found_items`

### 5B – Point Routes / Campus Map (Days 32–33)
- [ ] Set up MapLibre GL JS + PMTiles tile layer (see `maps-platform.md`)
- [ ] Render campus walking paths from QGIS-digitised GeoJSON
- [ ] Add bus-route overlay (from team-traced routes, color-coded by route)
- [ ] Build location-type filter pills: bus stops, priority areas, entrances
- [ ] Build tap-on-marker popover: route name, stops list, estimated walk time
- [ ] Add Prayer Room POI pin (cross-links from Prayer Times page "Show on map →")

### 5C – Announcements (Days 34–35)
- [ ] Build admin post form: title, body (markdown), module filter (optional), expiry date
- [ ] Wire real-time delivery: Firebase FCM push + Supabase Realtime subscription
- [ ] Build student announcements feed: card list, sorted newest first, optional module filter
- [ ] Build push-notification permission flow: priming card shown at the right moment (see `push-notifications.md` — max 2 asks)
- [ ] Write Supabase migration: `announcements`, `push_notifications`

### 5D – Prayer Times Full Page (Days 34–35)
- [ ] Build `/campus/prayers` page — see `ui-page-structure.md` §8 for full wireframe
- [ ] **Today's Prayers section:** calculate Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha via `adhan` (Karachi coords, Umm al-Qura method). Show checkmark (✓) on prayers whose time has passed. Bold + Teal highlight on next upcoming prayer.
- [ ] **Hijri date:** display at page top, calculated client-side via `hijri-converter`
- [ ] **Dow Masjid card:** pull congregational (jamaat) times from `masjid_schedules` table (`masjid_id = 'dow_main'`). Show opening hours + jamaat times for each prayer.
- [ ] **CHK Masjid card:** same structure, `masjid_id = 'chk'`
- [ ] **Qibla compass widget:** get device lat/lng via `navigator.geolocation` → calculate bearing via `adhan`. Show compass rose with arrow pointing toward Mecca + numeric bearing in degrees. Fall back to Karachi coords if geolocation denied.
- [ ] **Nearest Prayer Room card:** static text (Dow Main · Ground Floor) + "Show on map →" link that navigates to `/maps` and highlights the prayer-room POI.
- [ ] **Daily Verse / Hadith card:** fetch today's row from `daily_content` table. Fall back to a hardcoded default verse if row is missing.
- [ ] Wire `prayer_page_viewed` event via `app_events` table on page load
- [ ] Write Supabase migrations: `masjid_schedules`, `daily_content`

### 5E – Admin: Imam Prayer Form
- [ ] Build `/admin/prayers` page — role-gated (imam or admin only)
- [ ] Form: select masjid (Dow Main / CHK) → edit congregational times for each prayer → save to `masjid_schedules`
- [ ] Form: add / edit / delete Daily Verse rows in `daily_content` (date picker + verse text + source)
- [ ] Show current live values as read-only preview so imam can verify before saving

---

## Phase 6 – Polish & QA (Days 36–38) — critical path to beta

### Must-do before beta
- [ ] Full mobile-first QA pass: every screen at 375 px, all touch targets ≥ 44 × 44 px, correct keyboard types on inputs
- [ ] Pro-tier paywall enforcement audit: Viva Bot 1-free-session taste works + subsequent sessions block correctly, AI Tutor enforces 5/6 rate limit, Saved Qs 20-cap works, AI Study Plan Pro gate works, Pro users unlimited on all
- [ ] Error-state + loading-state review: toast messages, skeleton placeholders, network-error banners on every async page
- [ ] Lighthouse run: target Performance ≥ 90, Accessibility ≥ 90. Fix anything below.
- [ ] Bundle-size check: ensure no bloat from unused deps
- [ ] Capacitor build: `ionic build`, package APK, test install on real Android, verify FCM push arrives
- [ ] Prayer Times offline check: verify azan calc + qibla + Hijri all work with network off

### Deferred to Phase 8 (pre-full-launch)
- [ ] WCAG AA contrast audit — iterate during beta feedback window
- [ ] Build `/admin/analytics` dashboard (see `decisions/analytics-logging.md`)
- [ ] Bulk-seed remaining MCQ content (target 800+ questions)
- [ ] Final review of `docs/admin-content-upload.md`

---

## Phase 7 – Beta Launch (Mar 14, Day 39)

- [ ] Deploy to Vercel production with production env vars (not preview)
- [ ] Onboard first 20–50 beta testers from Batch 1 (personal invites)
- [ ] Dow ID approval workflow live — manual review queue active
- [ ] Seed `masjid_schedules` with real Dow Main + CHK congregational times before launch
- [ ] Seed first 7 days of `daily_content` (verses / hadith)
- [ ] Instagram beta-launch Reel goes live (pain-point hook + product reveal — script in `marketing-launch.md`)
- [ ] WhatsApp blast to Dow student groups (message in `marketing-launch.md`)
- [ ] Monitor dashboard live: error rates (Sentry), API latency, Supabase usage, DAU

---

## Phase 8 – Beta Feedback & Iteration (Mar 15–27, Days 40–52)

- [ ] Triage bugs daily — patch critical issues same-day
- [ ] Iterate on UX based on beta feedback — Education tab + AI Tutor are top priority
- [ ] Complete all deferred Phase 6 items: WCAG audit, `/admin/analytics`, 800+ MCQ seed
- [ ] Collect beta assets for full-launch marketing: student quotes, usage stats, screen recordings (see `marketing-launch.md` §7)
- [ ] Instagram teaser Stories: beta progress updates, feature peeks
- [ ] Draft + review LinkedIn post: founder story + ed-tech Pakistan vision + B2B university pitch
- [ ] Internal retrospective: what worked, what didn't
- [ ] Kick off Phase 2 product planning: DowEats, Dow Merch, Marketplace

---

## Phase 9 – Full Launch (Mar 28, Day 53)

- [ ] Open self-serve signups to all Dow students (remove beta-only gate)
- [ ] Instagram full-launch Reel goes live (beta proof + feature tour — script in `marketing-launch.md`)
- [ ] LinkedIn post live: founder story + ed-tech Pakistan + B2B university pitch
- [ ] WhatsApp blast to all Dow student groups (message in `marketing-launch.md`)
- [ ] Engage every comment and reply on launch day (all hands)
- [ ] Monitor at scale: error rates, DAU, API costs (Gemini + Groq + TTS), Pro conversion rate
- [ ] Patch critical issues same-day

---

## Parallel Workstreams (run across Phases 2–9)

### Content Prep — Azfar
- [ ] Receive MCQ CSV format spec (from `admin-content-upload.md`) — Day 10
- [ ] Produce first 100 MCQs across 2–3 modules — target ready by Day 17
- [ ] Produce Viva sheets for all Batch 1 current modules — target ready by Day 24
- [ ] Bulk-seed to 800+ MCQs — target Phase 8 (before full launch)
- [ ] Prepare rolling 30-day `daily_content` seed (verses + hadith) — target ready by Day 34

### Marketing — from Mar 7
- [ ] Mar 7–13: Post Instagram teaser Stories (5-post sequence — see `marketing-launch.md`)
- [ ] Mar 14: Beta Reel + WhatsApp blast (see `marketing-launch.md`)
- [ ] Mar 15–27: Beta-progress Stories + finalize LinkedIn post
- [ ] Mar 28: Full-launch Reel + LinkedIn post + WhatsApp blast

### Campus Map Data
- [ ] Request CAD/PDF floor plans for Dow main building (campus indoor map dependency)
- [ ] Trace 20–30 bus routes in QGIS — target ready by Day 31 (Point Routes dependency)
- [ ] Mark Prayer Room POI on campus map GeoJSON (Dow Main Ground Floor)

---

### Housekeeping
- [x] PR `feature/day4-maps-decision` → `main` — DONE (merged + pushed)
- [ ] Commit each logical unit to a feature branch → PR → merge (never push to main)
- [ ] Keep `docs/sessions/` updated every session (mandatory per CLAUDE.md #11)
