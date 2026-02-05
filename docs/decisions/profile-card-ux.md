# Decision: Glassmorphic Student Card + UX Improvements

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Day 4 decision sprint (extended)

---

## 1. Context — what was already decided

| Item | Source |
|---|---|
| Profile page wireframe (placeholder layout) | `ui-page-structure.md` §10 |
| Glassmorphism Card base spec already in design system | `4_DESIGN_SYSTEM.md` §3 Component Library |
| Gold = Pro / Premium colour | `4_DESIGN_SYSTEM.md` — `#D4A574` light, `#FFD89B` dark |
| Sidebar avatar access pattern | `mobile-web-ui.md` — desktop sidebar "System" section |
| shadcn primitives available | `badge`, `button`, `card`, `input`, `label`, `sheet`, `skeleton`, `tooltip` |

Skills consulted: `tailwind-design-system`, `ui-ux-pro-max` (design-system search, glassmorphism style deep-dive, dashboard UX best-practices, shadcn + Next.js stack patterns).

---

## 2. Glassmorphic Student Card — full spec

### 2.1 Where the card lives

| Location | Variant | Size |
|---|---|---|
| `/profile` page — top of page | **Full card** | Full width of content area (max-w-md, centred on mobile) |
| Desktop sidebar — bottom of sidebar, above "System" links | **Sidebar avatar** | Avatar ring (48 px) + name + Pro badge only. No batch / roll / credits. |

The card does **not** appear on the Dashboard. The Dashboard greeting remains a lightweight text greeting (§4 below). This keeps the Dashboard scannable and the Profile page the single "identity" destination.

### 2.2 Full card — visual anatomy

```
┌─────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← frosted glass backdrop
│  ░                                         ░ │     bg rgba(255,255,255,0.8)
│  ░   ┌──────────────────────────────┐     ░ │     backdrop-filter blur(10px)
│  ░   │  ╭──────╮                    ░     ░ │     border 1px solid rgba(255,255,255,0.3)
│  ░   │  │ 📷  │  [Name]            ░     ░ │     shadow 0 8px 32px rgba(31,38,135,0.15)
│  ░   │  │      │  Batch 3          ░     ░ │
│  ░   │  ╰──────╯  Roll 12345       ░     ░ │  ← avatar: 72 px circle, object-cover
│  ░   └──────────────────────────────┘     ░ │     border 3px solid: Gold if Pro, Navy-200 if Free
│  ░                                         ░ │
│  ░   ┌──────────────────────────────┐     ░ │  ← info row: module + credits
│  ░   │  📚 Anatomy (current)       ░     ░ │     left half: current module name (Teal text)
│  ░   │  💰 240 Credits             ░     ░ │     right half: Dow Credits balance (JetBrains Mono)
│  ░   └──────────────────────────────┘     ░ │
│  ░                                         ░ │
│  ░   [ ★ Pro ]   or   [ Upgrade → ]       ░ │  ← Pro: Gold badge. Free: subtle Upgrade CTA
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────────┘
```

### 2.3 Colour & border rules

| State | Avatar border | Card border glow | Pro badge |
|---|---|---|---|
| **Pro subscriber** | Gold `#D4A574` (3 px solid) | Subtle gold tint on outer shadow: `shadow 0 8px 32px rgba(212,165,116,0.25)` | Gold badge with white text: `★ Pro` |
| **Free user** | Navy-200 `#D1DCEB` (3 px solid) | Default glassmorphism shadow (no tint) | Hidden. An `Upgrade →` link in Teal sits in the same slot |
| **Dark mode – Pro** | Gold brightened `#FFD89B` | Shadow tint uses dark Gold | Badge colour unchanged |
| **Dark mode – Free** | Navy card-bg tone `#3A4F6E` | Default dark glassmorphism | Same Teal upgrade link |

### 2.4 Photo upload flow

- The photo on this card is a **separate selfie**, independent of the Dow ID photo uploaded during onboarding.
- On the Profile page, directly below the card, a small `+ Add photo` / `Change photo` link is visible.
- Tapping it opens a **bottom sheet** (mobile) or **modal** (desktop) with two options:
  1. **Take photo** — opens device camera via `<input type="file" accept="image/*" capture="user">`.
  2. **Choose from library** — standard file picker (`<input type="file" accept="image/*">`).
- The selected image is cropped to a square via a client-side crop step (use a lightweight library such as `react-image-crop`). Crop UI: a circular mask overlay on the image, drag to reposition, confirm button.
- On confirm: upload to Supabase Storage at `avatars/{user_id}.webp` (convert to WebP client-side for size). Update `users.avatar_url` via an RPC or simple UPDATE.
- If no photo has been uploaded yet, the card shows a placeholder: the student's initials in a coloured circle (colour derived from a hash of their name — picks from the design system's accent palette).
- **`next/image`** wraps all avatar renders for automatic optimisation and lazy load (per Next.js stack guidelines from the skill).

### 2.5 Sidebar avatar — desktop only

```
── System ──
  ┌─────────────────────┐
  │  ╭────╮             │
  │  │ 📷 │  [Name]     │  ← 48 px avatar, same border rules as full card
  │  │    │  ★ Pro       │     (Gold ring if Pro, Navy-200 if Free)
  │  ╰────╯             │     Pro badge is a tiny 10 px dot + "Pro" text
  └─────────────────────┘     No batch / roll / credits — space is tight
  Settings        [/settings]
  Profile         [/profile]
  …
```

The sidebar avatar is **not** glassmorphic — it sits in the sidebar's own surface. It uses only the avatar circle + Pro indicator. Clicking anywhere on this mini-card navigates to `/profile`.

### 2.6 Skeleton loading state

While the user's profile data is being fetched, the card slot renders a **skeleton** (shadcn `<Skeleton>`) that mirrors the card's shape:

- A circle skeleton (72 px) for the avatar.
- Two short line skeletons (name + batch/roll).
- A shorter rectangle skeleton for the module / credits row.
- The glassmorphism background (`bg-white/80 backdrop-blur-md`) is still present so the card shape is visible even before data arrives — avoids layout shift (per Next.js stack guideline: "Reserve space for dynamic content").

---

## 3. UX improvements — app-wide

The following improvements were derived from `ui-ux-pro-max` guidelines (loading states, skeleton screens, font loading, accessibility) cross-referenced with the existing design system and the app's current wireframes. They are **not** one-off tweaks — they are conventions to carry into every page that ships.

### 3.1 Dashboard greeting — time-aware, name-personalised

The existing wireframe already has `Good morning, [Name]`. Lock this in with these specifics:

| Time range (Asia/Karachi) | Greeting |
|---|---|
| 04:00 – 11:59 | Good morning, [First name] |
| 12:00 – 16:59 | Good afternoon, [First name] |
| 17:00 – 20:59 | Good evening, [First name] |
| 21:00 – 03:59 | Good night, [First name] |

- Use only the student's **first name** (split `full_name` on space, take index 0). Feels warmer than full name on a phone screen.
- Sub-line: `Batch 3 · Lab Group B` stays as-is (pulled from profile).
- The greeting text uses `Outfit Bold` (heading font), 22 px on mobile, 26 px on desktop. The sub-line is `Inter` 14 px, Navy-300 colour.
- No icon / emoji in the greeting itself. The time-of-day context is conveyed purely through the text. Keeps it clean and fast to render.

### 3.2 Skeleton-first loading on every page

Every page that fetches async data must render a **skeleton layout** before data arrives. This applies to:

| Page | What skeletonises |
|---|---|
| Dashboard | Each widget card renders as a skeleton block of the same height. Cards appear top-to-bottom as data streams in (no full-page spinner). |
| Profile | The glassmorphic card slot (§2.6 above). Account details section below it. |
| Education cards grid | Each card is a skeleton rectangle. |
| Campus cards grid | Same pattern. |
| Lost & Found list | Each list item is a skeleton row. |
| Prayer Times | The prayer table rows skeleton; masjid sections skeleton independently (they may fetch at different speeds if masjid data is manually updated). |
| AI Chat | The chat area shows a skeleton bubble when waiting for a streamed response. |

**Implementation:** Use shadcn `<Skeleton>` with `animate-pulse`. Wrap each data-fetching section in a `loading.tsx` alongside its `page.tsx` (Next.js App Router convention — per the skill's Next.js stack guideline). Do **not** use a full-page spinner anywhere.

### 3.3 Consistent transition timing

All interactive state changes use the design system's transition scale:

| Interaction | Duration | Easing |
|---|---|---|
| Hover / focus colour change | 150 ms | `ease-out` |
| Card tap / button press | 100 ms | `ease-out` |
| Sheet / modal open-close | 250 ms | `ease-in-out` |
| Page route transition | 200 ms | `ease-out` |
| Skeleton → content fade-in | 200 ms | `ease-out` (use `opacity-0 → opacity-100`) |

Rationale: 100–300 ms range feels snappy without being jarring (per `ui-ux-pro-max` duration-timing guideline). Never use `width` / `height` transitions — only `transform` and `opacity` (GPU-composited, jank-free).

### 3.4 Touch target enforcement

Every tappable element must be ≥ 44 × 44 px (CLAUDE.md rule #7, confirmed by skill's `touch-target-size` guideline). Specific callouts for this feature:

- The `+ Add photo` / `Change photo` link on Profile must have `min-h-[44px]` even though it's a short text link. Pad it vertically or wrap it in a 44 px tall hit area.
- The Pro badge / Upgrade CTA on the card: same rule. The badge itself may be small visually, but the tappable area extends to 44 × 44 px via padding or an invisible hit-area wrapper.
- Sidebar avatar mini-card: the entire 48 px avatar + name row must be one tappable block ≥ 44 px tall.

### 3.5 Focus states and keyboard navigation

Every interactive element must have a **visible focus ring** for keyboard / screen-reader users (WCAG AA). Convention:

- Focus ring: `ring-2 ring-teal-500 ring-offset-2` (Teal accent, 2 px offset so it doesn't overlap content).
- Focus-visible only (not on mouse click): use Tailwind's `focus-visible:` variant.
- Tab order follows visual top-to-bottom, left-to-right on every page.
- The glassmorphic card itself is not focusable (it's not a link). The `+ Add photo` link and the `Upgrade →` CTA inside it **are** focusable.

### 3.6 Contrast and colour usage

- Body text on glassmorphic card: Navy `#1A2B4C` (contrast ratio > 7:1 against the white-80 background). Never use a lighter grey.
- Sub-text (batch, roll number): Navy-300 `#A5B8D6` is **too light** against white — use Navy-200 `#D1DCEB` only for borders. Sub-text must be at least Navy `#1A2B4C` at reduced opacity (60 %) or a dedicated mid-tone. Recommendation: `text-[#5A6B8A]` — passes 4.5:1 against white-80.
- Dark mode card background shifts to `rgba(34,47,69,0.85)` (the dark-mode card colour `#222F45` at 85 % opacity). Text shifts to white / white-80. Sub-text uses `#A5B8D6`.
- The Credits balance number uses `JetBrains Mono` (metrics font) as per the design system convention for all numeric values.

### 3.7 Reduced-motion respect

Any animation on the card or skeleton must be wrapped in a `prefers-reduced-motion` check:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse { animation: none; }
  /* transitions still apply but at 0 ms duration */
}
```

In Tailwind: use `motion-safe:animate-pulse` instead of `animate-pulse` on all skeleton elements. This is a one-line convention that applies everywhere.

### 3.8 Image loading — no layout shift

- Avatar images use `next/image` with explicit `width={72}` `height={72}` (full card) or `width={48}` `height={48}` (sidebar). This reserves the pixel space before the image bytes arrive.
- Set `priority={true}` on the Profile page avatar (it's above the fold). All other avatar renders use the default lazy load.
- The circular crop is enforced via `rounded-full object-cover` — the aspect ratio is fixed, so the image container never changes size.

---

## 4. What changes in existing docs

| Doc | Section | Change |
|---|---|---|
| `ui-page-structure.md` | §10 Profile page | Wireframe replaced with glassmorphic card + photo upload link + updated layout |
| `ui-page-structure.md` | §3.1 Dashboard greeting | Greeting sub-spec added (time-aware, first-name only) |
| `mobile-web-ui.md` | Sidebar layout | Sidebar avatar mini-card added above System section |

---

## 5. Build placement

These changes ship with the Profile page and Dashboard in **Phase 2, Days 10–11** (nav shell + static widget cards + Profile page). The glassmorphic card is a single component; photo upload wires in on the same day because the upload path (`avatars/`) and `users.avatar_url` column already exist from the auth/onboarding work (Days 1–2).

| Component | Day | Dependency |
|---|---|---|
| Glassmorphic card (skeleton + static) | 10 | shadcn `card` + `skeleton` |
| Avatar upload flow (crop + upload + update) | 10 | Supabase Storage bucket already exists |
| Sidebar avatar mini-card | 10 | Same avatar URL |
| Dashboard greeting (time-aware) | 11 | `users` table `full_name` field |
| Skeleton-first loading convention | 10–14 | Applied page-by-page as each page ships |

---

## 6. Sources consulted

- `docs/4_DESIGN_SYSTEM.md` — glassmorphism card base spec, colour tokens, dark mode palette, font stack
- `docs/decisions/ui-page-structure.md` — existing Profile wireframe, Dashboard greeting
- `docs/decisions/mobile-web-ui.md` — sidebar layout, avatar access pattern
- Skills: `tailwind-design-system`, `ui-ux-pro-max` (design-system search, glassmorphism style, dashboard UX, shadcn stack, nextjs stack)
- CLAUDE.md rules: mobile-first 375 px, touch targets 44 px, WCAG AA
