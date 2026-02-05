# Decision: Marketplace Operational Spec

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Product decision sprint

---

## 1. What was already decided

From `FINAL_LOCKED_DECISIONS.md`: textbook listings (no verification needed), bundling encouraged, 10 % commission on sales, manual dispute arbitration, seller withdrawal at PKR 500 min with 0 % fees and 2–5 business day bank transfer. This doc formalises the flows.

---

## 2. Listing flow (buyer + seller)

### 2.1 Seller creates a listing

```
Step 1: What are you selling?
┌─────────────────────────────────────┐
│  📚 Sell on Marketplace             │
│                                     │
│  [ 📷 Add Photos ]                 │  ← up to 3 photos
│                                     │
│  Title:  [_________________________] │  ← e.g. "Robbins Pathology 10th Ed"
│  Price:  [PKR _______________]       │
│  Condition: [ New ] [Like New] [Good]│
│  Bundle?: [ Yes ] [ No ]            │  ← if Yes, show "add another item"
│  Description: [___________________]  │  ← optional, free text
│                                     │
│  [ List It ]                        │
└─────────────────────────────────────┘
```

- No verification step. Students trust each other (community is Dow-only, locked behind Dow ID approval).
- Listings are live instantly (Supabase Realtime — all buyers see new listings in real time).
- Seller can edit or remove their listing at any time.

### 2.2 Buyer purchases

```
┌─────────────────────────────────────┐
│  📚 Robbins Pathology 10th Ed       │
│  Condition: Like New                │
│  Seller: Ahmed K.                   │
│  Listed: 2 days ago                 │
│                                     │
│  Price:        PKR 800              │
│  Commission:   PKR  80  (10%)       │  ← transparent
│  You pay:      PKR 880              │
│                                     │
│  [ Buy — 880 Cr ]                  │  ← disabled if balance < 880
│  [ Message Seller ]                 │  ← optional, via in-app chat or WhatsApp
└─────────────────────────────────────┘
```

On **Buy**:
1. Deduct 880 Cr from buyer's balance (`credit_transactions`, type: `marketplace_purchase`).
2. Credit 800 Cr to seller's balance (80 Cr commission retained by DowOS).
3. Listing status → `sold`.
4. Both buyer and seller get a push: "Transaction complete. Arrange handoff directly."

### 2.3 Handoff

Handoff is **peer-to-peer**. The buyer and seller arrange it themselves (WhatsApp, in person on campus). DowOS does not facilitate physical delivery. The "Message Seller" button opens WhatsApp with the seller's number (same trust model as Lost & Found).

---

## 3. Seller withdrawal

When a seller has accumulated credits from sales, they can withdraw to a bank account.

### 3.1 Withdrawal flow

```
┌─────────────────────────────────────┐
│  💰 Withdraw Earnings               │
│                                     │
│  Available: 2 500 Cr                │
│  Minimum withdrawal: 500 Cr         │
│                                     │
│  Amount: [PKR ________________]     │  ← must be ≥ 500
│                                     │
│  Bank account:                      │
│  [ Enter account details ]          │  ← name, bank, account number
│                                     │
│  Fees: PKR 0                        │  ← always 0
│  You receive: PKR [amount]          │
│  Timeline: 2–5 business days        │
│                                     │
│  [ Request Withdrawal ]             │
└─────────────────────────────────────┘
```

On **Request Withdrawal**:
1. Insert row in `withdrawal_requests` (status: `pending`).
2. Deduct amount from seller's `credits_balance`.
3. Ammaar / Salik sees the request in the admin dashboard.
4. They verify the seller is legitimate (has real sales, not a fake account).
5. Process via bank transfer (manual, outside the app).
6. Mark withdrawal as `completed` in admin → seller gets push: "Your withdrawal of PKR X has been processed. Expect it in 2–5 business days."

**Note:** The seller enters bank account details in the withdrawal form. This is sensitive financial information — Claude Code / Windsurf must NOT auto-fill this. The student types it manually. The data is stored encrypted and is only visible to the admin during processing.

---

## 4. Dispute arbitration

If a buyer reports an issue (item not as described, seller ghosted after payment):

```
┌─────────────────────────────────────┐
│  ⚠️  Report an Issue                │
│                                     │
│  Order: Robbins Pathology 10th Ed   │
│  Seller: Ahmed K.                   │
│                                     │
│  What happened?                     │
│  [ ] Item not as described          │
│  [ ] Seller did not show up         │
│  [ ] Item is damaged                │
│  [ ] Other (describe)               │
│                                     │
│  [ Submit Report ]                  │
└─────────────────────────────────────┘
```

On submit:
1. Report goes to admin dashboard (Salik / Ammaar).
2. They contact both parties (WhatsApp / phone) and arbitrate manually.
3. Resolution options: full refund to buyer, partial refund, or no action (if buyer's claim is unfounded).
4. Refund is a credit re-credit to the buyer's balance + debit from the seller's balance (if they've already withdrawn, it's flagged for manual handling).

Dispute arbitration is manual and rare (expected < 5 disputes / month at MVP scale). No automated resolution system needed.

---

## 5. Database

| Table | Key columns |
|---|---|
| `marketplace_listings` | `id`, `seller_id`, `title`, `description`, `price_pkr`, `condition` (enum: new/like_new/good), `photos jsonb`, `is_bundle boolean`, `bundle_items jsonb`, `status` (enum: active/sold/removed), `created_at` |
| `marketplace_transactions` | `id`, `listing_id`, `buyer_id`, `seller_id`, `buyer_paid_pkr`, `seller_received_pkr`, `commission_pkr`, `created_at` |
| `withdrawal_requests` | `id`, `user_id`, `amount_pkr`, `bank_details jsonb` (encrypted), `status` (enum: pending/processing/completed/failed), `created_at`, `completed_at` |
| `dispute_reports` | `id`, `transaction_id`, `reporter_id`, `reason text`, `status` (enum: open/resolved), `resolution text`, `created_at`, `resolved_at` |

---

## 6. Build placement

Marketplace is a Phase 2 revenue feature. Ships in **Week 7**.

| Component | Approximate day |
|---|---|
| Database migration | 30 |
| Listing creation page (photos, title, price, condition, bundle) | 32 |
| Listing browse page (search, filters) | 32 |
| Buy flow (price breakdown, credits debit, seller credit) | 33 |
| Seller withdrawal flow | 33 |
| Dispute report form | 33 |
| Admin: withdrawal queue, dispute queue | 33 |

---

## 7. Sources

- `FINAL_LOCKED_DECISIONS.md` — no verification, bundling, 10 % commission, manual withdrawal (PKR 500 min, 0 % fees, 2–5 days), manual dispute arbitration
- `01_PRD_OVERVIEW.md` — Marketplace feature spec
- `credits-payment.md` — how credits work
