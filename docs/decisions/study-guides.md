# Decision: Study Guides & Resource Hub

**Date:** 2026-02-06 | **Status:** LOCKED | **Owner:** Product decision (Session 10)

---

## 1. What this feature is

A curated study guides section inside the Education tab. Three types of content:

| Type | Example | Who creates | Scope |
|---|---|---|---|
| **Module guides** | "How to study Cardiovascular — Year 1" | Azfar + team (curated) | Year-specific per module |
| **General guides** | "Viva preparation tips", "Prof exam strategy" | Azfar + team (curated) | Shared across all years |
| **Resource Hub** | Best textbooks, YouTube channels, apps, websites | Azfar + team (curated) | Per-module |

All content is **curated by the team** (Azfar writes, admin reviews). Not AI-generated, not community-sourced. This ensures quality and accuracy — medical study advice must be vetted.

---

## 2. Why curated, not AI-generated

- Medical study strategies are opinionated and experience-based. "Use Guyton for Physiology" is senior wisdom, not something an LLM should decide.
- Students trust advice from people who passed the same exams at the same college. Curated guides carry the implicit endorsement: "this worked for Dow seniors."
- AI-generated content can be added later as a supplement (e.g., "AI suggests reviewing Chapter 5 based on your weak topics"), but the base guides should be human-written.
- Content volume is manageable: ~30 modules × 1 guide each + ~10 general guides + ~30 resource pages = ~70 pages. Azfar can produce this over 4–6 weeks.

---

## 3. Module guides — year-specific

Each module that a year studies gets its own guide. Year 1 Cardiovascular is different from Year 3 Cardiovascular because the depth, textbooks, and exam format differ.

### 3.1 Structure of a module guide

```
┌─────────────────────────────────────────┐
│  📖 How to Study: Cardiovascular (Y1)   │
│  By Azfar · Updated Feb 2026            │
├─────────────────────────────────────────┤
│                                         │
│  ── Overview ──                         │
│  What this module covers in Y1.         │
│  Duration: 6 weeks. Exam weight: ~15 %  │
│  of annual marks.                       │
│                                         │
│  ── Study Order ──                      │
│  1. Start with Anatomy (heart chambers, │
│     coronary circulation)               │
│  2. Then Physiology (cardiac cycle,     │
│     conduction system)                  │
│  3. Then Pathology (ischemic heart      │
│     disease, valvular disorders)        │
│  4. Pharma last (antiarrhythmics,       │
│     antihypertensives)                  │
│                                         │
│  ── Recommended Resources ──            │
│  📚 Anatomy: Snell Ch. 3–5             │
│  📚 Physiology: Guyton Ch. 9–13        │
│  📚 Pathology: Robbins Ch. 12          │
│  🎥 YouTube: Ninja Nerd Cardiovascular  │
│     playlist (32 videos)                │
│  📱 App: Complete Anatomy (3D heart)    │
│                                         │
│  ── Past Paper Patterns ──              │
│  "Coronary circulation is asked every   │
│  year. Heart sounds come up in viva     │
│  90 % of the time."                     │
│                                         │
│  ── Tips from Seniors ──                │
│  "Don't skip the embryology — it's 2    │
│  easy marks in the MCQ paper."          │
│  "Draw the cardiac cycle diagram until  │
│  you can do it from memory."            │
│                                         │
│  ── Related in DowOS ──                 │
│  [Drill Cardiovascular MCQs →]          │
│  [Practice Cardiovascular Viva →]       │
│  [View Study Tracker →]                 │
└─────────────────────────────────────────┘
```

### 3.2 Sections (standardized across all module guides)

| Section | Required? | Content |
|---|---|---|
| **Overview** | Yes | What the module covers at this year's level. Duration. Exam weight. |
| **Study Order** | Yes | Recommended sequence of subjects within the module. Numbered list. |
| **Recommended Resources** | Yes | Textbooks (with chapter numbers), YouTube playlists/channels, apps, websites. Per-subject within the module. |
| **Past Paper Patterns** | Yes | Which topics come up frequently. Viva favourites. MCQ patterns. |
| **Tips from Seniors** | Optional | Practical advice. Mnemonics. Common mistakes. |
| **Related in DowOS** | Yes (auto-generated) | Deep links to MCQ drill, Viva Bot, Study Tracker for this module. |

---

## 4. General guides — shared across years

General guides are not tied to a specific module. They cover study skills, exam strategy, and medical school survival.

### 4.1 Initial set (Azfar to write)

| Guide | Topic |
|---|---|
| How to study Anatomy effectively | Dissection tips, atlas usage, 3D apps, drawing practice |
| How to study Physiology effectively | Graph interpretation, clinical correlations, Guyton vs Ganong |
| How to study Pathology effectively | Robbins approach, pathoma, case-based learning |
| How to study Pharmacology effectively | Drug tables, mechanism grouping, mnemonics |
| Viva preparation masterclass | Body language, answering technique, common examiner tricks |
| Prof exam strategy | Time allocation, paper structure, how to pass vs how to score |
| MCQ strategy | Elimination technique, time management, guessing strategy |
| Time management for medicos | Weekly schedule template, Pomodoro for medical students |
| How to use DowOS for studying | Feature walkthrough — Study Tracker, MCQ Solver, Viva Bot, AI Tutor |
| First year survival guide | What to expect, common mistakes, how to balance |

### 4.2 Structure

Same markdown format as module guides, but without the "Study Order" and "Past Paper Patterns" sections. Replaced with:
- **Key Principles** — the 3–5 most important ideas
- **Common Mistakes** — what students typically get wrong
- **Action Items** — concrete steps the student can take today

---

## 5. Resource Hub — per-module

A dedicated page listing all recommended resources, organized by module.

### 5.1 Structure

```
┌─────────────────────────────────────────┐
│  📚 Resource Hub                        │
│  Find the best resources for your       │
│  modules.                               │
├─────────────────────────────────────────┤
│                                         │
│  Filter: [All Modules ▼]  [Year 1 ▼]   │
│                                         │
│  ── Cardiovascular ──                   │
│                                         │
│  📚 Textbooks                           │
│  • Snell's Clinical Anatomy (Ch. 3–5)   │
│  • Guyton Physiology (Ch. 9–13)         │
│  • Robbins Pathology (Ch. 12)           │
│  • Lippincott Pharmacology (Ch. 15–17)  │
│                                         │
│  🎥 YouTube                             │
│  • Ninja Nerd – Cardiovascular (32 vid) │
│  • Osmosis – Heart (18 vid)             │
│  • Dr. Najeeb – Cardiac Physiology      │
│                                         │
│  📱 Apps                                │
│  • Complete Anatomy (3D heart model)    │
│  • Anki – Pre-made Cardiovascular deck  │
│                                         │
│  🌐 Websites                            │
│  • TeachMeAnatomy – Thorax section      │
│  • Pathoma.com – Chapter 12             │
│                                         │
│  ── Respiratory ──                      │
│  …                                      │
└─────────────────────────────────────────┘
```

### 5.2 Resource categories

| Category | Icon | Examples |
|---|---|---|
| Textbooks | 📚 | Book name + specific chapter numbers |
| YouTube | 🎥 | Channel/playlist name + video count |
| Apps | 📱 | App name + what it's useful for |
| Websites | 🌐 | Site name + specific section |
| Past Papers | 📋 | Link to past paper PDFs (if uploaded) |

### 5.3 Per-module, not per-subject

Resources are organized per module (Cardiovascular, Respiratory, etc.), not per subject (Anatomy, Physiology). This is because:
- Students think in modules when studying ("I'm studying Cardio this week")
- Textbook chapter recommendations are module-specific (Guyton Ch. 9–13 for Cardiovascular Physiology, not Guyton for all of Physiology)
- YouTube playlists are typically module-organized
- Keeps the page focused — one module = one section, everything you need in one place

Within each module section, resources are **grouped by type** (textbooks, YouTube, apps, websites), not by subject.

---

## 6. Education tab integration

Study Guides adds a new card to the Education landing page (Phase 2 slot, below existing Phase 1 cards):

```
│  ┌─────────────────────────────┐    │
│  │  📖  Study Guides           │    │
│  │  Curated guides & resources │    │
│  │  [Browse Guides →]          │    │
│  └─────────────────────────────┘    │
```

No badge needed (unlike Flashcards with "due today" count). Guides are static content — no urgency signal.

---

## 7. Route structure

```
src/app/(app)/education/
├── guides/
│   ├── page.tsx                 ← Study Guides landing (module guides + general guides tabs)
│   ├── module/
│   │   └── [guide_id]/
│   │       └── page.tsx         ← Individual module guide
│   ├── general/
│   │   └── [guide_id]/
│   │       └── page.tsx         ← Individual general guide
│   └── resources/
│       └── page.tsx             ← Resource Hub (all modules, filterable)
```

### 7.1 Landing page layout

Two tabs on the guides landing page:
1. **Module Guides** (default) — grid of cards, one per module, filtered by student's current year. Badge shows subject count (e.g., "4 subjects covered").
2. **General Guides** — list of general guide cards.

Below both tabs: a prominent "Resource Hub →" link.

---

## 8. Database

New table: `study_guides`

```sql
CREATE TABLE study_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  guide_type TEXT NOT NULL CHECK (guide_type IN ('module', 'general')),
  year_id UUID REFERENCES years(id),          -- NULL for general guides
  module_id UUID REFERENCES modules(id),      -- NULL for general guides
  content TEXT NOT NULL,                       -- Markdown body
  author TEXT NOT NULL DEFAULT 'DowOS Team',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

New table: `study_resources`

```sql
CREATE TABLE study_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('textbook', 'youtube', 'app', 'website', 'past_paper')),
  title TEXT NOT NULL,
  description TEXT,                            -- e.g., "Chapters 9–13"
  url TEXT,                                    -- external link (optional)
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

RLS: All students can read published guides and all resources. Only admins can write.

---

## 9. Content pipeline

1. Azfar writes guides in markdown (Google Doc or directly in admin dashboard)
2. Admin uploads via `/admin/guides` page — markdown editor with preview
3. Admin toggles `is_published` → guide goes live
4. Resources are added separately via `/admin/resources` — simple form (module, type, title, description, URL)
5. Guides can be updated without versioning (just edit + save). `updated_at` timestamp shown to students.

---

## 10. Free vs Pro

**All Study Guides and Resource Hub content is free for all users.** No Pro gate.

Rationale:
- Study guides are a discovery and retention tool. They bring students into the app daily.
- Gating study advice behind a paywall would feel hostile for a campus app.
- The guides contain deep links to Pro features (Viva Bot, AI Study Plan, Voice mode) — they're a natural conversion funnel without being gated themselves.

---

## 11. Build placement

Study Guides is a **Phase 2 Education feature**, built after Flashcards and Quick Summaries (Phase 12 in the todo). Estimated: Week 9 post-launch.

| Day | Work |
|---|---|
| W9-D1 | Write Supabase migrations. Build admin guide editor + resource manager. |
| W9-D2 | Build guides landing page (module + general tabs). Build individual guide page (markdown renderer). |
| W9-D3 | Build Resource Hub page. Wire deep links (MCQ drill, Viva Bot, Study Tracker). |
| W9-D4 | Azfar seeds first 5 module guides + 3 general guides + resources for 10 modules. |

**Content dependency:** Azfar needs 2–3 weeks to write the initial set of guides. Start writing at full launch (Mar 28) → ready by mid-April → feature ships Week 9.

---

## 12. Sources

- Product discussion, Session 10
- `docs/decisions/education-tab.md` — Phase 2 card slots
- `docs/03_COMPLETE_PRD.md` — Education feature list
