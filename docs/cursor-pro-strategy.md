# Cursor Pro Strategy — DowOS Phase 2 Build

**Goal:** Maximum deep output, zero ambiguity, highest code quality. Use Cursor's Agent (Composer) mode with strategic context injection.

> **Full Cursor Pro feature reference:** See `docs/cursor-guide.md` for models, subagents, skills, and all Cursor Pro capabilities (Feb 2026).

---

## 1. Model Selection & When to Use Each

Cursor Pro (Feb 2026) gives you: Composer 1, Claude Sonnet 4.5, Claude Opus 4.5, GPT-5.2, Gemini 3 Pro, Grok Code.

| Model | Speed | Code Quality | Best for |
|---|---|---|---|
| **Claude Sonnet 4.5** (default) | Fast | Excellent | 95% of tasks. Standard feature builds. |
| **Claude Opus 4.5** | Slower | Elite | RAG, Viva Bot, RLS, complex refactors. |
| **Composer 1** | ~4× faster | Good | Speed-critical simple tasks. |
| **GPT-5.2** | Fast | Good | Fallback if Claude fails on a task type. |

**DowOS recommendation:** Start with Sonnet. Escalate to Opus for RAG, Viva Bot, RLS, or when Sonnet cuts off or logic is shallow. See `docs/model-usage-guide.md` for task-by-task picks.

---

## 2. The Three Cursor Modes — When to Use Which

### ① Chat Mode (Ctrl+K)
**Best for:** Single-file edits, clarifications, small fixes.
- "Why does this TypeScript error happen?"
- "Fix the dark mode class on this button"
- "Add console.log to debug this function"

**Characteristic:** Inline diffs, quick accept/reject.

---

### ② Composer Mode (Ctrl+Shift+I) — **PRIMARY FOR DOWOS**
**Best for:** Multi-file feature builds. This is where you spend 90% of your time.
- "Build the BottomNav component with all 5 routes + dark mode"
- "Wire the MCQ drill flow with analytics + Save button"
- "Create the admin Dow ID approval queue with status badges"

**Characteristic:** Opens all files being edited, shows diffs for review, you accept en masse or file-by-file.

**Why Composer is best for DowOS:**
- Features in Phase 2–5 always touch 3–5 files (component + migrations + types + hooks)
- Composer sees all the files at once — it understands relationships
- You get one coherent diff review, not 5 separate Chat conversations
- Composer can run `npm run build` in the terminal within the same context

---

### ③ Search / Codebase Understanding (Ctrl+Shift+L)
**Best for:** Understanding existing patterns before you build.
- "Show me how the timetable component uses Supabase Realtime"
- "Find all places where we call `logApiCall()`"

**Characteristic:** Searches your repo, returns snippets with line numbers.

---

## 3. Context Injection Strategy — The `@` System

**Golden rule:** Every Composer prompt needs 3 layers of context:
1. **Decision doc** (`@docs/decisions/...`) — *what* to build and *why*
2. **Existing patterns** (`@src/components/ui/button.tsx`, `@src/hooks/...`) — *how* we build here
3. **Types/migrations** (`@src/types/database.ts`) — *what data* we work with

### Example: Building MCQ Solver

```
@docs/decisions/education-tab.md           ← WHAT: spec, wireframes, drill flow
@src/components/ui/                        ← HOW: existing card, button, input patterns
@src/hooks/useRagRetrieval.ts              ← HOW: RAG fetching pattern
@src/types/database.ts                     ← WHAT DATA: mcq_questions, mcq_attempts types
@src/lib/api-logger.ts                     ← HOW: cost tracking pattern
```

This gives Cursor:
- The full product spec (it reads it once, doesn't ask for clarifications)
- Proof that all dependencies exist and are already installed
- The exact TypeScript shapes it needs to use
- The pattern for logging API costs (critical for Gemini integration)

---

## 4. The Optimal Composer Workflow

### Step A: Pre-Composer Reading (You do this, NOT Cursor)
1. Open the **decision doc** for the feature (e.g., `docs/decisions/education-tab.md`)
2. Read the **wireframe + spec** thoroughly — understand the UX
3. Skim the **build timeline** — understand dependencies
4. Identify the **critical files it will touch** (components, migrations, types)

**Time:** 5–10 minutes. This prevents Cursor from inventing its own architecture.

---

### Step B: Open Composer (Ctrl+Shift+I)

### Step C: Inject Context
Paste (or type) the `@` references for:
- Decision doc
- Existing UI component library (`@src/components/ui/` folder)
- Relevant hooks / utilities
- Database types

### Step D: Write a Tight Prompt
See §5 for the prompt template.

### Step E: Watch Cursor Build
Sonnet writes code in real time. You see diffs accumulate.

### Step F: Review Every Diff
**Don't accept all at once.** For each file:
- ✅ Matches the decision doc spec?
- ✅ Uses existing patterns (dark: classes, @/ imports, shadcn components)?
- ✅ Has `logApiCall()` if it touches Gemini/Groq/TTS?
- ✅ Follows naming conventions (camelCase files, PascalCase components)?
- ✅ No new npm packages?

### Step G: Accept File-by-File
If one file looks off:
1. Click "Reject this file"
2. Re-prompt: "The X component should..." (be specific about what's wrong)
3. Cursor regenerates just that file
4. Accept the rest

### Step H: Build & Iterate
Run `npm run build` in the terminal. If errors:
1. Copy the **exact error output**
2. Paste it back into the same Composer
3. Say: "Fix this error" or "The TypeScript error is..."
4. Cursor fixes and shows the updated files
5. Accept and build again

---

## 5. Optimal Prompt Template

### The Structure
```
Build [WHAT] in [WHERE].

Context:
- Spec: @docs/decisions/[feature].md
- Patterns: @src/components/ui/ @src/hooks/
- Types: @src/types/database.ts

Technical requirements:
- [Specific tech constraint: "Use TanStack Query for data fetching"]
- [Dark mode: "Include dark: classes on all styled elements"]
- [Auth: "Server component — fetch user from session"]
- [Cost tracking: "Call logApiCall() after every Gemini API call"]

Details from spec:
- [Copy 2–3 bullet points from the decision doc that are critical]

Files to create/modify:
- [List 3–5 file paths Cursor should touch]

Do NOT:
- [List 2–3 things Cursor commonly gets wrong for THIS feature type]
```

### Real Example: Building BottomNav

```
Build <BottomNav /> in src/components/nav/BottomNav.tsx.

Context:
- Spec: @docs/decisions/mobile-web-ui.md §2 (nav config + wireframe)
- Nav config: @.cursorrules (lines 80–120, nav items array)
- Existing UI: @src/components/ui/ (button, icon patterns)

Technical requirements:
- Client component ("use client")
- Active route highlighted in Teal (#00A896)
- 5 fixed bottom-nav items: Dashboard, Education, AI Tutor, Campus, Maps
- Each item has icon (Lucide, 24px) + label
- 44px touch target minimum (height + padding)
- Safe-area bottom inset for iPhone notch (supports landscape)
- Dark mode: bg-offwhite light / dark:bg-dark-mode-bg
- Responsive: hidden on desktop (1024px+), shown on mobile

Build logic:
- Use Next.js usePathname() to detect active route
- Highlight the active item's icon + label in Teal
- Non-active items are Navy-300 (#A5B8D6)
- onClick navigates via useRouter

Do NOT:
- Use Tailwind's fixed positioning — use `fixed bottom-0 inset-x-0`
- Add new packages (Lucide is already installed)
- Forget the dark: color variants
```

---

## 6. Files to Prepare Before Each Build Session

Every session, **before you open Composer**, create a quick checklist:

```
Phase 2A (Day 10) — NavShell Prep

Decision docs:
☐ Read: docs/decisions/mobile-web-ui.md (nav structure)
☐ Read: docs/decisions/ui-page-structure.md (dashboard layout)

Existing patterns:
☐ Check: src/components/ui/ (what shadcn components exist?)
☐ Check: src/types/database.ts (User + UserPreferences shapes)
☐ Check: src/lib/supabase.ts (how we fetch current user)

Files Cursor will touch:
☐ src/components/nav/BottomNav.tsx (NEW)
☐ src/components/nav/Sidebar.tsx (NEW)
☐ src/components/nav/NavShell.tsx (NEW)
☐ src/app/(app)/layout.tsx (MODIFY — wire NavShell)
☐ src/lib/nav.ts (NEW — nav config)

Known gotchas:
⚠️  Dark mode classes on every element
⚠️  44px touch targets (height + padding)
⚠️  usePathname() only in client components
⚠️  Sidebar active highlight = Teal, not primary
```

This takes 10 minutes and **prevents 3 rounds of Composer back-and-forth.**

---

## 7. When to Use Opus Instead of Sonnet

**Stay on Sonnet 90% of the time.** Switch to Opus ONLY if:

1. **Sonnet's response is incomplete** — it cut off mid-response or didn't generate all the files
2. **The logic is ambiguous** — Sonnet generated code that works but you're not sure why
3. **Cross-file refactoring bug** — e.g., you changed `useRagRetrieval()` signature and now 7 components break — Opus is better at tracing the ripple effects
4. **Subtle TypeScript issue** — e.g., a union type edge case that Sonnet's quick-fix didn't catch

**How to escalate:**
1. In the same Composer, at the top, type: `@model=opus`
2. Then describe the issue
3. Opus regenerates with deeper reasoning

**After Opus fixes it,** type `@model=sonnet` to return to fast mode for the next chunk.

---

## 8. The Optimal Day-10 Session Plan

### Morning: NavShell + Dashboard Skeleton (3–4 hours)

```
1. Read decision docs (mobile-web-ui, ui-page-structure) — 15 min
2. Composer: Build BottomNav — 30 min (Sonnet)
   ✓ Review + accept
3. Composer: Build Sidebar — 30 min (Sonnet)
   ✓ Review + accept
4. Composer: Build NavShell (responsive wrapper) — 30 min (Sonnet)
   ✓ Review + accept
5. Composer: Wire NavShell into (app)/layout.tsx — 30 min (Sonnet)
   ✓ Fix any layout issues
6. npm run build — 60 sec
   ✓ Zero errors = ship
```

**Outputs:**
- BottomNav live on mobile
- Sidebar live on desktop (1024px+)
- Dark mode working
- No layout shifts
- Ready for dashboard content

### Afternoon: Dashboard Page + Profile Page (2–3 hours)

```
7. Composer: Build Dashboard skeleton — 45 min (Sonnet)
   - Time-aware greeting
   - 6 widget placeholders (skeletons)
8. Composer: Build Profile page with glassmorphic card — 45 min (Sonnet)
   - Upload self/avatar photo handler
   - Form for credits top-up, batch/module display
9. npm run build
10. Test locally: /dashboard, /profile — verify layout, dark mode
```

**Outputs:**
- Dashboard page structure complete
- Profile card ready for photo upload wiring (Day 11)
- Both pages responsive at 375px + desktop

---

## 9. Pro Tips for Maximum Output

### Tip 1: Use Composer's File List View
When Composer shows you the file diffs, click on the filename headers. You can jump between files, expand/collapse diffs, see just the changes. This speeds up review 2×.

### Tip 2: Keep Terminal Open
In the Cursor terminal, run `npm run build` as soon as you accept files. Errors surface immediately. Paste them back into Composer before you forget what you were building.

### Tip 3: Tag Generously
If there's a file you think Cursor *might* need to understand, `@`-mention it. Cursor's cheap on tokens — extra context is better than the alternative (Cursor inventing its own patterns).

### Tip 4: Restart Composer If It Goes Off-Track
If Cursor starts building something you didn't ask for (e.g., installs a package, creates a file in the wrong route group, forgets dark mode classes), **don't try to steer it mid-conversation.** Close Composer, start a fresh one with a tighter prompt. Fresh context = better focus.

### Tip 5: Copy-Paste Errors Exactly
When `npm run build` fails, copy the **full error text**—not a summary. Cursor fixes TypeScript errors much better with the exact compiler output.

### Tip 6: Review Diffs Before Accepting
This seems obvious, but it saves 2 hours: **scan every file's diff for:**
- ✅ `dark:` classes
- ✅ `@/` imports (not `../../../`)
- ✅ No new `npm install` commands
- ✅ Component names match the file path (PascalCase)

---

## 10. Day-by-Day Cursor Workplan — Phase 2

### Day 10: NavShell + Dashboard Foundation
Sonnet the whole day.

### Day 11: Admin Dashboard + Photo Upload
Sonnet for builds, Opus if you hit a subtle cross-file bug (unlikely).

### Day 12–14: Timetable + Attendance
Sonnet for component builds. Opus for complex Supabase RLS policies if they get tricky.

### Day 15–16: Refinement + Dark Mode Polish
Sonnet for tweaks.

**Estimated time per day:** 4–6 hours of active Composer time (rest is testing + review).

---

## 11. When to Hand Off to Claude Code

Use **Claude Code** (not Cursor) for:
- **End-of-session code review** — "Does this match the decision doc? Any security issues? Type safety?"
- **Cross-file logic bugs** — "This API call works but I'm not sure why. Trace the path."
- **Decision doc updates** — "The Progress Matrix spec is incomplete. Add these details."
- **Architecture changes mid-build** — "We need to change how we store viva session data. Impact analysis?"

Hand off with:
> "Salik here. Built NavShell + Dashboard in Cursor today. Can you review for:
> - Decision doc alignment (mobile-web-ui.md §2)
> - Dark mode coverage (all styled elements)
> - Supabase RLS patterns (server-side fetches)
> - Next steps clarity"

---

## 12. Keyboard Shortcuts Cheat Sheet

| Shortcut | What it does |
|---|---|
| **Ctrl+Shift+I** | **Open Composer** (use this ~60% of the time) |
| Ctrl+K | Open Chat (single-file edits) |
| Ctrl+P | Quick-open a file |
| Ctrl+Shift+P | Command palette |
| Ctrl+/ | Comment/uncomment selection |
| Ctrl+` | Toggle terminal |
| Tab | Accept suggestion |
| Esc | Dismiss suggestion |
| Ctrl+Z | Undo (works in diffs too) |
| Ctrl+Shift+L | Search codebase for patterns |

---

## Summary

**The formula for maximum deep output:**

1. **Read the decision doc first** (10 min)
2. **Tag 3–5 files with context** (@-mentions)
3. **Write a tight prompt** (see §5 template)
4. **Use Sonnet** (default)
5. **Review file-by-file** (don't accept blindly)
6. **Build after every major change** (`npm run build`)
7. **Escalate to Opus only when stuck**
8. **Hand off to Claude Code** for review + next planning

**This combo = fast iteration, zero architectural regressions, and code that ships clean.**
