# DowOS – Current Todo (Feb 4–14)

Next 10 days. Mirrors Phase 1 + early Phase 2 of the roadmap.
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

### Architecture Decision Days (Days 3–9)
- [ ] **Day 3 – RAG:** Research chunking + embedding options, write `docs/decisions/rag-architecture.md`
- [ ] **Day 4 – Maps:** Compare Google Maps vs OSM/OpenLayers, write `docs/decisions/maps-platform.md`
- [ ] **Day 5 – Voice/STT:** Test accent accuracy on all three options, write `docs/decisions/voice-stt.md`
- [ ] **Day 6 – AI routing:** Benchmark Gemini vs DeepSeek R1 on 20 med questions, write `docs/decisions/ai-routing-fallback.md`
- [ ] **Day 7 – Mobile delivery:** Capacitor vs PWA comparison, write `docs/decisions/mobile-delivery.md`
- [ ] **Day 8 – Viva orchestration:** LangGraph vs state machine, write `docs/decisions/viva-bot-orchestration.md`
- [ ] **Day 9 – Sign-off:** Review all 6 decision docs for consistency, update `docs/FINAL_LOCKED_DECISIONS.md`
- [x] Create `docs/decisions/` folder (one doc per decision, all decisions live here going forward)

## Phase 2 – Core Shell & Admin (Days 10–14, early start)

### Dashboard & Nav
- [ ] Build bottom-nav (mobile) / sidebar (desktop) shell inside `(app)/layout.tsx`
- [ ] Wire dark-mode toggle (next-themes already installed)
- [ ] Stub all nav links to their existing route pages

### Timetable & Attendance
- [ ] Write Supabase migrations: `modules`, `subjects`, `timetable_entries`, `attendance`
- [ ] Build timetable week-view component (Mon–Fri, color-coded by module)
- [ ] Add viva toggle + roll-number display
- [ ] Build attendance check-in button + per-module % breakdown
- [ ] Build runway calculator card

### Admin Dashboard
- [ ] Create `/admin/` route group (service-role gated middleware)
- [ ] Build MCQ bulk-upload page (CSV/JSON → preview → save)
- [ ] Build Viva sheet upload page
- [ ] Build textbook/PDF upload page (triggers chunking + embedding pipeline)
- [ ] Build content-list view: list / edit / delete / archive per module
- [ ] Add upload-status indicators (processing / ready / errored)
- [ ] Write `docs/admin-content-upload.md` — the guide Azfar will actually use

---

### Housekeeping (do as you go)
- [ ] Commit each logical unit to a feature branch, open a PR
- [ ] Keep `docs/sessions/` updated (mandatory per CLAUDE.md rule #11)
- [ ] Seed `docs/decisions/` folder structure before Day 3
