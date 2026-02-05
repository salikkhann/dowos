# DowOS – Comprehensive Feature Build Todo

Last updated: 2026-02-06 (Session 10). Full coverage: Phases 1–14 + all parallel workstreams.
Tick items off as you go. Re-create when the list drains.

**RULE:** Always update this file when work is marked complete. Tick off items immediately in this file, same as in TodoWrite.

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
- [x] Day 3 – RAG: `rag-architecture.md` LOCKED
- [x] Day 4 – Maps: `maps-platform.md` LOCKED
- [x] Day 5 – Voice/STT: `voice-stt.md` LOCKED
- [x] Day 6 – AI Routing: `ai-routing-fallback.md` LOCKED
- [x] Day 7 – Mobile: `mobile-delivery.md` LOCKED
- [x] Day 8 – Viva Orchestration: `viva-bot-orchestration.md` LOCKED
- [x] Day 9 – Sign-off: All conflicts resolved. `FINAL_LOCKED_DECISIONS.md` rewritten.

### ✓ UI & Product Decisions
- [x] Education tab structure: `education-tab.md` LOCKED
- [x] Mobile vs Web UI: `mobile-web-ui.md` LOCKED
- [x] All-pages UI structure: `ui-page-structure.md` LOCKED
- [x] Profile card + UX conventions: `profile-card-ux.md` LOCKED

### ✓ Product & Operational Decisions
- [x] Dow Credits + Pro upgrade flow: `credits-payment.md` LOCKED
- [x] Dow ID approval workflow: `dow-id-approval.md` LOCKED
- [x] Push notification permission strategy: `push-notifications.md` LOCKED
- [x] DowEats operational spec: `doweats-ops.md` LOCKED
- [x] Marketplace ops: `marketplace-ops.md` LOCKED
- [x] Viva Bot scoring: `viva-scoring.md` LOCKED

### ✓ Stale Docs Reconciled
- [x] Rate limit conflict resolved — locked at soft 2 / hard 4
- [x] `5_UXUI_GUIDELINES.md` nav updated
- [x] `00_DISCOVERY_RESOLVED.md` maps block updated
- [x] `FINAL_LOCKED_DECISIONS.md` rewritten

### ✓ Cursor Handoff Docs
- [x] `.cursorrules` created
- [x] `docs/cursor-guide.md` written
- [x] `docs/decisions/upload-pipeline.md` LOCKED
- [x] `docs/decisions/analytics-logging.md` LOCKED
- [x] `docs/admin-content-upload.md` written

---

## Phase 2 – Core Shell, Timetable & Admin (Days 10–16)

### 2A – Tooling & Infra (Day 10)
- [x] Read `docs/cursor-guide.md` before first Cursor session
- [ ] Install + configure Sentry: `npx @sentry/cli login`, add `@sentry/nextjs`, wire `src/instrumentation.ts`
- [ ] Create Resend account → add `RESEND_API_KEY` to `.env.local`
- [x] Write `src/lib/api-rates.ts` — cost-rate table (per-model $/1 K tokens)
- [x] Write `src/lib/api-logger.ts` — `logApiCall()` helper
- [x] Write Supabase migrations: `api_usage_log` + `app_events` + RLS — ✅ APPLIED
- [x] Write Supabase migrations: `years` (5), `modules` (30), `subjects` (42), `module_subjects`, `subtopics` — ✅ APPLIED
- [ ] Install `adhan` + `hijri-converter` npm packages (prayer calc — client-side)
- [ ] Set up PostHog for product analytics — DAU/MAU, feature usage, funnels, retention cohorts (PRD §Deployment)
- [ ] Write email templates via Resend: welcome email, Dow ID approved/rejected, Pro confirmed/expiring, order confirmations

### 2B – NavShell + Dashboard (Days 10–11)
- [x] Build `<BottomNav />` — 5 items, active-route highlight, 44 px tall, safe-area inset
- [x] Build `<Sidebar />` — config-driven from `nav.ts`, section headers, active highlight, role-gated items
- [x] Build `<NavShell />` — `'use client'` leaf, media-query switch at 1024 px
- [x] Build sidebar avatar mini-card (Identity section)
- [x] Build mobile avatar tap → bottom sheet (Settings / Profile / Help / Logout)
- [x] Wire dark-mode toggle (`next-themes` already installed)
- [x] Stub all nav links to their route pages
- [x] Build Dashboard page: time-aware greeting + skeleton widget stack

### 2B-2 – Profile, Settings, Admin Stubs (Day 11)
- [ ] Build Profile page: glassmorphic student card + photo upload — see `profile-card-ux.md` §2
- [ ] Build Pro badge display: Gold ring on glassmorphic card for Pro users, "PRO" label
- [ ] Build profile edit flow: update name, photo, learning style, explanation depth
- [ ] Build Settings page: notification preferences (on/off per category, quiet hours 10 PM–6 AM customizable), theme toggle, voice speed (0.8x–1.5x), voice gender, language
- [ ] Build Help page: FAQ accordion, contact form / WhatsApp link, app version display, link to feedback form
- [ ] Build first-login onboarding wizard: learning style → explanation depth → notification prefs (one-time, PRD §Auth)
- [ ] Build Admin route group `/admin/` — role-gating middleware + stubs
- [ ] Wire Dashboard live data to curriculum tables (year/batch, enrolled modules, subjects)

### 2C – Timetable, Attendance & Dashboard Widgets (Days 12–14)
- [ ] Write Supabase migrations: `timetable_entries`, `viva_schedules`, `attendance`
- [ ] Build timetable week-view component (Mon–Sat, color-coded by subject)
- [ ] Show class details per slot: class name, time, location (room/hall), faculty name
- [ ] Add viva toggle: shows viva schedule with roll numbers (lab group or clinical group specific)
- [ ] Handle lab groups (A–F for Y1–Y2) vs clinical groups (14–15 students, Y3+) display
- [ ] Build ISR revalidation for timetable (5-min interval via Supabase)
- [ ] Build Supabase Realtime subscription for timetable: live updates push to connected clients
- [ ] Build attendance check-in button + haptic feedback (`@capacitorjs/haptics`) + sound effect + animation ("Checking in..." → "✓ Checked in" with 2 s delay)
- [ ] Build per-module attendance % breakdown display
- [ ] Build runway calculator card: "You can safely skip X classes and stay at 75%", dynamic calculation based on remaining classes
- [ ] Build attendance history view: past check-ins list, filterable by module + date range
- [ ] Wire live Dashboard widgets: next-class card, mark present/absent, attendance-warning banner, exam countdown timer, current module display
- [ ] Wire Dashboard **Prayer Times mini-card**: next upcoming prayer + live countdown (client-side via `adhan`, Karachi 24.8607° N / 67.0011° E, Umm al-Qura method)

### 2D – Admin Dashboard (Days 13–16)
- [ ] Create `/admin/` route group (service-role gated middleware using `auth.jwt() ->> 'role' = 'admin'`)
- [ ] Build admin dashboard overview: total users, pending Dow ID approvals, content stats (MCQs/viva sheets/PDFs uploaded), API cost summary (this month), active Pro subscribers
- [ ] Build Dow ID approval queue — pending list → photo preview → approve / reject + reason picker (see `dow-id-approval.md`)
- [ ] Wire approval/rejection email via Resend
- [ ] Build MCQ bulk-upload page: CSV/JSON → preview table → duplicate detection → required-field validation (module, subject, difficulty, options, correct answer) → save
- [ ] Build Viva sheet upload page: CSV → preview → validate columns (question, model_answer, key_points, difficulty) → save
- [ ] Build textbook/PDF upload page: drag-drop → progress bar via SSE → triggers Gemini 2.5 Pro extraction → chunk → embed pipeline (see `upload-pipeline.md`)
- [ ] Build content-list view: list / edit / delete / archive, filterable by module & subject & content type
- [ ] Add upload-status indicators: `Queued` → `Processing` → `Ready` / `Errored` (with retry button)
- [ ] Build admin user management page: student list, search by name/roll number, filter by batch/status/role, manual role assignment (student/admin/imam)
- [ ] Build admin timetable editor: add/edit/delete timetable entries per batch, bulk import
- [ ] Wire `app_events` logging into: login, logout, Dow ID upload, content upload, admin actions

---

## Phase 3 – AI & Learning Core (Days 17–23)

### 3A – RAG & Embedding Pipeline (Day 17 — prerequisite for AI features)
- [ ] Set up pgvector extension in Supabase (`CREATE EXTENSION IF NOT EXISTS vector`)
- [ ] Write embedding pipeline: textbook PDF → Gemini 2.5 Pro extraction (via Files API) → sentence/paragraph chunking → Gemini `text-embedding-004` (768 dims) → store in pgvector
- [ ] Build BM25 sparse index for keyword retrieval alongside dense vectors
- [ ] Build retrieval function: hybrid search (dense + BM25) → Reciprocal Rank Fusion → cross-encoder re-rank → return top-K chunks
- [ ] Build Google Search grounding integration: inject web results when RAG confidence is low
- [ ] Build high-yield topic scoring: weight past-paper questions higher in retrieval (from `rag-architecture.md`)
- [ ] Write Supabase migrations: `document_chunks` (with `embedding vector(768)`), `document_sources`
- [ ] Test end-to-end: upload PDF → chunk → embed → query → retrieve relevant context → verify accuracy

### 3B – Education Landing + MCQ Solver (Days 17–19)
- [ ] Build `education/page.tsx` — cards grid landing screen (MCQ, Viva Bot + Browse Q&A, Saved Questions, Study Tracker). Server Component with parallel data fetch for badges.
- [ ] Build MCQ source picker: **Tested Questions** (default) vs **General Questions** toggle
- [ ] Build Tested Questions drill flow: year picker (badge shows Q count per year) → module → subject → drill. Show Annual/Supplementary badge per question.
- [ ] Build General Questions drill flow: module → subject → topic. Toggle: subject-wise (default, all topics shuffled) / topic-wise (pick specific topic)
- [ ] Build shared drill screen: question → options (A–E) → select → reveal correct answer + AI explanation → swipe/tap next
- [ ] Wire AI explanations: Gemini streaming, RAG-backed context (module/subject scoped), citations from Dow slides/textbooks
- [ ] Build drill-entry analytics bar: `% correct · N done` + `streak` (resets if no drill in 24 h). Scope = current selection shown in breadcrumb.
- [ ] Build filter pills: `[All]` `[Incorrects]` `[Undone]` — updates question list + count in real time
- [ ] Add bookmark icon (top-right of each question) → save to Saved Questions (filled = saved, tap to unsave)
- [ ] Add **"Ask AI →"** button on every MCQ explanation → navigates to `/ai` with question + explanation pre-loaded as context (Free for all — conversion trigger, see `education-tab.md` §5.5)
- [ ] Build MCQ review mode: view past attempts, filter by date/topic/performance, retake with different question order
- [ ] Wire `api_usage_log` into every MCQ Solver API call via `logApiCall()`
- [ ] Write Supabase migrations: `mcq_questions`, `past_paper_questions`, `mcq_attempts`, `saved_questions`

### 3C – AI Tutor Chat (Days 17–19, parallel with 3B)
- [ ] Build `/ai` chat screen: message list (assistant + user bubbles), input bar, send button
- [ ] Wire Gemini Flash streaming — typing indicator while response streams
- [ ] Build AI mode selector: Auto (router picks), Quick (Flash), Tutor (Flash step-by-step: explain → ask → verify → relate), Socratic (DeepSeek R1, Pro-gated)
- [ ] Build complexity router: keyword-based classification ("calculate", "derive", "compare", "why", "how" → Complex; word count > 50 → Complex; user struggled before → Complex; else → Simple)
- [ ] Wire RAG context retrieval: hybrid pgvector search → re-rank → inject top-K chunks into prompt
- [ ] Include module/subject context tag in every prompt for medical accuracy
- [ ] Build session memory: persist `chat_sessions` + `chat_messages` to Supabase (last 10 messages as context window)
- [ ] Build chat history sidebar: past conversations list, rename, delete, search
- [ ] Build long-term memory: `user_knowledge_base` (pgvector) — topics studied, weak areas, strong signals extracted from conversations
- [ ] Build rate-limit UI: soft warning toast at 2 msgs/day (Free, +5 s delay), hard block + upgrade CTA at 4 msgs. Pro = unlimited. Reset daily at midnight PKT.
- [ ] Build clear chat button + confirm dialog
- [ ] Wire Tier 2 fallback: if Flash errors 3×, route to DeepSeek R1 (see `ai-routing-fallback.md` — 3-attempt chain Tier 1, 2-attempt downgrade Tier 2)
- [ ] Wire `api_usage_log` into every AI Tutor call (model, tokens, cost, latency)
- [ ] Write Supabase migrations: `chat_sessions`, `chat_messages`, `user_knowledge_base`

### 3D – AI Tutor Voice Mode (Days 20–21)
- [ ] Build voice recording button (always visible on AI chat input bar, uses `@capacitorjs/camera` microphone access on mobile or Web Audio API on desktop)
- [ ] Wire Groq Whisper Large v3 Turbo for STT (Pakistani-accent medical terms — $20/mo budget)
- [ ] Wire Gemini medical-term correction pass on transcription (see `voice-stt.md`)
- [ ] Wire Google Cloud TTS for voice output ($5–10/mo): selectable male/female, speed 0.8x–1.5x
- [ ] Build voice settings UI: voice on/off toggle, speed slider, voice gender picker, pronunciation preferences
- [ ] Voice mode Pro-gated: Free users see "Upgrade to Pro for voice mode" CTA. Pro users get unlimited voice.
- [ ] Build audio waveform visualizer during recording (optional polish)
- [ ] Wire `api_usage_log` into STT (Groq) + TTS (Google Cloud) calls

### 3E – Content Seed Checkpoint (Day 22)
- [ ] Confirm Azfar has first 100 MCQs uploaded via admin dashboard
- [ ] Confirm 2–3 textbook PDFs ingested end-to-end: upload → extract → chunk → embed → retrievable by AI Tutor
- [ ] Test AI Tutor responses with seeded content — verify RAG retrieval quality
- [ ] Test MCQ drill end-to-end: pick module → subject → drill → answer → see AI explanation
- [ ] Test "Ask AI →" flow: MCQ explanation → tap → lands in AI Tutor with context

---

## Phase 4 – Viva Bot & Browse Q&A & Progress (Days 24–30)

### 4A – Viva Bot Voice Drill (Days 24–27)
- [ ] Build Viva entry: module → subject picker (shared component with Browse Q&A). Only show subjects with uploaded viva content — no dead ends.
- [ ] Build mode picker card: Strict / Friendly / Standard — show description + scoring weight breakdown per mode
- [ ] Build **GREET** state: examiner greeting via Google Cloud TTS ("Good morning, I'll be your examiner today..."), session timer starts
- [ ] Build **ASK** state: question delivery via TTS, mic-button for student answer, recording indicator
- [ ] Build **EVALUATE** state: capture speech via Groq Whisper STT → LLM scores against model answer (correctness 25 pts, confidence 10–15 pts, articulation 7–10 pts per mode)
- [ ] Build transcript display: show student's transcribed answer, allow manual text correction before final submission
- [ ] Build **FOLLOWUP** state: adaptive follow-up if answer was weak (dig deeper); skip if strong (move on)
- [ ] Build **SCORE** state: session report card — 50-point total, per-question breakdown, per-dimension scores, strengths summary, weaknesses summary, study recommendations
- [ ] Build adaptive difficulty: adjust question difficulty 1–5 based on running performance within session
- [ ] Build **1 free session taste** for Free users: first Viva session plays fully → ends with "That's your free session. Upgrade to Pro for 180 min/month." Subsequent sessions → Pro paywall modal
- [ ] Build **180 min/month** usage tracker for Pro users: show remaining time in session UI, warn at 10 min remaining, block at 0, reset monthly
- [ ] Wire `api_usage_log` into every Viva Bot + STT (Groq) + TTS (Google Cloud) call
- [ ] Integration test: full voice round-trip latency < 3 s (student speaks → transcribe → evaluate → TTS response)
- [ ] Write Supabase migrations: `viva_sheets`, `viva_bot_sessions`, `viva_bot_responses`

### 4B – Browse Q&A (Day 28)
- [ ] Build Browse Q&A page at `/education/viva/browse` — expandable question list (Free for all)
- [ ] **Collapsed row:** question number + text + `[Show answer]` cue
- [ ] **Expanded row:** question → `── Answer ──` (model_answer) → `── Key points ──` (bullet list from key_points) → `[Save]` `[Collapse]`
- [ ] Wire to same viva sheet data as Viva Bot (same module → subject picker upstream)
- [ ] Save button → adds question to Saved Questions collection (tracks "touched" signal for Study Tracker)
- [ ] Smooth expand/collapse animation

### 4C – Study Tracker + AI Study Plan + Saved Questions (Days 29–30)

**Heatmap (combined: manual checklist + auto scores — see `study-tracker.md`):**
- [ ] Build Study Tracker heatmap page at `/education/progress`: rows = modules, columns = subjects, each cell shows **coverage %** (manual ticks) + **mastery %** (auto from MCQ/Viva/Flashcards)
- [ ] Colour-code mastery cells: 🟩 Strong (≥ 70 %), 🟨 Progressing (40–69 %), 🟥 Needs Work (< 40 %), ⬜ Not Attempted
- [ ] Show coverage % as separate progress bar per cell (not colour-coded — binary per subtopic)
- [ ] Add colour legend strip (always visible above/beside heatmap)
- [ ] Add attempt-count badge on every cell (bottom-right corner)
- [ ] Wire multi-source mastery calculation: MCQ accuracy × 50% + Viva Bot performance × 30% + spaced repetition × 20%
- [ ] Multi-source data feed: MCQ attempts (full weight), Browse Q&A reads (low weight — "touched"), Viva Bot session scores (full weight)

**Subtopic checklist drill-down (manual tick-off per subtopic):**
- [ ] Build subtopic checklist page: tap any heatmap cell → show all subtopics for that module + subject
- [ ] Each subtopic row: checkbox (manual tick) + auto MCQ/Viva/Flashcard scores + "Drill this topic →" CTA
- [ ] Persist manual ticks to `student_topic_coverage` table (student_id + subtopic_id + is_covered + covered_at)
- [ ] Build auto-tick suggestion: when ≥ 5 MCQ attempts with ≥ 60% accuracy on a subtopic, suggest "Mark as covered?" (one-tap confirm)
- [ ] Subtopics with low mastery + not ticked get subtle highlight (nudge to study)
- [ ] Write Supabase migration: `student_topic_coverage` table + RLS (students read/write own rows only)

**Batch aggregate view:**
- [ ] Build "My Batch" tab/toggle on Study Tracker page: anonymized aggregate stats
- [ ] Show per-module: "X% of your batch has covered this module" (average coverage %)
- [ ] Show per-subject: bar chart of batch distribution, student's own position as marker
- [ ] Privacy: only show aggregates with ≥ 5 students per bucket, never expose individual data
- [ ] Batch aggregate computed server-side, cached 1 hour

**Top-level cards + AI Study Plan:**
- [ ] Build tap-to-drill-down on heatmap cells: mini stats panel (attempts, correct, incorrect, week-on-week trend ↑/↓) + "Drill this topic →" CTA
- [ ] Build **Top 3 Weak Topics** card: auto-detects subjects with most attempts + lowest accuracy. Tap → MCQ drill filtered.
- [ ] Build **Exam Readiness score** per module: `(% subjects attempted) × (avg accuracy)`. Display next to each module name.
- [ ] Build **Annual Exam Planner mode** (activates during prof break): coverage % per module, recommended study order, exam countdown, mock exam suggestions
- [ ] Build **AI Study Plan** card (Pro-gated): reads heatmap + coverage data → Gemini Flash weekly 3-topic plan. Free = blurred preview + upgrade CTA. Refresh every 7 days, max 1 manual refresh/day.
- [ ] Wire `logApiCall()` into every AI Study Plan Gemini call
- [ ] Write Supabase migrations: `ai_study_plans`
- [ ] Seed `subtopics` table from Salik's existing batch tracker data (full module → subject → subtopic hierarchy)

**Saved Questions:**
- [ ] Build Saved Questions page at `/education/saved` — list of all saved questions
- [ ] Add source filter pills on Saved Questions: `[All]` `[MCQ]` `[Browse Q&A]` `[Flashcards]`
- [ ] Wire **20-question cap** for Free users (server-side enforcement + client CTA). Show "Upgrade to Pro — save unlimited" when cap reached.
- [ ] Wire live saved-count badge on Education landing Saved Questions card (hidden if 0)
- [ ] Coordinate with Azfar: all Viva sheets for Batch 1 current modules seeded

---

## Phase 5 – Community, Prayers & Maps (Days 31–35)

### 5A – Lost & Found (Days 31–32)
- [ ] Build post form: item type (lost / found), title, description, photo upload (optional, Supabase Storage), location (dropdown: Library / Cafeteria / Lab / Lecture Hall / Other), date, contact method (phone / WhatsApp — auto-populated from profile, option to hide last digits)
- [ ] Build browse list: card grid with photo thumbnails, search bar, filters by type (lost/found) + date + location
- [ ] Add WhatsApp deep-link on each listing card (opens WhatsApp chat with poster's number)
- [ ] Build "mark as resolved" button on own listings — moves to resolved state
- [ ] Build 30-day auto-archive: Supabase scheduled function or pg_cron — status flips to `archived`, hidden from default view
- [ ] Build Supabase Realtime subscription: new posts appear instantly for browsing students
- [ ] Write Supabase migration: `lost_found_items`

### 5B – Point Routes / Campus Map (Days 32–33)
- [ ] Set up MapLibre GL JS + PMTiles tile layer (see `maps-platform.md`)
- [ ] Render campus walking paths from QGIS-digitised GeoJSON (team-created data)
- [ ] Add bus-route overlay (from team-traced routes, color-coded by route, numbered stops)
- [ ] Build location-type filter pills: bus stops, priority areas, entrances, buildings
- [ ] Build tap-on-marker popover: route name, stops list, estimated walk time
- [ ] Build "Where are you going?" destination picker dropdown → recommended route + estimated arrival time
- [ ] Add Prayer Room POI pin (cross-links from Prayer Times page "Show on map →")
- [ ] Add key campus POI pins: cafeteria, library, admin office, parking, hostels, labs, lecture halls
- [ ] Wire Google Geocoding for place-search only (scoped to campus area)

### 5C – Announcements (Days 34–35)
- [ ] Build admin post form: title, body (markdown), target audience (university-wide / batch-specific / module-specific), expiry date, pin toggle, urgency level (urgent/normal)
- [ ] Wire real-time delivery: Firebase FCM push (to targeted devices) + Supabase Realtime subscription (in-app live feed)
- [ ] Build student announcements feed: card list, sorted newest first, pinned announcements at top, batch + module filter tabs
- [ ] Build search + filter on announcements (by date range, batch, module, keyword)
- [ ] Build club announcements (Phase 2 addon): student clubs can submit → admin reviews → publish or reject
- [ ] Wire push notification delivery for announcements (uses notification categories from Phase 2E)
- [ ] Write Supabase migration: `announcements`

### 5D – Prayer Times Full Page (Days 34–35)
- [ ] Build `/campus/prayers` page — see `ui-page-structure.md` §8
- [ ] **Today's Prayers section:** calculate Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha via `adhan` (Karachi 24.8607° N / 67.0011° E, Umm al-Qura method). Checkmark (✓) on passed prayers. Bold + Teal highlight on next upcoming.
- [ ] **Hijri date:** display at page top, calculated client-side via `hijri-converter`
- [ ] **Dow Masjid card:** congregational (jamaat) times from `masjid_schedules` (`masjid_id = 'dow_main'`). Show opening hours + jamaat time for each prayer.
- [ ] **CHK Masjid card:** same structure, `masjid_id = 'chk'`
- [ ] **Qibla compass widget:** device lat/lng via `navigator.geolocation` (or `@capacitorjs/geolocation` on mobile) → calculate bearing via `adhan`. Show compass rose with arrow pointing toward Mecca + numeric bearing. Fallback to Karachi coords if denied.
- [ ] **Nearest Prayer Room card:** static text (Dow Main · Ground Floor) + "Show on map →" link → `/maps` with prayer-room POI highlighted
- [ ] **Daily Verse / Hadith card:** fetch today's row from `daily_content` table. Fallback to hardcoded default if missing.
- [ ] Build prayer notification opt-in: "Remind me X minutes before each prayer" → schedules local notifications via `@capacitorjs/local-notifications`
- [ ] Wire `prayer_page_viewed` event via `app_events` table on page load
- [ ] Test offline: verify azan calc + qibla + Hijri all work with no network
- [ ] Write Supabase migrations: `masjid_schedules`, `daily_content`

### 5E – Admin: Imam Prayer Form
- [ ] Build `/admin/prayers` page — role-gated (imam or admin only)
- [ ] Form: select masjid (Dow Main / CHK) → edit congregational times for each prayer → save to `masjid_schedules`
- [ ] Form: add / edit / delete Daily Verse rows in `daily_content` (date picker + verse text + source reference)
- [ ] Show current live values as read-only preview so imam can verify before saving

---

## Phase 6 – Dow Credits & Pro Subscription (Days 33–35, parallel with Phase 5)

### 6A – Dow Credits System
- [ ] Write Supabase migrations: `credits_balances`, `credits_transactions`, `top_up_requests`
- [ ] Build wallet page (`/profile/wallet` or `/settings/wallet`): balance display (large number, PKR equivalent), "Add Credits" CTA, recent transactions list (date, amount, type, status)
- [ ] Build "Add Credits" sub-flow:
  - [ ] Step 1: Amount selection — preset chips (500 / 1000 / 3000, touch targets 44 px) + custom amount input. Show "1 Credit = PKR 1" conversion always.
  - [ ] Step 2: Payment instructions — Easypaisa + JazzCash numbers displayed, "Copy number" one-tap button
  - [ ] Step 3: Receipt upload — camera or gallery pick, upload to Supabase Storage
  - [ ] Step 4: "Pending verification" state — show status + estimated wait (5–10 min)
- [ ] Build admin top-up verification queue: pending requests with receipt photo preview → approve (credits added instantly) / reject (with reason, student notified)
- [ ] Build balance-check middleware: block purchases when credits insufficient, redirect to "Add Credits" flow
- [ ] Build transaction history page: all debits and credits, filterable by type (top-up, purchase, refund, Pro subscription)
- [ ] Wire push notification: "Your credits have been added" when admin approves

### 6B – Pro Subscription Flow (separate from Dow Credits — direct Easypaisa/JazzCash payment)
- [ ] Build Pro upgrade page: feature comparison table (Free vs Pro side-by-side), pricing cards (PKR 3 000/year annual, PKR 1 500/3-month exam-season pass), "Upgrade Now" CTA
- [ ] Build Pro payment flow (NOT through Dow Credits — separate direct payment):
  - [ ] Step 1: Select plan (Annual PKR 3 000 or Exam Pass PKR 1 500)
  - [ ] Step 2: Payment instructions — send PKR to Easypaisa/JazzCash number (same manual flow as credits, but separate transaction type)
  - [ ] Step 3: Upload payment receipt screenshot
  - [ ] Step 4: "Pending verification" → admin approves → `is_pro = true` + `pro_expires_at` set → confirmation email via Resend + push notification
- [ ] Build admin Pro verification queue: pending Pro payment requests → view receipt → approve (Pro activated) / reject (with reason)
- [ ] Build Pro badge display across app: Gold ring on glassmorphic profile card, "PRO" badge on sidebar mini-card, Pro indicator on chat screen
- [ ] Build Pro expiry handling: warn 7 days before expiry (push + in-app banner), warn 1 day before, downgrade to Free on expiry (revoke all Pro gates), grace period (24 h after expiry to renew without losing data)
- [ ] Build Pro renewal flow: "Renew Pro" CTA in profile + Settings + expiry warning banner
- [ ] Wire all Pro gates across the app:
  - [ ] AI Tutor: unlimited messages (vs 2 soft / 4 hard)
  - [ ] AI Tutor Voice: enabled (vs blocked)
  - [ ] Viva Bot: 180 min/month (vs 1 free session)
  - [ ] Saved Questions: unlimited (vs 20 max)
  - [ ] AI Study Plan: full access (vs blurred preview)
  - [ ] Chat history: persisted (vs not)
  - [ ] Offline content download: enabled (Phase 2)
- [ ] Build reusable upgrade CTA components: `<PaywallModal />` (full-screen comparison), `<UpgradeBanner />` (inline), `<ProBadge />` (small badge)
- [ ] Write Supabase migrations: `pro_subscriptions` table (user_id, plan_type, payment_receipt_url, status, approved_by, starts_at, expires_at) + add `is_pro`, `pro_expires_at` to `users`

---

## Phase 7 – Capacitor Build, Push Notifications & QA (Days 36–38) — critical path to beta

### 7A – Capacitor Android Build (Day 36)
- [ ] Run `capacitor init` + configure `capacitor.config.ts` (app name, bundle ID `com.dowos.app`, server URL)
- [ ] Run `npx cap add android` — scaffold Android project
- [ ] Install `@capacitorjs/push-notification` plugin — wire FCM token registration
- [ ] Install `@capacitorjs/camera` plugin — replace web file input for Dow ID + avatar photo
- [ ] Install `@capacitorjs/splash-screen` plugin — branded splash on app open (Navy bg + DowOS logo)
- [ ] Install `@capacitorjs/haptics` plugin — wire haptic feedback for attendance check-in, button presses
- [ ] Install `@capacitorjs/status-bar` plugin — match status bar color to theme (Navy light / dark-bg dark)
- [ ] Install `@capacitorjs/keyboard` plugin — auto-scroll when keyboard opens on chat input
- [ ] Install `@capacitorjs/app` plugin — handle back button, app state (foreground/background)
- [ ] Install `@capacitorjs/local-notifications` plugin — schedule local prayer reminders without server
- [ ] First working APK build: `npm run build && npx cap sync && npx cap open android` → test on real device
- [ ] Upload APK to Play Store **internal testing track** (instant deploy to team)

### 7B – Push Notifications — Mobile (Day 36–37)
- [ ] Configure Firebase project: create Android app entry, download `google-services.json`, place in `android/app/`
- [ ] Wire FCM token registration on app startup: `PushNotifications.register()` → save token to `users.fcm_token` in Supabase
- [ ] Handle token refresh: update Supabase when FCM token changes
- [ ] Build server-side push sender: Next.js API route → Firebase Admin SDK → send to user/batch/all
- [ ] Build notification permission priming card: show on Day 2 of usage (not first login), explain value (class changes, attendance reminders, exam alerts, payment confirmations), "Turn on" → native OS dialog, "Maybe later" → dismiss (see `push-notifications.md` §3)
- [ ] Build retry logic: if declined, try again in 7 days (one more time only). Max 2 asks lifetime.
- [ ] iOS special handling: if native dialog returns "denied", show toast "You can enable notifications in Settings → DowOS any time"
- [ ] Build notification categories with quiet hours logic:
  - [ ] **Urgent** (bypass quiet hours): exam schedule change, emergency admin announcement, class in 5 min
  - [ ] **Normal** (respect quiet hours): attendance reminder, general announcement, order status
  - [ ] **Low** (respect quiet hours): Dow ID status change, credits confirmed, Pro expiry warning
- [ ] Build quiet hours engine: default 10 PM – 6 AM PKT. Normal + Low notifications held → delivered at 6 AM. Students can adjust in Settings.
- [ ] Build local notification scheduling via `@capacitorjs/local-notifications`: prayer time alerts (X min before each prayer), class reminders (15 min before)
- [ ] Build in-app notification toast: show Sonner toast when push arrives while app is in foreground
- [ ] Build notification badge: unread count on BottomNav bell icon
- [ ] Test push end-to-end: send from admin → arrives on Android device in < 5 s

### 7C – QA (Days 37–38)
- [ ] Full mobile-first QA pass: every screen at 375 px, all touch targets ≥ 44 × 44 px, correct keyboard types on inputs (email, number, text)
- [ ] Dark mode QA: verify all screens render correctly in dark mode, check Teal/Gold/Red contrast on dark bg `#0F1823`
- [ ] Capacitor Android QA: test full app on real Android device — navigation, camera, push, haptics, back button, keyboard behavior
- [ ] Pro-tier paywall enforcement audit: Viva Bot 1-free-session taste → subsequent block, AI Tutor 2/4 rate limit works, Saved Qs 20-cap enforced server-side, AI Study Plan blurred for Free, Voice mode blocked for Free
- [ ] Error-state + loading-state review: toast messages (Sonner), skeleton placeholders on every data-loading page, network-error banner ("You're offline — showing cached data"), retry buttons on failed API calls
- [ ] Empty-state review: every page with zero data shows a friendly empty state (illustration + "Get started" CTA), not a blank screen
- [ ] Lighthouse run: target Performance ≥ 90, Accessibility ≥ 90. Fix anything below.
- [ ] Bundle-size check: `npx @next/bundle-analyzer`, ensure no bloat from unused deps, tree-shaking working
- [ ] Prayer Times offline check: verify azan calc + qibla compass + Hijri all work with airplane mode
- [ ] Cross-browser testing: Chrome Android, Safari iOS, Samsung Internet, Chrome desktop, Firefox desktop
- [ ] Form validation audit: all forms have proper validation, inline error messages, disabled submit states, loading spinners
- [ ] Rate-limit edge cases: test at exactly 2 msgs (soft), exactly 4 msgs (hard), timezone rollover at midnight PKT, Pro user has no limits
- [ ] Security audit: OWASP top 10 check, RLS policy verification on every table, input sanitization review, API route auth checks
- [ ] Deep-link testing: verify all internal links work on both web and Capacitor app
- [ ] Notification testing: verify all push categories arrive correctly with right urgency, quiet hours respected
- [ ] Credits flow testing: full top-up → admin approve → purchase → balance update flow

### Deferred to Phase 9 (pre-full-launch)
- [ ] WCAG AA contrast audit — iterate during beta feedback
- [ ] Build `/admin/analytics` dashboard: API cost summary (per model per day), DAU/MAU chart, feature usage breakdown, revenue tracking (Pro subs + credits), user growth (see `analytics-logging.md`)
- [ ] Bulk-seed remaining MCQ content (target 800+ questions)
- [ ] Final review of `docs/admin-content-upload.md`

---

## Phase 8 – Beta Launch (Mar 14, Day 39)

### Pre-launch Checklist
- [ ] Verify all env vars set in Vercel production: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `GOOGLE_CLOUD_TTS_KEY`, `RESEND_API_KEY`, `SENTRY_DSN`, `NEXT_PUBLIC_FIREBASE_*`, `POSTHOG_API_KEY`
- [ ] DNS + custom domain configured on Vercel (dowos.app or similar)
- [ ] SSL certificate active on custom domain
- [ ] Supabase production project configured (separate from dev if needed), RLS verified on all tables
- [ ] Firebase project configured: FCM enabled, Android app registered, `google-services.json` in APK
- [ ] Logo finalized and exported — all variants (see `marketing-launch.md` §2.5) — deadline Mar 6
- [ ] Play Store listing prepared: screenshots, description, logo, feature graphic → upload to internal testing track
- [ ] Sentry release tracking configured: source maps uploaded, release tagged

### Launch Day
- [ ] Deploy to Vercel production with production env vars
- [ ] Upload production APK to Play Store internal testing track → invite beta testers
- [ ] Onboard first 20–50 beta testers from Batch 1 (personal invites via WhatsApp)
- [ ] Dow ID approval workflow live — Salik + Ammaar monitoring approval queue
- [ ] Seed `masjid_schedules` with real Dow Main + CHK congregational times
- [ ] Seed first 7 days of `daily_content` (verses / hadith)
- [ ] Seed timetable with current Batch 1 schedule
- [ ] Instagram beta-launch Reel goes live (script in `marketing-launch.md` §6.1)
- [ ] WhatsApp blast to Dow student groups (message in `marketing-launch.md` §6.2)
- [ ] Monitor dashboard live: Sentry errors, API latency (Gemini/Groq/TTS), Supabase usage (rows/bandwidth), PostHog DAU/funnels

### Go/No-Go Criteria (from PRD)
- [ ] < 20 critical bugs outstanding
- [ ] > 4.2/5 user rating from beta testers
- [ ] 60%+ DAU retention (Day 2 / Day 1)

---

## Phase 9 – Beta Feedback & Iteration (Mar 15–27, Days 40–52)

- [ ] Set up beta feedback collection: in-app feedback button (bottom of Settings), WhatsApp feedback group (separate from main group), Google Form link
- [ ] Triage bugs daily — patch critical issues same-day, track in GitHub Issues
- [ ] Iterate on UX based on beta feedback — Education tab + AI Tutor are top priority
- [ ] Complete all deferred Phase 7 items: WCAG audit, `/admin/analytics` dashboard, 800+ MCQ seed, admin-content-upload review
- [ ] Collect beta assets for full-launch marketing: student quotes, usage stats, screen recordings, testimonials (see `marketing-launch.md` §10)
- [ ] Instagram feature-series posts (one feature per day, Mar 15–27 — full calendar in `marketing-launch.md` §7)
- [ ] Draft + review LinkedIn post: founder story + ed-tech Pakistan vision + B2B university pitch
- [ ] Internal retrospective: what worked, what didn't, process improvements for Phase 2
- [ ] Performance optimization: identify slow queries via Supabase dashboard, add indexes, cache hot paths, optimize images (WebP), lazy-load below-fold content
- [ ] Play Store: promote APK from internal → closed testing → open testing (if stable)
- [ ] Kick off Phase 2 product planning: finalize DowEats menu partnerships, Merch vendor contracts, Marketplace UX

---

## Phase 10 – Full Launch (Mar 28, Day 53)

- [ ] Open self-serve signups to all Dow students (remove beta-only gate / invite code)
- [ ] Upload production APK to Play Store **public track** → available to all Android users
- [ ] Instagram full-launch Reel goes live (beta proof + feature tour — script in `marketing-launch.md` §8)
- [ ] LinkedIn post live: founder story + ed-tech Pakistan + B2B university pitch
- [ ] WhatsApp blast to all Dow student groups (message in `marketing-launch.md` §8.2)
- [ ] Engage every comment and reply on launch day (all hands — Salik + Ammaar + Azfar)
- [ ] Monitor at scale: error rates, DAU, API costs (Gemini + Groq + TTS), Pro conversion rate, credits top-up volume
- [ ] Patch critical issues same-day
- [ ] Track Week 1–4 targets: 100 → 225 → 350 → 500 signups, 50 → 500 AI msgs/day, 30 → 400 attendance check-ins/day, 100 → 1000 MCQ attempts/day (from PRD §Success Metrics)
- [ ] Monitor app rating: target 4.2 → 4.6/5 over 4 weeks

---

## Phase 11 – Revenue Features (Weeks 5–7 post-launch)

### 11A – DowEats (Week 5)
- [ ] Write Supabase migrations: `restaurants`, `menu_items`, `menu_categories`, `orders`, `order_items`, `riders`
- [ ] Build restaurant/menu management admin page: add/edit/remove restaurants, add/edit/remove menu items per restaurant, mark items out-of-stock (instant removal from student view), set item prices
- [ ] Build student menu browsing page (`/campus/doweats`): item-first layout (NOT restaurant-first — see `doweats-ops.md`), category tabs (Biryani, Karahi, Burgers, Drinks, Desserts), restaurant tag on each item, item photo + price + description
- [ ] Build "out of stock" visual: greyed-out item, "Currently unavailable" label, no add-to-cart
- [ ] Build cart system: add items (+ button), adjust quantity (+/−), show subtotal + 15% DowOS commission (transparent line item) + total, persist cart in localStorage
- [ ] Build checkout flow: review order → confirm → debit Dow Credits → generate 6-digit order code → display code prominently ("Show this code to the rider at the gate")
- [ ] Build order status tracking: Placed → Accepted → Picked Up → At Gate → Delivered. Real-time updates via Supabase Realtime.
- [ ] Build gate-delivery flow: Ammaar/rider sees incoming orders list → marks picked up → arrives at gate → student shows 6-digit code → verify → mark delivered
- [ ] Build order history page for students: past orders, reorder button, total spent
- [ ] Build rider/Ammaar order management page (`/admin/doweats`): incoming orders queue, one-tap status updates, order details
- [ ] Set operating hours enforcement: orders only accepted 10 AM – 12:30 PM for lunch delivery 12–1:30 PM. Outside hours → "Orders open at 10 AM" message.
- [ ] Wire push notification for order status changes ("Your order is on the way", "Your order is at the gate — show code XXXXXX")
- [ ] Wire `app_events` + revenue tracking into every order (order value, commission earned)
- [ ] Target: 20 orders/day by end of Week 5

### 11B – Dow Merch (Week 6)
- [ ] Write Supabase migrations: `merch_products`, `merch_variants` (size/color combos), `merch_orders`, `merch_order_items`
- [ ] Build merch catalog page (`/campus/merch`): product cards grid with photos, price (PKR), customization options badge, "Add to Cart" button
- [ ] Build product detail page: photo gallery, size selector (XS–XXL), color variants, customization options (batch year embroidery, optional student name for lab coats), add to cart CTA
- [ ] Build merch cart + checkout: review items → confirm customizations → debit Dow Credits → order confirmed → 7-day delivery estimate
- [ ] Build merch order management admin page (`/admin/merch`): incoming orders with customization details, update production status, mark shipped/delivered
- [ ] Build merch order tracking for students: Confirmed → In Production → Ready for Pickup → Delivered
- [ ] Inventory management: stock counts per variant, pre-order toggle (unlimited orders, batch production), low-stock alerts for admin
- [ ] Product catalog: hoodies (PKR 3 500–4 500), lab coats (PKR 2 000), notebooks, pens, caps, totebags, laptop sleeves, phone covers, stickers, varsity jackets (PKR 5 000+)
- [ ] Wire push notification for order status ("Your hoodie is ready for pickup")
- [ ] Wire `app_events` + revenue tracking (gross revenue, cost of goods, margin)
- [ ] Target: 30 items/week by end of Week 6

### 11C – Marketplace (Week 7)
- [ ] Write Supabase migrations: `marketplace_listings`, `marketplace_transactions`, `marketplace_disputes`, `seller_wallets`, `seller_withdrawals`
- [ ] Build listing creation page: title, description, photos (up to 4, drag-reorder), price (PKR), category (Textbooks / Equipment / Notes / Other), condition (New / Like New / Good / Fair)
- [ ] Build marketplace browse page (`/campus/marketplace`): card grid with first photo + title + price, search bar, filter by category + price range + condition, sort by newest/price
- [ ] Build listing detail page: photo carousel (swipeable), seller info (name, batch, rating if available), "Buy Now" button, "Message Seller" WhatsApp deep-link
- [ ] Build purchase flow: buyer taps "Buy Now" → confirm → debit Dow Credits (price + 10% commission shown) → seller credited → push notification to seller ("Someone bought your textbook!")
- [ ] Build seller dashboard (`/campus/marketplace/seller`): active listings, sold items, wallet balance, withdrawal requests, listing analytics (views, saves)
- [ ] Build seller withdrawal flow: "Withdraw" → min PKR 500 threshold → 0% fees → enter bank details → submit → admin approval queue → manual bank transfer (2–5 business days) → push notification "Your withdrawal has been processed"
- [ ] Build admin withdrawal queue (`/admin/marketplace`): pending withdrawals → verify bank details → process transfer → mark complete
- [ ] Build dispute resolution: buyer or seller can raise dispute within 48 h → admin arbitration queue → resolve with full refund (buyer credited, seller debited) or release (seller keeps funds) → push notification with resolution
- [ ] Build listing expiry: auto-expire after 60 days, seller gets notification to renew or remove
- [ ] Wire Supabase Realtime for instant listing visibility (new listings appear immediately for all browsers)
- [ ] Wire `app_events` + commission tracking (10% per transaction, total GMV, total commission)

---

## Phase 12 – Education Phase 2: Flashcards & Summaries (Week 8 post-launch)

### 12A – Flashcards (Anki-Style Spaced Repetition)
- [ ] Write Supabase migrations: `flashcard_decks`, `flashcards`, `flashcard_reviews` (stores next_review_date, ease_factor, interval, repetitions per card per user)
- [ ] Build flashcard deck management: auto-generated decks from MCQ questions (wrong answers become flashcards), admin-created decks, student-created custom decks
- [ ] Build deck browse page at `/education/flashcards`: list of decks with card count + due-today badge, filter by module/subject, "Start Review" CTA
- [ ] Build flashcard review screen:
  - [ ] Show front of card (question / term / concept)
  - [ ] Tap to reveal back (answer / definition / explanation)
  - [ ] Rate difficulty: Again (< 1 min) / Hard (next interval × 1.2) / Good (next interval × ease_factor) / Easy (next interval × ease_factor × 1.3) — SM-2 algorithm
  - [ ] Show progress bar: X of Y cards reviewed, X remaining
  - [ ] Swipe left/right as alternative to button taps
- [ ] Implement SM-2 spaced repetition algorithm:
  - [ ] New cards: show on day 0
  - [ ] If "Again": reset to 1 min, then 10 min, then 1 day
  - [ ] If "Good": interval = previous_interval × ease_factor (starting ease = 2.5, min 1.3)
  - [ ] If "Easy": interval × ease_factor × 1.3
  - [ ] If "Hard": interval × 1.2, ease_factor − 0.15
  - [ ] Cap max interval at 365 days
- [ ] Build daily review dashboard: total cards due today across all decks, streak counter, cards reviewed this week chart
- [ ] Build card creation UI: front + back text fields, optional image, tag with module/subject, bulk import from CSV
- [ ] Auto-generate flashcards from MCQ mistakes: when student gets MCQ wrong, auto-create flashcard (question = front, correct answer + explanation = back). Student can dismiss if not wanted.
- [ ] Auto-generate flashcards from AI Tutor conversations: key concepts discussed → suggest flashcard (student confirms before adding)
- [ ] Wire flashcard reviews into Study Tracker: spaced repetition score = % of due cards reviewed on time, feeds into 20% weight
- [ ] Wire live due-today badge on Education landing Flashcards card (hidden if 0)
- [ ] Build flashcard statistics page: total cards, mature vs young, retention rate, forecast (cards due per day for next 30 days)
- [ ] Free tier: unlimited flashcard reviews. Pro: auto-generation from AI Tutor + unlimited custom decks (Free: max 3 custom decks)
- [ ] Wire `app_events` tracking: cards reviewed per session, retention rate

### 12B – Quick Summaries (AI-Generated Topic Notes)
- [ ] Build Quick Summaries page at `/education/summaries`: browse by module → subject → topic
- [ ] Build summary generation: student selects topic → Gemini Flash generates 300–500 word summary using RAG context (textbook chunks + slides) → display as clean formatted note
- [ ] Build summary caching: generated summaries stored in `ai_summaries` table, served from cache on repeat visits (regenerate only on manual refresh)
- [ ] Build summary UI: clean reading layout, key terms bolded, bullet points for key concepts, "Read more in textbook" link to relevant RAG source
- [ ] Build save/bookmark on summaries → adds to Saved Questions (source: Summaries)
- [ ] Build download as PDF option (Pro-gated): generate clean PDF of summary for offline study
- [ ] Build "Explain this further →" button on each summary → opens AI Tutor with summary context pre-loaded
- [ ] Wire `logApiCall()` into every summary generation call
- [ ] Write Supabase migrations: `ai_summaries`
- [ ] Free tier: 5 summary generations/day. Pro: unlimited.

### 12C – Exam Prediction Engine (Week 8–9 post-launch)
- [ ] Build past paper analysis pipeline: ingest all available past papers → extract topics per question → build frequency matrix (topic × year × exam type)
- [ ] Build prediction model: for each subtopic, calculate % probability of appearing based on last 5 years of past papers. Weight recent years higher (3× for last year, 2× for 2 years ago, 1× for older).
- [ ] Build "High Yield Topics" page at `/education/high-yield`: ranked list of subtopics by exam probability, filterable by module + subject
- [ ] Show prediction badges on MCQ drill: "87% exam probability" tag on high-yield questions
- [ ] Integrate with Study Tracker: highlight high-yield subtopics that the student hasn't covered yet ("These topics appear 80%+ of the time and you haven't studied them")
- [ ] Integrate with AI Study Plan: Gemini uses high-yield data to prioritize weekly plan topics
- [ ] Wire into Progress Matrix: Exam Readiness score weighted by high-yield coverage (covering a 90%-probability topic matters more than a 10%-probability topic)
- [ ] Write Supabase migration: `past_paper_analysis` table (subtopic_id, year, exam_type, appeared boolean, frequency_score)
- [ ] Free for all users (drives adoption). Pro users get AI-powered "If you only have 3 days, study these" recommendations.

### 12D – Study Guides & Resource Hub (Week 9 post-launch — see `study-guides.md`)
- [ ] Write Supabase migrations: `study_guides` table (title, slug, guide_type, year_id, module_id, content markdown, author, is_published) + `study_resources` table (module_id, resource_type, title, description, url, sort_order)
- [ ] Build admin guide editor (`/admin/guides`): markdown editor with live preview, publish toggle, module/year/type selectors
- [ ] Build admin resource manager (`/admin/resources`): add/edit/delete resources per module (type, title, description, URL, sort order)
- [ ] Build Study Guides landing page (`/education/guides`): two tabs — Module Guides (filtered by student's year, card per module) + General Guides (list of all general guides)
- [ ] Build individual module guide page: render markdown body with standardized sections (Overview, Study Order, Recommended Resources, Past Paper Patterns, Tips from Seniors, Related in DowOS deep links)
- [ ] Build individual general guide page: render markdown with sections (Key Principles, Common Mistakes, Action Items)
- [ ] Build Resource Hub page (`/education/guides/resources`): all modules listed, each with textbooks/YouTube/apps/websites grouped by type, filter by module + year
- [ ] Auto-generate "Related in DowOS" section on each module guide: deep links to MCQ drill, Viva Bot, Study Tracker for that module
- [ ] Add Study Guides card to Education landing page: `📖 Study Guides — Curated guides & resources — [Browse Guides →]`
- [ ] All Study Guides + Resource Hub content is **free for all users** (no Pro gate — conversion funnel via deep links to Pro features)
- [ ] Content seeding — Azfar writes first batch:
  - [ ] 5 module guides (Batch 1 current modules)
  - [ ] 3 general guides (Viva prep, Prof exam strategy, How to use DowOS)
  - [ ] Resources for 10 modules (textbooks + YouTube + apps)
  - [ ] Target: start writing at full launch (Mar 28) → ready by mid-April

---

## Phase 13 – Scale, Native & Growth (Post-launch, ongoing)

### Mobile Native — Android Polish
- [ ] Play Store optimization: screenshots for all screen sizes, localized description (English + Urdu), feature graphic, promo video
- [ ] Android App Rating prompt: show after 5th successful session (attendance check-in or MCQ drill), use `@capacitorjs/app-rating` plugin
- [ ] Deep linking: `dowos.app/ai/chat/123` → opens specific chat in app (App Links / Universal Links)
- [ ] App widget: prayer times widget for Android home screen (shows next prayer + countdown)
- [ ] Background sync: sync attendance data, flashcard review state when app regains connectivity
- [ ] Offline mode: cache timetable, prayer times, saved questions, flashcard decks for offline access via Service Worker + Capacitor

### Mobile Native — iOS (Phase 3)
- [ ] Apple Developer account (PKR 12 500/yr) — budget when revenue covers it
- [ ] Capacitor iOS build: `npx cap add ios`, configure Xcode project, Info.plist permissions (camera, microphone, notifications, location)
- [ ] Test on iOS simulator + real device
- [ ] Fix iOS-specific issues: Safari WebKit quirks, safe-area insets (notch/Dynamic Island), iOS push notification differences (APNs), keyboard behavior
- [ ] Submit to Apple App Store: screenshots, App Store description, privacy policy, review process (1–7 days)
- [ ] Handle App Store Review rejections (iterate until approved)

### Real-Time Bus GPS (Phase 2 Enhancement)
- [ ] Build driver mini-app (separate page or standalone): GPS tracking sends location every 10 s during peak hours (6–8:30 AM, 3:15–6 PM only)
- [ ] Wire GPS data to Supabase Realtime: `bus_locations` table with lat/lng/timestamp/route_id
- [ ] Build student-facing live map overlay: driver location marker (bus icon), "Driver is X min away" ETA based on route distance, auto-refresh
- [ ] Build driver management admin page: active drivers, assign routes, view current location

### Notification Center
- [ ] Build notification center page (`/notifications`): all notifications in one place (push, in-app, system)
- [ ] Mark read/unread per notification
- [ ] Filter by type: Announcements, Attendance, Orders, Credits, System
- [ ] Batch actions: mark all read, clear old notifications
- [ ] Badge count on BottomNav: total unread notifications (decrements on open)

### Platform Growth
- [ ] Build referral system: existing students get unique referral code → share → new student signs up with code → both get 100 Dow Credits bonus
- [ ] Build rating/feedback system: rate AI Tutor responses (thumbs up/down → improves prompt quality), rate DowEats orders (1–5 stars), rate marketplace sellers (1–5 stars + written review)
- [ ] Build exam-season Pro pass marketing: PKR 1 500 / 3-month pass → prominent CTA during exam periods (auto-detect from exam countdown dates)
- [ ] Explore payment gateway integration: Easypaisa/JazzCash API → automate Dow Credits top-up (eliminate manual verification)
- [ ] Build offline content download (Pro): download MCQ sets, flashcard decks, summaries for offline study (Capacitor filesystem or IndexedDB)
- [ ] Build student dashboard analytics: personal stats page — total MCQs attempted, average accuracy, study streak, time spent per feature, comparison with batch average (anonymized)
- [ ] Build leaderboard (opt-in): top 10 students by MCQ accuracy this week, top streaks, most flashcards reviewed — anonymized by default, opt-in to show name
- [ ] Build study groups: create/join study groups, share flashcard decks, group progress tracking
- [ ] Build in-app changelog / "What's New": show after app update — bullet points of new features, improvements, fixes

### AI Study Buddy Nudges (Smart Push Notifications)
- [ ] Build nudge engine: analyze student activity patterns (MCQ streaks, flashcard reviews, coverage gaps, last active timestamp)
- [ ] Build streak-at-risk nudge: "Your 12-day streak is at risk! 5 MCQs to keep it alive" — triggers when student hasn't done daily activity by 8 PM
- [ ] Build topic gap nudge: "You haven't practiced Anatomy in 3 days. Your batch average is 45 questions this week" — triggers when subject goes stale vs batch
- [ ] Build exam proximity nudge: "Prof exams in 14 days. You've covered 40% of Cardiovascular — here's a quick 10-question drill" — ramps up as exam approaches
- [ ] Build high-yield nudge: "87% of past papers include Coronary Circulation — you scored 35% last time. Quick review?" — ties into Exam Prediction Engine
- [ ] Build celebration nudge: "You just hit 500 MCQs! Top 15% of your batch 🎯" — positive reinforcement on milestones
- [ ] Build optimal study time nudge: detect when student usually studies (from app_events) → send "Ready for your evening study session?" at their habitual time
- [ ] Build nudge preferences: per-category toggle in Settings (streak, topic gaps, exam, celebrations), max 3 nudges/day cap, respect quiet hours
- [ ] Wire nudges to FCM push + in-app notification center
- [ ] Write Supabase migration: `nudge_rules` table (rule_type, conditions JSON, template text, cooldown_hours)

### Mental Health & Wellness (Post-Launch, Later Phases)
- [ ] Build study break reminder: after 90 min continuous app usage, show gentle "Take a 5-minute break — stretch, hydrate, breathe" interstitial (dismissible, not blocking)
- [ ] Build breathing exercise mini-widget: 4-7-8 breathing animation (inhale 4s, hold 7s, exhale 8s), accessible from dashboard or Settings
- [ ] Build weekly wellness check-in (opt-in): "How are you feeling this week?" — 5-emoji scale (😊→😢), optional free-text, stored privately (never shared, no batch aggregate)
- [ ] Build stress-level correlation: if student self-reports low mood + has upcoming exams, show supportive message + link to Dow counseling services
- [ ] Build exam anxiety resources page: curated tips for managing exam stress, links to professional support at Dow (counselor contact, helpline numbers)
- [ ] Build "Do Not Disturb Study Mode": mutes all non-urgent notifications, shows focus timer, tracks focused study sessions in Study Tracker

### B2B University Expansion
- [ ] White-label investigation: can DowOS be packaged for other Pakistani medical colleges (KEMU, AKU, Ziauddin)?
- [ ] Prepare pitch deck: usage data from Dow (DAU, retention, Pro conversion, revenue), product demo video, pricing model for universities
- [ ] Document multi-tenant architecture requirements: separate Supabase projects per university, shared codebase, university-specific branding/colors, per-university content
- [ ] Approach 2–3 universities for pilot partnerships

---

## Phase 14 – Continuous Improvement (Ongoing)

### Performance & Reliability
- [ ] Set up uptime monitoring: Vercel checks, Supabase health, API endpoint monitoring (every 5 min)
- [ ] Set up Sentry performance monitoring: track slow API routes, slow database queries, JS bundle load times
- [ ] Database optimization: add indexes on frequently queried columns (user_id, module_id, created_at), query plan analysis on slow queries
- [ ] CDN optimization: serve static assets via Vercel Edge, optimize image delivery (WebP, lazy loading, responsive sizes)
- [ ] API response caching: cache Gemini responses for identical prompts (Redis or Supabase cache layer), cache timetable data (5 min ISR)
- [ ] Rate limiting: implement server-side rate limiting on all API routes (beyond just AI — prevent abuse of auth endpoints, file uploads)

### Content & Data
- [ ] Build content quality dashboard: flag low-quality MCQs (high skip rate, reported by students), track explanation helpfulness
- [ ] Build student-reported issue system: "Report this question" on MCQs/flashcards → admin review queue
- [ ] Build AI-assisted content generation: use Gemini to draft MCQ explanations, flashcard backs, summary notes → Azfar reviews + publishes
- [ ] Curriculum update workflow: when Dow updates curriculum (new module, renamed subject), admin can update hierarchy without breaking existing data

### Legal & Compliance
- [ ] Draft privacy policy: what data is collected, how it's used, how students can delete their data (PDPA compliance for Pakistan)
- [ ] Draft terms of service: app usage rules, DowEats liability, marketplace dispute policy, Pro subscription terms
- [ ] Build account deletion flow: student requests → 30-day grace period → permanent deletion of all user data (GDPR-adjacent best practice)
- [ ] Cookie/tracking consent: even though campus-only, good practice — minimal tracking notice on first visit

### Financial Tracking
- [ ] Build revenue dashboard (admin): monthly revenue by source (Pro subs, DowEats commission, Merch profit, Marketplace commission), MoM growth, projections
- [ ] Build cost dashboard (admin): monthly costs by service (Supabase, Gemini, Groq, TTS, Vercel, Firebase), cost per user, margin calculation
- [ ] Set up billing alerts: Supabase, Gemini, Groq — alert when spending approaches budget thresholds
- [ ] Financial reporting: monthly P&L statement (auto-generated from revenue + cost dashboards)

---

## Parallel Workstreams (run across all phases)

### Content Prep — Azfar
- [ ] Receive MCQ CSV format spec (from `admin-content-upload.md`) — Day 10
- [ ] Produce first 100 MCQs across 2–3 modules — target ready by Day 17
- [ ] Produce Viva sheets for all Batch 1 current modules — target ready by Day 24
- [ ] Populate `module_subjects` junction table with correct module-to-subject mappings
- [ ] Seed `subtopics` table with granular topic structure per subject
- [ ] Bulk-seed to 800+ MCQs — target Phase 9 (before full launch)
- [ ] Prepare rolling 30-day `daily_content` seed (verses + hadith) — target ready by Day 34
- [ ] Prepare 25 medical textbooks for RAG ingestion (prioritize Batch 1 curriculum, PDF format)
- [ ] Create initial flashcard decks for top 5 modules (50 cards each)
- [ ] Review and approve AI-generated summaries for accuracy before publishing
- [ ] Ongoing: add new MCQs weekly (target 50/week post-launch), update viva sheets per module rotation

### Marketing — from Mar 6
- [ ] Mar 6: Logo finalized — all variants exported (app icon 1024×1024, social avatar 400×400, horizontal lockup 1200×400, dark-mode variants, favicon 32×32 — see `marketing-launch.md` §2.5)
- [ ] Create DowOS Instagram account (brand account, separate from personal)
- [ ] Set up Instagram bio with link-in-bio (Play Store link + website)
- [ ] Mar 7–13: Post Instagram teaser Stories (6-post sequence — see `marketing-launch.md` §5)
- [ ] Mar 13: WhatsApp seed to 1–2 trusted contacts ("heads up, something dropping tomorrow")
- [ ] Mar 14: Beta Reel + WhatsApp blast (see `marketing-launch.md` §6)
- [ ] Mar 15–27: Feature-series posts (one feature per day — Reels, Carousels, Stories — see `marketing-launch.md` §7)
- [ ] Mar 15–27: Finalize LinkedIn founder story post (Salik writes, Ammaar reviews)
- [ ] Mar 28: Full-launch Reel + LinkedIn post + WhatsApp blast (see `marketing-launch.md` §8)
- [ ] Post-launch: weekly Instagram posts (feature tips, user testimonials, study tips), monthly LinkedIn updates
- [ ] Collect and publish student testimonials (with permission) on Instagram + website

### Campus Map Data — Ammaar
- [ ] Request CAD/PDF floor plans for Dow main building (campus indoor map dependency)
- [ ] Trace 20–30 bus routes in QGIS — target ready by Day 31 (Point Routes dependency)
- [ ] Mark Prayer Room POI on campus map GeoJSON (Dow Main Ground Floor)
- [ ] Identify and mark key POIs: cafeteria, library, admin office, parking, hostels, labs, lecture halls, sports grounds

### Ops — Ammaar
- [ ] DowEats: onboard 3–5 Burns Road restaurants before Week 5 launch (get menus, agree on 15% commission, set up ordering channel)
- [ ] DowEats: hire rider(s) for gate delivery (interview, set pay rate, brief on 6-digit code verification)
- [ ] DowEats: set up Ammaar's gate-delivery station (12 PM–1:30 PM daily schedule, phone for order management)
- [ ] DowEats: test full order flow manually before launch (place test order → rider picks up → gate delivery → code verify)
- [ ] Merch: source vendors for hoodies, lab coats, caps, varsity jackets (get samples, negotiate bulk pricing, check quality)
- [ ] Merch: set up customization workflow (embroidery partner for batch year / student names, turnaround time, quality check)
- [ ] Merch: photograph all products for catalog (clean product photos on white/navy background)
- [ ] Credits: set up Easypaisa/JazzCash receiving accounts for Dow Credits top-up
- [ ] Credits: establish manual verification workflow — who checks (Salik primary, Ammaar backup), SLA (verify within 10 min during business hours, 30 min off-hours)
- [ ] Credits: create verification checklist (receipt screenshot matches amount, sender matches student account, no duplicate submissions)

### Salik — Dev & Technical
- [ ] Set up GitHub Actions CI: lint + type-check + build on every PR
- [ ] Set up staging environment: Vercel preview deployments + staging Supabase project
- [ ] Set up database backup strategy: Supabase daily backups + manual backup before major migrations
- [ ] Document API routes: create API reference doc for all Next.js API routes (endpoint, method, auth, request/response)
- [ ] Set up error alerting: Sentry Slack integration — alert on new errors, spike in error rate
- [ ] Security: rotate API keys quarterly, audit RLS policies after each new table, review Supabase dashboard for anomalies weekly

---

### Housekeeping
- [x] PR `feature/day4-maps-decision` → `main` — DONE (merged + pushed)
- [ ] Commit each logical unit to a feature branch → PR → merge (never push to main)
- [ ] Keep `docs/sessions/` updated every session (mandatory per CLAUDE.md #11)
- [ ] Update `CLAUDE.md` if new conventions or rules emerge
- [ ] Keep this todo in sync with TodoWrite at all times (Rule 16)
- [ ] Archive completed phases periodically (move to `docs/todo-archive.md` when a phase is 100% done) to keep this file navigable
