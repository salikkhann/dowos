# Decision: Dow Credits Top-Up & Pro Upgrade Flow

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Product decision sprint

---

## 1. What was already decided

From `FINAL_LOCKED_DECISIONS.md`:
- All in-app payments use **Dow Credits** (manual top-up, verified in 5–10 min).
- Students load credits via **Easypaisa or JazzCash**.
- Payment is processed by the payment provider immediately; credits appear in DowOS after manual verification by the team (Salik / Ammaar) in 5–10 min.
- Automated processing is a Phase 2 addon (not MVP).
- Pro subscription: **PKR 3 000 / year**, annual only.

This doc formalises the UX flows that Windsurf will build from.

---

## 2. Dow Credits top-up flow

### 2.1 Where it starts

Three entry points, all leading to the same flow:

| Entry point | How student gets there |
|---|---|
| Profile card — credits balance tap | Tap the `💰 240 Cr` row on the glassmorphic card |
| Credits balance zero + trying to buy something | DowEats cart checkout, Marketplace purchase, Pro upgrade |
| Settings → Wallet | Explicit navigation to manage credits |

### 2.2 The flow

```
┌─────────────────────────────────────┐
│  💰 Dow Credits                     │
│  Balance: 240 Cr                    │
├─────────────────────────────────────┤
│                                     │
│  [ + Add Credits ]                  │  ← primary CTA, Teal button
│                                     │
│  How it works:                      │
│  1. Send money via Easypaisa or     │
│     JazzCash to our number          │
│  2. Screenshot the receipt          │
│  3. Submit it here                  │
│  4. Credits appear in 5–10 min      │
│                                     │
│  ┌─ Recent Transactions ─────────┐  │
│  │  +500 Cr  Feb 05  ✓ Done     │  │
│  │  −150 Cr  Feb 04  DowEats    │  │
│  │  −3000 Cr Feb 01  Pro Sub    │  │
│  └────────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 2.3 "Add Credits" sub-flow

```
Step 1: Amount selection
┌─────────────────────────────────────┐
│  How many credits to add?           │
│                                     │
│  [ 500 ]  [ 1 000 ]  [ 3 000 ]     │  ← preset chips (touch targets 44 px)
│  [ Custom amount ]                  │
│                                     │
│  1 Credit = PKR 1                   │  ← always show the conversion
│  You selected: 1 000 Cr = PKR 1000  │
│                                     │
│  [ Next ]                           │
└─────────────────────────────────────┘

Step 2: Payment instructions
┌─────────────────────────────────────┐
│  Send PKR 1 000 to:                 │
│                                     │
│  Easypaisa: 03XX-XXX-XXXX          │  ← team's registered number
│  JazzCash:  03XX-XXX-XXXX          │
│                                     │
│  [ Copy number ]                    │  ← one tap to copy
│                                     │
│  After sending, upload your receipt │
│  screenshot below.                  │
│                                     │
│  [ 📷 Upload Receipt ]             │  ← opens camera/library picker
│                                     │
│  [ Back ]                           │
└─────────────────────────────────────┘

Step 3: Pending confirmation
┌─────────────────────────────────────┐
│  ⏳ Verifying your payment...       │
│                                     │
│  Amount: PKR 1 000 (1 000 Cr)      │
│  Submitted: 2:34 PM                 │
│  Status: Pending                    │
│                                     │
│  Credits usually appear in 5–10 min.│
│  You'll get a notification when     │
│  they're ready.                     │
│                                     │
│  [ Done ]  ← goes back to wallet   │
└─────────────────────────────────────┘
```

### 2.4 Admin side (Ammaar's job)

When a receipt is uploaded:
1. A row appears in the admin dashboard under **Pending Payments**.
2. Ammaar verifies the receipt matches the amount and the team's account.
3. Ammaar taps **Approve** → credits are added to the student's balance. Student gets an FCM push: "1 000 credits added to your wallet!"
4. If the receipt is invalid → **Reject** with a reason. Student gets a push: "Payment could not be verified. Please re-upload or contact support."

This is a simple CRUD screen in the admin dashboard. No payment gateway integration needed for MVP.

---

## 3. Pro upgrade flow

### 3.1 Where it starts

Two entry points:

| Entry point | How |
|---|---|
| Profile card — `Upgrade →` CTA | The Teal link on the glassmorphic card (free users only) |
| Locked feature paywall | Tapping Socratic mode toggle, or any Pro-gated widget, shows an upgrade prompt |

### 3.2 The flow

```
┌─────────────────────────────────────┐
│  ★ Upgrade to Pro                   │
│                                     │
│  PKR 3 000 / year                   │  ← prominent, JetBrains Mono
│                                     │
│  What you get:                      │
│  ✓ Unlimited AI Tutor               │
│  ✓ Socratic deep-dive mode          │
│  ✓ Viva Bot (180 min / mo)          │
│  ✓ Weekly study plans               │
│  ✓ Exam-readiness scores            │
│  ✓ Progress narratives              │
│                                     │
│  Your balance: 240 Cr               │  ← show current credits
│  Cost: 3 000 Cr                     │
│                                     │
│  [ Upgrade — 3 000 Cr ]            │  ← disabled if balance < 3000
│  [ Add Credits First ]             │  ← shown if balance < 3000, links to top-up
│                                     │
│  [ Cancel ]                         │
└─────────────────────────────────────┘
```

### 3.3 Confirmation + debit

If balance ≥ 3 000 Cr and student taps **Upgrade**:

```
┌─────────────────────────────────────┐
│  Confirm upgrade?                   │
│                                     │
│  3 000 Cr will be deducted          │
│  Pro access: 1 year from today      │
│  (expires: DD/MM/YYYY)              │
│                                     │
│  [ Confirm ]   [ Cancel ]           │
└─────────────────────────────────────┘
```

On confirm:
1. Deduct 3 000 from `users.credits_balance`.
2. Set `users.is_pro = true`, `users.pro_expires_at = now() + 1 year`.
3. Insert a row in `credit_transactions` (type: `pro_subscription`, amount: −3000).
4. Show success: "🎉 You're Pro! Enjoy unlimited learning."
5. Profile card immediately flips to Gold border + Pro badge. No page refresh needed (Zustand store update).

### 3.4 What happens when Pro expires

On `pro_expires_at`:
- A scheduled Edge Function (runs daily at 00:00 PKT) checks all Pro users. Any whose `pro_expires_at` has passed → set `is_pro = false`.
- Next time the student opens the app, the Profile card shows `Upgrade →` again.
- A push notification fires on expiry day: "Your Pro subscription expires today. Renew to keep unlimited access."
- Socratic mode toggle goes back to locked. Viva Bot shows "Pro required." No data is lost — all their history, MCQs, memory signals persist.

---

## 4. Database additions

| Table | New columns / rows |
|---|---|
| `users` | `credits_balance integer DEFAULT 0`, `is_pro boolean DEFAULT false`, `pro_expires_at timestamptz` |
| `credit_transactions` | New table: `id`, `user_id`, `type` (`top_up` \| `pro_subscription` \| `doweats` \| `marketplace` \| `merch`), `amount` (positive = in, negative = out), `status` (`pending` \| `confirmed` \| `rejected`), `receipt_url` (for top-ups), `created_at` |
| `pending_payments` | View or filtered query on `credit_transactions` where `type = top_up AND status = pending`. Admin dashboard reads this. |

---

## 5. Build placement

| Component | Day |
|---|---|
| `credits_balance` + `credit_transactions` migration | 12 |
| Wallet page (balance + recent transactions) | 11 |
| Add Credits flow (amount picker → instructions → receipt upload → pending) | 11 |
| Pro upgrade screen + confirm + debit | 11 |
| Admin pending payments queue (approve / reject) | 13 |
| Pro expiry scheduled job | 14 |
| Profile card credits balance wire-up | 10 |

---

## 6. Sources

- `FINAL_LOCKED_DECISIONS.md` — Dow Credits mechanism, Easypaisa/JazzCash, manual verification
- `profile-card-ux.md` — `Upgrade →` CTA placement, credits balance on card
- `01_PRD_OVERVIEW.md` — Pro tier pricing (PKR 3 000 / yr), revenue model
- `rag-architecture.md` §8.3 — Pro feature list (what unlocks)
