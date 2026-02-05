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
| Viva Bot + Anki Mode | 1 | Viva Bot: Pro-gated voice Q&A drill, module → subject. Anki Mode: free flashcard view of the same questions, lives inside the Viva entry (not a separate card). See §4.1 + §4.2. |
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
│  │  [📖 Anki Mode →]          │    │  ← free for all — tap to flip Q&A
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
│   ├── page.tsx              ← Viva entry: module picker (shared by both modes)
│   ├── [module_id]/
│   │   └── page.tsx          ← Subject picker within module
│   ├── session/
│   │   └── page.tsx          ← Active Viva Bot session (voice Q&A, Pro)
│   └── anki/
│       └── page.tsx          ← Anki Mode drill (tap-to-reveal, Free)
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

The drill screens (`mcq/drill`, `viva/session`, `viva/anki`) are `'use client'` components — they manage active session state (current question, score, timer).

---

## 4.1 Viva Bot — module → subject navigation + mode picker

Viva Bot is organised in **two levels**: module → subject. There is no subtopic picker. Once the student picks a subject, the bot draws questions from **all subtopics within that subject** and adapts difficulty dynamically. This keeps the session feeling like a real viva — an examiner doesn't announce "now I'm moving to coronary circulation"; they move between topics naturally.

```
Student taps "Viva Bot" card  (or the free "Anki Mode" link on the same card)
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
│    Anatomy          [→]   (12 Qs)     │  ← badge shows total viva questions
│    Physiology       [→]   (8 Qs)      │     available across all subtopics
│    Pathology        [→]   (5 Qs)      │
│    …                                  │
└──────────────┬────────────────────────┘
               │  student taps "Anatomy"
               ▼
┌── Mode Picker ────────────────────────┐  ← this screen only appears after
│  How do you want to study?            │     the subject is chosen
│                                       │
│  ┌─────────────────────────────────┐  │
│  │  🎤  Viva Bot                   │  │  ← voice Q&A with the examiner
│  │  Scored session · 3 modes       │  │     🔒 Pro only
│  │  [Start Session →] 🔒 Pro      │  │
│  └─────────────────────────────────┘  │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │  📖  Anki Mode                  │  │  ← tap-to-reveal flashcards
│  │  Self-study at your own pace    │  │     Free for all
│  │  [Start Learning →]            │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
               │
               ├── if Viva Bot → mode picker (Strict / Friendly / Standard)
               │                 → greeting → session loop
               │
               └── if Anki    → flashcard drill (no mode needed)
```

Only subjects that have uploaded viva content appear in the list. No empty pages, no dead ends.

---

## 4.2 Anki Mode — self-study flashcards (free for all)

Anki Mode uses the **exact same question + model answer data** as Viva Bot, but in a completely different interaction pattern. No voice. No scoring. No bot. Just: question on screen → tap to flip → see the answer → mark yourself (Got it / Need review) → next card.

This is the free-tier path into viva-style content. Students who don't have Pro (or who just want to memorise before a viva) use Anki Mode. It's also useful for quick revision — 5 minutes of card flipping before an exam.

### Navigation

Same module → subject picker as Viva Bot. After picking the subject, the student lands directly in the flashcard drill — no mode picker, no examiner greeting. Cards are drawn from all subtopics within the chosen subject, shuffled.

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

## 5. MCQ Solver — two question pools, two different groupings

MCQ Solver has two question pools: **Tested Questions** (past papers) and **General Questions** (all other MCQs). Each pool has its own grouping logic because students use them differently.

- **Tested Questions:** Students ask "what came up in last year's exam?" → grouped by **year first**, then module → subject within that year.
- **General Questions:** Students ask "I need to practise Anatomy" → grouped by **module → subject → topic**. Within this, they can choose to drill **subject-wise** (all topics in a subject at once) or **topic-wise** (one specific topic). This is a toggle, not a separate page.

### 5.1 Entry — source picker

```
Student taps "MCQ Solver" card
     │
     ▼
┌── Source Picker ──────────────────────────┐
│                                           │
│  ┌───────────────────┐  ┌─────────────┐   │
│  │  📋 Tested        │  │  📝 General │   │  ← two top-level pills
│  │  Questions        │  │  Questions  │   │     (default: Tested)
│  │  (default)        │  │             │   │
│  └───────────────────┘  └─────────────┘   │
│                                           │
└───────────────────────────────────────────┘
```

**Why "Tested Questions" is the default:** Past papers are high-yield by definition — they're what actually showed up on exams. The `high_yield_topics` system (from `rag-architecture.md`) already scores these. Defaulting to past papers means the student's first drill is automatically the highest-value one.

### 5.2 Tested Questions — year → module → subject

```
┌── Year Picker ────────────────────────────┐
│  Which year's questions?                  │
│                                           │
│    2024   Annual + Supplementary  (34 Qs) │  ← badge shows total questions
│    2023   Annual + Supplementary  (28 Qs) │     for that year
│    2022   Annual only             (19 Qs) │
│    …                                      │
└──────────────┬────────────────────────────┘
               │  student taps "2024"
               ▼
┌── Module Picker ──────────────────────────┐
│  Which module?                            │
│                                           │
│    Cardiovascular                 (12 Qs) │
│    Respiratory                    (8 Qs)  │
│    …                                      │
└──────────────┬────────────────────────────┘
               │  student taps "Cardiovascular"
               ▼
┌── Subject Picker + Drill ─────────────────┐
│                                           │
│    Anatomy          (5 Qs)  [→]           │  ← tap subject to drill its questions
│    Physiology       (4 Qs)  [→]           │
│    Pathology        (3 Qs)  [→]           │
│                                           │
│  [Drill all Cardiovascular 2024 →]        │  ← or drill the whole module at once
└───────────────────────────────────────────┘
```

Each question in the list shows a small badge: **Annual** or **Supplementary** so the student knows the exam context.

### 5.3 General Questions — module → subject → topic, with drill-mode toggle

```
┌── Module Picker ──────────────────────────┐
│  Which module?                            │
│                                           │
│    Cardiovascular                 (48 Qs) │
│    Respiratory                    (31 Qs) │
│    …                                      │
└──────────────┬────────────────────────────┘
               │  student taps "Cardiovascular"
               ▼
┌── Subject Picker ─────────────────────────┐
│  Which subject?                           │
│                                           │
│    Anatomy          (22 Qs)  [→]          │
│    Physiology       (16 Qs) [→]          │
│    Pathology        (10 Qs) [→]          │
│    …                                      │
└──────────────┬────────────────────────────┘
               │  student taps "Anatomy"
               ▼
┌── Drill Mode Toggle ──────────────────────┐
│                                           │
│  ┌──────────────┐  ┌────────────────┐     │
│  │ Subject-wise │  │  Topic-wise    │     │  ← how do you want to drill?
│  │  (default)   │  │                │     │     Subject-wise = all 22 Qs
│  └──────────────┘  └────────────────┘     │     shuffled together.
│                                           │     Topic-wise = pick a topic first.
│  "Subject-wise" selected:                 │
│    All 22 Anatomy questions, shuffled.    │
│    [Start Drilling →]                     │
│                                           │
│  "Topic-wise" selected:                   │
│    Coronary Circulation  (6 Qs)  [→]      │  ← topic list appears
│    Aortic Arch           (4 Qs)  [→]      │
│    Heart Chambers        (5 Qs)  [→]      │
│    …                                      │
│    [Drill all topics →]                   │  ← or drill all, topic-grouped
└───────────────────────────────────────────┘
```

**Subject-wise** is the default because most students just want to practise a subject broadly. **Topic-wise** is for targeted revision — "I'm weak on coronary circulation specifically."

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
| 17 | Build `education/page.tsx` — the cards grid landing screen. Render Phase 1 cards (MCQ, Viva+Anki, Progress). No badge logic yet — that comes with the data. |
| 18–19 | Build MCQ Solver: source picker (Tested / General). Tested Questions: year → module → subject drill. General Questions: module → subject → topic with subject-wise / topic-wise toggle. Drill screen shared by both. Wire to `mcq_questions` + `past_paper_questions` tables. |
| 20 | Build Progress Matrix page (heatmap). |
| 21 | Build Viva entry: module → subject picker → mode picker (Viva Bot vs Anki). Build Viva Bot session (examiner mode picker: Strict / Friendly / Standard → greeting → voice Q&A loop). Pro paywall gate. |
| 22 | Build Anki Mode drill (tap-to-reveal, Got it / Need review). Shares the same module → subject picker as Viva. Wire to same viva sheet data. |
| 23 | Wire live badges. Integration test: full Education tab flow on mobile (375 px) and desktop. Dark-mode check. |

Phase 2 additions (Saved Questions, Quick Summaries, Flashcards) each add one card to the grid and one route subtree. No changes to the landing screen component — just one more item in the cards array.

---

## 8. Sources consulted

- `docs/decisions/rag-architecture.md` — past-paper ingestion, high-yield scoring
- `docs/decisions/model-selection.md` — MCQ explanation generation (Flash-Lite batch)
- `docs/4_DESIGN_SYSTEM.md` — design tokens, card component patterns
- `docs/roadmap-day-by-day.md` — Phase 3 scope
- Skills consulted: `nextjs-app-router-patterns`, `react-patterns`, `tailwind-design-system`
