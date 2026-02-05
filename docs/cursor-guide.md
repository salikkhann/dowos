# Cursor Pro — Complete Guide for DowOS

**Who this is for:** Salik. Cursor Pro as of February 2026. Practical, expert-level usage.

---

## 1. What Cursor Pro Gives You

### 1.1 Core Features

| Feature | What it does |
|---------|--------------|
| **Agent (Composer)** | Multi-file coding. Reads codebase, edits files, runs terminal. Primary for DowOS. |
| **Tab** | Inline autocomplete. Predicts next actions, multi-line edits. |
| **Chat (Ctrl+K)** | Scoped edits. Single-file changes, questions, quick fixes. |
| **Codebase search** | Semantic search. "Where are menu colours defined?" → greps + embeds. |
| **Rules** | `.cursorrules` + file-scoped rules. Always-on context. |
| **Skills** | Domain workflows. Invoke via `/skill-name`. Dynamic context. |
| **MCP** | Connect external tools (Supabase, databases, APIs). |
| **Subagents** | Parallel agents for discrete subtasks. Faster, focused context. |

### 1.2 Frontier Models (Pro)

| Model | Speed | Best for | DowOS use |
|-------|-------|----------|-----------|
| **Composer 1** | ~4× faster | Speed-critical work | Default for simple builds |
| **Claude Opus 4.5** | Slower | Complex refactors, subtle bugs | RAG, Viva Bot, RLS |
| **Claude Sonnet 4.5** | Fast | 95% of tasks | Standard feature builds |
| **GPT-5.2** | Fast | Bug fixing, UI generation | Fallback if Claude fails |
| **Gemini 3 Pro** | — | Extreme context, multimodal | Large-file analysis |
| **Grok Code** | — | xAI coding model | Alternative option |

**DowOS default:** Claude Sonnet 4.5. Escalate to Opus for RAG, Viva Bot, RLS, multi-file refactors. See `docs/model-usage-guide.md` for task-by-task picks.

### 1.3 Agent Modes

| Mode | When | How |
|------|------|-----|
| **Default (Agent)** | Build, edit, execute | Ctrl+Shift+I, type prompt |
| **Plan** | Design before coding | `/plan` or mode picker — asks clarifying questions first |
| **Ask** | Explore without editing | `/ask` — read-only, no file changes |
| **Debug** | Fix bugs, trace logic | Mode picker — focused on error diagnosis |

---

## 2. Setup (one-time)

1. Install Cursor from [cursor.com](https://cursor.com). Sign in with Pro account.
2. **File → Open Folder** → `E:\dowos`.
3. `.cursorrules` at project root is auto-read every turn — design tokens, nav config, conventions.
4. Optional: Enable MCP for Supabase (query schema without opening docs). See Cursor docs.
5. Done.

---

## 3. The Three Interfaces — When to Use Which

### 3.1 Chat (Ctrl+K) — Scoped, single-file

**Use for:**
- "What does this hook do?"
- "Fix this TypeScript error"
- "Add dark: class to this button"
- "Add input validation to this field"

**Behaviour:** Inline diff. Accept/reject. Fast. No multi-file context.

---

### 3.2 Agent / Composer (Ctrl+Shift+I) — PRIMARY FOR DOWOS

**Use for:** Anything touching 2+ files. 90% of your time.

- "Build the BottomNav component"
- "Wire the MCQ drill flow with analytics + Save button"
- "Create the admin Dow ID approval queue"
- "Add RAG retrieval to the AI Tutor"

**Behaviour:**
- Opens Agent panel
- Reads files, writes across multiple files
- Runs terminal (`npm run build`)
- Shows diffs for review before accept
- Can spawn **subagents** for parallel subtasks (research, terminal, parallel work)
- Can ask **clarification questions** while continuing to work

**Rule:** If you'd open more than one file manually → use Composer.

---

### 3.3 Search / Codebase (Ctrl+Shift+L)

**Use for:**
- "Show me how the timetable uses Supabase Realtime"
- "Find all places where we call `logApiCall()`"
- "Where are menu label colours defined?"

**Behaviour:** Semantic + grep search. Returns snippets with line numbers. Read-only.

---

## 4. Context — The @ System

Cursor doesn't infer your architecture. You inject it:

| You type | What happens |
|----------|--------------|
| `@docs/decisions/education-tab.md` | Decision doc in context |
| `@src/components/ui/button.tsx` | Existing component |
| `@src/app/(app)/layout.tsx` | Layout file |
| `@package.json` | Dependencies |
| `@.cursorrules` | Project rules (already read, but explicit helps) |

**Golden rule:** Every Composer prompt needs:
1. **Decision doc** — *what* to build
2. **Existing patterns** — *how* we build
3. **Types** — *what data* we use

### Example prompt
```
Build <BottomNav /> in src/components/nav/BottomNav.tsx.

Context:
- Spec: @docs/decisions/mobile-web-ui.md §2
- UI: @src/components/ui/
- Types: @src/types/database.ts

Requirements:
- Client component ("use client")
- 5 items: Dashboard, Education, AI Tutor, Campus, Maps
- Active route Teal (#00A896), 44px touch targets
- dark: classes on all styled elements
- No new packages

Do NOT: use Pages Router patterns, forget dark mode
```

---

## 5. Models — How to Switch

### In Composer
- Click model dropdown at top of Agent panel
- Or type `@model=opus` / `@model=sonnet` at start of prompt
- **Composer 1** = Cursor's proprietary, ~4× faster — use for speed-critical simple tasks

### When to use which (DowOS)
| Task | Model |
|------|-------|
| RAG, Viva Bot, RLS, 5+ file refactors | **Opus** |
| Standard components, forms, pages | **Sonnet** |
| Quick fixes, build errors | **Sonnet** or **Composer 1** |
| Stuck after 2 Sonnet cycles | **Opus** |

---

## 6. Subagents (Cursor 2.4+)

Subagents run discrete subtasks **in parallel** with their own context.

**Built-in subagents:**
- **Research** — Searches codebase, gathers context
- **Terminal** — Runs commands
- **Parallel work streams** — Splits a task across agents

**When they help:**
- "Build MCQ Solver + Admin upload page" → one subagent per feature
- Large refactor → research subagent gathers all usages first

**Custom subagents:** Define in Cursor docs. DowOS doesn't need custom ones yet.

---

## 7. Skills

Skills are **domain workflows** — procedural "how-to" instructions. Invoked via slash command: `/skill-name`.

**Vs Rules:** Rules are always-on, declarative. Skills are on-demand, procedural.

**Example skills you might add:**
- `/nextjs-app-router` — App Router patterns
- `/supabase-rls` — RLS policy template
- `/dowos-check` — Pre-accept checklist (dark:, logApiCall, 44px, etc.)

**DowOS:** Rely on `.cursorrules` for now. Add skills if you find repeated workflows.

---

## 8. Rules & .cursorrules

- **Project rules:** `.cursorrules` at repo root. Cursor reads every turn.
- **File-scoped rules:** `*.mdc` in `.cursor/rules/` — apply only when those files are relevant.
- **DowOS:** `.cursorrules` has design tokens, nav config, NEVER rules, checklist. Don't duplicate in prompts — reference it: "per .cursorrules"

---

## 9. Robust Code Practices

### 9.1 Before accepting diffs
- [ ] Matches decision doc?
- [ ] `dark:` classes on styled elements?
- [ ] `logApiCall()` after every Gemini/Groq/TTS call?
- [ ] Touch targets ≥ 44px?
- [ ] Imports use `@/` path alias?
- [ ] No new `npm install`?
- [ ] App Router only (no getServerSideProps, no pages/)?
- [ ] Route group correct? `(app)/` = auth, `(auth)/` = login

### 9.2 When Agent goes off-track
- **Don't** steer mid-conversation
- **Do** close Composer, start fresh with tighter prompt
- **Do** add explicit "Do NOT: X, Y, Z" to prompt

### 9.3 Build-after-every-feature
```
Accept files → npm run build → paste errors → Composer fixes
```
Copy **full error text**. Paraphrasing hurts fix quality.

---

## 10. The DowOS Workflow

```
1.  READ decision doc (5–10 min)
2.  Open Composer (Ctrl+Shift+I)
3.  @-mention: decision doc + ui/ + types + relevant hooks
4.  Write tight prompt (spec, requirements, Do NOT)
5.  WATCH diffs. Review file-by-file.
6.  Accept. npm run build.
7.  Errors? Paste into Composer. Fix. Repeat.
8.  Session done → Claude Code for review + session doc
```

---

## 11. Tips

| Tip | Why |
|-----|-----|
| Tag generously | Extra @-mentions cost little. Prevents invented patterns. |
| Restart on drift | Fresh context > steering a lost agent. |
| File-by-file accept | One bad file can break build. |
| Paste errors exactly | Compiler output > your summary. |
| Use Plan mode for complex tasks | Clarifying questions before code = fewer rewrites. |
| Subagents for parallel work | E.g. "Build NavShell + Dashboard skeleton" — split across agents. |

---

## 12. Clarification Questions (Cursor 2.4+)

The Agent can **ask you questions** mid-task. While you answer, it keeps reading/editing. Use this:
- When spec is ambiguous
- When you want to constrain a choice ("Use Teal, not primary")

Answer concisely. Agent incorporates and continues.

---

## 13. Image Generation (Cursor 2.4+)

Describe an image in the Agent prompt. Cursor generates via underlying model, saves to `assets/`. Use for:
- UI mockups
- Architecture diagrams
- Product assets

**DowOS:** Optional. Design system is in docs; generate only if you need a visual spec.

---

## 14. Keyboard Shortcuts (Windows)

| Shortcut | Action |
|----------|--------|
| **Ctrl+Shift+I** | Open Composer (Agent) |
| **Ctrl+K** | Open Chat |
| Ctrl+Shift+L | Search codebase |
| Ctrl+P | Quick-open file |
| Ctrl+Shift+P | Command palette |
| Tab | Accept suggestion |
| Esc | Dismiss |
| Ctrl+` | Toggle terminal |
| Ctrl+Z | Undo (works in diffs) |

---

## 15. Cursor vs Claude Code

| Task | Best tool |
|------|-----------|
| Components, pages, multi-file features | **Cursor Composer** |
| Small fixes, single-file | **Cursor Chat** |
| Build error fixes | **Cursor** |
| Architecture, decision docs | **Claude Code** |
| End-of-session review | **Claude Code** |
| Cross-file logic debugging | **Claude Code** |

**Strategy:** Cursor builds. Claude Code reviews and plans. See `docs/model-usage-guide.md` for daily split.

---

## 16. Common Mistakes

| Mistake | Fix |
|---------|-----|
| No @-mention of decision doc | Always @-mention. |
| Accept all at once | Review file-by-file. |
| Pages Router patterns | Specify "App Router only". |
| Missing dark: | Check every styled element. |
| Missing logApiCall() | Convention #16 in .cursorrules. |
| Wrong route group | `(app)/` = auth. `(auth)/` = login. |
| Letting Cursor install packages | Say no. Check decision docs. |

---

## 17. CLI & Cloud Agents

- **Cursor CLI:** Run agents in terminal. `cursor` or `cursor agent`. Useful for scripts, CI.
- **Handoff to Cloud:** Prepend `&` to a message to push the conversation to [cursor.com/agents](https://cursor.com/agents). Continue on web or mobile. Pick up later in the IDE.
- **Plan mode:** `/plan` — design before coding. Ask mode: `/ask` — explore without edits.

---

## 18. Reference

- **Model picks per task:** `docs/model-usage-guide.md`
- **Prompt templates:** `docs/cursor-pro-strategy.md` §5
- **DowOS conventions:** `.cursorrules`, `CLAUDE.md`
