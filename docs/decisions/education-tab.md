# Decision: Education Tab Structure

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Day 4 decision sprint (extended)

---

## 1. What was already locked (do not re-debate)

| Item | Decision |
|---|---|
| AI Tutor | Own top-level nav item (`/ai`). Not inside Education. |
| MCQ Solver | Lives under Education. Two question sources: Past Papers + External. |
| Viva Bot | Lives under Education. Pro-gated (180 min / mo). |
| Progress Matrix | Lives under Education. Module/subject mastery heatmap. |
| Route structure | Authenticated routes live under `src/app/(app)/` |
| Education route | `src/app/(app)/education/` — confirmed in folder structure |

---

## 2. What this doc resolves

The PRD listed three features under Education (MCQ, Viva, Progress). Product discovery expanded that to six, split across Phase 1 and Phase 2:

| Feature | Phase | Notes |
|---|---|---|
| MCQ Solver | 1 | Two sources: Past Papers (high-yield, from past-paper CSV/JSON uploads) + External (other relevant questions). Module picker → source toggle. |
| Viva Bot | 1 | Pro-gated. Voice Q&A drill. Organised module → subject → subtopic. |
| Anki Mode | 1 | Free for all. Flashcard-style self-study using the same viva questions + model answers. Students can skip the bot and just learn at their own pace. See §4.2. |
| Progress Matrix | 1 | Mastery heatmap per module/subject/subtopic. |
| Saved Questions | 2 | Student bookmarks questions they want to revisit. |
| Quick Summaries | 2 | Short AI-generated notes on a topic. |
| Flashcards | 2 | Spaced-repetition style card drill (broader than Anki mode — covers MCQs + summaries too). |

**Questions this doc resolves:**

1. How is the Education landing screen organised?
2. What is the route and component hierarchy?
3. How does the MCQ two-source split surface in the UI?
4. How do Phase 2 features slot in without restructuring?

---

## 3. Education tab — landing screen

The student taps "Education" in the nav. They land on a **cards grid** — a vertical list of feature cards. Each card is a self-contained entry point to one feature.

### Phase 1 cards (ship Day 17–23)

```
┌─────────────────────────────────────┐
│  Education                          │  ← screen title
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │  📝  MCQ Solver             │    │
│  │  Drill questions by module  │    │
│  │  [Start Drilling →]         │    │  ← CTA taps into /education/mcq
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🎤  Viva Bot               │    │
│  │  Practice with voice Q&A    │    │
│  │  [Start Session →] 🔒 Pro  │    │  ← Pro paywall CTA if free
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🃏  Anki Mode              │    │
│  │  Learn Q&A at your pace     │    │
│  │  [Start Learning →]        │    │  ← free for all, no Pro gate
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  📊  Progress Matrix        │    │
│  │  See your mastery by module │    │
│  │  [View Progress →]          │    │  ← taps into /education/progress
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### Phase 2 cards (added below the Phase 1 cards, no restructure needed)

```
│  ┌─────────────────────────────┐    │
│  │  🔖  Saved Questions        │    │
│  │  3 questions saved          │    │  ← badge shows count
│  │  [Review →]                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  ⚡  Quick Summaries        │    │
│  │  AI-generated topic notes   │    │
│  │  [Browse →]                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🃏  Flashcards             │    │
│  │  12 cards due today         │    │  ← badge shows due count
│  │  [Start Review →]           │    │
│  └─────────────────────────────┘    │
```

Cards grid is the right structure because: (a) it's a flat list — adding a card is `push one item`, not a nav restructure; (b) each card can show a live badge (saved count, cards due, progress %) without cramming data into a tab header; (c) it works at 375 px — one card per row, full width, touch target is the entire card.

---

## 4. Route & component hierarchy

```
src/app/(app)/education/
├── page.tsx                  ← Education landing (cards grid)
├── mcq/
│   ├── page.tsx              ← MCQ module picker
│   ├── [module_id]/
│   │   └── page.tsx          ← Source toggle + question list for a module
│   └── drill/
│       └── page.tsx          ← Active drill screen (question → answer → next)
├── viva/
│   ├── page.tsx              ← Viva entry: module picker
│   ├── [module_id]/
│   │   └── page.tsx          ← Subject picker within module
│   └── session/
│       └── page.tsx          ← Active Viva Bot session (voice Q&A)
├── anki/
│   ├── page.tsx              ← Anki entry: module picker (same as viva)
│   ├── [module_id]/
│   │   └── page.tsx          ← Subject picker within module
│   └── [subtopic_id]/
│       └── page.tsx          ← Flashcard drill (question → tap to reveal answer → next)
├── progress/
│   └── page.tsx              ← Progress Matrix heatmap
├── saved/                    ← Phase 2
│   └── page.tsx
├── summaries/                ← Phase 2
│   └── page.tsx
└── flashcards/               ← Phase 2
    └── page.tsx
```

`education/page.tsx` is a Server Component. It fetches the card metadata (e.g. saved-question count, flashcards-due count) in parallel via Supabase and renders the grid. Each card is a simple `<Link>` — no client-side state needed on the landing screen.

The drill screens (`mcq/drill`, `viva/session`, `anki/[subtopic_id]`) are `'use client'` components — they manage active session state (current question, score, timer).

---

## 4.1 Viva Bot — module → subject → subtopic navigation

Viva Bot is organised in a three-level drill-down. This matches how students think about studying ("I need to practise Cardiology → Anatomy → Coronary Circulation") and how the content is tagged in the taxonomy.

```
Student taps "Viva Bot" card
     │
     ▼
┌── Module Picker ──────────────────────┐
│  Pick the module you're studying.     │
│                                       │
│    Cardiovascular   [→]               │
│    Respiratory      [→]               │
│    Renal            [→]               │
│    …                                  │
└──────────────┬────────────────────────┘
               │  student taps "Cardiovascular"
               ▼
┌── Subject Picker ─────────────────────┐
│  Pick the subject within Cardiovascular│
│                                       │
│    Anatomy          [→]   (12 topics) │  ← badge shows how many subtopics
│    Physiology       [→]   (8 topics)  │     have viva content
│    Pathology        [→]   (5 topics)  │
│    …                                  │
└──────────────┬────────────────────────┘
               │  student taps "Anatomy"
               ▼
┌── Subtopic Picker ────────────────────┐
│  Pick the topic to practise.          │
│                                       │
│    Coronary Circulation  [→]          │  ← taps into /viva/session
│    Aortic Arch           [→]          │     with module + subject + subtopic
│    Heart Chambers        [→]          │     context passed as params
│    …                                  │
└───────────────────────────────────────┘
```

The subject and subtopic pickers only show entries that have **viva content uploaded**. If Azfar hasn't uploaded a viva sheet for "Heart Valves" yet, it doesn't appear in the list. No empty pages, no dead ends.

---

## 4.2 Anki Mode — self-study flashcards (free for all)

Anki Mode uses the **exact same question + model answer data** as Viva Bot, but in a completely different interaction pattern. No voice. No scoring. No bot. Just: question on screen → tap to flip → see the answer → mark yourself (Got it / Need review) → next card.

This is the free-tier path into viva-style content. Students who don't have Pro (or who just want to memorise before a viva) use Anki Mode. It's also useful for quick revision — 5 minutes of card flipping before an exam.

### Navigation

Identical to Viva Bot: module → subject → subtopic. Same three-level drill-down, same filtered lists (only subtopics with content show up).

### The card drill

```
┌─────────────────────────────────────┐
│  Coronary Circulation               │  ← breadcrumb: module > subject > subtopic
│  Card 3 of 12                       │  ← progress counter
├─────────────────────────────────────┤
│                                     │
│  Describe the blood supply          │  ← the question (same text Viva Bot
│  to the myocardium.                 │     would ask out loud)
│                                     │
│  ┌─────────────────────────────┐    │
│  │  [ Tap to reveal answer ]   │    │  ← large tap target, full width
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘

           ── after tap ──

┌─────────────────────────────────────┐
│  Coronary Circulation               │
│  Card 3 of 12                       │
├─────────────────────────────────────┤
│                                     │
│  Describe the blood supply          │
│  to the myocardium.                 │
│                                     │
│  ── Answer ─────────────────────    │  ← answer revealed (the model_answer
│  The myocardium receives its        │     from the viva sheet — written
│  blood supply from the left and     │     clearly by Azfar)
│  right coronary arteries…           │
│                                     │
│  ── Key points ─────────────────    │  ← the key_points from the viva sheet,
│  • Left & right coronary arteries   │     shown as bullet list so the student
│  • Arise from aortic sinuses        │     can check themselves
│  • Flow mainly in diastole          │
│                                     │
│  Did you get it?                    │
│  [ ✓ Got it ]  [ ↻ Need review ]   │  ← self-assessment. "Got it" moves to
│                                     │     next card. "Need review" pushes it
└─────────────────────────────────────┘     to the back of the deck.
```

### How Anki Mode relates to Viva Bot

| Aspect | Viva Bot | Anki Mode |
|---|---|---|
| Same questions? | ✓ Yes | ✓ Yes (same viva sheet data) |
| Same model answers? | Bot uses them internally for scoring | Student sees them after tapping |
| Voice? | ✓ Bot speaks questions, student speaks answers | ✗ Silent. Text only. |
| Scoring? | ✓ 3-dimension scoring + adaptive difficulty | ✗ Self-assessed only (Got it / Need review) |
| Pro gate? | ✓ Pro only | ✗ Free for all |
| Progress tracked? | ✓ Full session report | ✓ Card completion % shown on subtopic card |

### Why both exist

Viva Bot is the **practice exam** — it simulates the real thing, scores you, adapts difficulty. It's high-value but high-friction (Pro gate, voice required, time commitment).

Anki Mode is the **study tool** — low friction, quick, free. A student can flip 20 cards in 3 minutes while waiting for class. It's not a replacement for Viva Bot; it's the entry ramp. Students who get comfortable with the material in Anki Mode are more likely to attempt Viva Bot when the time comes.

---

## 5. MCQ Solver — module picker → source toggle flow

This is the most structurally interesting feature because it has two question sources. The flow is designed so that **module context comes first** — that's what students think about ("I'm studying Anatomy"). The past-paper vs external split is a filter, not a fork.

```
Student taps "MCQ Solver" card
     │
     ▼
┌── Module Picker ──────────────────────────┐
│  A vertical list of modules the student   │
│  is currently enrolled in (from their     │
│  batch + timetable data).                 │
│                                           │
│    Anatomy          [→]                   │
│    Physiology       [→]                   │
│    Biochemistry     [→]                   │
│    …                                      │
└──────────────┬────────────────────────────┘
               │  student taps "Anatomy"
               ▼
┌── Source Toggle + Question List ──────────┐
│                                           │
│  ┌─────────┐  ┌──────────┐               │
│  │Past Papers│  │  All     │  ← toggle    │
│  │ (default) │  │  Sources │    pills      │
│  └─────────┘  └──────────┘               │
│                                           │
│  "Past Papers" selected:                  │
│    Shows only questions extracted from    │
│    uploaded past-paper CSVs for Anatomy.  │
│    Each question has a badge: exam year + │
│    type (Annual / Supplementary / Mock).  │
│                                           │
│  "All Sources" selected:                  │
│    Shows past-paper questions AND         │
│    external questions, interleaved.       │
│    Past-paper questions get a small       │
│    "Past Paper" tag so they're            │
│    distinguishable.                       │
│                                           │
│  [Start Drilling →]  ← taps into drill   │
└───────────────────────────────────────────┘
```

**Why "Past Papers" is the default toggle state:**
Past papers are high-yield by definition — they're the questions that actually showed up on exams. The `high_yield_topics` system (from `rag-architecture.md`) already scores these. Defaulting to past papers means the student's first drill session is automatically the highest-value one. They can switch to "All Sources" if they want broader coverage.

**Why not a separate "Past Papers" page?**
Past papers and external questions are the same *type* of content (multiple choice questions with explanations). Splitting them into separate pages doubles the navigation and the drill UI code. A toggle is a one-line filter on the data query — `WHERE source_type = 'past_paper'` vs no filter.

---

## 6. Card design spec

Each Education card follows the same component shape. Built from existing shadcn primitives (`card`, `badge`, `button`).

| Element | Detail |
|---|---|
| Icon | Lucide, 28 px, Teal (`#00A896`) |
| Title | Outfit Bold, 16 px, Navy (`#1A2B4C`) |
| Subtitle | Inter, 13 px, 60 % opacity Navy |
| CTA | Full-width `Button` variant inside card, Teal fill, white text |
| Badge (optional) | shadcn `badge` — top-right corner. Shows live count (saved questions, cards due). Only rendered if count > 0. |
| Pro lock (Viva) | CTA text changes to "Upgrade to Pro". Button variant changes to outline. A small lock icon appears next to the text. Taps into the Pro upgrade flow. |
| Card height | Auto — content-driven. No fixed height. Consistent horizontal padding (16 px). |
| Tap target | Entire card is clickable (`<Link>`), not just the CTA button. CTA button exists for visual emphasis only. |

---

## 7. What to build and when

All Education tab work lives in Phase 3 (Days 17–23). The landing screen and MCQ are the first things built because MCQ is the highest-volume feature (students drill questions daily).

| Day | Work item |
|---|---|
| 17 | Build `education/page.tsx` — the cards grid landing screen. Render Phase 1 cards (MCQ, Viva, Anki, Progress) as static `<Link>` cards. No badge logic yet — that comes with the data. |
| 18–19 | Build MCQ Solver: module picker page, source toggle, question list, drill screen. Wire to `mcq_questions` + `past_paper_questions` tables (already seeded by admin). |
| 20 | Build Progress Matrix page (heatmap). |
| 21 | Build Viva Bot entry: module → subject → subtopic navigation. Pro paywall gate on the card CTA. Build Viva Bot session page (voice Q&A, scored). |
| 22 | Build Anki Mode: module → subject → subtopic navigation (reuses same picker components as Viva). Build flashcard drill screen (tap-to-reveal, Got it / Need review self-assessment). Wire to same viva sheet data. |
| 23 | Wire live badges: saved-question count, cards-due count (Phase 2 data not yet seeded — badges hidden until count > 0, so no visual gap). Integration test: full Education tab flow on mobile (375 px) and desktop. Dark-mode check. |

Phase 2 additions (Saved Questions, Quick Summaries, Flashcards) each add one card to the grid and one route subtree. No changes to the landing screen component — just one more item in the cards array.

---

## 8. Sources consulted

- `docs/decisions/rag-architecture.md` — past-paper ingestion, high-yield scoring
- `docs/decisions/model-selection.md` — MCQ explanation generation (Flash-Lite batch)
- `docs/4_DESIGN_SYSTEM.md` — design tokens, card component patterns
- `docs/roadmap-day-by-day.md` — Phase 3 scope
- Skills consulted: `nextjs-app-router-patterns`, `react-patterns`, `tailwind-design-system`
