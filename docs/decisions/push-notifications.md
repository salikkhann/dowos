# Decision: Push Notification Permission Strategy

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Product decision sprint

---

## 1. Why this decision matters

iOS and Android both require **explicit user permission** to send push notifications. If the student denies permission, the app can never ask again (on iOS) or can only ask again after the student manually re-enables it in device settings. One wrong prompt at the wrong time and you lose push for that user permanently.

DowOS relies on push for: announcements (time-sensitive), attendance reminders, Dow ID approval status, credits confirmation, and (Phase 2) order status updates. These are high-value notifications — losing the channel hurts retention.

---

## 2. Decision — delayed permission, value-first

**Do NOT ask for push permission on first login or during onboarding.**

Ask on **Day 2 of usage**, after the student has experienced at least one value moment (checked their timetable, marked attendance, or received an in-app announcement). At that point, show a custom "permission priming" card BEFORE the native OS dialog fires.

### 2.1 Why not first login?

- First login is already cognitively heavy: OTP verification, profile setup, ID upload, onboarding tour. Adding a permission popup here is noise.
- The student hasn't experienced the app yet. They have no reason to say yes.
- Industry data: permission requests on first visit have ~30 % accept rates. After the user has seen value, accept rates jump to 60–80 %.

### 2.2 Why not "first time an announcement fires"?

- Announcements are admin-posted. The timing is unpredictable. The first announcement might come on Day 1 (during onboarding) or Day 5 (after the student has already left).
- Tying the permission ask to an external event means you can't control when it happens.

### 2.3 Why Day 2?

- Enough time for the student to have opened the app at least once after onboarding and used one feature.
- Not so late that they've already forgotten the app exists.
- Capacitor can track "sessions since install" trivially — Day 2 = second app open.

---

## 3. The permission priming card

Before the native OS dialog fires, show a custom full-screen card (bottom sheet on mobile) that explains WHY the student should say yes:

```
┌─────────────────────────────────────┐
│                                     │
│  🔔 Stay in the loop                │
│                                     │
│  Turn on notifications so you don't │
│  miss:                              │
│                                     │
│  📢 Class schedule changes          │
│  ✓  Attendance reminders            │
│  📑 Exam announcements              │
│  💰 Payment confirmations           │
│                                     │
│  [ Turn on notifications ]          │  ← primary CTA. Tapping this fires
│  [ Maybe later ]                    │     the native OS permission dialog.
│                                     │     "Maybe later" dismisses the card
└─────────────────────────────────────┘    without firing the OS dialog.
```

### 3.1 What happens after each tap

| Student taps | What happens |
|---|---|
| **Turn on notifications** | Native OS permission dialog fires. If student says Yes → FCM token registered, push is live. If student says No → we note it, don't ask again for 7 days (see §3.2). |
| **Maybe later** | Card dismissed. We note it. Try again in 7 days (see §3.2). |

### 3.2 Retry logic

If the student declined (either "Maybe later" or the native "No"):

- Wait **7 days**.
- Show the priming card again, but only **once more**. If they decline again, stop asking forever.
- Total: maximum 2 permission asks in the student's lifetime in the app.

This respects the student's choice while giving us one more shot after they've had a full week of using the app.

### 3.3 iOS special handling

iOS does NOT allow re-prompting after a "No" on the native dialog. So the priming card is especially important on iOS — it's our only chance to frame the ask correctly before the native dialog fires. On iOS, if the native dialog returns "denied," we show a gentle one-time toast: "You can enable notifications in Settings → DowOS any time."

---

## 4. Notification categories (what we send, once permission is granted)

| Category | Urgency | Quiet hours respected? |
|---|---|---|
| Announcement (urgent: exam schedule change, emergency) | High | **No** — bypasses quiet hours |
| Announcement (normal: general info) | Normal | Yes |
| Attendance reminder ("Class in 15 min") | Normal | Yes |
| Dow ID status change | Low | Yes |
| Credits confirmed | Low | Yes |
| Pro subscription expiry | Low | Yes |
| DowEats order status (Phase 2) | Normal | Yes |

**Quiet hours:** 10:00 PM – 6:00 AM PKT. Normal and Low notifications are held and delivered at 6:00 AM. Urgent notifications bypass this. Students can adjust their quiet hours in Settings.

---

## 5. Database

| Table | What |
|---|---|
| `users` | `fcm_token text` (set on permission grant), `push_enabled boolean DEFAULT false`, `push_permission_asked_count integer DEFAULT 0`, `push_last_asked_at timestamptz` |
| `notification_preferences` | New table: `user_id`, `category` (enum of categories above), `enabled boolean DEFAULT true`. Student can toggle per-category in Settings. |

---

## 6. Build placement

| Component | Day |
|---|---|
| FCM token registration via Capacitor plugin | 11 |
| Permission priming card component | 11 |
| Trigger logic: "show priming card on 2nd app open" | 11 |
| Retry logic (7-day cooldown, max 2 asks) | 11 |
| Per-category toggle in Settings | 14 |
| Quiet hours logic (hold + deliver at 6 AM) | 14 |
| Urgent bypass | 14 |

---

## 7. Sources

- Capacitor `@capacitorjs/push-notification` plugin docs
- Firebase Cloud Messaging (FCM) docs
- iOS UNUserNotificationCenter permission flow
- Android notification permission (API 33+) docs
- Industry benchmarks: permission request timing vs accept rate (various mobile marketing studies)
