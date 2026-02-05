# DowOS — Cursor / Windsurf Rules (source)

**NOTE:** `.cursorrules` at the project root is the live file Cursor reads automatically every turn. This file is the human-readable backup. They must stay in sync. If you edit one, update the other.

---

# DowOS Rules

## ⚡ First thing — read before you build

Before touching any feature, read the relevant decision doc in `docs/decisions/`. Every architectural choice is locked there. Do NOT guess or invent architecture. If a feature has no decision doc and you can't find it in `FINAL_LOCKED_DECISIONS.md`, **stop and flag it** — do not build anything undocumented. Ask the developer first.

Decision docs live at: `docs/decisions/`
Index of all locked decisions: `docs/FINAL_LOCKED_DECISIONS.md`
Design system: `docs/4_DESIGN_SYSTEM.md`
UX patterns + accessibility: `docs/5_UXUI_GUIDELINES.md`
Full screen wireframes + route tree: `docs/decisions/ui-page-structure.md`

---

## 🛠 Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 — App Router only. No Pages Router. No `pages/` directory. |
| Language | TypeScript strict mode. No `any`. Use `unknown` + narrowing or proper types in `src/types/`. |
| Styling | Tailwind CSS v4. shadcn/ui primitives. No CSS modules, no emotion, no styled-components. |
| State | Zustand (global app state). TanStack Query (server cache + refetch). |
| Backend / DB | Supabase — PostgreSQL + Realtime + Auth + Storage. |
| AI – Tier 1 | Google Gemini Flash (interactive chat, MCQ explanations). |
| AI – Tier 2 | DeepSeek R1 (reasoning fallback when Flash errors 3×). |
| AI – Extraction | Gemini 2.5 Pro (PDF text extraction via Files API only). |
| Speech – STT | Groq Whisper Large v3 Turbo. NOT OpenAI Whisper. |
| Speech – TTS | Google Cloud TTS. |
| Push notifications | Firebase Cloud Messaging (FCM). |
| Maps | MapLibre GL JS + PMTiles. NOT Google Maps JS SDK. |
| Prayer calc | `adhan` npm package — azan times + qibla bearing. Client-side only, zero API calls. |
| Hijri date | `hijri-converter` npm package. Client-side only, zero API calls. |
| Mobile | Capacitor.js wrapping the Next.js build. NOT a React Native app. |
| Icons | Lucide React. 24 px default, 1.5 px stroke, linear style. |
| Fonts | Outfit Bold (headings). Inter (body). JetBrains Mono (scores, metrics, order codes). |
| Path alias | `@/*` → `src/*`. Always use this. Never relative cross-folder imports. |
| Toasts | Sonner (shadcn toast wrapper). One instance at app root. Never stack. |
| Dark mode | next-themes. Provider at root layout. `dark:` Tailwind classes. Do NOT mirror in Zustand. |
| Error reporting | Sentry (`@sentry/nextjs`). Auto-captures unhandled exceptions. |
| Email | Resend. `RESEND_API_KEY` in `.env.local`. |

shadcn/ui components already installed: `badge`, `button`, `card`, `input`, `label`, `sheet`, `skeleton`, `tooltip`

**Do NOT install new packages.** The stack is locked. If something genuinely isn't here, flag it — don't npm install.

⚠️ **`adhan` and `hijri-converter` are NOT yet in `package.json`.** They are Phase 2A install tasks. Do NOT `import` from them until they appear in the lockfile — prayer features will error if you try.

📱 **Mobile:** The Next.js build is wrapped in **Capacitor.js** on iOS / Android. All code is standard web. `navigator.geolocation` works in the Capacitor webview without a plugin. Do NOT use any React Native or native mobile APIs.

---

## 🎨 Design Tokens — use these everywhere

### Colours

| Token | Hex | Usage |
|---|---|---|
| Navy (primary) | `#1A2B4C` | Headers, body text, primary elements |
| Navy-50 | `#F8F9FB` | Light backgrounds |
| Navy-100 | `#E8EDF5` | Hover backgrounds |
| Navy-200 | `#D1DCEB` | Borders, dividers |
| Navy-300 | `#A5B8D6` | Placeholder text ONLY. NEVER for body text — fails contrast. |
| Navy-400 | `#6B85B3` | Focus borders |
| Offwhite | `#F5F5F7` | Page backgrounds |
| Teal | `#00A896` | CTAs, buttons, success, links, next-prayer highlight |
| Teal-500 | `#008B7D` | Teal hover state |
| Gold | `#D4A574` | Pro / Premium badges and borders |
| Red | `#E74C3C` | Errors, warnings, attendance danger |
| Sub-text on glass | `#5A6B8A` | Min-contrast text on glassmorphic cards (passes 4.5:1) |

**Dark mode overrides:**

| Token | Hex |
|---|---|
| BG | `#0F1823` |
| Card BG | `#222F45` |
| Teal (dark) | `#00D4C4` |
| Gold (dark) | `#FFD89B` |
| Red (dark) | `#FF6B5B` |

### Glassmorphism (Profile card + featured sections)

```css
background: rgba(255, 255, 255, 0.8);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.3);
border-radius: 8px;
box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
/* Dark mode: background rgba(34, 47, 69, 0.85) */
/* Pro card: border Gold, shadow tinted rgba(212, 165, 116, 0.25) */
```

### Typography scale

| Role | Font | Weight | Size |
|---|---|---|---|
| H1 Page title | Outfit | 800 | 32 px |
| H2 Section | Outfit | 700 | 24 px |
| H3 Card header | Outfit | 700 | 18 px |
| H4 Label | Outfit | 700 | 14 px |
| Body large | Inter | 400 | 16 px |
| Body normal | Inter | 400 | 14 px |
| Body small | Inter | 400 | 12 px |
| Score / metric | JetBrains Mono | 600 | 14 px |
| Order code | JetBrains Mono | 700 | 24 px+ |

---

## 📐 Layout & Spacing

- **4 px base unit.** Spacing steps: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48.
- **Mobile-first.** Every component must work on 375 px viewport. Design for this width first.
- **Touch targets:** minimum 44 × 44 px on ALL interactive elements. No exceptions.
- **Breakpoints:** Mobile < 768 px · Tablet 768–1023 px · Desktop ≥ 1024 px.
- **NavShell** switches layout at 1024 px: BottomNav (mobile) ↔ Sidebar (desktop).
- Cards: 16 px padding, 8 px radius, 12 px gap between cards.
- Page padding: 16 px mobile, 24 px desktop top; 40 px desktop sides.

---

## 🗺️ Complete Route Map — every file goes exactly here

`(app)/` = auth-guarded. `(auth)/` = unauthenticated login pages. **NEVER mix these two.**

```
src/app/
├── layout.tsx                          ← root: fonts, ThemeProvider, QueryClientProvider
├── globals.css                         ← Tailwind imports + global resets
├── not-found.tsx                       ← global 404. No NavShell. Navy on Offwhite.
├── error.tsx                           ← global error boundary. No NavShell.
│
├── (auth)/                             ← UNAUTHENTICATED routes
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── verify/page.tsx
│
└── (app)/                              ← AUTHENTICATED routes (NavShell wraps all)
    ├── layout.tsx                      ← mounts <NavShell />. Server Component.
    ├── dashboard/
    │   ├── page.tsx                    ← widget stack: greeting, timetable, attendance, announcements, PRAYERS, L&F
    │   └── timetable/page.tsx          ← full timetable week-view
    ├── ai/page.tsx                     ← AI Tutor chat
    ├── education/
    │   ├── page.tsx                    ← cards grid: MCQ, Viva+Browse, Saved Qs, Progress
    │   ├── mcq/page.tsx                ← MCQ drill
    │   ├── viva/
    │   │   ├── page.tsx                ← Viva Bot entry [Pro gate]
    │   │   └── browse/page.tsx         ← Browse Q&A expandable list [FREE]
    │   ├── saved/page.tsx              ← Saved Questions
    │   └── progress/page.tsx           ← Progress Matrix heatmap
    ├── campus/
    │   ├── page.tsx                    ← Campus cards grid
    │   ├── lost-found/page.tsx         ← Lost & Found
    │   ├── prayers/page.tsx            ← Prayer Times (azan, masjid, qibla, verse)
    │   ├── doweats/page.tsx            ← [Coming Soon]
    │   ├── merch/page.tsx              ← [Coming Soon]
    │   └── marketplace/page.tsx        ← [Coming Soon]
    ├── maps/page.tsx                   ← MapLibre campus map
    ├── settings/page.tsx
    ├── profile/page.tsx
    ├── help/page.tsx
    └── admin/                          ← service-role gated
        ├── layout.tsx                  ← non-admin → redirect /dashboard
        ├── page.tsx
        ├── content/page.tsx            ← upload + list + manage
        ├── approvals/page.tsx          ← Dow ID approval queue
        ├── analytics/page.tsx          ← cost + usage (Phase 8)
        └── prayers/page.tsx            ← imam: masjid schedules + daily verse
```

---

## 🔐 Auth & Middleware

Route-group auth is enforced by `src/middleware.ts` at the project root.

- Every request to an `(app)/` route: middleware reads the Supabase session via `createServerClient`. No valid session → redirect to `/login`.
- `(auth)/` routes (login, signup, verify) bypass the session check entirely.
- Do NOT add auth checks inside individual page components. The middleware is the single gate.
- The middleware sets cookies required by `createServerClient` in Server Components — do not remove or skip it.

---

## 🧭 Nav Config (locked — do not change without a decision doc update)

### Mobile bottom nav (5 items, 44 px tall, safe-area inset)

```
1. Dashboard   → /dashboard        icon: Home
2. Education   → /education        icon: Book
3. AI Tutor    → /ai               icon: MessageCircle
4. Campus      → /campus           icon: MapPin
5. Maps        → /maps             icon: Map
```

### Desktop sidebar (config-driven via nav.ts)

```
── Main ──────────────────
  Dashboard          /dashboard
  AI Tutor           /ai

── Study ─────────────────
  MCQ Solver         /education/mcq
  Viva Bot           /education/viva       [Pro gate]; Browse Q&A (Free) at /education/viva/browse
  Saved Questions    /education/saved      bookmarked Qs from MCQ + Browse Q&A
  Progress Matrix    /education/progress

── Campus ────────────────
  Lost & Found       /campus/lost-found
  Prayer Times       /campus/prayers
  DowEats            /campus/doweats       [Coming Soon]
  Dow Merch          /campus/merch         [Coming Soon]
  Marketplace        /campus/marketplace   [Coming Soon]
  Maps               /maps

── Identity ──────────────
  [Avatar mini-card: 48 px circle, Gold ring if Pro]
  Tap (mobile) → bottom sheet: Settings / Profile / Help / Logout

── System ────────────────
  Settings           /settings
  Profile            /profile
  Admin              /admin                [role-gated]
  Help               /help
```

---

## 📦 Import paths — always use these

| What | Pattern |
|---|---|
| shadcn/ui | `import { Button } from "@/components/ui/button"` |
| Zustand store | `import { useAuthStore } from "@/stores/auth"` |
| Custom hook | `import { useXxx } from "@/hooks/xxx"` |
| Shared type | `import type { Xxx } from "@/types/xxx"` |
| Utility | `import { xxx } from "@/lib/xxx"` |
| Supabase (browser) | `import { supabase } from "@/lib/supabase"` |

Always `@/`. Never relative paths across folders (e.g. `../../lib/foo`).

### NavShell component tree

```
src/components/nav/
├── NavShell.tsx       ← layout wrapper. Renders BottomNav OR Sidebar based on viewport (< 1024 px / ≥ 1024 px).
├── BottomNav.tsx      ← mobile nav. 5 items. 44 px tall. safe-area-inset-bottom.
├── Sidebar.tsx        ← desktop nav. Config-driven from nav.ts.
└── nav.ts             ← nav config array. Single source of truth for sidebar items, icons, routes, badges.
```

---

## 🗃️ State — what lives where

**Zustand (global) — stores in `src/stores/`:**
- `useAuthStore` — user profile (name, email, role, isPro). Populated once after login.
- `useCreditsStore` — Dow Credits balance.
- `useNotifStore` — unread notification count.

**TanStack Query (server cache) — via `useQuery` in components:**
- All Supabase fetches: timetable, announcements, masjid schedules, daily verse, MCQ banks, Lost & Found listings.
- `QueryClientProvider` is in `src/app/layout.tsx` (root layout).
- Default `staleTime`: 5 min (`300_000` ms).
- Keys are arrays: `["timetable", userId]`, `["announcements"]`, `["masjid-schedules"]`.

**Local state (`useState`):** modal open/close, form values, anything that doesn't survive navigation.

**NEVER in a store:** theme (`next-themes` only), server data (TanStack Query only).

---

## 🌐 Environment variables

All in `.env.local`. Reference `.env.local.example`. Never hardcode.

| Variable | Scope |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — never in browser |
| `GEMINI_API_KEY` | Server Route Handlers |
| `GROQ_API_KEY` | Server Route Handlers |
| `GOOGLE_TTS_API_KEY` | Server Route Handlers |
| `RESEND_API_KEY` | Server Route Handlers |
| `SENTRY_DSN` | Both (auto by `@sentry/nextjs`) |

---

## 🕌 Prayer Times — specific rules for this feature

Prayer Times is **client-side-first**. The core calculation never hits a server or third-party API.

- **Azan times:** `adhan` package. Karachi `{ latitude: 24.8607, longitude: 67.0011 }`. Method: `UmmAlQura`. Recalculate daily on page load. Order: Fajr → Sunrise → Dhuhr → Asr → Maghrib → Isha. Passed = ✓ (Teal). Next = bold + Teal.
- **Qibla:** `adhan` + `navigator.geolocation`. Fall back to Karachi coords silently if denied. Compass rose + numeric bearing.
- **Hijri date:** `hijri-converter`. Client-side. Display: `6 Sha'ban 1447`.
- **Masjid jamaat times:** Supabase `masjid_schedules` table. `dow_main` + `chk`. Fetched via TanStack Query. Updated by imam at `/admin/prayers`.
- **Daily Verse:** Supabase `daily_content` table. One row per date. Fall back to hardcoded default if missing.
- **Dashboard mini-card:** Next prayer + time + live countdown (`setInterval`). Always visible. Client-side only.
- **Logging:** `prayer_page_viewed` event to `app_events` on full page mount. Calc itself = no `logApiCall()`.

---

## 📋 Conventions — follow these on every file

1. **`'use client'` only on leaf components** that need hooks. Pages + layouts = Server Components by default.
2. **Skeleton-first.** Every async fetch shows `<Skeleton>` shapes. No spinners. Each widget skeletonises independently.
3. **Transitions:** 100 ms tap · 150 ms hover · 200 ms route · 250 ms sheet. Animate `transform` + `opacity` only.
4. **Focus rings:** `focus-visible:ring-2 ring-teal-500 ring-offset-2` on every interactive element.
5. **Reduced motion:** `motion-safe:animate-pulse`. Animations inside `@media (prefers-reduced-motion: no-preference)`.
6. **WCAG AA.** Body text ≥ 4.5:1. Never Navy-300 for text — use `#5A6B8A`.
7. **Images:** `next/image`. Explicit `width` + `height`. `priority` on above-fold.
8. **Secrets:** `.env.local` only. `process.env.VARIABLE_NAME`. Never hardcode.
9. **Timezone:** `Asia/Karachi` (UTC+5). Display: DD/MM/YYYY. ISO only when API requires.
10. **Currency:** PKR everywhere. 1 Dow Credit = PKR 1.
11. **Supabase:** Browser → `createBrowserClient()`. Server → `createServerClient(cookies)`. NEVER browser client in Server Component. RLS on every table.
12. **AI rate limits (server-side):** AI Tutor Free: soft 5 / hard 6 / day. Pro: unlimited. MCQ: unlimited (explanations identical Free + Pro; "Ask AI →" on every explanation opens AI Tutor). Viva Bot: 1 free session taste, then Pro-only (180 min/mo). Saved Qs: Free cap 20 / Pro unlimited. AI Study Plan: Pro-only (reads Progress Matrix → Gemini weekly plan).
13. **Branches:** Never push to `main`. Feature branch → PR → merge.
14. **Toasts:** Sonner. One per type. New replaces old.
15. **Dark mode:** `next-themes` only. `suppressHydrationWarning` on `<html>`. `dark:` classes everywhere.
16. **API logging:** Every Gemini / DeepSeek / Groq / Google TTS / Geocoding call → `logApiCall()`. Prayer calc is local — exempt.
17. **Sentry:** Auto-captures. Don't manually wrap unless error would be swallowed.
18. **Admin auth:** (1) `admin/layout.tsx` checks role. (2) Service-role client server-side only — never in browser.
19. **404 / error:** `not-found.tsx` + `error.tsx` at `src/app/`. No NavShell. Navy on Offwhite.
20. **Uploads:** Long jobs → Vercel Route Handlers + SSE. See `upload-pipeline.md`.
21. **Server actions:** `actions/` subfolder per feature. `'use server'` at top. Return `{ error: string }` — never throw.
22. **Pro gates:** Enforce server-side. Client gate = UI sugar only — bypassable.

---

## 🚫 NEVER do these — hard stops

1. NEVER use Pages Router. No `pages/`, no `getServerSideProps`, no `getStaticProps`.
2. NEVER install new packages. Stack is locked.
3. NEVER use `any`. TypeScript strict.
4. NEVER hardcode secrets.
5. NEVER call AI/ML providers without `logApiCall()`.
6. NEVER create files outside the route map.
7. NEVER use `createBrowserClient` in a Server Component.
8. NEVER use CSS modules / styled-components / emotion.
9. NEVER skip skeleton state on async pages.
10. NEVER use an API for prayer times / Hijri / Qibla. Client-side calc only.
11. NEVER expose service-role key to browser.
12. NEVER push to `main` directly.
13. NEVER use Navy-300 for body text on light backgrounds.
14. NEVER stack toasts.
15. NEVER mirror theme state in Zustand.
16. NEVER mix `(app)/` and `(auth)/` route groups.
17. NEVER throw from server actions.
18. NEVER enforce Pro limits client-side only.

---

## 🚨 Stop-and-flag checklist

- [ ] Decision doc exists? → No = stop.
- [ ] Route path matches the route map?
- [ ] Correct route group — `(app)/` vs `(auth)/`?
- [ ] Touch targets ≥ 44 × 44 px?
- [ ] Skeleton state on every async fetch?
- [ ] Dark mode (`dark:`) on every styled element?
- [ ] Focus ring on every interactive element?
- [ ] No hardcoded secrets?
- [ ] `next/image` with width + height?
- [ ] `logApiCall()` after every external AI call?
- [ ] `npm run build` passes?
- [ ] Tested at 375 px?
- [ ] Pro paywall enforced server-side?
- [ ] Server actions return typed results, never throw?
