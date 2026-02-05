# DowOS — Model Usage Guide

**Goal:** Maximize daily output within Claude Code Pro + Cursor Pro limits. Use the right model for each task so you work efficiently and preserve capacity for complex work.

---

## 1. Quick Reference

| Task Type | Tool | Model | Why |
|-----------|------|-------|-----|
| Multi-file feature builds | Cursor Composer | Opus | Fewer bugs, better spec adherence |
| Small edits, single-file fixes | Cursor Chat | Sonnet | Fast, cheap, good enough |
| Architecture, decisions, review | Claude Code | Opus | Deep reasoning, consistency |
| Planning, session handoff | Claude Code | Sonnet | Speed, lower usage |
| Boilerplate, repetitive UI | Cursor Composer | Sonnet | Save Opus for hard parts |

---

## 2. Task-by-Task Recommendations

### 2.1 Use Opus (Cursor or Claude Code)

These tasks have high cost-of-error: mistakes cost 30+ minutes of debugging. Reserve Opus for them.

| Task | Reason |
|------|--------|
| **RAG pipeline** | Chunking, hybrid retrieval, re-ranking, pgvector setup — one wrong join breaks everything |
| **Viva Bot** | 5-state machine (GREET → ASK → EVALUATE → FOLLOWUP → SCORE), voice flow, scoring logic |
| **RLS policies** | Supabase migrations, auth rules — security bugs are silent until exploited |
| **AI Tutor** | Memory, rate limits, fallback routing, complexity classifier |
| **Maps** | MapLibre setup, PMTiles, GeoJSON overlays, bus route rendering |
| **Admin flows** | Dow ID approval, content upload validation, duplicate detection |
| **Any task touching 5+ files** | Consistency across components — Sonnet forgets `logApiCall()` or `dark:` classes |
| **Embedding pipeline** | Chunk boundaries, metadata filtering, parent-document indexing |

### 2.2 Use Sonnet

These tasks are lower risk. Sonnet is faster and cheaper; mistakes are easy to fix.

| Task | Reason |
|------|--------|
| **Single-component builds** | BottomNav, cards, forms — when spec is clear and self-contained |
| **Copy-paste heavy UI** | List views, tables, repetitive layouts |
| **Build error fixes** | Paste exact error; Sonnet handles most TypeScript/Next.js fixes |
| **Session docs, handoffs** | Planning, summaries, `docs/sessions/` updates |
| **Quick questions** | "What does this hook do?", "Where is X defined?" |
| **Dark mode class fixes** | Adding `dark:` variants — mechanical, low reasoning |
| **Route stub pages** | Empty page shells with skeleton layout |

### 2.3 Use Sonnet to Stretch Limits

When Opus capacity is low, these *can* be done with Sonnet — but expect 1–2 fix cycles.

| Task | Mitigation |
|------|------------|
| **Timetable week view** | Full spec in `ui-page-structure.md`; @-mention it |
| **Attendance check-in + runway** | Simple CRUD; verify RLS after |
| **Lost & Found** | Search + filters; no AI, no complex state |
| **Prayer Times page** | Client-side `adhan` calc; no backend |
| **Dashboard widgets** | Skeleton placeholders; wire data in second pass |
| **MCQ drill UI** | UI only; AI explanation is separate API route |
| **Profile page** | Form + photo upload; patterns in `profile-card-ux.md` |

---

## 3. Daily Workflow to Maximize Output

### Morning (Opus-heavy)

1. **Cursor Opus** — 2–3 complex features (RAG, Viva Bot, migrations)
2. Run `npm run build` after each feature
3. Fix any errors in same Composer session

### Midday (Sonnet)

4. **Cursor Sonnet** — 2–3 simpler components (cards, forms, list views)
5. **Cursor Sonnet** — Build error fixes from morning session
6. Stub remaining nav links if needed

### Afternoon (Claude Code)

7. **Claude Code Opus** — Code review, decision-doc alignment check
8. **Claude Code Opus** — Architecture questions, RLS audit if needed

### Evening (capacity permitting)

9. **Claude Code Sonnet** — Session handoff, `docs/sessions/` update
10. **Cursor Sonnet** — Polish, small fixes, dark mode verification

**Rule:** Reserve Opus for tasks where a mistake costs 30+ min of debugging. Use Sonnet for everything else.

---

## 4. Prompt Efficiency Tips

### 4.1 Always @-mention

- **Decision doc** — e.g. `@docs/decisions/education-tab.md`
- **Existing patterns** — `@src/components/ui/` `@src/lib/supabase.ts`
- **Types** — `@src/types/database.ts`

### 4.2 Tight prompts save prompts

Bad: "Build the MCQ solver"  
Good: "Build MCQ drill at `/education/mcq`. Spec: @docs/decisions/education-tab.md §5. Use `logApiCall()` after every Gemini call. Filter pills: All / Incorrects / Undone. 44px touch targets."

### 4.3 Batch related work

One prompt: "Build Lost & Found: post form (type, title, description, photo), browse list with search, 30-day archive. Migration: `lost_found_items`. RLS: students read all, insert own."

---

## 5. Capacity Limits (Reference)

| Tool | Limit | Reset |
|------|-------|-------|
| **Claude Code Pro** | ~15–25 Opus prompts / 5 hours | 5-hour cycle |
| **Cursor Pro** | ~$20/month frontier usage | Monthly |
| **Sustainable Cursor** | ~10–15 Opus requests/day | To last 20 working days |
| **Combined daily** | ~30–50 meaningful interactions | — |

---

## 6. MVP in 10–15 Days?

| Days | Feasibility | Conditions |
|------|-------------|------------|
| **10** | Aggressive | Cut scope (defer Prayers, simplify Admin), no blockers, perfect execution |
| **12–13** | Tight | Max output, content ready, minimal rework |
| **15** | Realistic | 3–4 features/day, 1–2 buffer days for integration/debug |

**Bottlenecks (prioritize Opus):** RAG (Day 17–19), Viva Bot (Day 24–27), Maps (Day 32–33).

---

## 7. When to Escalate Sonnet → Opus

Switch to Opus if:

- Sonnet's response is incomplete (cut off mid-file)
- Same error recurs after 2 fix cycles
- Logic is ambiguous — code works but you don't know why
- Cross-file refactor — changed a hook signature, 5+ components break
- Subtle TypeScript union/edge case Sonnet didn't catch

**In Cursor:** Type `@model=opus` at top of prompt, then re-describe the task.

**After fix:** Type `@model=sonnet` to return to fast mode.
