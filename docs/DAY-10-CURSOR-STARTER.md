# Day 10 — Cursor Pro Starter Prompt & File Tags

**Start here when you open Cursor Pro for Phase 2 Day 10 (NavShell + Dashboard).**

---

## Before Opening Cursor

**Prep checklist (10 minutes):**

- [ ] Read `docs/decisions/mobile-web-ui.md` (nav structure, wireframe)
- [ ] Read `docs/decisions/ui-page-structure.md` (dashboard layout, widget order)
- [ ] Check `.cursorrules` exists at repo root (it's auto-read by Cursor)
- [ ] Verify `.env.local` has real Supabase keys (from Session 2)
- [ ] Open Cursor, navigate to `E:\dowos`

---

## Cursor Pro Setup Check

**In Cursor:**
1. **File → Open Folder** → `E:\dowos`
2. **Model picker** (top-right) → select **Claude Sonnet 4.5** (default)
3. **Ctrl+Shift+I** to open Composer (Agent mode)
4. You're ready.

---

## Task 1: Build BottomNav Component

### Prompt (copy-paste into Composer)

```
Build <BottomNav /> in src/components/nav/BottomNav.tsx.

Context:
- Spec: @docs/decisions/mobile-web-ui.md §2 (nav config + wireframe)
- Nav array in .cursorrules lines 80-120
- UI primitives: @src/components/ui/
- Types: @src/types/database.ts

Technical requirements:
- "use client" (client component)
- 5 fixed bottom-nav items: Dashboard, Education, AI Tutor, Campus, Maps
- Active route highlighted in Teal (#00A896)
- Inactive items: Navy-300 (#A5B8D6)
- Icons: Lucide React, 24px size, 1.5px stroke
- Touch targets: 44px minimum (height + padding)
- Dark mode: bg-offwhite light, dark:bg-dark-mode-bg
- Safe-area bottom inset (iPhone notch support)

Build logic:
- Use Next.js usePathname() to detect active route
- Use useRouter() for navigation on click
- Icon color: Teal if active, Navy-300 if inactive
- Label text: always visible below icon
- Export default BottomNav

Do NOT:
- Use fixed positioning directly (use `fixed bottom-0 inset-x-0`)
- Add new npm packages (Lucide already installed)
- Forget dark: color variants
- Use getStaticProps or Pages Router patterns
```

### After Build

1. **Review the diff** — check:
   - ✅ `dark:` classes on all styled elements
   - ✅ 44px touch targets (height + padding)
   - ✅ Lucide icons imported correctly
   - ✅ Uses `usePathname()` in client component
   - ✅ No new packages

2. **Accept** the file

3. **Run:** `npm run build` in terminal

---

## Task 2: Build Sidebar Component

### Prompt (copy-paste into Composer)

```
Build <Sidebar /> in src/components/nav/Sidebar.tsx.

Context:
- Spec: @docs/decisions/mobile-web-ui.md §2 (sidebar layout)
- Nav config: @.cursorrules lines 85-120
- Existing nav patterns: @src/components/nav/BottomNav.tsx
- Profile card spec: @docs/decisions/profile-card-ux.md
- UI primitives: @src/components/ui/

Technical requirements:
- "use client"
- Desktop sidebar: visible on 1024px+, hidden on mobile
- Fixed width: 280px or per .cursorrules (check the doc)
- Sections: Main (Dashboard), Study (Education sub-items), Campus (all campus features), Identity (Profile, Settings), System (Admin role-gated, Help)
- Active route indicator: left border Teal + bold label
- Avatar mini-card at top: 48px circle, gold border if Pro, navy border if Free
- Dark mode: bg-offwhite light, dark:bg-dark-mode-bg
- Each nav item: 44px touch target

Build logic:
- Display flat nav tree (no nested accordions — spec is flat)
- Role-gated Admin link (read role from user session)
- Active route detected via usePathname()
- Avatar click opens dropdown (Settings, Logout, Help)

Do NOT:
- Make it nested/accordion-style (spec says flat)
- Forget Pro vs Free avatar border color
- Add admin link for non-admins
```

### After Build

1. **Review the diff**
2. **Accept**
3. **Run:** `npm run build`

---

## Task 3: Build NavShell (Responsive Wrapper)

### Prompt

```
Build <NavShell /> in src/components/nav/NavShell.tsx.

Context:
- Decision: @docs/decisions/mobile-web-ui.md §2
- BottomNav: @src/components/nav/BottomNav.tsx
- Sidebar: @src/components/nav/Sidebar.tsx

Technical requirements:
- "use client"
- Responsive logic: show BottomNav on mobile (<1024px), Sidebar on desktop (≥1024px)
- Single children prop — all pages render the same content inside NavShell
- Sidebar takes fixed 280px on desktop; main content fills remaining width
- BottomNav is fixed at bottom on mobile
- Main content area: position relative (or flex child) to fill available space

Build logic:
- Use next/navigation useMediaQuery or Tailwind responsive classes
- Sidebar wrapper: hidden on mobile, block on desktop via Tailwind `hidden md:block` pattern
- BottomNav wrapper: block on mobile, hidden on desktop
- Return JSX with {children} in the content area

Do NOT:
- Use external media query libraries (useMediaQuery is problematic in Next.js)
- Instead use Tailwind responsive classes on the wrapper divs
- Forget the fixed 280px sidebar width calculation
```

### After Build

1. **Review the diff**
2. **Accept**
3. **Run:** `npm run build`

---

## Task 4: Wire NavShell into (app)/layout.tsx

### Prompt

```
Update src/app/(app)/layout.tsx to use NavShell.

Context:
- Spec: @docs/decisions/ui-page-structure.md
- NavShell: @src/components/nav/NavShell.tsx
- Current layout: @src/app/(app)/layout.tsx

Technical requirements:
- Keep: theme provider, session validation, auth guard (middleware already handles it)
- Add: import NavShell from "@/components/nav/NavShell"
- Wrap children with <NavShell>{children}</NavShell>
- Main content area inside NavShell should be full width on mobile, flex-grow on desktop

Build logic:
- Import NavShell
- Replace bare {children} with <NavShell>{children}</NavShell>
- Test mobile + desktop layout

Do NOT:
- Remove existing theme provider or session setup
- Add new middleware (middleware.ts already exists)
- Forget the children prop
```

### After Build

1. **Review the diff**
2. **Accept**
3. **Run:** `npm run build`

---

## Task 5: Dashboard Skeleton Page

### Prompt

```
Build Dashboard skeleton at src/app/(app)/dashboard/page.tsx.

Context:
- Spec: @docs/decisions/ui-page-structure.md §3 (dashboard layout)
- Design: @docs/decisions/profile-card-ux.md (greeting, UX conventions)
- Widgets: time-aware greeting, exam countdown, timetable mini, attendance, announcements, prayers, L&F

Technical requirements:
- Server component (default export)
- Fetch user + session on server (use createServerClient)
- Time-aware greeting: "Good morning/afternoon/evening [First Name]" using Asia/Karachi timezone
- Skeleton structure:
  * Greeting (text only, no card)
  * Exam countdown (placeholder)
  * Timetable mini (6 row skeleton)
  * Attendance quick-mark (2 row skeleton)
  * Announcements (4 row skeleton)
  * Prayers (4 row skeleton)
  * L&F (3 row skeleton)
- Each widget uses shadcn Skeleton for loading state
- No actual data wired yet — just layout

Do NOT:
- Fetch actual data (stubs only)
- Add buttons yet (just layout)
- Forget skeleton animations (motion-safe:animate-pulse per .cursorrules)
```

### After Build

1. **Review the diff**
2. **Accept**
3. **Run:** `npm run build`

---

## File List Cursor Will Touch

```
src/components/nav/BottomNav.tsx          (NEW)
src/components/nav/Sidebar.tsx            (NEW)
src/components/nav/NavShell.tsx           (NEW)
src/app/(app)/layout.tsx                  (MODIFY)
src/app/(app)/dashboard/page.tsx          (NEW)
```

---

## After All Tasks Complete

1. **Run:** `npm run build`
2. **Expected:** 0 TypeScript errors, build succeeds
3. **If errors:** Paste exact error output back into Composer
4. **Test locally:**
   - Open http://localhost:3000
   - Should redirect to /login (no session)
   - Sign up, complete onboarding
   - /dashboard should show NavShell + greeting + skeleton widgets
   - Resize to mobile — BottomNav visible, Sidebar hidden
   - Resize to desktop (1024px) — Sidebar visible, BottomNav hidden

---

## Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails: `Cannot find module @/components/nav/...` | Files weren't created. Re-prompt: "The BottomNav file is missing. Create it at..." |
| Dark mode not working | Check: does BottomNav have `dark:bg-...` classes? Does NavShell properly pass dark class to children? |
| Mobile layout broken | Check: is BottomNav fixed at bottom-0? Is NavShell hiding/showing sidebar correctly at 1024px? |
| Types failing | Check: Supabase types loaded? Run: `npm run build` again (sometimes needs 2nd pass). |
| Cursor hit token limit | Close Composer, start fresh. It'll remember the files already created. |

---

## Key Differences from Session 6 Windsurf Build

- **Cursor is faster** at multi-file work (Composer sees all files at once)
- **Always @-mention** the decision doc — Cursor doesn't infer your spec
- **Review file-by-file** before accepting all at once
- **Use Sonnet for Day 10** (simpler UI builds) — Opus not needed yet
- **Build after every task** to catch errors early

---

## Expected Timeline

- Task 1 (BottomNav): ~10 min (Composer), ~5 min (review + build)
- Task 2 (Sidebar): ~10 min, ~5 min
- Task 3 (NavShell): ~8 min, ~3 min
- Task 4 (Layout wiring): ~5 min, ~2 min
- Task 5 (Dashboard skeleton): ~15 min, ~5 min

**Total: ~45 min active Composer time + ~20 min review/build = ~65 minutes.**

If all goes clean, you're shipping NavShell + Dashboard skeleton by midday Day 10.

---

## Next Up (Afternoon Day 10 or Day 11)

- Profile page (glassmorphic card + photo upload form)
- Photo upload handler (camera/library picker → Supabase Storage)
- Admin dashboard skeleton (Dow ID approval queue)

See `docs/cursor-pro-strategy.md` §7 for the full Day-10 schedule.

---

**You're ready. Open Cursor Pro, copy the prompt above, and build.**
