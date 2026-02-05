# Decision: Dow ID Approval Workflow

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Product decision sprint

---

## 1. Context

Every student uploads a Dow Medical College ID photo during onboarding. The upload goes to Supabase Storage. A human (Salik or Ammaar) manually verifies the photo is a real Dow ID and approves or rejects it. This doc defines the admin UI and the student-facing status feedback.

---

## 2. Student-side states (already specced in `ui-page-structure.md` §10)

| Status | Badge colour | What student sees |
|---|---|---|
| `pending` | Yellow | "Pending approval — uploaded X days ago" |
| `approved` | Green | "ID verified ✓" |
| `rejected` | Red | "ID could not be verified. [Reason]. Re-upload below." |

The status badge lives on the Profile page, below the glassmorphic card. It persists until the student is approved — then it collapses to a small "Verified ✓" line.

---

## 3. Admin queue — the screen Ammaar uses

```
┌─────────────────────────────────────────────────┐
│  📋 Dow ID Approval Queue                       │
│                                                 │
│  Pending: 3   Approved: 142   Rejected: 5       │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  👤 Ahmed Khan          Batch 3         │    │  ← card per pending student
│  │  Roll: 12345            Lab: A          │    │
│  │  Submitted: Feb 04, 2:15 PM             │    │
│  │                                         │    │
│  │  [📷 View Photo]                        │    │  ← opens photo in modal/lightbox
│  │                                         │    │
│  │  [ ✓ Approve ]    [ ✗ Reject ]         │    │  ← primary actions
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  👤 Fatima Naz          Batch 2         │    │
│  │  …                                      │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ── Filters ──                                  │
│  [ All ] [ Pending ] [ Approved ] [ Rejected ]  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3.1 Approve action

1. Ammaar taps **Approve**.
2. `users.dow_id_status` → `approved`.
3. Student gets **two notifications** (both fire in parallel, no user-visible delay):
   - **FCM push:** "Your Dow ID has been verified! ✓"
   - **Email** (to the student's registered email): see §3.4 below.
4. Card disappears from the queue.

No confirmation dialog needed — approvals are low-risk and reversible (admin can re-open a student's status if needed via a "Revoke" action on the Approved list).

### 3.2 Reject action

1. Ammaar taps **Reject**.
2. A reason picker appears (bottom sheet on mobile, inline on desktop):

```
Why are you rejecting this ID?

[ ] Photo is blurry / unreadable
[ ] Photo does not look like a Dow ID card
[ ] Name on ID does not match profile name
[ ] Roll number on ID does not match profile
[ ] Photo appears to be edited / fake
[ ] Other (type reason)
```

3. Ammaar selects a reason (or types one) and taps **Confirm Rejection**.
4. `users.dow_id_status` → `rejected`. `users.dow_id_rejection_reason` stores the selected reason text.
5. Student gets FCM push: "Your Dow ID could not be verified. Check your Profile for details."
6. On the student's Profile page, the red status badge shows the reason text and a **Re-upload** button.

### 3.3 Re-upload after rejection

The student taps **Re-upload**. The same onboarding upload flow fires: camera/library picker → upload to Storage (overwrites or creates a new version) → status resets to `pending`. A new card appears in the admin queue.

### 3.4 Emails — verification confirmation + rejection notification

DowOS sends transactional emails on two Dow ID events. These are **not** marketing emails — they are status notifications the student needs to act on or be aware of.

| Trigger | Subject line | Body (summary) |
|---|---|---|
| **Approved** | "Your Dow ID has been verified ✓" | Welcome confirmation. Tells the student they now have full access to all DowOS features. One-liner: "Your Dow Medical College ID has been verified. You're all set." No further action needed. |
| **Rejected** | "Action needed — your Dow ID upload" | Tells the student the upload was rejected. Includes the reason (same text shown in the app badge). Directs them to re-upload via the Profile page. |

**Implementation:** Emails are sent via a Supabase Edge Function triggered by the same admin action that flips `dow_id_status`. The Edge Function calls the project's email provider (e.g. Resend or SendGrid — key in `.env.local`). Template is plain-text + simple HTML. No rich marketing layout needed.

---

## 3.5 Periodic email broadcasts (separate from Dow ID)

The email infrastructure built here (Edge Function → email provider) is also the delivery channel for **project-wide announcements and feature updates** sent to all users periodically. These are one-off blasts (e.g. "New feature: Viva Bot is live", "App update v1.2"). They are:

- Sent manually by Salik / Ammaar (not automated on a schedule).
- Subject + body drafted in a simple admin form or Notion page before sending.
- Opt-out link included in every email (legal requirement; preference stored in `user_preferences.email_notifications`).
- Frequency target: ≤ 2 per month. Students won't unsubscribe if the signal-to-noise is high.

The admin trigger for these broadcasts is a separate route (`/admin/emails/broadcast`) — it's not part of the Dow ID flow. But it reuses the same Edge Function + email provider wiring.

---

## 4. Database

| Table | Changes |
|---|---|
| `users` | `dow_id_status text DEFAULT 'pending'` (enum: `pending`, `approved`, `rejected`), `dow_id_photo_url text`, `dow_id_rejection_reason text`, `dow_id_submitted_at timestamptz` |

RLS: `dow_id_status` and `dow_id_rejection_reason` are readable by the student (self-only). Writable only by service-role (admin actions).

---

## 5. Build placement

| Component | Day |
|---|---|
| `dow_id_status` + `dow_id_rejection_reason` columns (migration) | 12 |
| Admin approval queue page (`/admin/id-approval`) | 13 |
| Reject reason picker | 13 |
| Student-side status badge + re-upload button (Profile page) | 10–11 |
| FCM push on approve / reject | 13 |

---

## 6. Sources

- `FINAL_LOCKED_DECISIONS.md` — Dow ID verification is manual
- `ui-page-structure.md` §10 — Profile page status badge placement
- `5_UXUI_GUIDELINES.md` §4 — Signup flow step 4 (Verification Status)
