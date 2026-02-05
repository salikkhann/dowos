# Decision: UI Page Structure — all screens

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Day 4 decision sprint (extended)

---

## 1. What was already locked (do not re-debate)

| Item | Source |
|---|---|
| Nav: 5-item mobile bottom nav / grouped desktop sidebar | `mobile-web-ui.md` |
| Education tab: cards grid, AI Tutor is its own nav item | `education-tab.md` |
| Maps: Point map (bus) + Campus map (indoor) | `maps-platform.md` |
| shadcn components installed | `badge`, `button`, `card`, `input`, `label`, `sheet`, `skeleton`, `tooltip` |
| Design tokens | Navy `#1A2B4C`, Teal `#00A896`, Gold `#D4A574`, Red `#E74C3C`, Offwhite `#F5F5F7` |
| Fonts | Outfit Bold (headings), Inter (body), JetBrains Mono (metrics) |
| Icons | Lucide React, 24 px, 1.5 px stroke |

---

## 2. Nav restructure — Community → Campus

The mobile bottom nav item "Community" is renamed to **Campus**. It now owns all campus-life features: DowEats, Merch, Marketplace, Lost & Found, and Prayer Times.

### Updated nav — mobile bottom nav

| # | Label | Icon | Route |
|---|---|---|---|
| 1 | Dashboard | `layout-dashboard` | `/dashboard` |
| 2 | Education | `book-open` | `/education` |
| 3 | AI Tutor | `sparkles` | `/ai` |
| 4 | Campus | `building-2` | `/campus` |
| 5 | Maps | `map-pin` | `/maps` |

### Updated nav — desktop sidebar

```
── Main ──
  Dashboard          [/dashboard]
  AI Tutor           [/ai]

── Study ──                          (see education-tab.md)
  MCQ Solver         [/education/mcq]
  Viva Bot           [/education/viva]       🔒 Pro — module → subject. Anki Mode (Free) is a mode inside this entry, not a separate nav item (/education/viva/anki)
  Progress           [/education/progress]

── Campus ──                         ← replaces "Explore" section
  Lost & Found       [/campus/lost-found]
  Prayer Times       [/campus/prayers]
  DowEats            [/campus/doweats]        ← Phase 2 revenue
  Merch              [/campus/merch]          ← Phase 2 revenue
  Marketplace        [/campus/marketplace]    ← Phase 2 revenue
  Maps               [/maps]

── System ──                         (unchanged)
  Settings, Profile, Admin, Help
```

Desktop sidebar expands Campus sub-features flat (same pattern as Study expanding Education). Students on laptop browsing Lost & Found or prayer times get direct access.

---

## 3. Dashboard — the landing screen

The first screen after login. A single scrolling page of widgets. No tabs, no sub-nav — just a vertical stack. Order is priority: most time-sensitive at the top.

### 3.1 Widget stack (top → bottom)

The greeting is time-aware and uses the student's **first name only** (warmer, shorter on mobile). Time ranges are Asia/Karachi (UTC+5). Full greeting spec in `profile-card-ux.md` §3.1.

| Time (IST) | Text |
|---|---|
| 04:00 – 11:59 | Good morning, [First name] |
| 12:00 – 16:59 | Good afternoon, [First name] |
| 17:00 – 20:59 | Good evening, [First name] |
| 21:00 – 03:59 | Good night, [First name] |

```
┌─────────────────────────────────────┐
│  Good morning, [First name]         │  ← time-aware greeting (see table above)
│  Batch 3 · Lab Group B              │  ← from user profile
├─────────────────────────────────────┤
│                                     │
│  ┌─ EXAM COUNTDOWN ───────────────┐ │
│  │  📚 Anatomy                    │ │  ← current module
│  │  Final exam in  14 days        │ │  ← countdown, Red if ≤ 7 days
│  │  Exam-readiness: 62%  [████░░] │ │  ← Pro feature; hidden if free
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ TODAY'S TIMETABLE ──────────┐   │
│  │  ⏰ Next class               │   │
│  │  Physiology · 10:30 AM       │   │
│  │  Lecture Hall 2              │   │
│  │  [Mark Present] [Mark Absent]│   │  ← tap buttons mark attendance directly
│  │                              │   │     (no need to open full timetable)
│  │  After that: Biochem 12:00   │   │  ← next-next class, compact
│  │  [View full timetable →]     │   │  ← taps into /dashboard/timetable
│  └──────────────────────────────┘   │
│                                     │
│  ┌─ ATTENDANCE WARNING ─────────┐   │  ← only shown if any module is danger
│  │  ⚠️  Surgery: 68% (min 75%) │   │
│  │  You need 4 more classes     │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌─ ANNOUNCEMENTS ──────────────┐   │
│  │  📢 Exam schedule updated    │   │  ← latest 2-3, audience-filtered
│  │     Posted 2 hours ago       │   │
│  │  📢 Library hours change     │   │
│  │     Posted yesterday         │   │
│  │  [See all →]                 │   │  ← taps into /campus/announcements
│  └──────────────────────────────┘   │
│                                     │
│  ┌─ PRAYER TIMES ───────────────┐   │
│  │  🕌 Fajr  05:12  ✓           │   │  ← checkmark if time has passed
│  │     Maghrib  06:15            │   │  ← next upcoming prayer, bold
│  │  [Full prayer page →]        │   │  ← taps into /campus/prayers
│  └──────────────────────────────┘   │
│                                     │
│  ┌─ LOST & FOUND ───────────────┐   │
│  │  🔍 iPhone 15 — lost near    │   │  ← latest 2-3 posts
│  │     library (2h ago)         │   │
│  │  🔍 Blue water bottle        │   │
│  │  [See all →]                 │   │  ← taps into /campus/lost-found
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 3.2 Widget visibility rules

| Widget | Shown when | Hidden when |
|---|---|---|
| Exam Countdown | Student has an upcoming exam in the next 60 days | No upcoming exam in timetable data |
| Exam-readiness % | User is Pro | User is Free (entire readiness row hidden, not greyed) |
| Today's Timetable | Student has classes today | No classes today — card says "No classes today. Enjoy your day." |
| Mark Present / Absent buttons | Class has started (current time ≥ class start time) AND class hasn't ended more than 30 min ago | Class is in the future (buttons hidden until start time) or ended > 30 min ago |
| Attendance Warning | Any module's attendance % is below 75 % | All modules are ≥ 75 % |
| Announcements | There are unread announcements targeted at this student's batch/modules | No announcements (card hidden entirely) |
| Prayer Times | Always shown | — |
| Lost & Found | There are posts in the last 30 days | No recent posts (card hidden) |

### 3.3 Timetable sub-page: `/dashboard/timetable`

Reached by tapping "View full timetable" on the mini card. This is the full week view (Mon–Fri) that was already planned in Phase 2. It's a sub-route of Dashboard, not a top-level nav item.

Each class block in the week view is tappable → opens a sheet with class details + the same Mark Present / Absent buttons. This is how students mark attendance: open timetable, tap today's class, tap the button. The dashboard mini card is a shortcut for the *next* class only.

---

## 4. AI Chat page (`/ai`)

The AI Tutor chat screen. Already specced in `rag-architecture.md` §4.5 (streaming, citations, mode toggle). This section covers only the page-level layout and the elements that aren't in the RAG doc.

```
┌─────────────────────────────────────┐
│  ← back    AI Tutor    [mode ▼]     │  ← mode toggle: Auto / Quick /
│                                     │     Tutor / Socratic (Pro-locked)
├─────────────────────────────────────┤
│                                     │
│  [chat bubble area — scrollable]    │
│                                     │
│  Assistant: Here's how metformin    │
│  works… [T1] [W2]                   │  ← inline citations
│                                     │
│  You: Can you explain…              │
│                                     │
│  ├── rate limit bar (Free users) ──┤│  ← shows X / 4 msgs used today
│  │   ████░░░░  2 of 4 used        ││     disappears for Pro users
│  │                                ││
├─────────────────────────────────────┤
│  ┌─────────────────────────┐  [→]  │  ← send button
│  │  Type a message…        │       │
│  └─────────────────────────┘       │
│  [📎] [🎤] [📚 current module]     │  ← attachments (future), mic (Phase 4),
│                                     │     module context toggle
└─────────────────────────────────────┘
```

**Module context toggle:** A small pill at the bottom that shows the current module (e.g. "Anatomy"). Tapping it lets the student switch module context. The RAG pipeline uses this to scope retrieval. If no module is selected, retrieval is unscoped (searches all textbooks).

**Session list:** On desktop, a left panel shows previous chat sessions (like ChatGPT's sidebar). On mobile, sessions are accessed via a history icon in the header. Each session stores the mode it was started in.

---

## 5. Maps page (`/maps`)

Two maps, one screen, a tab switcher at the top.

```
┌─────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐        │
│  │  Point   │  │  Campus  │        │  ← tab switcher, top of screen
│  │ (active) │  │          │        │     Point = default (higher priority)
│  └──────────┘  └──────────┘        │
├─────────────────────────────────────┤
│                                     │
│  [search bar]                       │  ← shared component; behaviour
│                                     │     changes by active tab (see
│  [MapLibre GL JS full bleed]        │     maps-platform.md §4.5)
│                                     │
│  … map content …                    │
│                                     │
│  ┌─ floor pills (Campus only) ───┐  │  ← hidden when Point tab is active
│  │  G   1   2   3   4           │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  [bottom nav]                       │
└─────────────────────────────────────┘
```

Point tab is the default because it's higher priority and more frequently used. The tab switcher is a simple two-pill component — not a full horizontal scroll tab bar. Both tabs share the same MapLibre instance; switching tabs swaps the GeoJSON layers and search behaviour, not the map renderer.

---

## 6. Campus tab (`/campus`) — cards grid

Same cards-grid pattern as Education. Vertical stack of feature cards.

```
┌─────────────────────────────────────┐
│  Campus                             │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🍕  DowEats                │    │  ← Phase 2 revenue. Shows
│  │  Order food from campus     │    │     "Coming Soon" until built.
│  │  [Coming Soon]              │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  👕  Merch                  │    │  ← Phase 2 revenue. Coming Soon.
│  │  Dow hoodies & lab coats    │    │
│  │  [Coming Soon]              │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  📚  Marketplace            │    │  ← Phase 2 revenue. Coming Soon.
│  │  Buy & sell textbooks       │    │
│  │  [Coming Soon]              │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🔍  Lost & Found           │    │  ← Phase 1. Live from soft launch.
│  │  Find lost items on campus  │    │
│  │  [Browse →]                 │    │  ← taps into /campus/lost-found
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🕌  Prayer Times           │    │  ← Phase 1. Live from soft launch.
│  │  Next: Maghrib at 06:15     │    │  ← live next-prayer preview
│  │  [View →]                   │    │  ← taps into /campus/prayers
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

Revenue cards (DowEats, Merch, Marketplace) show "Coming Soon" with a muted CTA style. They exist in the grid from day one so the layout doesn't shift when they go live. Students can see what's planned. No tapping through — CTA is disabled until the feature ships.

---

## 7. Lost & Found page (`/campus/lost-found`)

Reached from: Dashboard card "See all" OR Campus tab card OR desktop sidebar.

```
┌─────────────────────────────────────┐
│  ← back    Lost & Found   [+ Post] │  ← post button top-right
├─────────────────────────────────────┤
│  [🔍 Search items…]                 │  ← filters posts by text
│  [All] [Lost] [Found]               │  ← type filter pills
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🔎 Lost                   │    │
│  │  iPhone 15 Pro — black     │    │
│  │  Last seen: library, 2h ago│    │
│  │  [Contact via WhatsApp →]  │    │  ← WhatsApp deep link (tel: style)
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  ✓ Found                   │    │  ← green badge
│  │  Blue water bottle         │    │
│  │  At: reception desk        │    │
│  └─────────────────────────────┘    │
│  …                                  │
└─────────────────────────────────────┘
```

Posts auto-archive after 30 days (background job, no admin action). Posting a "Lost" item includes an optional WhatsApp number for contact — displayed as a tappable link on the card.

---

## 8. Prayer Times page (`/campus/prayers`)

Reached from: Dashboard card OR Campus tab card OR desktop sidebar.

```
┌─────────────────────────────────────┐
│  ← back    Prayer Times             │
├─────────────────────────────────────┤
│  📅 Wednesday, 5 Feb 2026           │
│  🕙 Hijri: 6 Sha'ban 1447          │  ← Hijri date
├─────────────────────────────────────┤
│                                     │
│  ┌─ Today's Prayers ────────────┐   │
│  │                              │   │
│  │  Fajr       05:12   ✓        │   │  ← checkmark = time passed
│  │  Sunrise    06:28   ✓        │   │  ← not a prayer, reference only
│  │  Dhuhr      12:15            │   │  ← next upcoming, bold + Teal
│  │  Asr        15:42            │   │
│  │  Maghrib    18:05            │   │
│  │  Isha       19:30            │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌─ Dow Masjid ─────────────────┐   │
│  │  🕌 Open: 05:00 – 19:45     │   │  ← manually updated by imam
│  │  Congregational prayer times │   │  ← imam sets these; different
│  │  Fajr  05:15 (jamaat)       │   │     from the azan times above
│  │  Dhuhr 12:30 (jamaat)       │   │
│  │  …                           │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌─ Civil Hospital Masjid ──────┐   │
│  │  🕌 Open: 05:00 – 19:30     │   │  ← same structure, different times
│  │  Congregational prayer times │   │
│  │  …                           │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌─ Qibla Direction ────────────┐   │
│  │        ▲ N                   │   │  ← compass widget
│  │     ╱     ╲                  │   │     arrow points toward Mecca
│  │   W    ●    E                │   │     uses device geolocation
│  │     ╲     ╱                  │   │
│  │        ▼ S                   │   │
│  │  ➡️ Qibla: 247°             │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌─ Nearest Prayer Room ────────┐   │
│  │  📍 Dow Main · Ground Floor  │   │  ← cross-links to campus map
│  │  [Show on map →]             │   │     highlights the prayer room POI
│  └──────────────────────────────┘   │
│                                     │
│  ┌─ Daily Verse ────────────────┐   │
│  │  📖 Quran / Hadith of the day│   │  ← one piece of content per day
│  │  "…[verse text]…"            │   │     rotates daily. Content seeded
│  │  — Surah Al-Baqarah 2:286   │   │     by imam or a curated list.
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Prayer data sources and update model

| Data | Source | Update frequency | Who updates |
|---|---|---|---|
| Azan times (5 prayers + sunrise) | Calculated from Karachi coordinates using a prayer-time library (e.g. `adhan` npm package — free, works offline) | Recalculated daily, no API call | Automatic |
| Dow Masjid congregational times | Supabase `masjid_schedules` table | Manual — imam has a simple admin form | Imam (given a role-gated route) |
| CHK Masjid congregational times | Same table, different `masjid_id` | Manual | Imam |
| Qibla direction | Calculated client-side from device lat/lng | On page load | Automatic (device geolocation) |
| Daily verse / hadith | Supabase `daily_content` table, one row per date | Imam or team seeds a rolling list | Manual |
| Hijri date | Calculated client-side using a Hijri calendar library (e.g. `hijri-converter` npm) | Daily | Automatic |

**Why calculated, not API-based:** Prayer times for a fixed location (Karachi) can be computed locally using the sun's position. No API call, no cost, works offline. The `adhan` library implements the ISNA/Umm al-Qura calculation methods — standard across Pakistan.

---

## 9. Announcements — data model and rendering

Announcements appear in two places: the Dashboard feed (latest 2-3) and a full list page (`/campus/announcements`, reached via "See all" on the dashboard card). They are also pushed via FCM.

### 9.1 Announcement data model

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid | PK |
| `title` | text | Short headline |
| `body` | text | Full announcement text |
| `priority` | enum (`urgent` \| `normal` \| `info`) | Controls visual treatment (see §9.2) |
| `audience_type` | enum (`all` \| `batch` \| `module`) | Who can see this |
| `audience_id` | uuid (nullable) | If `batch`: the batch row id. If `module`: the module row id. If `all`: null. |
| `push_enabled` | boolean | If true, FCM push is sent on creation |
| `pinned` | boolean | If true, stays at top of feed until admin unpins |
| `created_at` | timestamptz | |
| `expires_at` | timestamptz (nullable) | Auto-hidden after this time. Default: 30 days from creation. |

### 9.2 Visual treatment by priority

| Priority | Dashboard rendering | Full list rendering |
|---|---|---|
| `urgent` | Red left border on card. Title in bold. | Red left border + `urgent` badge (Red fill, white text) |
| `normal` | Teal left border. Standard title weight. | Teal left border + `normal` badge |
| `info` | No border. Muted title. | Grey left border + `info` badge |

### 9.3 Filtering — what each student sees

The dashboard and full list both filter announcements client-side after fetch:

```
SELECT * FROM announcements
WHERE expires_at > now()
  AND (
    audience_type = 'all'
    OR (audience_type = 'batch'  AND audience_id = [student's batch_id])
    OR (audience_type = 'module' AND audience_id IN [student's current module ids])
  )
ORDER BY pinned DESC, priority DESC, created_at DESC
```

Students never see announcements that aren't targeted at them. An Anatomy module announcement only shows up for students currently enrolled in Anatomy.

---

## 10. Profile page (`/profile`)

Reached from: mobile avatar tap → bottom sheet → "Profile" link. Desktop sidebar avatar mini-card or "Profile" link.

Full spec for the glassmorphic student card and all UX conventions lives in `profile-card-ux.md`. This section is the page-level wireframe.

```
┌─────────────────────────────────────┐
│  ← back    My Profile               │
├─────────────────────────────────────┤
│                                     │
│  ┌─── GLASSMORPHIC STUDENT CARD ──┐ │  ← see profile-card-ux.md §2
│  │  bg white/80 · blur(10px)      │ │     border Gold (Pro) or Navy-200 (Free)
│  │  border white/30               │ │     shadow tinted Gold if Pro
│  │                                │ │
│  │   ╭──────╮  [Name]            │ │  ← 72 px avatar circle
│  │   │ 📷  │  Batch 3            │ │     border 3px Gold (Pro) / Navy-200 (Free)
│  │   │      │  Roll 12345        │ │     initials placeholder if no photo
│  │   ╰──────╯                    │ │
│  │                                │ │
│  │   📚 Anatomy · 💰 240 Cr     │ │  ← current module (Teal) + credits (Mono)
│  │                                │ │
│  │   [ ★ Pro ]  or  [Upgrade →]  │ │  ← Gold badge or Teal upgrade CTA
│  └────────────────────────────────┘ │
│                                     │
│  [+ Add photo]  or  [Change photo]  │  ← opens bottom sheet / modal
│                                     │     with "Take photo" + "Choose from library"
│                                     │     → client-side circular crop → upload
│  ┌─ Dow ID Status ──────────────┐   │
│  │  🟡 Pending approval        │   │  ← colour-coded status badge
│  │  Uploaded 3 days ago        │   │     Green = approved
│  └──────────────────────────────┘   │     Red = rejected (re-upload CTA)
│                                     │
│  ┌─ Account Details ────────────┐   │
│  │  Email        [redacted]    │   │
│  │  Roll Number  12345         │   │
│  │  Batch        3             │   │
│  │  Lab Group    B             │   │
│  │  Learning Style  Visual     │   │  ← from onboarding, editable
│  └──────────────────────────────┘   │
│                                     │
│  [Logout]                           │
└─────────────────────────────────────┘
```

**Key changes from previous wireframe:**
- The plain avatar + name block is replaced by the full glassmorphic card (Gold-bordered if Pro).
- The separate "Pro Status" section is removed — Pro/Free status is now shown **inside** the card (badge or upgrade CTA). This reduces vertical scroll and keeps the identity + subscription status in one visual unit.
- A `+ Add photo` / `Change photo` affordance appears directly below the card. The photo here is a **separate selfie** from the Dow ID photo — students can update it any time. See `profile-card-ux.md` §2.4 for the upload flow.
- Account details and Dow ID status sections remain unchanged below.

---

## 11. Route tree — full picture

```
src/app/
├── (auth)/
│   ├── login/
│   ├── signup/
│   └── verify/
├── (app)/                          ← guarded by middleware
│   ├── layout.tsx                  ← NavShell (BottomNav or Sidebar)
│   ├── dashboard/
│   │   ├── page.tsx                ← widget stack (§3)
│   │   └── timetable/
│   │       └── page.tsx            ← full week view
│   ├── education/                  ← see education-tab.md
│   │   ├── page.tsx
│   │   ├── mcq/…
│   │   ├── viva/…                  ← module → subject picker (shared)
│   │   │   ├── session/…           ← scored Viva Bot session (Pro)
│   │   │   └── anki/…              ← flashcard tap-to-reveal drill (Free)
│   │   └── progress/…
│   ├── ai/
│   │   └── page.tsx                ← chat screen (§4)
│   ├── campus/
│   │   ├── page.tsx                ← cards grid (§6)
│   │   ├── lost-found/
│   │   │   └── page.tsx            ← L&F list + post (§7)
│   │   ├── prayers/
│   │   │   └── page.tsx            ← prayer times full page (§8)
│   │   ├── announcements/
│   │   │   └── page.tsx            ← full announcement list
│   │   ├── doweats/                ← Phase 2 stub
│   │   ├── merch/                  ← Phase 2 stub
│   │   └── marketplace/            ← Phase 2 stub
│   ├── maps/
│   │   └── page.tsx                ← Point/Campus tab switcher (§5)
│   ├── profile/
│   │   └── page.tsx                ← profile page (§10)
│   └── settings/
│       └── page.tsx                ← settings (future)
└── layout.tsx                      ← root layout (fonts, theme provider)
```

---

## 12. What to build and when

| Phase | Days | What ships |
|---|---|---|
| Phase 2 | 10–11 | Nav shell (BottomNav + Sidebar) + layout split. Dashboard skeleton with static widget cards (no live data yet). Profile page. |
| Phase 2 | 12–14 | Wire live data into Dashboard: timetable mini card (from `timetable_entries`), attendance warning (from `attendance`), current module + exam countdown (from `modules` + `timetable_entries`). Announcement cards (from `announcements` table — admin seeds a few test posts). Prayer times card (calculated client-side via `adhan`). Lost & Found card (from `lost_found_items`). |
| Phase 3 | 17 | AI Chat page layout (shell + mode toggle + rate-limit bar). Streaming wired in later that week. |
| Phase 5 | 31–35 | Maps page with tab switcher. Campus tab cards grid (L&F and Prayers live; revenue cards show "Coming Soon"). Lost & Found full page. Prayer Times full page (azan calc + masjid schedules + qibla + daily verse). Announcements full list page. |

---

## 13. Sources consulted

- `docs/decisions/education-tab.md` — cards grid pattern, card component spec
- `docs/decisions/mobile-web-ui.md` — nav structure, layout split, component sharing rules
- `docs/decisions/maps-platform.md` — maps page layout, cross-link from prayer room to campus map
- `docs/decisions/rag-architecture.md` — AI chat streaming, citations, mode toggle
- `docs/roadmap-day-by-day.md` — phase assignments for each feature
- `docs/4_DESIGN_SYSTEM.md` — tokens, typography, shadcn primitives
- Skills consulted: `nextjs-app-router-patterns`, `react-patterns`, `tailwind-design-system`
