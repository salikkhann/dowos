# Decision: Study Tracker (formerly Progress Matrix)

**Date:** 2026-02-06 | **Status:** LOCKED | **Owner:** Product decision (Session 10)

---

## 1. What changed

"Progress Matrix" is renamed to **Study Tracker**. The feature is expanded from a pure auto-calculated mastery heatmap to a **combined** experience: manual subtopic checklist + auto-calculated scores from MCQ/Viva/Flashcard activity.

The rename reflects what Dow students actually want: a tracker for their study coverage, not a data dashboard. "Study Tracker" is direct and action-oriented.

---

## 2. Origin — Salik's batch tracker

Salik built a custom app/website tracker for his batch (Batch 1) with the full module → subject → subtopic hierarchy. Students tick off subtopics as they study them before exams. This is already proven behaviour — students want to know "have I covered everything?" as much as "how well did I score on practice questions?"

The existing tracker validates two things:
1. Manual tick-off is a real workflow students use.
2. Subtopic-level granularity is the right depth — not too broad (subject level) and not too fine (individual concepts).

DowOS Study Tracker replaces this external tool and adds auto-scoring from in-app activity.

---

## 3. Combined UX — manual checklist + auto scores

### 3.1 The two signals

| Signal | Source | Weight in mastery % | Student action |
|---|---|---|---|
| **Manual tick** | Student marks subtopic as "covered" | Not weighted in mastery % — shown as coverage % separately | Tap checkbox |
| **MCQ accuracy** | `mcq_attempts` table — correct/incorrect per subtopic | 50 % of mastery score | Automatic from drilling |
| **Viva Bot performance** | `viva_bot_responses` table — per-subject scores | 30 % of mastery score | Automatic from Viva sessions |
| **Spaced repetition** | `flashcard_reviews` table — % of due cards reviewed on time | 20 % of mastery score | Automatic from flashcard reviews |

**Key distinction:** Coverage (manual ticks) and Mastery (auto scores) are shown **side by side**, not merged into one number. A student who has "covered" 100% of subtopics but scored 40% on MCQs needs to see both signals — they studied everything but didn't retain it.

### 3.2 Two metrics per cell

Every cell in the heatmap shows:
- **Coverage %** — what fraction of subtopics within that subject the student has manually ticked off
- **Mastery %** — auto-calculated from MCQ + Viva + Flashcard data (the existing formula)

```
┌──────────────────────────────────────────────────────────────┐
│  Study Tracker                                               │
│  Cardiovascular                          Readiness: 62 %     │
├──────────────────────────────────────────────────────────────┤
│              Anatomy    Physiology    Pathology    Pharma     │
│  Coverage    ████░░     ██████░░      ███░░░░░    ░░░░░░░    │
│              75 %       85 %          40 %        0 %        │
│  Mastery     🟨 58 %    🟩 74 %       🟥 32 %     ⬜ —       │
│  Attempts    31         28            12          0          │
└──────────────────────────────────────────────────────────────┘
```

### 3.3 Subtopic checklist (drill-down view)

Tapping any cell opens the subtopic checklist for that module + subject combination:

```
┌─────────────────────────────────────────┐
│  ← back    Cardiovascular > Anatomy     │
│  Coverage: 9/12 subtopics (75 %)        │
│  Mastery: 58 % (31 attempts)            │
├─────────────────────────────────────────┤
│                                         │
│  [✓]  Heart chambers & valves           │  ← ticked = student covered this
│        MCQ: 85 % (7/8)  🟩              │  ← auto score from MCQ attempts
│                                         │
│  [✓]  Coronary circulation              │
│        MCQ: 62 % (5/8)  🟨              │
│        Viva: 38/50  🟨                  │
│                                         │
│  [ ]  Aortic arch & branches            │  ← not ticked yet
│        MCQ: 25 % (1/4)  🟥              │
│        [Drill this topic →]             │  ← CTA to MCQ drill
│                                         │
│  [ ]  Venous drainage of the heart      │
│        No attempts yet  ⬜               │
│        [Start drilling →]               │
│                                         │
│  …                                      │
└─────────────────────────────────────────┘
```

Each subtopic row shows:
- **Checkbox** — manual tick (persisted to `student_topic_coverage` table)
- **Auto scores** — MCQ accuracy, Viva score (if attempted), Flashcard retention (if cards exist)
- **CTA** — "Drill this topic →" navigates to MCQ drill filtered to that subtopic
- Subtopics with low mastery + not ticked get a subtle highlight (nudge to study)

### 3.4 Batch-level aggregate view

A separate tab or toggle on the Study Tracker page: **"My Batch"**.

Shows anonymized aggregate stats for the student's batch:
- Per module: "X % of your batch has covered this module" (based on average coverage %)
- Per subject: bar chart showing batch distribution (e.g., "73 % of Batch 1 has covered Coronary Circulation")
- Student's own position shown as a marker on the distribution (anonymous to others)

**Privacy rules:**
- Individual student data is never exposed
- Only aggregate percentages shown (min 5 students per bucket to prevent identification)
- Students cannot see who has or hasn't covered what
- Batch aggregate only visible to students in that batch

### 3.5 Auto-tick suggestions

When a student completes enough activity on a subtopic (e.g., ≥ 5 MCQ attempts with ≥ 60 % accuracy), show a gentle suggestion: "You've practised Heart Chambers & Valves. Mark it as covered?" with a one-tap confirm. This bridges the gap between passive practice and active coverage tracking.

---

## 4. Heatmap colour coding

| Colour | Label | Mastery range |
|---|---|---|
| 🟩 Green | Strong | ≥ 70 % |
| 🟨 Amber | Progressing | 40–69 % |
| 🟥 Red | Needs Work | < 40 % |
| ⬜ Grey | Not Attempted | 0 attempts |

Coverage % uses a separate progress bar (not colour-coded — it's binary per subtopic).

---

## 5. Top-level cards (unchanged from previous spec)

These remain on the Study Tracker page:
- **Top 3 Weak Topics** — subjects with most attempts + lowest accuracy. Tap → MCQ drill.
- **Exam Readiness score** per module — `(% subjects attempted) × (avg accuracy)`.
- **AI Study Plan** (Pro-gated) — Gemini reads heatmap + coverage data → weekly plan.
- **Annual Exam Planner mode** — activates during prof break. Coverage % per module, recommended study order.

---

## 6. Batch aggregate computation

The batch aggregate view computes:
- **Batch coverage %** = average of all students' coverage % per module/subject (students with 0 progress excluded from average)
- **Batch mastery %** = average of all students' mastery % per module/subject
- Minimum 5 students must have data for a cell to show aggregate (prevents identification)
- Computed server-side on page load (cached 1 hour)

---

## 7. Database additions

New table: `student_topic_coverage`

```sql
CREATE TABLE student_topic_coverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  subtopic_id UUID NOT NULL REFERENCES subtopics(id),
  is_covered BOOLEAN NOT NULL DEFAULT false,
  covered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, subtopic_id)
);
```

RLS: Students can read/write only their own rows. Admins can read all (for batch aggregates).

The existing `progress_matrix` table (or views) will compute mastery % from `mcq_attempts` + `viva_bot_responses` + `flashcard_reviews`.

---

## 8. Route structure

```
src/app/(app)/education/
├── progress/                    ← RENAMED from "progress" display name to "Study Tracker"
│   ├── page.tsx                 ← Study Tracker main page (heatmap + cards)
│   ├── [module_id]/
│   │   └── [subject_id]/
│   │       └── page.tsx         ← Subtopic checklist drill-down
│   └── batch/
│       └── page.tsx             ← Batch aggregate view
```

The URL stays `/education/progress` (no need to change routes for a display name change). The page title, nav label, and Education landing card all read "Study Tracker".

---

## 9. Migration from Salik's existing tracker

Since Salik already has a custom tracker with the full hierarchy, the data can be imported:
1. Export the module → subject → subtopic hierarchy
2. Verify against the `years`, `modules`, `subjects`, `subtopics` tables already in Supabase
3. Fill any gaps in the `subtopics` table (currently empty — needs seeding)
4. Students who used the external tracker cannot import their ticks (fresh start in DowOS)

---

## 10. Build placement

| Day | Work |
|---|---|
| 29 | Build Study Tracker heatmap (coverage % + mastery % per cell), colour legend, attempt badges |
| 29 | Build subtopic checklist drill-down (manual ticks + auto scores per subtopic) |
| 30 | Build batch aggregate view, Top 3 Weak Topics, Exam Readiness scores, AI Study Plan card |
| 30 | Wire auto-tick suggestions, seed `subtopics` table from Salik's tracker data |

---

## 11. Sources

- Salik's batch tracker (custom app — existing validated workflow)
- `docs/decisions/education-tab.md` §6 — original Progress Matrix spec
- `docs/03_COMPLETE_PRD.md` §8 — mastery calculation formula
- Product discussion, Session 10
