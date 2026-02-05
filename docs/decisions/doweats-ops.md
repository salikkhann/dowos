# Decision: DowEats Operational Spec

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Product decision sprint

---

## 1. What was already decided

From `FINAL_LOCKED_DECISIONS.md`: item-first menu (not restaurant-first), 6-digit order code, gate delivery via hired rider + Ammaar, peak hours 12:00–1:30 PM, all payments via Dow Credits, 15 % commission. This doc formalises the full UX flow and data model for Windsurf to build from.

---

## 2. Menu structure

### 2.1 Display logic

Items are displayed **item-first**, grouped by food category. Each item shows which restaurant it comes from as a tag:

```
┌─────────────────────────────────────┐
│  🍕 DowEats                         │
│                                     │
│  ── Filter chips ──                 │
│  [ All ] [Biryani] [Burgers]        │
│  [Karahi] [Drinks] [Desserts]       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🍚 Biryani                 │    │
│  │  Burns Road Cafe            │    │  ← restaurant tag, small text
│  │  PKR 180                    │    │
│  │  [ + ]                      │    │  ← add to cart
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🍚 Biryani                 │    │  ← same item, different restaurant
│  │  Sizzle Point               │    │
│  │  PKR 150                    │    │
│  │  [ + ]                      │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🍲 Karahi                  │    │
│  │  Burns Road Cafe            │    │
│  │  PKR 220                    │    │
│  │  [ + ]                      │    │
│  └─────────────────────────────┘    │
│                                     │
│  … (more items)                     │
│                                     │
│  🛒 Cart: 2 items — PKR 330        │  ← sticky bottom bar
└─────────────────────────────────────┘
```

### 2.2 Out-of-stock handling

Items that are out of stock are **removed from the menu entirely** — not greyed out, not marked "unavailable." Ammaar or the restaurant updates the menu daily (or in real time during peak hours). The admin dashboard has a simple toggle per item: visible / hidden.

### 2.3 Peak hours indicator

A banner at the top of the menu shows whether the kitchen is currently accepting orders:

| Time (PKT) | Banner |
|---|---|
| Before 11:30 AM | "Orders open at 11:30 AM" |
| 11:30 AM – 1:30 PM | "🟢 Accepting orders now" |
| After 1:30 PM | "Orders closed for today" |

Students can browse the menu any time, but the **Place Order** button is disabled outside the order window.

---

## 3. Order flow

### 3.1 Cart → Checkout

```
Step 1: Cart review
┌─────────────────────────────────────┐
│  🛒 Your Cart                       │
│                                     │
│  Biryani (Burns Road)    PKR 180    │
│  Karahi (Burns Road)     PKR 220    │
│                                     │
│  Subtotal:               PKR 400    │
│  Commission (15%):       PKR  60    │  ← transparent. Student sees it.
│  Total:                  PKR 460    │
│                                     │
│  Your balance: 1 200 Cr             │
│  After purchase: 740 Cr             │
│                                     │
│  [ Place Order — 460 Cr ]          │
│  [ Edit Cart ]                      │
└─────────────────────────────────────┘

Step 2: Confirmation + order code
┌─────────────────────────────────────┐
│  ✓ Order placed!                    │
│                                     │
│  Your order code:                   │
│                                     │
│      [ 4 8 2 9 1 7 ]               │  ← large, bold, JetBrains Mono
│                                     │
│  [ Copy Code ]                      │  ← one tap to copy to clipboard
│                                     │
│  Show this code to the rider        │
│  at the Dow gate at pickup time.    │
│                                     │
│  Estimated pickup: 12:45 PM         │
│                                     │
│  [ Done ]                           │
└─────────────────────────────────────┘
```

### 3.2 The 6-digit code

- Generated server-side: 6 random digits, unique per order.
- Stored in `doweats_orders.order_code`.
- The rider (or Ammaar at the gate) scans / reads the code to match the student to their order.
- Code is valid for **2 hours** after order placement. After that, the order is auto-cancelled and credits refunded.

### 3.3 Order status tracking

The student can check their order status at any time:

| Status | What it means |
|---|---|
| Placed | Order received. Restaurant is preparing. |
| Ready | Food is ready. Rider is picking it up. |
| At gate | Rider is at the Dow gate. Student should come collect. |
| Collected | Student showed their code and collected. Order complete. |
| Cancelled | Order was cancelled (timeout, restaurant unavailable). Credits refunded. |

Status updates are pushed via FCM: "Your order is ready at the gate! Show code 482917."

---

## 4. Delivery mechanics (operational, not code)

This section documents what Ammaar manages. The code just shows statuses — the humans move the food.

1. **Restaurant prepares the food.** Ammaar confirms with the restaurant that the order is ready → updates status to `Ready` in the admin dashboard.
2. **Rider picks up.** The hired rider collects from the restaurant and brings to Dow gate.
3. **Gate handoff.** During peak hours (12–1:30 PM), Ammaar is at the gate. The student shows their 6-digit code. Ammaar matches it in the admin dashboard and marks the order `Collected`.
4. **Off-peak.** If an order comes outside peak hours (rare — the order window is 11:30–1:30), the rider waits at the gate. The student is notified via push.

---

## 5. Database

| Table | Key columns |
|---|---|
| `doweats_restaurants` | `id`, `name`, `address`, `active boolean` |
| `doweats_menu_items` | `id`, `restaurant_id`, `name`, `category` (enum: biryani/karahi/burgers/drinks/desserts), `price_pkr integer`, `visible boolean`, `photo_url` |
| `doweats_orders` | `id`, `user_id`, `order_code text` (6 digits, unique), `items jsonb` (snapshot of items + prices at order time), `subtotal_pkr`, `commission_pkr`, `total_pkr`, `status` (enum: placed/ready/at_gate/collected/cancelled), `placed_at`, `expires_at` (placed_at + 2 hrs) |
| `credit_transactions` | Row inserted with `type = 'doweats'`, `amount = -total_pkr` on order placement. Refund row inserted if cancelled. |

---

## 6. Build placement

DowEats is a Phase 2 revenue feature. It ships in **Week 5** (after MVP launch).

| Component | Approximate day |
|---|---|
| Database migration (restaurants, menu items, orders) | 28 |
| Menu page (item-first grid, category filters, peak-hours banner) | 29 |
| Cart + checkout + order code generation | 29 |
| Order status page + FCM push on status change | 30 |
| Admin: menu item toggle (visible/hidden), order status updates | 29 |
| Admin: gate handoff screen (show active orders, mark collected) | 30 |

---

## 7. Sources

- `FINAL_LOCKED_DECISIONS.md` — item-first menu, 6-digit code, gate delivery, peak hours, 15 % commission
- `01_PRD_OVERVIEW.md` — DowEats feature spec, revenue model
- `credits-payment.md` — how credits debit
