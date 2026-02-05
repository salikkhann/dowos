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
3. Student gets FCM push: "Your Dow ID has been verified! ✓"
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
