# Decision: AI Routing & Fallback

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Day 6 decision

---

## 1. What was already decided (do not re-debate)

`model-selection.md` §3 defines the full three-tier routing and every call in the app. This doc locks two things that were left as "validate empirically":

1. The complexity-router trigger set — are the thresholds correct without a live benchmark?
2. The fallback chain — what happens when a model is down or times out?

---

## 2. Complexity router — locked as specced

The triggers in `model-selection.md` §3.2 are locked without running a 20-question live benchmark. Rationale:

- The cost model in `model-selection.md` §5 already assumes **10 % of queries hit Tier 2** (DeepSeek R1). The trigger set was designed to produce exactly that hit rate.
- The triggers are conservative — they only fire on clear signals (reasoning keywords, query length > 60 words, documented struggle history, viva scores < 50 %). False positives (firing Tier 2 on a simple question) cost money but don't break anything. False negatives (missing a complex question) get caught by the bump safety net in Quick/Tutor modes.
- Validation happens in production: after 1 week of beta (500 DAU), we pull the Tier 1 vs Tier 2 split from logs. If it drifts above 15 % or below 5 %, adjust the keyword list or the query-length threshold. No architecture change needed — it's a config tweak.

**Locked trigger set (copy from `model-selection.md` §3.2):**

| Signal | Threshold |
|---|---|
| Reasoning keywords in query | `calculate`, `derive`, `compare`, `why does`, `mechanism`, `pathophysiology`, `differentiate` |
| Query length | > 60 words |
| Student has weak/strong struggle signal on this subtopic | Any signal in `student_memory` |
| Viva bot scored < 50 % on this topic in last session | Yes |
| Query references multiple subtopics or modules | Yes (detected via embedding similarity to > 1 subtopic) |

Any one signal → `COMPLEX` → Tier 2. All absent → `SIMPLE` → Tier 1.

---

## 3. Fallback chain — new, locked here

Models go down. APIs time out. The app must never show a blank screen when the student is waiting for an answer. Fallback is a priority-ordered chain with hard timeouts at each step.

### 3.1 Tier 1 fallback (Flash is the primary interactive model)

```
Attempt 1: Gemini 2.5 Flash  (primary)
  timeout: 8 s to first token
  on timeout or 5xx →

Attempt 2: Gemini 2.5 Flash  (retry, same endpoint)
  timeout: 5 s to first token
  on timeout or 5xx →

Attempt 3: DeepSeek V3.2 Chat  (cross-provider fallback)
  timeout: 10 s to first token  (R1 is slower)
  on timeout or 5xx →

Show error: "Something went wrong. Try again in a moment."
  + retry button
```

Rationale:
- One retry on Flash before cross-provider fallback. Google outages are usually < 5 s blips — a single retry catches most of them.
- DeepSeek Chat (not Reasoner) as the cross-provider fallback. Chat is faster than Reasoner and adequate for simple answers. If Flash is completely down, we'd rather give the student a decent answer in 4 s than a perfect one in 12 s.
- Hard stop after 3 attempts. No infinite retry loops — the student sees a clear error and can tap retry manually.

### 3.2 Tier 2 fallback (R1 is the reasoning model)

```
Attempt 1: DeepSeek V3.2 Reasoner  (primary)
  timeout: 15 s to first token  (reasoning takes longer)
  on timeout or 5xx →

Attempt 2: Gemini 2.5 Flash  (downgrade to Tier 1)
  timeout: 8 s to first token
  on timeout or 5xx →

Show error + retry button (same as above)
```

Rationale:
- R1 gets one attempt with a generous timeout (15 s). Reasoning models are inherently slower.
- Fallback is a **downgrade to Flash**, not a retry on R1. If DeepSeek is down, retrying won't help. Flash can handle most complex questions adequately — just without the deep reasoning chain.
- The student sees no indication of the downgrade. The UX is identical. If they notice the answer feels shallow, they can ask a follow-up.

### 3.3 Tier 3 fallback (batch / background jobs)

Batch jobs (ingestion, memory distillation, MCQ explanation gen) have no user-facing latency requirement. They use a simple retry queue:

```
Attempt 1 → wait 5 s → Attempt 2 → wait 30 s → Attempt 3 → mark job as "errored"
```

Errored jobs show in the admin dashboard status column. No student-facing impact.

### 3.4 Google Search grounding fallback

Search grounding is self-gated by Gemini — if Google Search is down, Gemini simply doesn't use it and answers from textbook context alone. No explicit fallback needed. The student sees no difference (citations just won't include `[W]` web sources for that response).

---

## 4. Monitoring

After launch, track these in logs (structured JSON, ship to Vercel logs):

| Metric | Alert threshold |
|---|---|
| Tier 2 hit rate (% of queries routed to R1) | Outside 5 %–15 % band |
| Tier 1 fallback trigger rate | > 2 % of Tier 1 calls |
| Tier 2 fallback trigger rate | > 5 % of Tier 2 calls |
| Flash first-token latency p95 | > 2 s |
| R1 first-token latency p95 | > 8 s |

If any alert fires, investigate the same day. The routing config (keyword list, query-length threshold) and timeout values are all in a single config object — no code deploy needed to tune them.

---

## 5. What changes vs existing docs

| Item | Was | Now |
|---|---|---|
| Complexity router | Specced in `model-selection.md` §3.2, marked "validate empirically" | Locked as-is. Validate via production logs after Week 4 beta. |
| Fallback chain | Not specced anywhere | New. Defined here. 3-attempt chain for Tier 1, 2-attempt downgrade for Tier 2, retry queue for Tier 3. |
| Search grounding | Assumed always-on | Confirmed self-gating. No explicit fallback. |

---

## 6. Build placement

The fallback logic is a wrapper around every LLM call. Build it as a single reusable `callWithFallback(tier, prompt, context)` utility in `src/lib/ai.ts` on **Day 17** (when the chat Route Handler is built). All subsequent AI calls use this wrapper — no per-feature fallback code.
