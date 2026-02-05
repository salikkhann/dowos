# DowOS – Current Todo (Feb 4–20)

Covers Phase 1 decisions + early Phase 2 build. Audited 2026-02-05.
Tick items off as you go. Update or re-create this file when the list drains.

---

## Phase 1 – Foundation & Decisions

### Backend & Auth (Days 1–2) ✓ DONE
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

### Architecture Decision Days (Days 3–9) — remaining tech decisions
- [x] **Day 3 – RAG + Models:** `docs/decisions/rag-architecture.md` + `docs/decisions/model-selection.md` LOCKED. Three-tier model routing (Flash / DeepSeek R1 / Flash-Lite). Hybrid pgvector retrieval. Student memory signal system. Pro personalisation layer (study plans, readiness scores, Socratic mode). Cost: ~$41/mo at 500 DAU.
- [x] **Day 4 – Maps:** `docs/decisions/maps-platform.md` LOCKED. MapLibre GL JS + PMTiles. Two maps: Point (bus, priority) + Campus (indoor, gated on floor-plan data). Google Geocoding scoped to place-search only. Campus MVP spec includes QGIS digitisation workflow + 3-table Supabase schema.
- [x] **Day 5 – Voice/STT:** Deep research on 7 STT providers. Groq Whisper Large v3 Turbo locked ($20/mo). Gemini correction pass for medical terms. Upgrade path to Deepgram Nova-3 Medical documented. `docs/decisions/voice-stt.md` LOCKED.
- [x] **Day 6 – AI routing:** Complexity router triggers locked as-is (validate via production logs post-beta). 3-attempt fallback chain for Tier 1, 2-attempt downgrade for Tier 2. `docs/decisions/ai-routing-fallback.md` LOCKED.
- [x] **Day 7 – Mobile delivery:** Capacitor locked. PWA rejected (discoverability + iOS Safari push). Android Play Store immediate, iOS Phase 3. `docs/decisions/mobile-delivery.md` LOCKED.
- [x] **Day 8 – Viva orchestration:** State machine locked (4 states). LangGraph rejected (overkill). Persisted session in Supabase. Adaptive difficulty 1–5. `docs/decisions/viva-bot-orchestration.md` LOCKED.
- [x] **Day 9 – Sign-off:** All conflicts resolved. Rate limits locked at 2/4. `FINAL_LOCKED_DECISIONS.md` rewritten as 17-decision index. All stale docs updated.

### UI & Product Decisions (Days 4–5, extended) ✓ DONE
- [x] **Education tab structure:** Cards grid, MCQ module-picker → source toggle, Phase 2 slots. `docs/decisions/education-tab.md` LOCKED.
- [x] **Mobile vs Web UI:** One component tree, two layout wrappers. 5-item bottom nav / grouped sidebar. Config-driven nav via `nav.ts`. `docs/decisions/mobile-web-ui.md` LOCKED.
- [x] **All-pages UI structure:** Every screen wireframed — Dashboard (6 widgets + timetable sub-page), AI Chat, Maps tab switcher, Campus cards grid, L&F, Prayer Times, Announcements, Profile. Full route tree. `docs/decisions/ui-page-structure.md` LOCKED.
- [x] **Profile card + UX conventions:** Glassmorphic student card (Gold if Pro, selfie upload, module + credits), sidebar avatar mini-card, time-aware greeting, skeleton-first loading, transition scale, touch targets, focus rings, contrast rules, reduced-motion. `docs/decisions/profile-card-ux.md` LOCKED.

### Product & Operational Decisions (new — added from audit)
- [x] **Dow Credits + Pro upgrade flow:** Full UX flow specced. `docs/decisions/credits-payment.md` LOCKED.
- [x] **Dow ID approval workflow:** Admin queue + reject reason picker. `docs/decisions/dow-id-approval.md` LOCKED.
- [x] **Push notification permission strategy:** Day 2 ask, priming card, max 2 asks. `docs/decisions/push-notifications.md` LOCKED.
- [x] **DowEats operational spec:** Item-first menu, 6-digit code, gate delivery. `docs/decisions/doweats-ops.md` LOCKED.
- [x] **Marketplace ops:** Withdrawal + disputes specced. `docs/decisions/marketplace-ops.md` LOCKED.
- [x] **Viva Bot scoring:** 3-mode weights + LLM prompt + report format. `docs/decisions/viva-scoring.md` LOCKED.

### Stale docs to reconcile before coding starts ✓ DONE
- [x] **Rate limit conflict:** Locked at soft 2 / hard 4. The 20/50 was a pre-cost-model placeholder. Resolved in `FINAL_LOCKED_DECISIONS.md` §Resolved conflicts.
- [x] **`5_UXUI_GUIDELINES.md` nav updated:** IA tree and nav hierarchy now match the locked route tree (Dashboard / Education / AI Tutor / Campus / Maps).
- [x] **`00_DISCOVERY_RESOLVED.md` maps updated:** Maps block now reflects MapLibre GL JS + PMTiles. Superseded note added.
- [x] **`FINAL_LOCKED_DECISIONS.md` rewritten:** Clean 17-decision index. Each row points to its decision doc with a one-line summary. Resolved conflicts table included.

---

## Phase 2 – Core Shell & Admin (Days 10–16)

### Dashboard & Nav (Days 10–11)
- [ ] Build `<BottomNav />`: 5 items, active-route highlight, 44 px tall, safe-area inset
- [ ] Build `<Sidebar />`: config-driven from `nav.ts`, section headers, active highlight, role-gated items
- [ ] Build `<NavShell />`: `'use client'` leaf, media-query switch at 1024 px. Wire into `(app)/layout.tsx`
- [ ] Build sidebar avatar mini-card (Identity section) — see `profile-card-ux.md` §2.5
- [ ] Build mobile avatar tap → bottom sheet (Settings / Profile / Help / Logout)
- [ ] Wire dark-mode toggle (next-themes already installed)
- [ ] Stub all nav links to their existing route pages
- [ ] Build Dashboard page: time-aware greeting + skeleton widget stack (static, no live data yet)
- [ ] Build Profile page: glassmorphic student card + photo upload flow — see `profile-card-ux.md` §2

### Timetable & Attendance (Days 12–14)
- [ ] Write Supabase migrations: `modules`, `subjects`, `timetable_entries`, `attendance`
- [ ] Build timetable week-view component (Mon–Fri, color-coded by module)
- [ ] Add viva toggle + roll-number display
- [ ] Build attendance check-in button + per-module % breakdown
- [ ] Build runway calculator card
- [ ] Wire live data into Dashboard widgets: timetable mini card (next class + mark present/absent), attendance warning, exam countdown, current module

### Admin Dashboard (Days 13–14)
- [ ] Create `/admin/` route group (service-role gated middleware)
- [ ] Build Dow ID approval queue (pending → approve / reject + reason picker) — see `dow-id-approval.md`
- [ ] Build MCQ bulk-upload page (CSV/JSON → preview → save)
- [ ] Build Viva sheet upload page
- [ ] Build textbook/PDF upload page (triggers chunking + embedding pipeline)
- [ ] Build content-list view: list / edit / delete / archive per module
- [ ] Add upload-status indicators (processing / ready / errored)
- [x] Write `docs/admin-content-upload.md` — the guide Azfar will actually use ✓ DONE
- [ ] Install + configure Sentry: `npx @sentry/cli login`, add `@sentry/nextjs`, wire `src/instrumentation.ts`
- [ ] Set up Resend: create account at resend.com, add `RESEND_API_KEY` to `.env.local`
- [ ] Write Supabase migrations: `api_usage_log` + `app_events` tables + RLS (admin-only read)
- [ ] Write `src/lib/api-rates.ts` (cost rate table) + `src/lib/api-logger.ts` (`logApiCall()` helper)
- [ ] Wire `app_events` into login / logout / Dow ID upload flows

### Parallel workstream: Content prep (kickoff Day 10, runs through Day 23)
- [ ] Send admin email requesting CAD/PDF floor plans for Dow main building (campus map digitisation dependency)
- [ ] Hand Azfar the MCQ CSV format spec (from `admin-content-upload.md` once written). Target: first 100 MCQs across 2–3 modules ready by Day 17.
- [ ] Team starts tracing 20–30 bus routes in QGIS (Point map Phase 5 dependency). Runs in parallel.

---

## Cursor Handoff — docs ✓ ALL DONE

Cursor Pro is the IDE. `.cursorrules` is at the project root — Cursor reads it automatically. Read `docs/cursor-guide.md` before your first session tonight.

| Doc | Status |
|---|---|
| `.cursorrules` | ✓ Created — Cursor reads it automatically. Source doc: `docs/windsurf-rules.md` (renamed in content, filename is legacy) |
| `docs/cursor-guide.md` | ✓ Written — read before first Cursor session |
| `docs/decisions/upload-pipeline.md` | ✓ LOCKED — Vercel Route Handlers + SSE |
| `docs/decisions/analytics-logging.md` | ✓ LOCKED — api_usage_log + app_events + /admin/analytics |
| `docs/decisions/credits-payment.md` | ✓ LOCKED |
| `docs/decisions/dow-id-approval.md` | ✓ LOCKED |
| `docs/decisions/push-notifications.md` | ✓ LOCKED |
| `docs/decisions/doweats-ops.md` | ✓ LOCKED |
| `docs/decisions/marketplace-ops.md` | ✓ LOCKED |
| `docs/decisions/viva-scoring.md` | ✓ LOCKED |
| `docs/admin-content-upload.md` | ✓ Written — hand to Azfar before Day 10 |

---

### Housekeeping (do as you go)
- [ ] Commit each logical unit to a feature branch, open a PR
- [ ] Keep `docs/sessions/` updated (mandatory per CLAUDE.md rule #11)
- [ ] PR `feature/day4-maps-decision` → `main` (has 6 commits, all Day 4 work)
