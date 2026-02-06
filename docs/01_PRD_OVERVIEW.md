# DowOS - PRD Overview (Executive Summary)

**Project:** DowOS Medical Super-App
**Organization:** Dow Medical College, Karachi
**Target Users:** ~2,000 medical students (Batches 1-5)
**Timeline:** 8 weeks to beta (Mar 14) + 2 weeks iteration + full launch Mar 28
**Year 1 Projection:** PKR 2.25M revenue (conservative)
**Last Updated:** 2026-02-06 (Session 10 — reflects all locked decisions)

---

## ONE-PAGE SUMMARY

**DowOS** transforms Dow Medical College from a fragmented ecosystem (WhatsApp groups, paper timetables, expensive alternatives like MedAngle) into a unified, student-centric super-app.

**Core App (Phases 1-7, beta Mar 14):** Education + Campus + Community
- Timetable + real-time updates + viva schedules
- Attendance tracking + runway calculator ("You can safely skip X classes")
- AI Tutor (text + voice, Gemini-powered, RAG-backed with Dow textbooks/slides)
- MCQ Solver (unlimited, free forever, AI explanations on every question)
- Viva Bot (voice exam practice, 50-point adaptive scoring, 3 difficulty modes)
- Study Tracker (manual subtopic checklist + auto mastery heatmap + batch aggregates)
- Flashcards (Anki-style SM-2 spaced repetition, auto-generated from MCQ mistakes)
- Point Routes (campus map via MapLibre + PMTiles)
- Lost & Found, Announcements, Prayer Times, Dow Credits, Pro Subscription

**Post-Launch Revenue Features (Weeks 5-7):**
- DowEats: Burns Road food delivery via gate pickup (15% commission)
- Dow Merch: Hoodies, lab coats, varsity jackets (direct profit)
- Marketplace: Textbook exchange + peer-to-peer sales (10% commission)

**Education Phase 2 (Weeks 8-9):**
- Quick Summaries (AI-generated topic notes)
- Exam Prediction Engine (past paper frequency analysis, high-yield badges)
- Study Guides & Resource Hub (curated by team, module-specific + general)

**Differentiation:**
- Campus-exclusive (Dow students only, Dow ID verified)
- Hyperlocal (gate delivery, campus maps, Dow prayer rooms, batch-specific content)
- 100% student adoption goal (vs MedAngle ~20-30%)
- PKR 3,000/year Pro (vs MedAngle PKR 5,000+)
- Free forever: MCQs, Study Tracker, Flashcards, Exam Predictions, Study Guides
- Revenue diversification (education + food + merch + marketplace)

---

## PROBLEM STATEMENT

### Current Pain Points at Dow Medical College

1. **Unclear Timetables**
   - Manual updates, paper-based
   - Students uncertain about classes
   - No real-time notifications

2. **Attendance Opacity**
   - No visibility into attendance %
   - Students unsure if they'll pass
   - Runway to 75% unclear

3. **Expensive Alternatives**
   - MedAngle: PKR 5,000/year
   - Limited to MCQs
   - Poor user experience
   - Only 20-30% adoption

4. **Expensive Food**
   - Cafeteria overpriced
   - Limited options
   - No delivery

5. **Fragmented Community**
   - WhatsApp groups for everything
   - Lost items never recovered
   - No student-to-student marketplace

---

## SOLUTION: DOWOS

### Core Features (Beta Launch — Mar 14)

**Feature 1: Authentication & Onboarding**
- Email/OTP signup via Supabase Auth
- Dow ID card photo verification (manual admin approval — see `dow-id-approval.md`)
- Profile: roll number, batch year, lab group (A-F for Y1-Y2, clinical groups for Y3+), learning style, explanation depth
- First-login onboarding wizard: learning style → explanation depth → notification prefs

**Feature 2: Timetable & Viva Schedules**
- Week view (Mon-Sat), color-coded by module
- Class details: name, time, location (room/hall), faculty name
- Viva toggle: shows viva schedule with roll numbers (lab/clinical group specific)
- Real-time updates via Supabase Realtime + ISR 5-min fallback

**Feature 3: Attendance Tracking**
- One-tap check-in with haptic feedback + animation
- Per-module attendance % breakdown
- **Runway Calculator** (unique): "You can safely skip X classes and stay at 75%"
- Attendance history: past check-ins, filterable by module + date range

**Feature 4: AI Tutor Chat**
- Four modes: Auto (router picks), Quick (Gemini Flash), Tutor (step-by-step), Socratic (DeepSeek R1, Pro)
- Voice input: Groq Whisper Large v3 Turbo (Pakistani-accent medical terms)
- Voice output: Google Cloud TTS (selectable male/female, speed 0.8x-1.5x)
- RAG-backed: hybrid pgvector search + BM25 + cross-encoder re-rank from Dow textbooks/slides
- Memory: session context (last 10 msgs) + long-term knowledge base (pgvector)
- Rate limiting: 5 soft / 6 hard msgs/day (Free), unlimited (Pro)
- Voice mode: Pro-gated

**Feature 5: MCQ Solver**
- Two sources: Tested Questions (past papers, annual/supplementary tagged) + General Questions
- Drill flow: year → module → subject → topic → question → answer → AI explanation
- AI explanations: Gemini streaming, RAG-backed citations from Dow slides/textbooks
- "Ask AI →" on every explanation → opens AI Tutor with context (free, conversion trigger)
- Filter pills: All / Incorrects / Undone
- Bookmark to Saved Questions
- **Free forever** (unlimited for all users)

**Feature 6: Viva Bot**
- Three modes: Strict / Friendly / Standard (different scoring weights)
- Full voice loop: TTS question → STT student answer → LLM evaluate → adaptive follow-up
- 50-point scoring: correctness (25 pts) + confidence (10-15 pts) + articulation (7-10 pts)
- Session report: per-question breakdown, strengths, weaknesses, study recommendations
- 1 free session taste (Free users), 180 min/month (Pro)

**Feature 7: Study Tracker** (renamed from Progress Matrix — see `study-tracker.md`)
- Combined UX: manual subtopic checklist + auto-calculated mastery heatmap
- Two metrics per cell: Coverage % (manual ticks) + Mastery % (MCQ 50% + Viva 30% + Flashcards 20%)
- Subtopic drill-down: checkboxes + auto scores + "Drill this topic →" CTA
- Auto-tick suggestions: when 5+ MCQ attempts at 60%+ accuracy
- Batch aggregate view: anonymized stats (min 5 students), student position as marker
- Top 3 Weak Topics card, Exam Readiness score, AI Study Plan (Pro)

**Feature 8: Browse Q&A**
- Expandable question list from viva sheets (free for all)
- Collapsed: question text + "Show answer" cue
- Expanded: model answer + key points + Save button

**Feature 9: Point Routes / Campus Map**
- MapLibre GL JS + PMTiles (no Google Maps dependency)
- QGIS-digitised campus walking paths + bus routes (color-coded, numbered stops)
- POI pins: prayer rooms, cafeteria, library, admin office, hostels, labs
- Destination picker → recommended route + estimated walk time

**Feature 10: Community & Campus**
- **Lost & Found:** post form (photo, location dropdown, contact method), browse with search/filters, WhatsApp deep-link, 30-day auto-archive
- **Announcements:** admin-posted, real-time FCM push + Supabase Realtime, batch/module-specific or university-wide, quiet hours (bypass for urgent)
- **Prayer Times:** Fajr-Isha calculated via `adhan` (Karachi coords, Umm al-Qura method), Hijri date, Dow Main + CHK masjid congregational times, Qibla compass, daily verse/hadith

**Feature 11: Dow Credits & Pro Subscription**
- **Dow Credits** (for DowEats / Merch / Marketplace only): 1 Credit = PKR 1, manual Easypaisa/JazzCash top-up with receipt verification (5-10 min)
- **Pro Subscription** (separate from Dow Credits): PKR 3,000/year or PKR 1,500/3-month exam-season pass, direct Easypaisa/JazzCash payment with receipt upload → admin verification → Pro activated
- Pro unlocks: unlimited AI Tutor, voice mode, Viva Bot 180 min/mo, AI Study Plan, unlimited saved questions, conversation history, offline content download

---

### Post-Launch Revenue Features (Weeks 5-7)

**DowEats (Week 5)** — see `doweats-ops.md`
- Item-first menu layout (not restaurant-first), category tabs
- Student orders → 6-digit code → rider picks up → gate delivery
- Operating hours: orders 10 AM - 12:30 PM, delivery 12-1:30 PM
- All payments via Dow Credits (15% commission)
- Order tracking: Placed → Accepted → Picked Up → At Gate → Delivered (Supabase Realtime)
- Success target: 20 orders/day

**Dow Merch (Week 6)**
- Product catalog: hoodies (PKR 3,500-4,500), lab coats (PKR 2,000), caps, varsity jackets (PKR 5,000+), notebooks, stickers
- Customization: batch year embroidery + optional student name (lab coats)
- Order tracking: Confirmed → In Production → Ready for Pickup → Delivered
- Inventory management with pre-order toggle for batch production
- Success target: 30 items/week

**Marketplace (Week 7)** — see `marketplace-ops.md`
- Textbook listings: up to 4 photos, condition grading, category filter
- Purchase via Dow Credits (10% commission)
- Seller wallet + withdrawal (PKR 500 min, 0% fees, manual bank transfer 2-5 days)
- Dispute resolution: 48h window, admin arbitration
- 60-day listing expiry with renewal option

### Education Phase 2 (Weeks 8-9)

**Flashcards — Anki-Style Spaced Repetition (Week 8)**
- SM-2 algorithm: Again/Hard/Good/Easy buttons, ease_factor (start 2.5, min 1.3), max 365-day interval
- Auto-generate from MCQ mistakes + AI Tutor conversations
- Due-today badges, streak counter, retention stats
- Free: unlimited reviews, max 3 custom decks. Pro: unlimited custom decks + auto-generation from AI Tutor

**Quick Summaries (Week 8)**
- AI-generated 300-500 word topic notes via Gemini Flash + RAG context
- Cached after first generation, "Explain further →" links to AI Tutor
- Free: 5 generations/day. Pro: unlimited + PDF download

**Exam Prediction Engine (Week 8-9)**
- Past paper frequency analysis → high-yield topic ranking by exam probability
- "87% exam probability" badges on MCQ drill questions
- Integrates with Study Tracker (highlight uncovered high-yield topics) and AI Study Plan
- Free for all. Pro: AI-powered "If you only have 3 days, study these" recommendations

**Study Guides & Resource Hub (Week 9)** — see `study-guides.md`
- Module guides: year-specific, curated by Azfar/team (study order, resources, past paper patterns, senior tips)
- General guides: viva prep, prof exam strategy, how to use DowOS
- Resource Hub: per-module textbooks, YouTube, apps, websites
- All free for all users (no Pro gate — conversion funnel via deep links to Pro features)

---

## BUSINESS MODEL

### Revenue Streams

**Stream 1: Pro Subscription** (separate from Dow Credits — direct Easypaisa/JazzCash payment)
- Annual: PKR 3,000/year
- Exam-season pass: PKR 1,500/3 months (key conversion lever during prof exams)
- Realistic conversion: 15-20% (300-400 students)
- Revenue: ~PKR 100-150K/month at steady state

**Stream 2: DowEats Commission**
- Model: 15% commission on orders (Foodpanda charges 25-30%, we undercut to onboard restaurants)
- Average order: PKR 300-400
- Target: 20 orders/day = PKR 90,000-120,000/month
- M3 projection: PKR 112K/month

**Stream 3: Merch Profit**
- Model: Direct profit per item
- Varsity jacket: PKR 800-900 profit × 400 = PKR 320-360K
- Monthly items: Hoodies, caps, lab coats = PKR 30-50K/month
- M3 projection: PKR 30K/month

**Stream 4: Marketplace Commission**
- Model: 10% commission on textbook/equipment sales
- Target: PKR 15-40K/month
- M3 projection: PKR 15K/month

### Year 1 Revenue Projection

| Period | Pro Subs | DowEats | Merch | Marketplace | Total |
|--------|----------|---------|-------|-------------|-------|
| M1-M2 | 0 | 0 | 0 | 0 | PKR 0 |
| M3 | PKR 75K | PKR 112K | PKR 30K | PKR 15K | PKR 232K |
| M6 | PKR 100K | PKR 225K | PKR 120K | PKR 40K | PKR 485K |
| **Y1** | **PKR 150K** | **PKR 1.35M** | **PKR 600K** | **PKR 150K** | **PKR 2.25M** |

### Payment Infrastructure
- **Dow Credits** (1 Credit = PKR 1): used for DowEats, Merch, Marketplace transactions only. Manual top-up via Easypaisa/JazzCash receipt → admin verification in 5-10 min.
- **Pro Subscription**: separate direct payment flow (NOT through Dow Credits). Receipt upload → admin verification → Pro activated.
- Phase 2 addon: Easypaisa/JazzCash API integration to automate verification.

---

## TECHNICAL ARCHITECTURE

### Frontend
- **Framework:** Next.js 15 (App Router) + TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State:** Zustand (global) + TanStack Query (server cache)
- **Mobile:** Capacitor.js (Android — built in Phase 7, pre-beta. iOS deferred to Phase 3.)
- **Rendering:** ISR (timetable 5-min) + SSR (auth) + Realtime (announcements, orders)

### Backend
- **Database:** Supabase PostgreSQL (RLS on every table)
- **Auth:** Supabase Auth (email/OTP, JWT role claims for admin gating)
- **Real-Time:** Supabase Realtime (announcements, timetable, orders, lost & found)
- **Storage:** Supabase Storage (Dow ID photos, avatars, receipts, audio)
- **API:** Next.js API routes
- **Analytics:** PostHog (DAU/MAU, funnels, retention), Sentry (errors, performance)

### AI/LLM
- **Primary:** Gemini 2.5 Flash (AI Tutor, MCQ explanations, summaries, study plans)
- **Reasoning fallback:** DeepSeek R1 (Socratic mode, complex questions — 3-attempt chain then downgrade)
- **Voice STT:** Groq Whisper Large v3 Turbo (~$20/month, Pakistani-accent medical terms)
- **Voice TTS:** Google Cloud TTS ($5-10/month, selectable male/female, 0.8x-1.5x speed)
- **Embeddings:** Gemini `text-embedding-004` (768 dims) → pgvector (hybrid dense + BM25 + cross-encoder re-rank)
- **RAG pipeline:** PDF → Gemini 2.5 Pro extraction → sentence/paragraph chunking → embed → hybrid retrieval → Google Search grounding fallback

### Maps
- **Renderer:** MapLibre GL JS + PMTiles (no Google Maps dependency)
- **Data:** QGIS-digitised GeoJSON (campus paths, bus routes, POIs)
- **Geocoding:** Google Geocoding API (place-search only, scoped to campus)

### Push Notifications
- **Push:** Firebase Cloud Messaging (via Capacitor plugin)
- **Local:** `@capacitorjs/local-notifications` (prayer reminders, class reminders)
- **Permission:** Day 2 priming (not first login), max 2 asks lifetime
- **Categories:** Urgent (bypass quiet hours), Normal, Low. Quiet hours 10 PM - 6 AM PKT.

### Monthly Cost Estimate
- Supabase: $25/month
- Gemini API: $40-50/month
- Groq Whisper: ~$20/month
- Google Cloud TTS: $5-10/month
- Vercel: $0-20/month
- Firebase: $0 (free tier)
- PostHog: $0 (free tier up to 1M events)
- **Total: ~$90-125/month**

---

## TEAM & ROLES

**Salik - Full-Stack Developer & Technical Lead**
- All Next.js 15 + Supabase development
- AI integration (Gemini, Groq, RAG pipeline)
- Voice integration (Whisper + TTS)
- Capacitor Android build
- CI/CD, staging environment, error monitoring
- Primary Dow Credits verification (backup: Ammaar)

**Ammaar - Operations & Campus**
- DowEats: restaurant onboarding (3-5 Burns Road partners), rider hiring, gate delivery coordination
- Merch: vendor sourcing, customization workflow, product photography
- Campus map data: QGIS bus route tracing, POI marking
- Dow Credits verification (backup to Salik)
- Beta testing coordination

**Azfar - Content & Curriculum**
- MCQ production: first 100 by Day 17, target 800+ by full launch
- Viva sheets: all Batch 1 current modules by Day 24
- Textbook/slide preparation: 25 PDFs for RAG ingestion
- Study Guides writing: 5 module guides + 3 general guides + resource data for 10 modules (start at full launch, ready by mid-April)
- Flashcard deck creation: 50 cards each for top 5 modules
- Content quality review (AI-generated summaries, MCQ explanations)
- Daily verse/hadith content for prayer page (rolling 30-day seed)

---

## SUCCESS METRICS

### Beta Launch (Mar 14)
- < 20 critical bugs outstanding
- > 4.2/5 user rating from beta testers
- 60%+ Day-2 retention (Day 2 DAU / Day 1 DAU)
- 20-50 beta testers from Batch 1

### Full Launch (Mar 28) — Week 1-4 Targets
| Week | Signups | AI msgs/day | Attendance check-ins/day | MCQ attempts/day |
|------|---------|-------------|--------------------------|------------------|
| W1 | 100 | 50 | 30 | 100 |
| W2 | 225 | 200 | 100 | 300 |
| W3 | 350 | 350 | 250 | 600 |
| W4 | 500 | 500 | 400 | 1,000 |

### Month 2-3
- 1,000+ active users (50% of Dow Medical)
- PKR 100K+ revenue
- 50%+ DAU retention
- 15-20% Pro conversion rate
- App rating: 4.2 → 4.6/5

### Year 1
- 2,000 users (100% Dow Medical)
- PKR 2.25M revenue
- 60%+ daily engagement
- Ready for expansion to 2-3 other medical colleges (CampusOS)

---

## COMPETITIVE ADVANTAGE

### vs MedAngle
| Metric | MedAngle | DowOS |
|--------|-----------|-------|
| **Price** | PKR 5,000+/year | PKR 3,000/year (or PKR 1,500/3-mo exam pass) |
| **MCQs** | Limited + paid | Unlimited, free forever |
| **AI Tutor** | No | Yes (Gemini-powered, RAG-backed, voice) |
| **Viva Practice** | No | Yes (voice exam simulation, 50-pt scoring) |
| **Study Tracker** | No | Yes (manual checklist + auto mastery + batch compare) |
| **Flashcards** | No | Yes (Anki-style SM-2 spaced repetition) |
| **Exam Predictions** | No | Yes (past paper frequency analysis) |
| **Food Delivery** | No | Yes (Burns Road, gate delivery) |
| **Merchandise** | No | Yes (hoodies, lab coats, varsity jackets) |
| **Campus Exclusive** | No | Yes (Dow ID verified) |
| **Adoption Rate** | 20-30% | Target 100% |

### vs International (UWorld, AMBOSS, Anki)
- UWorld: $400+/yr, AMBOSS: $180+/yr — 10-50x more expensive than DowOS
- Not tailored to Pakistani medical curriculum (PMC-regulated)
- No campus features (timetable, attendance, food, community)
- DowOS: built BY Dow students FOR Dow students, with Dow-specific content

### Moat
- Campus lock-in (Dow ID verification, batch-specific content)
- Hyperlocal ops (gate delivery, campus map, prayer rooms, Dow-specific timetable)
- Network effects (batch aggregates, marketplace, lost & found)
- Content flywheel (MCQs, viva sheets, study guides — all Dow curriculum-specific)
- Revenue diversification (not just education — food, merch, marketplace)

---

## DESIGN SYSTEM - LOCKED

**Colors:**
- Primary: Dark Navy `#1A2B4C`
- Secondary: Offwhite `#F5F5F7`
- Accents: Teal `#00A896`, Gold `#D4A574`, Red `#E74C3C`

**Typography:**
- Headers: **Outfit Bold** (700/800)
- Body: **Inter Regular** (400)
- Data: **JetBrains Mono** (600)

**Components:**
- Buttons: Slightly rounded (4-6px)
- Cards: Glassmorphism + subtle shadow
- Inputs: Rounded borders + subtle shadow
- Dark Mode: Full support

---

## TIMELINE

### Phase 1: Foundation & Decisions (Days 1-9) — DONE
- Auth/onboarding, all architecture decisions locked, UI/product decisions locked

### Phase 2: Core Shell, Timetable & Admin (Days 10-16)
- NavShell (done), Dashboard, Profile, Admin stubs, Timetable, Attendance, Dow Credits, Pro Subscription

### Phase 3: AI & Learning Core (Days 17-23)
- RAG pipeline, MCQ Solver, AI Tutor (text + voice), content seed checkpoint

### Phase 4: Viva Bot, Browse Q&A, Study Tracker (Days 24-30)
- Viva Bot voice drill, Browse Q&A, Study Tracker (heatmap + checklist + batch), Saved Questions

### Phase 5: Community, Prayers & Maps (Days 31-35)
- Lost & Found, Campus Map, Announcements, Prayer Times (full page + Qibla + masjid times)

### Phase 6: Dow Credits & Pro Subscription (Days 33-35, parallel)
- Wallet, top-up flow, Pro upgrade flow (separate from Credits), admin verification queues

### Phase 7: Capacitor Build, Push Notifications & QA (Days 36-38)
- Android APK via Capacitor, FCM push, notification categories + quiet hours, full QA pass

### Phase 8: BETA LAUNCH — Mar 14 (Day 39)
- 20-50 beta testers from Batch 1, Play Store internal testing track

### Phase 9: Beta Feedback & Iteration (Mar 15-27)
- Bug triage, UX iteration, WCAG audit, admin analytics dashboard, 800+ MCQ seed

### Phase 10: FULL LAUNCH — Mar 28 (Day 53)
- Open signups to all 2,000 Dow students, Play Store public track, marketing blitz

### Post-Launch: Revenue + Education Phase 2 + Scale
- Week 5: DowEats | Week 6: Merch | Week 7: Marketplace
- Week 8: Flashcards + Quick Summaries + Exam Predictions | Week 9: Study Guides
- Ongoing: AI Study Buddy Nudges, Mental Health features, Android polish, iOS (when revenue covers Apple Dev account), CampusOS expansion investigation

---

## RISK REGISTER

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Content delays (MCQs, viva sheets) | HIGH | HIGH | AI-assisted drafting, Azfar starts Day 10, prioritize Batch 1 modules |
| Cafe partnerships fail | MEDIUM | MEDIUM | Pre-identified sympathetic Burns Road owners, show revenue potential (15% is below Foodpanda's 25-30%) |
| Critical bug at launch | MEDIUM | HIGH | Vercel preview deploys for staging, Sentry monitoring, 2-week beta buffer |
| Retention drops between exams | MEDIUM | HIGH | Non-education hooks (timetable, attendance, DowEats, lost & found) keep daily engagement |
| AI costs spike at scale | LOW | MEDIUM | Gemini response caching, rate limits (5/6 free), cost dashboard with billing alerts |
| Low Pro conversion (< 10%) | MEDIUM | MEDIUM | Exam-season pass at PKR 1,500 for impulse conversion, "Ask AI →" as conversion trigger on every MCQ |
| Content per-campus doesn't scale | MEDIUM | HIGH (for expansion) | AI-assisted content generation, contributor network model for new campuses |

---

## EXPANSION VISION: CAMPUSОС

DowOS is the first product. The long-term vision is **CampusOS** — a parent brand that packages the student super-app for other Pakistani medical colleges.

- ~170 medical colleges in Pakistan, ~28,000 new MBBS seats/year
- Medical curriculum ~80% standardized (same textbooks, PMC-regulated exam formats)
- Go-to-market: find a student champion at each campus (replicates the Salik/Azfar/Ammaar model)
- Multi-tenant: shared codebase, per-university Supabase project, university-specific branding + content
- Timeline: prove model at Dow (1,000+ DAU, PKR 1M+ revenue) → expand to university #2

**Not building for this yet.** Focus is 100% on making DowOS work at Dow. CampusOS becomes the natural next step once the model is proven.

---

## LOCKED DECISION DOCUMENTS

All architecture and product decisions are locked in `docs/decisions/`:

| Decision | Doc | Status |
|----------|-----|--------|
| RAG Architecture | `rag-architecture.md` | LOCKED |
| Maps Platform | `maps-platform.md` | LOCKED |
| Voice/STT Pipeline | `voice-stt.md` | LOCKED |
| AI Routing & Fallback | `ai-routing-fallback.md` | LOCKED |
| Mobile Delivery | `mobile-delivery.md` | LOCKED |
| Viva Bot Orchestration | `viva-bot-orchestration.md` | LOCKED |
| Education Tab Structure | `education-tab.md` | LOCKED |
| Mobile vs Web UI | `mobile-web-ui.md` | LOCKED |
| UI Page Structure | `ui-page-structure.md` | LOCKED |
| Profile Card UX | `profile-card-ux.md` | LOCKED |
| Dow Credits & Payment | `credits-payment.md` | LOCKED |
| Dow ID Approval | `dow-id-approval.md` | LOCKED |
| Push Notifications | `push-notifications.md` | LOCKED |
| DowEats Operations | `doweats-ops.md` | LOCKED |
| Marketplace Operations | `marketplace-ops.md` | LOCKED |
| Viva Scoring | `viva-scoring.md` | LOCKED |
| Upload Pipeline | `upload-pipeline.md` | LOCKED |
| Analytics & Logging | `analytics-logging.md` | LOCKED |
| Study Tracker | `study-tracker.md` | LOCKED |
| Study Guides | `study-guides.md` | LOCKED |

---

## CONCLUSION

DowOS will capture 100% of Dow Medical College's student market by offering:
1. **Free forever MCQs + Flashcards + Study Tracker + Exam Predictions** (vs paid competitors)
2. **Campus-exclusive** (Dow ID verified, hyperlocal ops)
3. **AI-powered learning** (Gemini RAG-backed tutor, voice viva practice, smart study nudges)
4. **Revenue diversification** (Pro subs + food + merch + marketplace)
5. **Built BY Dow students FOR Dow students** (trust, understanding, campus-specific content)

**Beta Mar 14. Full launch Mar 28. 500 DAU Week 4. PKR 2.25M Year 1. CampusOS after proof of model.**

---

**Status:** Phase 2 Build In Progress (NavShell + Dashboard complete, Profile + Admin next)
**Last Updated:** 2026-02-06 (Session 10)
**Current Build Day:** 11

