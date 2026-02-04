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
| Viva Bot | 1 | Pro-gated. Voice Q&A drill. |
| Progress Matrix | 1 | Mastery heatmap per module/subject/subtopic. |
| Saved Questions | 2 | Student bookmarks questions they want to revisit. |
| Quick Summaries | 2 | Short AI-generated notes on a topic. |
| Flashcards | 2 | Spaced-repetition style card drill. |

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
│   └── page.tsx              ← Viva Bot entry (module/topic picker, then session)
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

The drill screens (`mcq/drill`, `viva`) are `'use client'` components — they manage active session state (current question, score, timer).

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
| 17 | Build `education/page.tsx` — the cards grid landing screen. Render Phase 1 cards (MCQ, Viva, Progress) as static `<Link>` cards. No badge logic yet — that comes with the data. |
| 18–19 | Build MCQ Solver: module picker page, source toggle, question list, drill screen. Wire to `mcq_questions` + `past_paper_questions` tables (already seeded by admin). |
| 20 | Build Progress Matrix page (heatmap). |
| 21 | Build Viva Bot entry + session pages. Pro paywall gate on the card CTA. |
| 22 | Wire live badges: saved-question count, cards-due count (Phase 2 data not yet seeded — badges hidden until count > 0, so no visual gap). |
| 23 | Integration test: full Education tab flow on mobile (375 px) and desktop. Dark-mode check. |

Phase 2 additions (Saved Questions, Quick Summaries, Flashcards) each add one card to the grid and one route subtree. No changes to the landing screen component — just one more item in the cards array.

---

## 8. Sources consulted

- `docs/decisions/rag-architecture.md` — past-paper ingestion, high-yield scoring
- `docs/decisions/model-selection.md` — MCQ explanation generation (Flash-Lite batch)
- `docs/4_DESIGN_SYSTEM.md` — design tokens, card component patterns
- `docs/roadmap-day-by-day.md` — Phase 3 scope
- Skills consulted: `nextjs-app-router-patterns`, `react-patterns`, `tailwind-design-system`
