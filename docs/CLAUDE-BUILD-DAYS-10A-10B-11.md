# Claude Build Sprint: Days 10A, 10B, 11 (Phase 2A + Phase 2B Part 1)

**Goal:** Complete all Phase 2A (tooling + infrastructure) + Phase 2B part 1 (NavShell + Dashboard skeleton) in one continuous session with Claude Code Opus.

**Scope:** 16 files touched, 7 migrations, 3 utility libs, 2 components library, nav config, dashboard page.

**Expected output:** Fully responsive NavShell + working Dashboard, all infra in place, ready for Day 11 (Profile + Admin).

---

## What We're Building

### Phase 2A: Tooling & Infrastructure (Day 10A, ~2 hours)

**Infrastructure setup (no coding yet, just config):**
1. Sentry installation + configuration
2. Resend account verification
3. npm packages: `adhan`, `hijri-converter`

**Core utility libraries (Salik will code these with Claude):**
1. `src/lib/api-rates.ts` — Cost lookup table (per-model $ per 1K tokens)
2. `src/lib/api-logger.ts` — `logApiCall()` helper + database insert logic

**Supabase migrations (SQL, Salik will write with Claude):**
1. `src/migrations/00002_api_usage_log.sql` — API call tracking table + RLS (admin-only read)
2. `src/migrations/00003_app_events.sql` — User action events (login, logout, ID upload) + RLS
3. `src/migrations/00004_modules_subjects.sql` — Module + Subject lookup tables + RLS (read-only for students)

**Files created in 2A:**
```
src/lib/api-rates.ts
src/lib/api-logger.ts
src/migrations/00002_api_usage_log.sql
src/migrations/00003_app_events.sql
src/migrations/00004_modules_subjects.sql
src/instrumentation.ts (Sentry)
```

---

### Phase 2B: NavShell + Dashboard (Days 10B + 11, ~4 hours)

**Components & pages:**
1. `src/lib/nav.ts` — Navigation configuration (5 mobile items + 5 sidebar sections, role-gated)
2. `src/components/nav/BottomNav.tsx` — Mobile fixed bottom, 5 items, Teal active highlight, 44px tall, safe-area
3. `src/components/nav/Sidebar.tsx` — Desktop fixed sidebar (280px), 5 sections, role gates, avatar mini-card
4. `src/components/nav/NavShell.tsx` — Responsive wrapper, hides/shows BottomNav/Sidebar at 1024px breakpoint
5. `src/app/(app)/layout.tsx` — Wire NavShell + dark-mode provider
6. `src/app/(app)/dashboard/page.tsx` — Time-aware greeting + 6 skeleton widgets (timetable, attendance, announcements, prayers, L&F, exam countdown)

**Files created in 2B:**
```
src/lib/nav.ts
src/components/nav/BottomNav.tsx
src/components/nav/Sidebar.tsx
src/components/nav/NavShell.tsx
src/app/(app)/layout.tsx (MODIFY)
src/app/(app)/dashboard/page.tsx
```

**Stub pages (empty route shells, 1 line each):**
```
src/app/(app)/education/page.tsx
src/app/(app)/ai/page.tsx
src/app/(app)/campus/page.tsx
src/app/(app)/maps/page.tsx
src/app/(app)/profile/page.tsx
src/app/(app)/settings/page.tsx
src/app/(app)/help/page.tsx
src/app/(admin)/page.tsx (service-role gated redirect)
```

---

## What I Need from You (Checklist)

### Before We Start Building

**✅ Account / API Setup (You do these, takes ~15 min):**
1. [ ] **Sentry:** Go to [sentry.io](https://sentry.io), sign up/login
   - Create a new project: Next.js
   - Copy the DSN (looks like `https://xxx@xxx.ingest.sentry.io/xxx`)
   - Add to `.env.local`: `NEXT_PUBLIC_SENTRY_DSN=<your-dsn>`

2. [ ] **Resend:** Go to [resend.com](https://resend.com), sign up/login
   - Copy your API key
   - Add to `.env.local`: `RESEND_API_KEY=<your-key>`

3. [ ] **Verify current `.env.local`** has these (already should from Session 2):
   - `NEXT_PUBLIC_SUPABASE_URL=<your-url>`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>`
   - `SUPABASE_SERVICE_ROLE_KEY=<your-key>`

### What I'll Code (You just confirm)

**✅ All code files** (I write with Opus)

**✅ All SQL migrations** (I write, you review + run in Supabase Studio)

**✅ `.env.local` additions** (you'll add 2 keys from Sentry + Resend)

---

## Step-by-Step Execution Plan

### Phase 2A: Infrastructure (Claude will write)

1. **`src/lib/api-rates.ts`**
   - Export `RATE_LIMITS` object with per-model costs
   - Models: Gemini Flash, Gemini Flash-Lite, DeepSeek R1, Groq Whisper, Google TTS
   - Format: `{ model: { input: $, output: $, ... } }`

2. **`src/lib/api-logger.ts`**
   - Export `logApiCall()` function
   - Takes: `(model, feature, cost, tokens)` → inserts to `api_usage_log` table
   - Server-only (use `'use server'`)
   - Error handling: log to Sentry if DB insert fails

3. **SQL Migrations** (I write, you run in Supabase Studio)
   - `00002_api_usage_log.sql`: Table schema + indexes + RLS (admin-only read, no write)
   - `00003_app_events.sql`: Table + RLS (students insert own, read all)
   - `00004_modules_subjects.sql`: Lookup tables, RLS (read-only for authenticated users)

4. **`src/instrumentation.ts`** (Sentry init)
   - Import from `@sentry/nextjs`
   - Wire DSN from `.env.local`
   - Export function for Next.js to call on startup

### Phase 2B: UI Components (Claude will write)

5. **`src/lib/nav.ts`**
   - Define `MOBILE_NAV_ITEMS` array
   - Define `SIDEBAR_SECTIONS` nested structure
   - Each item: `{ label, href, icon, requiresAuth, requiresAdmin, requiresPro }`

6. **`src/components/nav/BottomNav.tsx`**
   - Client component
   - Map `MOBILE_NAV_ITEMS` to buttons
   - Active route detection via `usePathname()`
   - 44px tall + safe-area-inset-bottom
   - Dark mode support

7. **`src/components/nav/Sidebar.tsx`**
   - Client component
   - Map `SIDEBAR_SECTIONS` to section headers + links
   - Avatar mini-card at top (Pro ring if needed)
   - Settings/Help/Logout bottom sheet trigger
   - Active route highlight (left border Teal)
   - Dark mode support

8. **`src/components/nav/NavShell.tsx`**
   - Client component (use Tailwind responsive classes, no JS media query)
   - Hidden on mobile, visible on desktop: `hidden md:flex`
   - Sidebar + main content layout

9. **`src/app/(app)/layout.tsx`** (MODIFY existing)
   - Import `NavShell` + `ThemeProvider`
   - Wrap `{children}` with `<NavShell>{children}</NavShell>`
   - Keep existing auth guard from middleware

10. **`src/app/(app)/dashboard/page.tsx`**
    - Server component (default)
    - Fetch user + session
    - Time-aware greeting (use `Asia/Karachi` timezone)
    - Render 6 widget skeletons (timetable, attendance, announcements, prayers, L&F, exam countdown)
    - Layout: vertical stack on mobile, 2-column grid on desktop

11. **Stub pages** (8 empty route shells)
    - Each one: `export default function Page() { return <div>Coming soon</div> }`

---

## Key Technical Decisions (Already Locked, Just FYI)

- **Nav config:** Data-driven (all items in `nav.ts`), not hardcoded in JSX
- **Dark mode:** `next-themes` already installed, `dark:` Tailwind classes
- **Responsive:** Tailwind `md:` breakpoint at 768px, sidebar appears at `lg:` (1024px)
- **Touch targets:** 44px minimum (Tail wind spacing: `h-11` = 44px, or `py-3` + text = 44px)
- **Icons:** Lucide React (already installed), 24px size
- **RLS:** All tables have row-level security on Supabase
- **Server vs Client:** Migrations + api-logger are server-only, nav components are client

---

## Success Criteria (We'll Validate)

✅ Sentry DSN in `.env.local` and no console errors
✅ Resend API key in `.env.local` and verifiable
✅ `npm run build` = 0 errors
✅ BottomNav renders on mobile (375px), 5 items clickable
✅ Sidebar renders on desktop (1024px+), 5 sections visible, role gates work
✅ NavShell responsive switch works (resize to 375px → bottom nav, 1024px → sidebar)
✅ Dark mode toggle works (sidebar button or system preference)
✅ Dashboard page loads, shows time-aware greeting, skeletons visible
✅ All 8 stub pages respond with 200 (no 404s)
✅ Migrations run in Supabase Studio without errors
✅ `api_usage_log` + `app_events` tables exist + RLS policies applied

---

## Files Modified / Created Summary

| File | Status | Purpose |
|------|--------|---------|
| `.env.local` | MODIFY | Add Sentry DSN + Resend API key |
| `src/lib/api-rates.ts` | NEW | Cost lookup table |
| `src/lib/api-logger.ts` | NEW | `logApiCall()` helper |
| `src/instrumentation.ts` | NEW | Sentry init |
| `src/migrations/00002_api_usage_log.sql` | NEW | Migration |
| `src/migrations/00003_app_events.sql` | NEW | Migration |
| `src/migrations/00004_modules_subjects.sql` | NEW | Migration |
| `src/lib/nav.ts` | NEW | Navigation config |
| `src/components/nav/BottomNav.tsx` | NEW | Component |
| `src/components/nav/Sidebar.tsx` | NEW | Component |
| `src/components/nav/NavShell.tsx` | NEW | Component |
| `src/app/(app)/layout.tsx` | MODIFY | Wire NavShell |
| `src/app/(app)/dashboard/page.tsx` | NEW | Dashboard page |
| `src/app/(app)/education/page.tsx` | NEW | Stub |
| `src/app/(app)/ai/page.tsx` | NEW | Stub |
| `src/app/(app)/campus/page.tsx` | NEW | Stub |
| `src/app/(app)/maps/page.tsx` | NEW | Stub |
| `src/app/(app)/profile/page.tsx` | NEW | Stub |
| `src/app/(app)/settings/page.tsx` | NEW | Stub |
| `src/app/(app)/help/page.tsx` | NEW | Stub |
| `src/app/(admin)/page.tsx` | NEW | Stub (admin route group) |

---

## Timeline

**Phase 2A Infrastructure:** ~2 hours
- Setup: 15 min (Sentry, Resend, npm install)
- Code: 30 min (api-rates.ts, api-logger.ts, instrumentation.ts)
- Migrations: 45 min (SQL + review)
- Build + test: 30 min

**Phase 2B UI:** ~4 hours
- Nav config + components: 90 min
- Layout wiring: 30 min
- Dashboard page: 45 min
- Stub pages: 15 min
- Build + responsive test: 60 min

**Total:** ~6 hours (might compress to 5 with good momentum)

---

## When to Stop & Verify

At the end of each phase:

**After 2A:**
- `npm run build` passes
- `.env.local` has Sentry DSN + Resend key
- Migrations apply in Supabase Studio
- `api_usage_log` table exists in Supabase + has RLS policies

**After 2B:**
- `npm run dev` starts without errors
- Navigate to `http://localhost:3000` → redirects to `/login`
- Sign up + onboarding → lands on `/dashboard`
- NavShell visible (sidebar on desktop, bottom nav on mobile)
- Dark mode toggle works
- All 8 stub pages respond with 200

---

## Notes for Continuity

- **Decision docs to reference:** `docs/decisions/mobile-web-ui.md`, `docs/decisions/ui-page-structure.md`, `docs/decisions/profile-card-ux.md`
- **Design tokens:** All in `.cursorrules` + `docs/4_DESIGN_SYSTEM.md`
- **Existing auth:** Already working from Session 2
- **Next after this:** Days 12+ (Timetable, Attendance, Admin dashboard)
