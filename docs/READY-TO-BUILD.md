# 🚀 READY TO BUILD — Session 7 Complete

**Date:** 2026-02-06 | **Status:** ✅ PHASE 2 GO-LIVE READY | **Commit:** `85d72f6` (pushed to origin/main)

---

## What's Done

### Phase 1 Complete ✅
- ✅ All 17 architecture decisions locked
- ✅ All decision docs written + committed
- ✅ All conflicts resolved
- ✅ All stale docs reconciled
- ✅ Windsurf handoff docs ready
- ✅ Auth + onboarding feature shipped + tested

### Phase 2 Planning Complete ✅
- ✅ Tech stack audited layer-by-layer (verdict: **proceed**)
- ✅ Cost model validated (~$95–130/mo at 500 DAU, sustainable)
- ✅ Model strategy defined (Sonnet 90%, Opus 10%)
- ✅ Cursor Pro workflow operationalized (Composer primary, pre-session prep, context injection)
- ✅ Day-10 build sprint fully outlined + copy-paste prompts ready
- ✅ Daily workflow optimized (morning Opus, midday Sonnet, afternoon review)
- ✅ Capacity limits calculated (~30–50 interactions/day)
- ✅ Escalation paths documented (when to Opus, when to hand off to Claude Code)

### New Docs Created ✅

| Doc | Purpose | Status |
|-----|---------|--------|
| `docs/tech-stack-audit.md` | Layer-by-layer audit of 12 stack decisions | ✅ Committed |
| `docs/model-usage-guide.md` | Task-by-task model picks + daily workflow | ✅ Committed |
| `docs/cursor-pro-strategy.md` | Deep Cursor Pro guide (Composer, templates, tips) | ✅ Committed |
| `docs/cursor-guide.md` | UPDATED with Feb 2026 Cursor Pro features | ✅ Committed |
| `docs/DAY-10-CURSOR-STARTER.md` | Copy-paste Day 10 prompts + file tags | ✅ Committed |
| `docs/sessions/2026-02-06-session-7.md` | Session 7 comprehensive log | ✅ Committed |

---

## How to Start Phase 2 (Tomorrow or Now)

### Step 1: Open Cursor Pro (5 minutes)

```
1. Launch Cursor Pro
2. File → Open Folder → E:\dowos
3. Ctrl+Shift+I (open Composer)
4. Select Claude Sonnet 4.5 (top-right)
```

### Step 2: Prep for Day 10 (10 minutes)

Read these two docs in this order:
1. `docs/decisions/mobile-web-ui.md` (nav structure + wireframe)
2. `docs/decisions/ui-page-structure.md` (dashboard layout)

### Step 3: First Composer Build (65 minutes total)

Open `docs/DAY-10-CURSOR-STARTER.md` and follow the 5 tasks:
1. **BottomNav** (~15 min)
2. **Sidebar** (~15 min)
3. **NavShell** (~12 min)
4. **Layout wiring** (~7 min)
5. **Dashboard skeleton** (~20 min)

Expected: 0 errors, all components rendered, responsive layout working.

---

## Complete Cursor Pro Reference

**Three documents work together:**

1. **`docs/cursor-guide.md`** — What Cursor Pro is, modes, shortcuts, common mistakes
2. **`docs/cursor-pro-strategy.md`** — HOW to use Cursor (Composer workflow, context injection, prompt templates)
3. **`docs/DAY-10-CURSOR-STARTER.md`** — START HERE (copy-paste prompts + pre-session checklist)

**Read in this order:**
1. `cursor-guide.md` §1-3 (setup, modes, context)
2. `cursor-pro-strategy.md` §1-7 (models, workflow, prompts)
3. `DAY-10-CURSOR-STARTER.md` (copy prompts, build)

---

## Model Strategy Reference

**Keep this nearby:**

```
90% of tasks: Claude Sonnet 4.5 (fast, cheap, good enough)
10% of tasks: Claude Opus 4.5 (RAG, Viva Bot, RLS, 5+ file refactors)

Daily quota: ~30–50 total Cursor + Claude Code interactions
Sustainable with rationing: spread ~10–15 Opus/day

When to escalate Sonnet → Opus:
- Response cut off mid-file
- Same error after 2 fix cycles
- Logic is ambiguous (code works, you don't know why)
- 5+ file refactor (consistency across components)
- Subtle TypeScript edge case

In Cursor: type @model=opus at start of prompt to switch
After fix: type @model=sonnet to return to fast mode
```

---

## Critical Files & Paths

```
Core:
├── .cursorrules                 (design tokens, nav config, NEVER rules)
├── .env.local                   (Supabase keys, keep gitignored)
└── src/
    ├── app/
    │   ├── (app)/               (auth-protected routes)
    │   │   ├── layout.tsx       (NavShell wrapper)
    │   │   ├── dashboard/page.tsx
    │   │   ├── ai/
    │   │   ├── education/
    │   │   ├── campus/
    │   │   └── maps/
    │   └── (auth)/              (login/signup)
    ├── components/
    │   ├── nav/                 (BottomNav, Sidebar, NavShell)
    │   └── ui/                  (shadcn primitives)
    ├── types/database.ts        (TypeScript shapes)
    └── lib/
        ├── supabase.ts          (client + server)
        └── api-logger.ts        (cost tracking)

Decision docs (read when building features):
├── docs/decisions/
│   ├── mobile-web-ui.md         (nav structure, responsive)
│   ├── ui-page-structure.md     (dashboard, all pages)
│   ├── rag-architecture.md      (AI tutor, memory, routing)
│   ├── viva-bot-orchestration.md
│   ├── maps-platform.md
│   ├── education-tab.md
│   └── [6 more...]

Strategy docs (read before building):
├── docs/CLAUDE.md               (project rules, tech stack, conventions)
├── docs/windsurf-rules.md       (always-on for code gen)
├── docs/cursor-pro-strategy.md  (Cursor workflow)
├── docs/model-usage-guide.md    (task-by-task model picks)
└── docs/DAY-10-CURSOR-STARTER.md (copy-paste Day 10 prompts)
```

---

## Daily Workflow (Optimized)

### Morning (Opus-heavy) — 2–3 hours
1. Cursor Opus: 1–2 complex features (RAG pipeline, Viva Bot, migrations)
2. `npm run build` after each
3. Fix errors in same Composer session

### Midday (Sonnet) — 2 hours
4. Cursor Sonnet: 2–3 simpler components (forms, cards, list views)
5. Cursor Sonnet: Polish, dark mode verification
6. Stub remaining nav links if needed

### Afternoon (Claude Code) — 1–2 hours
7. Claude Code Opus: Code review, decision-doc alignment check
8. Claude Code Opus: Architecture questions, RLS audit if needed

### Evening (capacity permitting) — 1 hour
9. Claude Code Sonnet: Session log, `docs/sessions/` update
10. Cursor Sonnet: Final tweaks, small fixes

**Rule:** Reserve Opus for tasks where a mistake costs 30+ min of debugging. Use Sonnet for everything else.

---

## Pre-Build Checklist (Do This Before Each Day)

```
Day 10:
☐ Decision docs read: mobile-web-ui.md, ui-page-structure.md
☐ Files Cursor will touch: BottomNav, Sidebar, NavShell, layout, dashboard page
☐ .cursorrules exists at repo root
☐ .env.local has real Supabase keys
☐ Cursor Pro open, Sonnet selected

Day 12 (Timetable):
☐ Decision docs read: ui-page-structure.md, (any timetable-specific?)
☐ Check existing patterns: @src/components/ui/, @src/hooks/
☐ Files to touch: page, migration, server component
☐ @-mention tags prepared
☐ Composer open, ready

[Repeat for Days 13, 14, 15, 16...]
```

---

## Cost Tracking Reminder

Every time your code calls Gemini, Groq, or Google TTS:
```typescript
import { logApiCall } from "@/lib/api-logger"

// After your API call:
logApiCall("gemini", "mcq-solver", cost, tokens)
logApiCall("groq", "viva-bot-stt", cost, tokens)
```

This is **convention #16 in `.cursorrules`**. Cursor may forget it — you verify.

---

## Escalation Paths

| Issue | Tool | Action |
|-------|------|--------|
| Multi-file feature build | Cursor Composer | Sonnet, @-mention 3 layers |
| Build error TypeScript | Cursor Chat/Composer | Paste exact error, Sonnet |
| Sonnet gets stuck after 2 cycles | Cursor Composer | Switch `@model=opus` |
| Code doesn't match decision doc | Claude Code | Review + point out mismatch |
| Cross-file logic bug (5+ files affected) | Claude Code Opus | Trace the ripple |
| Architecture question mid-build | Claude Code Opus | "Should we..." → continue building |
| Session handoff + next planning | Claude Code Sonnet | Log + outline tomorrow |

---

## Shortcuts (Windows)

```
Ctrl+Shift+I       Open Composer (PRIMARY — use this 90% of the time)
Ctrl+K             Open inline Chat
Ctrl+P             Quick-open file
Ctrl+Shift+P       Command palette
Ctrl+`             Toggle terminal
Tab                Accept suggestion
Esc                Dismiss
Ctrl+Z             Undo (works in diffs)
```

---

## Success Metrics (Day 10)

After Day 10 NavShell build:

- [ ] BottomNav renders on mobile (375px)
- [ ] Sidebar renders on desktop (1024px+)
- [ ] Active route highlighted in Teal
- [ ] Dark mode works (toggle in sidebar)
- [ ] 44px touch targets verified (tap on items, they're clickable)
- [ ] Dashboard shows greeting + 6 skeleton widgets
- [ ] No TypeScript errors on `npm run build`
- [ ] Responsive layout tested at 375px, 768px, 1024px
- [ ] All navigation links work (tap = route change)

---

## Remaining Timeline (Phase 2)

| Days | Feature | Status |
|------|---------|--------|
| 10 | NavShell + Dashboard skeleton | 🎯 TODAY |
| 11 | Profile page + photo upload | Sonnet |
| 12 | Admin dashboard (Dow ID queue) | Opus |
| 12–13 | Timetable week view | Sonnet |
| 13–14 | Attendance + mark present/absent | Sonnet |
| 14–15 | Announcements + Prayer Times | Sonnet |
| 15–16 | Polish, dark mode, integration | Sonnet |
| **17–23** | **Phase 3: AI Tutor + RAG** | Opus (next sprint) |

---

## Last-Minute Tips

1. **Always @-mention** the decision doc. Cursor will invent architecture without it.
2. **Review file-by-file** before accepting all at once. One bad file ruins the build.
3. **Run `npm run build` after every task.** Catch errors early, not at the end.
4. **Paste exact error messages.** Paraphrasing hurts fix quality.
5. **Restart Composer if it goes off-track.** Fresh context > steering mid-conversation.
6. **Tag generously.** Extra context is cheap. Invented patterns are expensive.
7. **Save Opus for hard parts.** Sonnet is fast and cheap — use it first.
8. **Hand off to Claude Code** for review at day-end. Catch architectural drift early.

---

## You Are Ready

- ✅ Phase 1 complete
- ✅ Phase 2 fully planned
- ✅ Tech stack audited + validated
- ✅ Model strategy optimized
- ✅ Cursor Pro workflow documented
- ✅ Day-10 prompts copy-paste ready
- ✅ All decisions locked (zero ambiguity)

**Open Cursor Pro. Read `DAY-10-CURSOR-STARTER.md`. Build.**

---

## Questions?

Refer to:
- **How do I use Cursor?** → `docs/cursor-guide.md`
- **What's the workflow?** → `docs/cursor-pro-strategy.md`
- **What model should I use?** → `docs/model-usage-guide.md`
- **Is the stack right?** → `docs/tech-stack-audit.md`
- **What do I build first?** → `docs/DAY-10-CURSOR-STARTER.md`
- **What's the full project plan?** → `docs/roadmap-day-by-day.md`

---

**Happy building. 🚀**
