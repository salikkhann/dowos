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
- [ ] **Day 5 – Voice/STT:** Test Pakistani-accent accuracy on Web Speech API vs OpenAI Whisper vs Google Cloud STT. Write `docs/decisions/voice-stt.md`
- [ ] **Day 6 – AI routing:** Benchmark Gemini vs DeepSeek R1 on 20 med questions. Complexity router triggers already specced in `model-selection.md` §3.2 — this day validates them empirically. Write `docs/decisions/ai-routing-fallback.md`
- [ ] **Day 7 – Mobile delivery:** Capacitor vs PWA. Discovery doc already leans Capacitor — this day stress-tests that with Play Store discoverability + push reliability on Android. Write `docs/decisions/mobile-delivery.md`
- [ ] **Day 8 – Viva orchestration:** LangGraph vs hand-rolled state machine for the Q → eval → follow-up → score loop. Write `docs/decisions/viva-bot-orchestration.md`
- [ ] **Day 9 – Sign-off:** Cross-check all decision docs for internal consistency (especially the rate-limit conflict — see ⚠️ below). Update `docs/FINAL_LOCKED_DECISIONS.md` with the new decision set.

### UI & Product Decisions (Days 4–5, extended) ✓ DONE
- [x] **Education tab structure:** Cards grid, MCQ module-picker → source toggle, Phase 2 slots. `docs/decisions/education-tab.md` LOCKED.
- [x] **Mobile vs Web UI:** One component tree, two layout wrappers. 5-item bottom nav / grouped sidebar. Config-driven nav via `nav.ts`. `docs/decisions/mobile-web-ui.md` LOCKED.
- [x] **All-pages UI structure:** Every screen wireframed — Dashboard (6 widgets + timetable sub-page), AI Chat, Maps tab switcher, Campus cards grid, L&F, Prayer Times, Announcements, Profile. Full route tree. `docs/decisions/ui-page-structure.md` LOCKED.
- [x] **Profile card + UX conventions:** Glassmorphic student card (Gold if Pro, selfie upload, module + credits), sidebar avatar mini-card, time-aware greeting, skeleton-first loading, transition scale, touch targets, focus rings, contrast rules, reduced-motion. `docs/decisions/profile-card-ux.md` LOCKED.

### Product & Operational Decisions (new — added from audit)
- [ ] **Dow Credits top-up + Pro upgrade flow:** Discovery already locked the top-up mechanism (Easypaisa / JazzCash → manual 5–10 min verification). This decision doc formalises: the upgrade CTA flow from the Profile card, what the payment confirmation screen looks like, and how credits debit for Pro (annual, one-time). Write `docs/decisions/credits-payment.md`
- [ ] **Dow ID approval workflow:** Admin sees a queue of pending uploads. Approve → student status flips to green. Reject → student gets re-upload CTA (red status). What fields does the admin see? What's the rejection reason picker? Ships with Phase 2 admin dashboard (Day 12–13). Write `docs/decisions/dow-id-approval.md`
- [ ] **Push notification permission strategy:** FCM is in the stack. iOS + Android both require explicit opt-in. Decision: when do we ask? (Options: first login after onboarding, first time an announcement fires, a dedicated "stay in the loop?" card on Day 2 of usage.) Wrong timing = permanent deny. Write `docs/decisions/push-notifications.md`
- [ ] **DowEats operational spec:** Menu structure (item-first + restaurant tag), 6-digit order code flow, gate delivery handoff, peak hours (12–1:30 PM). Already decided in `FINAL_LOCKED_DECISIONS.md` — needs a proper decision doc for Windsurf to build from. Write `docs/decisions/doweats-ops.md`
- [ ] **Marketplace seller withdrawal spec:** Manual withdrawal (PKR 500 min, 0% fees, 2–5 business days bank transfer). Already decided — formalise into `docs/decisions/marketplace-ops.md`
- [ ] **Viva Bot scoring spec:** 3 modes (Strict / Friendly / Standard), 50-point scale with per-dimension weights already locked in `FINAL_LOCKED_DECISIONS.md`. Formalise into `docs/decisions/viva-scoring.md` so Windsurf can build the scoring engine directly from it.

### Stale docs to reconcile before coding starts ⚠️
- [ ] **Rate limit conflict:** `FINAL_LOCKED_DECISIONS.md` says AI Tutor soft 20 / hard 50 msgs/day. `rag-architecture.md` says soft 2 / hard 4. CLAUDE.md says soft 2 / hard 4. → Resolve on Day 9 sign-off. Almost certainly 2/4 is correct (the 20/50 predates the cost model).
- [ ] **`5_UXUI_GUIDELINES.md` nav is stale:** Still shows Timetable / Attendance / Learning / Community / Account as the 5 tabs. Must update to Dashboard / Education / AI Tutor / Campus / Maps before coding starts. Also update the IA tree in §2 to match the route tree in `ui-page-structure.md` §11.
- [ ] **`00_DISCOVERY_RESOLVED.md` maps section stale:** Says "Google Maps SDK". Superseded by MapLibre decision. Update the maps block to reflect the locked architecture.
- [ ] **`FINAL_LOCKED_DECISIONS.md` is a flat legacy doc:** Once all new decision docs are written (Days 5–9 + product decisions), rewrite this file as a concise index that points to each decision doc with a one-line status. It should be the single source of truth for "what's locked, where's the detail."

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
- [ ] Write `docs/admin-content-upload.md` — the guide Azfar will actually use

### Parallel workstream: Content prep (kickoff Day 10, runs through Day 23)
- [ ] Send admin email requesting CAD/PDF floor plans for Dow main building (campus map digitisation dependency)
- [ ] Hand Azfar the MCQ CSV format spec (from `admin-content-upload.md` once written). Target: first 100 MCQs across 2–3 modules ready by Day 17.
- [ ] Team starts tracing 20–30 bus routes in QGIS (Point map Phase 5 dependency). Runs in parallel.

---

## Windsurf Handoff — docs to create before coding starts

These docs don't exist yet. Windsurf needs them to build without ambiguity. Create before Day 10.

| Doc | What it covers | When to write |
|---|---|---|
| `docs/windsurf-rules.md` | The `.windsurf/rules` file content — always-on context for Cascade. Stack, tokens, fonts, icons, conventions. | Day 9 (sign-off day) |
| `docs/decisions/credits-payment.md` | Top-up flow, Pro upgrade CTA, payment confirmation screen | Day 5–6 |
| `docs/decisions/dow-id-approval.md` | Admin approval queue UI, reject-reason picker | Day 6–7 |
| `docs/decisions/push-notifications.md` | Permission ask timing + strategy | Day 7 |
| `docs/decisions/doweats-ops.md` | Menu structure, order code flow, gate handoff | Day 7–8 |
| `docs/decisions/marketplace-ops.md` | Seller withdrawal flow, dispute arbitration | Day 8 |
| `docs/decisions/viva-scoring.md` | 3-mode scoring weights, report structure | Day 8 |
| `docs/admin-content-upload.md` | Azfar's step-by-step guide (MCQ CSV format, textbook upload, viva sheet format) | Day 10 (first thing) |

---

### Housekeeping (do as you go)
- [ ] Commit each logical unit to a feature branch, open a PR
- [ ] Keep `docs/sessions/` updated (mandatory per CLAUDE.md rule #11)
- [ ] PR `feature/day4-maps-decision` → `main` (has 6 commits, all Day 4 work)
