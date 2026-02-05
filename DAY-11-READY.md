# Day 11 Ready — Post-Review Action Items

**Review Score:** 92/100 — **Ready to proceed with minor cleanup**

---

## ✅ IMMEDIATE PRE-DAY-11 TASKS (15 minutes)

### 1. Delete Legacy `/community` Folder
```bash
rm -rf src/app/\(app\)/community
```
**Why:** New `/campus` folder is the correct one per decision docs. Removes routing ambiguity.

### 2. Replace Placeholder Icons in `src/lib/nav.ts`
**Current issues:**
- Line 63: Maps uses `BarChart3` → should be `Map`
- Line 200: Profile uses `Home` → should be `User`

**Fix:**
```typescript
// Replace at top:
import {
  BarChart3,
  BookOpen,
  Home,
  LogOut,
  Map,           // ← ADD THIS
  MessageSquare,
  Settings,
  HelpCircle,
  MoreVertical,
  Shirt,
  Utensils,
  ShoppingBag,
  Heart,
  User,          // ← ADD THIS
} from "lucide-react";

// Line 63: change
icon: BarChart3,   // ← CHANGE TO
icon: Map,

// Line 200: change
icon: Home,        // ← CHANGE TO
icon: User,
```

**Verification:** Re-run `npm run build` after changes (should still be 0 errors).

---

## 📋 SUPABASE MIGRATIONS (Ready to Apply)

Three migrations are ready to apply in Supabase Studio. These create the database tables needed for API logging + cost tracking.

### How to Apply:

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select DowOS project
3. Go to **SQL Editor** → **New Query**
4. Copy-paste each migration SQL below, run one at a time

**Migration 1: API Usage Log**
```
Location: src/migrations/00002_api_usage_log.sql
Tables: api_usage_log
Indexes: 4
RLS: Yes (admin-only read)
```

**Migration 2: App Events**
```
Location: src/migrations/00003_app_events.sql
Tables: app_events
Indexes: 4
RLS: Yes (CRUD own, admins read all)
```

**Migration 3: Modules & Subjects**
```
Location: src/migrations/00004_modules_subjects.sql
Tables: modules, subjects, subtopics
Seed data: 5 batches + 10 subjects per batch
RLS: Yes (read-only for students)
```

---

## 🚀 DAY 11 BUILD PRIORITIES (in order)

### Task 1: Profile Page (Glassmorphic Card + Photo Upload) — 2 hours
**Location:** `src/app/(app)/profile/page.tsx`

**What to build:**
1. Server component that fetches user profile from Supabase
2. Render glassmorphic card (per `docs/decisions/profile-card-ux.md`):
   - Avatar circle (48px, Pro ring if applicable)
   - User name + email
   - Pro badge (if is_pro=true)
   - Credits balance (from Dow Credits table when available)
3. Photo upload handler:
   - Camera/library picker (bottom sheet on mobile)
   - Client-side circular crop
   - Upload to Supabase Storage (`avatars/<uid>/`)
   - Update users.avatar_url on success
4. Form fields:
   - Edit module/subject
   - Display batch year
   - Display lab group

**Reference:** `docs/decisions/profile-card-ux.md`

**Acceptance criteria:**
- Photo uploads to Supabase Storage
- Avatar renders in Sidebar immediately after upload
- Dark mode works
- 44px touch targets on buttons

---

### Task 2: Admin Route Group Setup — 45 minutes
**Location:** `src/app/(admin)/layout.tsx` (create new)

**What to build:**
1. Admin layout that gates access to non-admins
   - Check user role from Supabase
   - Redirect to `/dashboard` if not admin
2. Admin-only sidebar (different from app sidebar):
   - Dow ID approval queue link
   - Content upload links (MCQ, Viva, Textbook)
   - Analytics dashboard link
3. Keep same NavShell for consistency (or simplified layout)

**Reference:** `docs/decisions/dow-id-approval.md`, `docs/admin-content-upload.md`

**Acceptance criteria:**
- Non-admins redirected to `/dashboard`
- Admins see admin-specific sidebar
- No build errors
- Dark mode works

---

### Task 3: Admin Dashboard Stub Pages — 30 minutes
**Location:** `src/app/(admin)/dow-id-queue/page.tsx`, etc.

**Create stubs for:**
1. `/admin/dow-id-queue` — Dow ID approval queue (see pending IDs, approve/reject)
2. `/admin/content-upload/mcq` — MCQ bulk upload (CSV preview + upload)
3. `/admin/content-upload/viva` — Viva sheet upload (sheet preview + upload)
4. `/admin/content-upload/textbook` — Textbook PDF upload (chunking status)
5. `/admin/analytics` — Dashboard stats (API usage, event logs, user metrics)

**For now:** Skeleton pages with just titles. Will be filled in with logic in Days 12–14.

**Acceptance criteria:**
- All routes respond (no 404s)
- Admin can navigate between pages
- Non-admin access is blocked

---

### Task 4: Dashboard Live Data — Optional (if time permits)
**Location:** `src/app/(app)/dashboard/page.tsx` (modify existing)

**What to wire (optional for Day 11):**
1. Replace exam countdown skeleton with real countdown (fetch from timetable table)
2. Replace timetable skeleton with today's classes (query timetable + filter by date/user)
3. Replace prayers skeleton with real prayer times (use `adhan` npm package)

**Or defer to Days 12–14** if you prefer to focus on UI first.

---

## 📊 VALIDATION CHECKLIST (Before handing to Windsurf/next session)

Before starting Day 12, run through this:

- [ ] Migrations applied in Supabase Studio (3 tables created)
- [ ] Legacy `/community` folder deleted
- [ ] Placeholder icons replaced (Map, User)
- [ ] `npm run build` still succeeds (0 errors)
- [ ] Profile page renders (can upload photo)
- [ ] Admin route group gates non-admins
- [ ] Admin dashboard stubs created
- [ ] All routes respond without 404s
- [ ] Dark mode toggle works on all new pages
- [ ] Responsive layout verified at 375px, 768px, 1024px

---

## 📝 GIT WORKFLOW FOR DAY 11

**Create a feature branch:**
```bash
git checkout -b feature/day-11-profile-admin
```

**Commit after each task:**
```bash
git add .
git commit -m "feat: profile page with photo upload"
git commit -m "feat: admin route group setup"
git commit -m "feat: admin dashboard stubs"
```

**Before handing to Windsurf, push:**
```bash
git push origin feature/day-11-profile-admin
```

**Then open PR** or merge to `main` after review.

---

## 🎯 SUCCESS CRITERIA (Day 11 Complete)

When Day 11 is done, you should have:

✅ **Profile page:**
- Photo uploads to Supabase Storage
- Avatar renders in sidebar + profile page
- Glassmorphic card displays user info
- Dark mode works

✅ **Admin system:**
- Non-admins cannot access `/admin`
- Admins see admin-specific sidebar
- 5 admin pages created (stubs)
- All routes accessible

✅ **Build status:**
- 0 TypeScript errors
- Build time < 15 seconds
- All 26+ routes compiled

✅ **Repo state:**
- Legacy `/community` deleted
- Placeholder icons fixed
- 3+ commits on feature branch
- Ready for Windsurf or next session

---

## 🚀 THEN WHAT? (Days 12–14)

After Day 11, focus shifts to **live data wiring**:

- **Timetable page:** Week view, class details, color-coded by module
- **Attendance page:** Today's classes + mark present/absent, % breakdown
- **Admin dashboard:** Dow ID approval queue, content upload + validation
- **Dashboard widgets:** Wire timetable, announcements, prayers, L&F with real data

By end of Day 16, Phase 2 is complete and ready for Phase 3 (AI Tutor + RAG).

---

## 📞 SUPPORT REFERENCES

**Decision docs to reference during Day 11:**
- `docs/decisions/profile-card-ux.md` — Profile card spec
- `docs/decisions/dow-id-approval.md` — Admin queue spec
- `docs/admin-content-upload.md` — Admin page guidance
- `docs/decisions/ui-page-structure.md` — Page structure reference

**Common patterns to reuse:**
- `src/components/nav/Sidebar.tsx` — Avatar mini-card pattern
- `src/app/(app)/dashboard/page.tsx` — Server component + data fetch pattern
- `src/lib/nav.ts` — Config-driven navigation pattern

---

## 💡 TIPS FOR SMOOTH DAY 11

1. **Test migrations first** — Apply all 3 to Supabase before building UI (verify tables exist)
2. **Use Skeleton components** — For any loading states (matches dashboard pattern)
3. **Dark mode on every element** — No light-mode-only components
4. **44px touch targets** — Verify on mobile (375px viewport)
5. **Copy patterns from existing code** — Use Sidebar photo upload as template
6. **Commit after each feature** — Easier to revert if something breaks
7. **Build + verify after every task** — Don't accumulate errors

---

## 🎉 YOU'RE READY

**92/100 readiness score. Minor cleanup done. All systems go.**

```
Phase 2A (Days 10A–10B): ✅ COMPLETE
├─ Infrastructure (cost tracking, logging)
├─ Navigation (mobile + desktop)
└─ Dashboard + routing

Phase 2B (Day 11): 🎯 READY TO BUILD
├─ Profile page + photo upload
├─ Admin route group + stubs
└─ Dashboard live data (optional)

Phase 2B–C (Days 12–16): 📋 PLANNED
├─ Timetable + Attendance
├─ Admin dashboard
└─ Full integration + polish
```

**Next step:** Clean up (delete `/community`, fix icons), apply migrations, then start Day 11.
