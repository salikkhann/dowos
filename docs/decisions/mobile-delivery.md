# Decision: Mobile App Delivery

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Day 7 decision

---

## 1. What was already decided

`00_DISCOVERY_RESOLVED.md` and CLAUDE.md both list **Capacitor.js** as the mobile wrapper. The roadmap allocated Day 7 to "stress-test Capacitor vs PWA." This doc locks Capacitor and documents why PWA was not chosen.

---

## 2. The two options

### Option A — Capacitor.js (hybrid native wrapper) ✓ CHOSEN

Capacitor wraps the Next.js web app in a native Android (and later iOS) shell. The student downloads a `.apk` from the Play Store. Inside, it's a WebView running the exact same Next.js build that runs on Vercel.

**Pros:**
- Play Store discoverability. Medical students at Dow already download apps from the Play Store — having DowOS there puts it where they look. A PWA install requires knowing the URL and tapping "Add to home screen," which most students won't do without prompting.
- Push notifications via FCM work natively on Android with Capacitor. PWA push on Android is unreliable (Chrome supports it, but the permission model is different and less reliable than native).
- Full device API access: camera (for Dow ID upload and avatar selfie), microphone (for Viva Bot voice), geolocation (for future bus GPS crowdsourcing). Capacitor plugins expose these cleanly.
- One codebase. The web app runs identically in browser and in the Capacitor shell. No React Native or Flutter rewrite.
- Play Store immediate submission. iOS App Store requires Apple Developer account (PKR 12 500 / yr) — defer iOS to Phase 3 when revenue covers it.

**Cons:**
- WebView performance on older Android devices can lag vs a fully native app. Mitigated by: skeleton-first loading (no layout shift), lazy-loaded routes, and the fact that Dow students are 18–25 (newer phones).
- Play Store review adds 1–3 days to each release cycle. Mitigated by: internal testing track (instant deploy to testers), public release only for stable builds.

### Option B — Progressive Web App (PWA)

A PWA runs in the browser, no app store required. The student visits the URL and taps "Add to home screen."

**Why it lost:**
- **Discoverability is the killer.** The target audience is 2 000 medical students who are used to app stores. Convincing them to install a PWA from a URL requires marketing effort that a Play Store listing does not. Adoption target is 100 % — PWA friction directly threatens that.
- **Push notifications on Android are unreliable for PWAs.** Chrome added PWA push support, but the permission model differs from native FCM. FCM is already in the stack and works reliably with Capacitor. No reason to fight the PWA push UX.
- **iOS PWA limitations.** Safari PWAs cannot access the camera or microphone via the Web API in the same way Chrome can. Since iOS is a future target, designing around PWA limitations now would constrain the architecture unnecessarily.

---

## 3. Locked architecture

```
Next.js 15 web app (src/)
        │
        ├── Runs on Vercel as a web app (browser, desktop)
        │
        └── Wrapped by Capacitor for mobile
                │
                ├── Android: .apk → Play Store (immediate submission)
                │     - WebView shell
                │     - FCM push via @capacitorjs/push-notification
                │     - Camera via @capacitorjs/camera
                │     - Microphone via Web Audio API (works in WebView)
                │     - Geolocation via @capacitorjs/geolocation
                │
                └── iOS: deferred to Phase 3
                      - Requires Apple Developer account (PKR 12 500 / yr)
                      - Same Capacitor build, different target
                      - App Store review adds 1–7 days per release
```

### 3.1 Capacitor plugins needed (MVP)

| Plugin | Purpose | Phase |
|---|---|---|
| `@capacitorjs/push-notification` | FCM push for announcements | Phase 2 (Days 10–11) |
| `@capacitorjs/camera` | Dow ID photo + avatar selfie upload | Phase 2 (Day 10) |
| `@capacitorjs/geolocation` | Future: bus GPS crowdsourcing | Phase 5 |
| `@capacitorjs/splash-screen` | Branded splash on app open | Phase 2 |

### 3.2 Build + deploy flow

```
npm run build          → Next.js static + API routes on Vercel
npx cap sync           → copies dist/ into Capacitor's www/
npx cap open android   → opens Android Studio
Android Studio build   → .apk or .aab
Play Console upload    → internal testing track (instant) or public track (1–3 day review)
```

No separate CI pipeline needed for MVP. Salik builds and uploads manually. Automate with GitHub Actions in Phase 3.

---

## 4. Build placement

| Item | Day |
|---|---|
| `capacitor init` + `capacitor add android` + first working build | 10 (first thing — unblocks everything) |
| Wire FCM push plugin | 11 |
| Wire camera plugin (Dow ID + avatar upload) | 10–11 |
| Play Store internal testing track upload | 14 (after first stable build) |
| Play Store public release | Week 4 launch day |

---

## 5. Sources

- Capacitor.js official docs (capacitorjs.com)
- PWA push notification support matrix (web.dev)
- Apple Developer Program pricing (developer.apple.com)
- Play Console internal testing track docs (developer.android.com)
