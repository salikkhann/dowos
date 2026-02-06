# CLAUDE.md – DowOS Project Guide

Last updated: 2026-02-06 (Session 10 — PRD updated, todo comprehensive, skills expanded)

---

## Role & Project Facts

DowOS is a **student super-app** for Dow Medical College, Karachi.
Target users: ~2 000 medical students (Batches 1–5).
The app is built by a three-person team (Salik – dev, Ammaar – ops, Azfar – content).

Core product tiers:
- **Free** – Auth, Timetable, Attendance, AI Tutor (5 soft / 6 hard msgs/day), MCQ Solver (unlimited + "Ask AI →" on every explanation), Study Tracker (full heatmap + manual checklist, weak topics, readiness scores), Flashcards (unlimited reviews, max 3 custom decks), Exam Prediction Engine (high-yield topics), Study Guides & Resource Hub, Saved Questions (20 max), Viva Bot (1 free session taste), Browse Q&A, Lost & Found, Announcements, Prayer Times, Maps.
- **Pro** – PKR 3 000 / year (or PKR 1 500 exam-season pass, 3 months). Unlocks: unlimited AI Tutor, conversation history, voice mode, Viva Bot (180 min/mo), AI Study Plan, unlimited saved questions, offline content download.

Revenue sources (Year 1 target PKR 2.25 M):
| Source | Model |
|---|---|
| Pro subscriptions | Direct Easypaisa/JazzCash (15-20 % conversion target) |
| DowEats | 15 % commission on food orders |
| Dow Merch | Direct profit on hoodies / lab coats |
| Marketplace | 10 % commission on textbook trades |

**Dow Credits** (manual Easypaisa/JazzCash top-up, verified in 5–10 min) are used for DowEats, Merch, and Marketplace only. **Pro subscription** uses a separate direct payment flow (NOT through Dow Credits).

---

## Must-Follow Rules

1. **Read before you write.** Never propose changes to a file you have not read.
2. **No over-engineering.** Implement only what is asked. No extra abstractions, no speculative helpers.
3. **Security first.** No SQL injection, XSS, command injection. Validate at system boundaries only.
4. **Secrets stay out of code.** All keys live in `.env.local` (gitignored). Reference `.env.local.example` for the list.
5. **PKR everywhere.** All currency values in Pakistani Rupees unless explicitly stated otherwise.
6. **Karachi context.** Timezone: Asia/Karachi (UTC+5). Date format: DD/MM/YYYY in UI unless ISO is required by an API.
7. **Mobile-first.** Every component must be usable on a 375 px viewport. Touch targets ≥ 44 × 44 px.
8. **WCAG AA.** Contrast ratios and accessibility must meet AA at minimum.
9. **Git branching discipline.**
   - **Docs-only changes** (session logs, todo, CLAUDE.md, decision docs, PRD): commit and push directly to `main`. These don't break builds and branching for docs is unnecessary overhead.
   - **Code changes** (anything in `src/`, migrations, config, `package.json`, tests): ALWAYS use a feature branch → PR → merge workflow:
     1. `git checkout -b feature/<short-name>` off `main`
     2. Build, commit with descriptive messages
     3. `git push -u origin feature/<short-name>`
     4. `gh pr create` with summary + test plan
     5. Self-review the diff on GitHub (catches mistakes before merge)
     6. `git checkout main && git merge feature/<short-name> && git push`
     7. `git branch -d feature/<short-name>`
   - Never force-push to `main`. Never skip the PR step for code changes.
   - Mixed changes (docs + code in same session): branch for the code, commit docs to `main` separately.
10. **Ask before creating files.** Especially documentation — confirm content before writing.
11. **Always update the session doc.** At the end of every session (or when switching context), update `docs/sessions/` with what was done, what state the project is in, and what comes next. This is mandatory — never skip it.
12. **Never read `docs/02_DATABASE_SCHEMA.md` in full at session start.** It is 925 lines. Query the live schema via the Supabase MCP server, or read only the specific table block you need. Same rule for any doc over 200 lines — read surgically, not wholesale.
13. **Compact manually at task boundaries.** Use `/compact` after finishing a feature or resolving a debug session. Never let auto-compaction fire mid-task — it loses the artifact trail (which files were touched and what state they're in).
14. **Model discipline.** Use Sonnet for all coding. Days 3–8 architecture decisions are done and locked — Opus is not needed for the build phases ahead.
15. **🔴 CRITICAL: Check Supabase FIRST.** Before proposing ANY schema changes, data migrations, or database-related modifications:
   - Query the LIVE schema using Supabase MCP (`SUPABASE_URL` and `SUPABASE_ANON_KEY` configured in `.claude/settings.local.json`)
   - Verify existing tables, columns, indexes, RLS policies, and triggers
   - Check row counts and data integrity
   - Compare proposed changes against actual database state
   - NEVER assume the database matches documentation — always verify against reality
   - This prevents breaking changes, duplicate table creation, conflicting migrations, and data loss

16. **Always tick off completed work in both places.** When you finish a task and the user says "tick work off" or "mark it complete":
   - Update `docs/todo-current.md` — change `[ ]` to `[x]` in Phase section
   - Update the TodoWrite list — mark task as `completed`
   - Update `docs/sessions/` with what was done
   - Never leave a task ticked in one place but not the other — keep them synchronized

---

## Tech Stack & Conventions

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | Zustand (global), TanStack Query (server cache) |
| Backend / DB | Supabase – PostgreSQL + Realtime + Auth |
| AI | Google Gemini (primary), DeepSeek R1 (fallback) |
| Speech | Groq Whisper Large v3 Turbo (STT), Google Cloud TTS |
| Push notifications | Firebase Cloud Messaging |
| Maps | MapLibre GL JS + PMTiles (campus routes) |
| Icons | Lucide React (24 px, 1.5 px stroke, linear) |
| Fonts | Outfit Bold (headings), Inter (body), JetBrains Mono (metrics) |

**Path alias:** `@/*` → `src/*`

**shadcn/ui components currently installed:**
`badge`, `button`, `card`, `input`, `label`, `sheet`, `skeleton`, `tooltip`

**Design tokens (key colours):**
| Token | Hex |
|---|---|
| Primary (Navy) | #1A2B4C |
| Offwhite | #F5F5F7 |
| Accent – Teal | #00A896 |
| Accent – Gold | #D4A574 |
| Accent – Red | #E74C3C |
| Dark-mode BG | #0F1823 |

---

## Folder Structure

```
src/
├── app/
│   ├── (app)/            # Authenticated routes (layout with sidebar/nav)
│   │   ├── dashboard/
│   │   ├── ai/           # AI Tutor Chat
│   │   ├── education/
│   │   │   ├── mcq/      # MCQ Solver
│   │   │   ├── viva/     # Viva Bot
│   │   │   └── progress/ # Progress Matrix
│   │   ├── campus/
│   │   │   ├── lost-found/
│   │   │   ├── prayers/
│   │   │   ├── doweats/    # Phase 2 revenue
│   │   │   ├── merch/      # Phase 2 revenue
│   │   │   └── marketplace/ # Phase 2 revenue
│   │   └── maps/           # Point Routes (MapLibre)
│   ├── (auth)/           # Unauthenticated routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── verify/
│   ├── layout.tsx        # Root layout (fonts, theme provider)
│   └── globals.css       # Global Tailwind styles
├── components/
│   └── ui/               # shadcn/ui primitives
├── hooks/                # Custom React hooks
├── lib/                  # Utilities (supabase client, helpers)
├── stores/               # Zustand stores
└── types/                # Shared TypeScript types
docs/                     # All project docs (PRD, schema, design, sessions, roadmap)
```

---

## Supabase & Gemini Patterns

**Supabase client setup** (expected location: `src/lib/supabase.ts`):
- Use `@supabase/ssr` `createBrowserClient` / `createServerClient` pattern.
- Row-Level Security (RLS) enabled on every table — students can only read/write their own rows.
- Realtime subscriptions for Timetable and Announcements (5-min ISR fallback).

**AI rate-limiting rules:**
| Feature | Free limit | Pro limit | Reset |
|---|---|---|---|
| AI Tutor | 5 soft / 6 hard | Unlimited | Daily |
| MCQ Solver | Unlimited (+ "Ask AI →" links to AI Tutor) | Unlimited | — |
| Viva Bot | 1 free session taste | 180 min / month | Monthly |
| Saved Questions | 20 max | Unlimited | — |
| AI Study Plan | — (Pro only) | Weekly plan via Gemini | Weekly |

**Gemini integration hints:**
- Route simple keyword queries locally; complex questions → Gemini API.
- Always stream responses when UX shows a chat bubble.
- Include module/subject context in the prompt for medical accuracy.

---

## Workflow & Safety

1. **Branching:** `feature/<short-name>` off `main`. PR → review → merge.
2. **Env setup:** Copy `.env.local.example` → `.env.local`, fill real keys. Never commit `.env.local`.
3. **Local dev:** `npm run dev` (port 3000).
4. **Build check:** Run `npm run build` before opening a PR.
5. **Docs location:** All docs live in `/docs`. Session logs go in `docs/sessions/`.
6. **Database changes:** Edit `docs/02_DATABASE_SCHEMA.md` first, get sign-off, then apply via Supabase Studio or migrations.
7. **Design changes:** Reference `docs/4_DESIGN_SYSTEM.md` and `docs/5_UXUI_GUIDELINES.md` before touching any UI.
8. **Session logging:** Every session must end with an update to `docs/sessions/`. If a new session file is needed, create one. Never leave the session log stale.

---

## Skills & Tooling

Skills live at `C:/Users/salik/.claude/skills/`. Invoke via the Skill tool by name.

**Key skills for this project and when to use them:**

Always tell the user which skill(s) you are invoking at the start of a task.

| Skill | Use when |
|---|---|
| **Core Development** | |
| `nextjs-app-router-patterns` | Building any Next.js page, layout, route group, data fetching, ISR, SSR |
| `nextjs-supabase-auth` | Auth middleware, session handling, login/signup, RLS, JWT role checks |
| `nextjs-best-practices` | Performance patterns, caching, rendering strategies, API routes |
| `react-patterns` | Component architecture, hooks, state management decisions |
| `react-best-practices` | Performance, memoization, error boundaries, suspense patterns |
| `typescript-expert` | Strict mode typing, generics, Supabase type generation, utility types |
| **Styling & Design** | |
| `tailwind-design-system` | New UI components — check design tokens, spacing, colour usage first |
| `tailwind-patterns` | Responsive layouts, dark mode, animation, utility patterns |
| `web-design-guidelines` | Layout principles, visual hierarchy, whitespace, consistency |
| `ui-ux-designer` | UX flow decisions, interaction patterns, user journey mapping |
| `mobile-design` | Mobile-first patterns, touch targets, safe areas, gestures |
| `accessibility-compliance-accessibility-audit` | WCAG AA audit, contrast checks, screen reader testing |
| **AI & Data** | |
| `ai-engineer` | Gemini integration, RAG pipeline, embedding, prompt engineering |
| `rag-engineer` | Chunking strategy, retrieval, re-ranking, pgvector queries |
| **Database & Backend** | |
| `database-design` | Schema decisions, table relationships, indexes, normalization |
| `postgres-best-practices` | Query optimization, RLS policies, migrations, indexes |
| `api-design-principles` | Next.js API routes structure, REST patterns, error handling |
| **Quality & Security** | |
| `security-review` | Before shipping auth, payment, admin routes, or credits flow |
| `clean-code` | Readability, naming, single responsibility, DRY |
| `code-review-excellence` | Self-review before committing, catching edge cases |
| **Session & Context** | |
| `strategic-compact` | Knowing *when* to `/compact` during long build sessions |
| `context-compression` | Before compacting — preserving the right context |
| **Shipping & Ops** | |
| `vercel-deployment` | Deploying, preview environments, env vars, edge functions |
| `firebase` | FCM push notification setup, token management |

**Supabase MCP** is wired in `.claude/settings.json`. Use it to query live schema instead of reading `docs/02_DATABASE_SCHEMA.md`.
