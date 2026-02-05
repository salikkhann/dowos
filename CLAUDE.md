# CLAUDE.md – DowOS Project Guide

Last updated: 2026-02-05 (Session 5 — stack + folder corrections)

---

## Role & Project Facts

DowOS is a **student super-app** for Dow Medical College, Karachi.
Target users: ~2 000 medical students (Batches 1–5).
The app is built by a three-person team (Salik – dev, Ammaar – ops, Azfar – content).

Core product tiers:
- **Free** – Auth, Timetable, Attendance, AI Tutor (rate-limited), MCQ Solver (unlimited), Progress Matrix, Lost & Found, Announcements.
- **Pro** – PKR 3 000 / year. Unlocks unlimited AI Tutor, Viva Bot (180 min/mo), and future premium features.

Revenue sources (Year 1 target PKR 2.25 M):
| Source | Model |
|---|---|
| Pro subscriptions | Direct (25 % conversion target) |
| DowEats | 15 % commission on food orders |
| Dow Merch | Direct profit on hoodies / lab coats |
| Marketplace | 10 % commission on textbook trades |

All in-app payments use **Dow Credits** (manual top-up, verified in 5–10 min).

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
9. **Commit often, branch often.** Never push directly to `main`. Feature branches only.
10. **Ask before creating files.** Especially documentation — confirm content before writing.
11. **Always update the session doc.** At the end of every session (or when switching context), update `docs/sessions/` with what was done, what state the project is in, and what comes next. This is mandatory — never skip it.
12. **Never read `docs/02_DATABASE_SCHEMA.md` in full at session start.** It is 925 lines. Query the live schema via the Supabase MCP server, or read only the specific table block you need. Same rule for any doc over 200 lines — read surgically, not wholesale.
13. **Compact manually at task boundaries.** Use `/compact` after finishing a feature or resolving a debug session. Never let auto-compaction fire mid-task — it loses the artifact trail (which files were touched and what state they're in).
14. **Model discipline.** Use Sonnet for all coding. Days 3–8 architecture decisions are done and locked — Opus is not needed for the build phases ahead.

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
| AI Tutor | 2 soft / 4 hard | Unlimited | Daily |
| MCQ Solver | Unlimited | Unlimited | — |
| Viva Bot | — (Pro only) | 180 min / month | Monthly |

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
| Skill | Use when |
|---|---|
| `nextjs-app-router-patterns` | Building any Next.js page, layout, or data-fetching pattern |
| `nextjs-supabase-auth` | Anything touching auth: middleware, session, login, signup |
| `ai-engineer` | RAG pipeline, Gemini integration, embedding, vector search |
| `rag-engineer` | Chunking, retrieval, re-ranking, pgvector queries |
| `context-compression` | Session is getting long — before you compact, read this |
| `strategic-compact` | Tells you *when* to `/compact`. Read before any long build session. |
| `tailwind-design-system` | New UI components — check tokens and patterns first |
| `react-patterns` | Component architecture, hooks, state decisions |
| `security-review` | Before any auth, payment, or admin route ships |

**Supabase MCP** is wired in `.claude/settings.json`. Use it to query live schema instead of reading `docs/02_DATABASE_SCHEMA.md`.
