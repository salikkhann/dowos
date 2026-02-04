# Decision: Mobile vs Web UI Architecture

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Day 4 decision sprint (extended)

---

## 1. What was already locked (do not re-debate)

| Item | Decision |
|---|---|
| Framework | Next.js 15 App Router |
| Mobile delivery | Capacitor native shell (Day 7 pending, but Capacitor is the leading candidate) |
| Mobile-first viewport | 375 px min; touch targets ≥ 44 × 44 px |
| Nav structure | Bottom nav (mobile) / sidebar (desktop) — confirmed in Phase 2 todo |
| AI Tutor | Own top-level nav item |
| Education | One tab, cards grid inside (see `education-tab.md`) |

---

## 2. What this doc resolves

Both mobile and desktop are first-class experiences — roughly equal usage split. But they are **not the same screen**. Students use the phone for quick drills and the Point map. They use the laptop for longer AI Tutor sessions and MCQ study runs. The nav structure diverges between the two: mobile has a compact 5-item bottom nav; desktop sidebar expands Education sub-features into top-level sidebar items because students stay longer and want direct access.

**Questions this doc resolves:**

1. What are the exact nav items on mobile vs desktop?
2. How much of the component tree is shared vs platform-specific?
3. Where does the layout split happen in the Next.js route tree?
4. How does the desktop sidebar "expand Education" without duplicating routes or components?

---

## 3. Nav item comparison — mobile vs desktop

### Mobile bottom nav (5 items, always visible)

| # | Label | Icon (Lucide) | Route |
|---|---|---|---|
| 1 | Dashboard | `layout-dashboard` | `/dashboard` |
| 2 | Education | `book-open` | `/education` |
| 3 | AI Tutor | `sparkles` | `/ai` |
| 4 | Community | `users` | `/community` |
| 5 | Maps | `map-pin` | `/maps` |

That's it. Five items. Fits a 375 px screen with ≥ 44 px touch targets each. Everything else is reachable from within these five.

### Desktop sidebar (expanded)

The sidebar has two sections: **Main** (always visible) and **Study** (the Education sub-features, expanded into the sidebar). Plus a **System** section at the bottom for admin/settings/help.

```
┌── Sidebar ──────────────────────┐
│                                 │
│  DowOS logo + dark-mode toggle  │
│                                 │
│  ── Main ──                     │
│  📊  Dashboard          [/dashboard]
│  🤖  AI Tutor           [/ai]
│                                 │
│  ── Study ──                    │  ← Education sub-features, flat
│  📝  MCQ Solver         [/education/mcq]
│  🎤  Viva Bot           [/education/viva]
│  📊  Progress           [/education/progress]
│  🔖  Saved Questions    [/education/saved]       ← Phase 2
│  ⚡  Quick Summaries    [/education/summaries]   ← Phase 2
│  🃏  Flashcards         [/education/flashcards]  ← Phase 2
│                                 │
│  ── Explore ──                  │
│  👥  Community          [/community]
│  📍  Maps               [/maps]
│                                 │
│  ── System ──                   │  ← desktop-only extras
│  ⚙️  Settings           [/settings]
│  👤  Profile            [/profile]
│  🛡️  Admin              [/admin]      ← role-gated, hidden if not admin
│  ❓  Help               [/help]
│                                 │
└─────────────────────────────────┘
```

**Why "Study" flattens Education sub-features on desktop:**
Students using a laptop are in a study session. They're drilling MCQs, checking progress, reviewing saved questions — switching between these rapidly. One tap to each feature, no intermediate "Education landing" screen to click through. The Education cards grid (`/education`) still exists as a route (mobile lands there) but desktop nav skips it entirely and links directly to the sub-pages.

**Why the sidebar sections are ordered Main → Study → Explore → System:**
Priority order matches usage frequency. Dashboard and AI Tutor are accessed constantly (Main). Study tools are accessed during active sessions (Study). Community and Maps are accessed occasionally (Explore). Admin/settings are rare (System). Visual hierarchy by section, not alphabetical.

---

## 4. Component sharing strategy — the rule

> **One component tree. Two layout wrappers.**

Every page, card, form, and drill screen is written once. The layout shell — nav chrome, spacing, max-width — is what changes between mobile and desktop. This is the standard Next.js responsive pattern: a single `(app)/layout.tsx` that renders either a bottom nav or a sidebar based on viewport width.

```
src/app/(app)/
├── layout.tsx            ← THE layout split lives here
│     detects viewport (or uses a media-query-driven approach)
│     mobile  → renders <BottomNav />  + content in full-width column
│     desktop → renders <Sidebar />    + content in sidebar-offset column
│
├── dashboard/page.tsx    ← same component, rendered inside either layout
├── education/page.tsx    ← same component
├── ai/page.tsx           ← same component
└── …
```

No duplicated pages. No `/mobile/` vs `/desktop/` route trees. The page components don't know or care which nav is wrapping them.

### What IS platform-specific (and why)

| Thing | Mobile behaviour | Desktop behaviour | Why |
|---|---|---|---|
| Nav chrome | Bottom nav, 5 items | Sidebar, grouped sections | Different input targets, different screen real estate |
| Education landing | Cards grid (full screen) | Skipped — sidebar links directly to sub-pages | Desktop users don't need the intermediate screen |
| Map screens | Full-bleed (no sidebar eating horizontal space) | Sidebar + map side by side (sidebar is narrow, map fills remaining width) | Maps need horizontal space; sidebar is only ~240 px |
| Bottom sheet (tap-a-stop, tap-a-room) | Slides up from bottom | Becomes a right-side panel or a modal | Bottom sheets don't work on desktop — no "bottom" in a sidebar layout |
| Touch targets | ≥ 44 × 44 px everywhere | Standard cursor targets (no minimum enforced) | Mobile is touch; desktop is pointer |

### What is NOT platform-specific (shared 1:1)

- Every card component (Education cards, Lost & Found cards, Marketplace cards)
- Every form (signup, profile, search inputs)
- Every drill screen (MCQ drill, Viva session, flashcard flip)
- Every data table / list (timetable, attendance, content list)
- Every modal / dialog (confirmations, Pro paywall CTA)
- All Zustand stores, TanStack Query hooks, and API calls

---

## 5. The layout split — implementation detail

The split in `(app)/layout.tsx` is driven by a **CSS media query + a client component for the nav**, not by JavaScript viewport detection at render time. This matters for Next.js: Server Components can't run `window.innerWidth`. The layout stays a Server Component; only the nav chrome is a `'use client'` leaf.

```
(app)/layout.tsx  (Server Component)
│
├── <main> wrapper (Server Component — renders children)
│
└── <NavShell />  ('use client' leaf)
      ├── on mobile (< 1024 px): renders <BottomNav />
      └── on desktop (≥ 1024 px): renders <Sidebar />
```

`<NavShell>` uses a `useMediaQuery` hook (or CSS-only show/hide with `md:` breakpoints) to switch between the two nav components. The `<main>` content area has responsive padding:
- Mobile: `px-4`, full width
- Desktop: `ml-60` (sidebar width offset), `max-w-4xl mx-auto` for content pages; full remaining width for maps

### Sidebar nav items — how "Study" section is built

The sidebar nav is driven by a config array. Each item has: `label`, `icon`, `route`, `section`, `roleGate` (optional). The `<Sidebar>` component groups items by `section` and renders a section header + item list per group. Adding a Phase 2 feature to the sidebar is one object in the config array — no JSX changes.

```typescript
// src/config/nav.ts
export const sidebarItems = [
  { section: 'Main',    label: 'Dashboard',      icon: 'layout-dashboard', route: '/dashboard' },
  { section: 'Main',    label: 'AI Tutor',       icon: 'sparkles',         route: '/ai' },
  { section: 'Study',   label: 'MCQ Solver',     icon: 'file-text',        route: '/education/mcq' },
  { section: 'Study',   label: 'Viva Bot',       icon: 'mic',              route: '/education/viva', roleGate: 'pro' },
  { section: 'Study',   label: 'Progress',       icon: 'bar-chart-3',      route: '/education/progress' },
  // Phase 2 — uncomment when built:
  // { section: 'Study', label: 'Saved Questions', icon: 'bookmark',       route: '/education/saved' },
  // { section: 'Study', label: 'Quick Summaries', icon: 'zap',            route: '/education/summaries' },
  // { section: 'Study', label: 'Flashcards',      icon: 'layers',         route: '/education/flashcards' },
  { section: 'Explore', label: 'Community',      icon: 'users',            route: '/community' },
  { section: 'Explore', label: 'Maps',           icon: 'map-pin',          route: '/maps' },
  { section: 'System',  label: 'Settings',       icon: 'settings',         route: '/settings' },
  { section: 'System',  label: 'Profile',        icon: 'user',             route: '/profile' },
  { section: 'System',  label: 'Admin',          icon: 'shield',           route: '/admin', roleGate: 'admin' },
  { section: 'System',  label: 'Help',           icon: 'help-circle',      route: '/help' },
];

export const bottomNavItems = [
  { label: 'Dashboard',  icon: 'layout-dashboard', route: '/dashboard' },
  { label: 'Education',  icon: 'book-open',        route: '/education' },
  { label: 'AI Tutor',   icon: 'sparkles',         route: '/ai' },
  { label: 'Community',  icon: 'users',            route: '/community' },
  { label: 'Maps',       icon: 'map-pin',          route: '/maps' },
];
```

`roleGate: 'admin'` hides the item entirely if the user doesn't have the admin role. `roleGate: 'pro'` shows the item but renders it with a lock indicator (same pattern as the Viva Bot card in Education).

---

## 6. Mobile-specific patterns

### Profile access on mobile

Settings, Profile, and Help don't live in the bottom nav. They're accessed via an **avatar tap** in the top-right corner of every screen (a persistent header element on mobile). Tapping the avatar opens a bottom sheet with:

- User's name + roll number
- Pro status badge (or "Upgrade" CTA)
- Links: Settings, Profile, Help, Logout

### Bottom sheets vs modals

On mobile, contextual actions slide up as bottom sheets (shadcn `sheet` component, `side="bottom"`). On desktop, the same actions render as modals (`sheet` with `side="right"` or a standard `dialog`). The parent component passes a `side` prop based on viewport — the child sheet/dialog component is shared.

### Back navigation

Mobile: every sub-page has a back arrow in the top-left header. This is a client-side `router.back()` — no full page reload.
Desktop: back navigation is less critical because the sidebar is always visible. Sub-pages still have a back arrow for consistency, but it's visually de-emphasised (lighter weight, smaller).

---

## 7. Desktop-specific patterns

### Sidebar active state

The currently active route gets a Teal left border + light Teal background fill on its sidebar item. Implemented via Next.js `usePathname()` — compare current path to each item's `route`. Partial match for nested routes (e.g. `/education/mcq/drill` highlights the "MCQ Solver" item).

### Map layout on desktop

The sidebar is always visible. Maps need horizontal space. Solution: on the Maps route, the `<main>` content area renders the map as `w-full h-screen` relative to the sidebar-offset column. The sidebar stays open — students can tap "Maps" in the sidebar and then tap another sidebar item without losing orientation.

---

## 8. What to build and when

The layout shell is Phase 2 work (Days 10–14). It's the first thing that ships after auth because every subsequent page needs it.

| Day | Work item |
|---|---|
| 10 | Build `<BottomNav />`: 5 items, active-route highlight via `usePathname()`, fixed to viewport bottom, 44 px tall, safe-area inset for iPhone notch. |
| 10 | Build `<Sidebar />`: config-driven from `nav.ts`. Section headers. Active-route highlight (Teal left border). Role-gated items hidden if user lacks role. |
| 11 | Build `<NavShell />`: the `'use client'` leaf that renders BottomNav or Sidebar based on viewport. Wire into `(app)/layout.tsx`. |
| 11 | Build mobile profile avatar + bottom sheet (Settings / Profile / Help / Logout links). |
| 12 | Stub all nav links to their existing (empty) route pages. Verify routing works end-to-end on both mobile and desktop. |
| 12 | Dark-mode: verify both nav components respect the theme toggle (already installed via next-themes). |
| 13 | Responsive QA: resize from 375 px → 1440 px. Verify the switch point (1024 px) is clean. Check that no nav items overflow or overlap at any breakpoint. |

---

## 9. Sources consulted

- `docs/decisions/education-tab.md` — Education sub-feature list (defines what "Study" section contains)
- `docs/decisions/maps-platform.md` — maps layout needs (horizontal space)
- `docs/4_DESIGN_SYSTEM.md` — design tokens, component primitives
- `docs/roadmap-day-by-day.md` — Phase 2 scope (Days 10–16)
- Skills consulted: `nextjs-app-router-patterns`, `react-patterns`, `tailwind-design-system`
