# DowOS — Locked Decisions Index

**Last updated:** 2026-02-05 | **Status:** All decisions below are LOCKED.

This file is the single source of truth for "what's decided and where's the detail."
Every decision has a dedicated doc in `docs/decisions/`. This index gives you the one-line status and a pointer. Do not re-debate anything marked LOCKED.

---

## Decision docs (each file is the authoritative spec)

| # | Decision | Doc | Status | One-line summary |
|---|---|---|---|---|
| 1 | RAG & AI Tutor Architecture | `decisions/rag-architecture.md` | LOCKED | Hybrid pgvector (dense + BM25 + RRF + cross-encoder). Gemini embedding-001 at 768 dims. Parent-document indexing. Google Search grounding on every query. |
| 2 | Model Selection & Memory | `decisions/model-selection.md` | LOCKED | 3-tier routing: Flash (interactive), DeepSeek R1 (reasoning), Flash-Lite (batch). Structured `student_memory` signal table with weak/strong taxonomy and decay rules. Cost: ~$41/mo at 500 DAU. |
| 3 | Maps Platform | `decisions/maps-platform.md` | LOCKED | MapLibre GL JS + PMTiles. Two maps: Point (bus routes, priority) + Campus (indoor, gated on floor-plan data). Google Geocoding scoped to place-search only. |
| 4 | Education Tab | `decisions/education-tab.md` | LOCKED | Cards grid landing. MCQ: module picker → source toggle (Past Papers default). Phase 2 card slots for Saved Qs, Summaries, Flashcards. |
| 5 | Mobile vs Web UI | `decisions/mobile-web-ui.md` | LOCKED | One component tree, two layout wrappers. 5-item mobile bottom nav. Desktop sidebar with Main / Study / Campus / Identity / System sections. Config-driven via `nav.ts`. |
| 6 | All-Pages UI Structure | `decisions/ui-page-structure.md` | LOCKED | Every screen wireframed. Dashboard 6 widgets. Full route tree. Prayer Times client-side calc (adhan). Announcements audience-targeted. |
| 7 | Profile Card + UX Conventions | `decisions/profile-card-ux.md` | LOCKED | Glassmorphic student card (Gold if Pro). Selfie upload with circular crop. App-wide: skeleton-first loading, transition timing scale, focus rings, contrast rules, reduced-motion. |
| 8 | Voice / STT | `decisions/voice-stt.md` | LOCKED | **Groq Whisper Large v3 Turbo** ($20/mo). + Gemini correction pass for medical terminology. Upgrade path to Deepgram Nova-3 Medical if budget flexes. |
| 9 | AI Routing & Fallback | `decisions/ai-routing-fallback.md` | LOCKED | Complexity router triggers locked as specced in model-selection.md §3.2. 3-attempt fallback chain for Tier 1, 2-attempt downgrade for Tier 2. Validate hit-rate via production logs. |
| 10 | Mobile App Delivery | `decisions/mobile-delivery.md` | LOCKED | **Capacitor.js** wrapping Next.js. Android Play Store immediate submission. iOS deferred to Phase 3. PWA rejected (discoverability + push reliability). |
| 11 | Viva Bot Orchestration | `decisions/viva-bot-orchestration.md` | LOCKED | Hand-rolled **state machine** (4 states: ASK → EVALUATE → FOLLOWUP → SCORE). LangGraph rejected for MVP (overkill for 4 states). Persisted session in Supabase for resilience. |
| 12 | Viva Bot Scoring | `decisions/viva-scoring.md` | LOCKED | 3 modes (Strict / Friendly / Standard). 50-point scale. Per-dimension weights (correctness 25, confidence 10–15, articulation 7–10, adaptive bonus 3–5). LLM prompt structure and report format specced. |
| 13 | Dow Credits + Pro Upgrade | `decisions/credits-payment.md` | LOCKED | Top-up via Easypaisa / JazzCash → receipt upload → manual verify (5–10 min). Pro: PKR 3 000 / yr, annual debit from credits balance. Full UX flow specced. |
| 14 | Dow ID Approval | `decisions/dow-id-approval.md` | LOCKED | Admin queue: approve (instant) or reject (reason picker). Student sees status badge + re-upload CTA on rejection. |
| 15 | Push Notification Permission | `decisions/push-notifications.md` | LOCKED | Ask on **Day 2 of usage** (not first login). Custom priming card before native OS dialog. Max 2 asks lifetime. Quiet hours 10 PM–6 AM PKT, urgent announcements bypass. |
| 16 | DowEats Ops | `decisions/doweats-ops.md` | LOCKED | Item-first menu with restaurant tag. 6-digit order code. Gate delivery 12–1:30 PM peak. 15 % commission (transparent in cart). |
| 17 | Marketplace Ops | `decisions/marketplace-ops.md` | LOCKED | Listings instant (Realtime). 10 % commission. Peer-to-peer handoff. Seller withdrawal: PKR 500 min, 0 % fees, 2–5 days manual bank transfer. Manual dispute arbitration. |
| 18 | Upload Pipeline | `decisions/upload-pipeline.md` | LOCKED | Vercel Route Handlers + SSE streaming for long jobs. Idempotent enrichment (timestamp columns). Migration path to Supabase EFs when Pro available. |
| 19 | Analytics & API Cost Logging | `decisions/analytics-logging.md` | LOCKED | `api_usage_log` (tokens, cost, latency) + `app_events` (DAU/MAU). Server-side cost calc from rate table. `/admin/analytics` dashboard Phase 6. Sentry free tier for errors. |
| 20 | Phase 2 Quick Decisions | (inline — see below) | LOCKED | Sonner toasts · next-themes dark mode (root provider) · minimal 404/error pages · Resend email · two-layer admin auth · Cursor IDE |

---

## ⚠️ Resolved conflicts

| Conflict | Resolution |
|---|---|
| **Rate limits:** Discovery doc said AI Tutor soft 20 / hard 50 msgs/day. `rag-architecture.md` + CLAUDE.md say soft 2 / hard 4. | **Locked: soft 2 / hard 4.** The 20/50 predates the cost model and was a placeholder. The 2/4 numbers are what the $41/mo cost model is built around. |
| **Maps:** Discovery doc said Google Maps SDK. | **Superseded.** MapLibre GL JS. See `maps-platform.md`. Discovery doc updated with a note. |
| **Nav structure:** `5_UXUI_GUIDELINES.md` had old 5-tab nav. | **Updated.** Now shows Dashboard / Education / AI Tutor / Campus / Maps. See the file for the full IA tree. |

---

## Design system (not a decision — a reference)

Design tokens, component specs, dark mode, glassmorphism base, typography: all in `docs/4_DESIGN_SYSTEM.md`. Do not duplicate here.

UX patterns (error handling, loading states, accessibility checklist): `docs/5_UXUI_GUIDELINES.md`.

---

## Rate limits (locked values — use these everywhere)

| Feature | Free soft limit | Free hard limit | Pro limit | Reset |
|---|---|---|---|---|
| AI Tutor | 2 msgs / day (+5 s delay on msg 3–4) | 4 msgs / day (blocked) | Unlimited | Daily (midnight PKT) |
| MCQ Solver | Unlimited | Unlimited | Unlimited | — |
| Viva Bot | Pro-only | Pro-only | 180 min / month | Monthly |

---

## Revenue model (locked)

| Source | Model | Target |
|---|---|---|
| Pro subscriptions | PKR 3 000 / yr. 25 % conversion = 500 students. | PKR 150 K / mo |
| DowEats | 15 % commission on orders | PKR 112 K / mo (M3) |
| Dow Merch | Direct profit per item | PKR 30 K / mo (M3) |
| Marketplace | 10 % commission on textbook sales | PKR 15 K / mo (M3) |
| **Year 1 total** | | **PKR 2.25 M** |

---

## Team structure (locked)

| Person | Role |
|---|---|
| Salik | Full-stack dev. All code. Technical decisions. |
| Ammaar | Ops: rider management, cafe partnerships, gate coordination, admin dashboard usage (approvals, withdrawals, menu updates) |
| Azfar | Content: 400 subtopics, 12 000 MCQs, viva sheets, 25 textbooks upload |
