# How to Use Cursor — DowOS

**Who this is for:** Salik. Practical, not theoretical. Assumes Cursor Pro is installed and the repo is open.

---

## 1. Setup (one-time, do this first)

1. Download and install **Cursor** from [cursor.com](https://cursor.com). Sign in with your account.
2. Open Cursor → **File → Open Folder** → navigate to `E:\dowos`.
3. `.cursorrules` is at the project root. **Cursor reads it automatically on every turn.** You don't touch it — it's always in context. It has all the design tokens, nav config, and conventions.
4. Done. Start coding.

That's it. No other config needed.

---

## 2. Two modes — when to use which

### Chat (Ctrl+K)
**Use for:** Questions, small edits, single-file changes.
- "What does this hook do?"
- "Add input validation to this form field"
- "Fix this TypeScript error"

Edits show as a diff — you accept or reject inline.

### Agent / Composer (Ctrl+Shift+I)
**Use for:** Anything that touches more than one file.** This is where Cursor shines.**
- "Build the BottomNav component"
- "Wire the dark mode toggle into the sidebar and layout"
- "Create the MCQ upload page with preview table"

Composer opens multiple files, writes across them, can run terminal commands. You see every file it's changing before you accept.

**Simple rule: if you'd need to open more than one file manually, use Composer.**

---

## 3. Giving Cursor context — the @ system

Cursor doesn't know your architecture automatically. You bring it in with @-mentions:

| You type | What happens |
|---|---|
| `@decisions/education-tab.md` | Brings the education tab decision doc into context |
| `@src/components/ui/button.tsx` | Brings the existing button component |
| `@src/app/(app)/layout.tsx` | Brings the app layout file |
| `@package.json` | Brings the dependency list |

### Good prompt example:
> Build `<BottomNav />` in `src/components/nav/BottomNav.tsx`. Spec is in @decisions/mobile-web-ui.md. Existing UI primitives are in @src/components/ui/. Use only what's already installed — no new packages. 44px touch targets. Active route highlighted in Teal.

### Bad prompt example:
> Build a navigation bar

The second one gives Cursor nothing. It'll invent its own structure, install random packages, and you'll spend 30 minutes fixing it. **Always reference the decision doc. Always specify the file path.**

---

## 4. The DowOS workflow — step by step

This is how every feature build goes:

```
1.  READ the decision doc for the feature you're building
          ↓
2.  Open Cursor Composer (Ctrl+Shift+I)
          ↓
3.  @-mention the decision doc + any relevant existing files
          ↓
4.  Write a specific prompt (see §3 for examples)
          ↓
5.  WATCH Composer write. Diffs appear in real time.
          ↓
6.  REVIEW every diff before accepting. Check:
      - App Router patterns only (no getServerSideProps, no pages/)
      - dark: classes present on styled elements
      - Touch targets ≥ 44px
      - Imports use @/ path alias
      - No new packages installed
          ↓
7.  Accept changes (file by file if you're unsure)
          ↓
8.  Run: npx next build  (or npm run build)
          ↓
9.  Errors? Paste the exact output back into Composer. It fixes them.
          ↓
10. Session done → hand to Claude Code for end-of-day review
```

---

## 5. Tips that save you time

### Don't let Cursor install packages
DowOS has a locked stack. If Cursor suggests `npm install something`, say no. Everything you need is already in `package.json`. If something genuinely isn't there, check the decision docs first — it might be intentional that it's not included.

### `.cursorrules` is your safety net
It has design tokens, nav config, all conventions. Cursor reads it every turn. If it violates something, your prompt wasn't specific enough — not a Cursor bug.

### Accept changes file by file
Composer might touch 5 files at once. Don't accept all blindly. Review each file's diff. If one looks wrong, reject just that file and re-prompt for it.

### Restart Composer when it goes off-track
If Cursor starts building things you didn't ask for, don't try to steer mid-conversation. Close Composer, start a fresh one with a tighter prompt. Fresh context = better output.

### Always specify exact file paths
Next.js App Router is file-system routing. `src/app/(app)/education/mcq/page.tsx` is a completely different thing from `src/app/education/mcq/page.tsx` (the parentheses matter — they're route groups). Always tell Cursor exactly where the file goes.

### Paste errors exactly as they are
When `npm run build` fails, copy the full error text and paste it into Composer. Don't paraphrase or summarize. Cursor fixes errors much better when it sees the exact compiler output.

### Reference the route tree
If you're confused about where a file should live, look at the route tree in `docs/decisions/ui-page-structure.md` §11. It shows the full `src/app/` structure.

---

## 6. Common mistakes — and how to avoid them

| Mistake | What happens | Fix |
|---|---|---|
| Forgetting to @-mention the decision doc | Cursor invents its own architecture | Always @-mention. Every time. |
| Accepting all changes at once | A bad file slips through | Review file by file |
| Letting Cursor use Pages Router patterns | Builds work but breaks the app | Specify "App Router only" in your prompt |
| Not checking dark mode | Light-mode-only components | Always test with dark: classes. `.cursorrules` reminds Cursor but you should verify. |
| Forgetting `logApiCall()` | AI calls aren't tracked → cost model breaks | If your code calls Gemini/Groq/TTS, check that `logApiCall()` is called after. Convention #16 in `.cursorrules`. |
| Writing to the wrong route group | Page is accessible without auth | `(app)/` = auth-guarded. `(auth)/` = login pages. Never mix them up. |

---

## 7. What Cursor does well vs what Claude Code does better

Use the right tool for the right job:

| Task | Best tool |
|---|---|
| Writing components and pages | **Cursor Composer** |
| Small fixes and refactors | **Cursor Chat** |
| Architecture decisions | **Claude Code** |
| Writing / proofing decision docs | **Claude Code** |
| End-of-session code review | **Claude Code** |
| Debugging subtle cross-file logic | **Claude Code** |
| Fixing build errors | **Cursor** (paste the error, it fixes it) |

**The combo is the strategy:** Cursor builds fast. Claude Code makes sure it's right. You ship with confidence.

---

## 8. Keyboard shortcuts (Windows)

| Shortcut | What it does |
|---|---|
| Ctrl+Shift+I | Open Composer (Agent mode) — use this most |
| Ctrl+K | Open inline chat |
| Ctrl+P | Quick-open a file |
| Ctrl+Shift+P | Command palette |
| Tab | Accept inline code suggestion |
| Esc | Dismiss suggestion / close panel |
| Ctrl+` | Toggle terminal |
