# Decision: Viva Bot Orchestration

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Day 8 decision

---

## 1. Context

The Viva Bot runs a loop: ask a question → student answers (voice) → evaluate the answer → optionally ask a follow-up → repeat or end with a score report. The loop has 4–6 turns max per session (180 min / mo cap for Pro).

Two architecture options: a multi-step agent framework (LangGraph) or a hand-rolled state machine. This doc locks the state machine.

---

## 2. Options evaluated

### Option A — LangGraph (multi-step agent framework)

LangGraph is a Python-first orchestration framework for multi-step LLM workflows. It models the Viva loop as a directed graph of nodes (states) with edges (transitions).

**Pros:**
- Declarative. The loop is defined as a graph, not imperative code.
- Handles complex branching (adaptive difficulty, multi-turn reasoning chains) without spaghetti if/else.
- Active ecosystem, good observability tooling.

**Cons:**
- **Python-first.** DowOS is a Next.js / TypeScript app. LangGraph would require either: (a) a separate Python microservice running the Viva loop (adds infra, adds latency, adds deployment complexity), or (b) a TypeScript port (exists but is less mature and less documented than the Python version).
- **Overkill for 4 states.** LangGraph shines when the graph has 10+ nodes with complex branching. The Viva loop is: ASK → EVALUATE → FOLLOWUP (optional) → SCORE. That's 4 states, one optional branch. A state machine handles this in ~60 lines of TypeScript.
- **Discovery doc already says "optional for MVP, MVP uses simpler state"** (`00_DISCOVERY_RESOLVED.md`). This was the original intent.

### Option B — Hand-rolled state machine ✓ CHOSEN

A TypeScript enum + switch statement managing 4 states. Each state is one LLM call. Transitions are explicit.

**Pros:**
- Lives entirely in the Next.js Route Handler. No separate service, no extra infra, no deployment complexity.
- Debuggable. Each state is a named function. Logs show exactly which state fired and what the LLM returned.
- Fast to build. ~60 lines of orchestration code + the LLM call wrappers (which already exist via `callWithFallback` from `ai-routing-fallback.md`).
- The loop is short and predictable. There is no scenario in the Viva Bot where the graph becomes too complex for a state machine.

**Cons:**
- If the loop grows significantly (e.g. multi-topic sessions, adaptive difficulty trees with 10+ branches), a state machine becomes hard to maintain. This is a Phase 3+ concern, not an MVP concern.

---

## 3. Locked architecture — state machine

### 3.1 States

```
enum VivaState {
  ASK         = "ASK",          // Generate and present a question
  EVALUATE    = "EVALUATE",     // Score the student's answer
  FOLLOWUP    = "FOLLOWUP",     // Ask a follow-up if answer was partial
  SCORE       = "SCORE",        // Generate final session report
}
```

### 3.2 State transition graph

```
┌─────┐     student          ┌──────────┐
│ ASK │ ──── answers ──────> │ EVALUATE │
└─────┘                      └────┬─────┘
  ▲                               │
  │                     ┌─────────┴──────────┐
  │                     ▼                    ▼
  │              answer partial        answer complete
  │              (score < 70%)         (score ≥ 70% OR
  │                     │               max follow-ups reached)
  │              ┌───────▼───────┐            │
  │              │   FOLLOWUP    │            │
  │              └───────┬───────┘            │
  │                      │                    │
  │              student answers again        │
  │                      │                    │
  │                      ▼                    ▼
  │              ┌──────────────┐     ┌───────────┐
  │              │   EVALUATE   │     │  more Qs? │
  │              │  (re-eval)   │     │  yes → ASK│
  │              └──────┬───────┘     │  no  → END│
  │                     │             └───────────┘
  └─────────────────────┘                    │
       (loop back for next Q)                ▼
                                      ┌───────────┐
                                      │   SCORE   │
                                      └───────────┘
```

### 3.3 Per-state LLM calls

| State | Model | What the prompt does | Max output tokens |
|---|---|---|---|
| ASK | Gemini Flash (Tier 1) | Generates a question on the current topic. Difficulty adapts: if student scored > 70 % on last Q, increase difficulty. | 200 |
| EVALUATE | Gemini Flash (Tier 1) | Receives question + student's transcribed answer. Scores on 3 dimensions (correctness, confidence, articulation) per the mode weights in `viva-scoring.md`. Returns JSON: `{ correctness, confidence, articulation, bonus, feedback }`. | 400 |
| EVALUATE (strict mode deep eval) | DeepSeek R1 (Tier 2) | Same as above but in Strict mode only — R1 is used because Strict mode requires nuanced partial-credit reasoning. | 800 |
| FOLLOWUP | Gemini Flash (Tier 1) | Generates a follow-up question that targets the specific gap in the student's answer. Receives the original Q, the student's answer, and the EVALUATE feedback. | 200 |
| SCORE | Gemini Flash (Tier 1) | Receives the full session log (all Qs, answers, scores). Generates: final score (sum of per-Q scores), strengths list, weaknesses list, study tips. | 600 |

### 3.4 Session management

- Each Viva session is one HTTP request lifecycle on a Next.js Route Handler? **No.** The session spans multiple user turns (student speaks, waits for feedback, speaks again). It is managed as a **persisted session** in Supabase:

```
viva_bot_sessions (id, user_id, mode, topic, state, questions_asked, current_question, scores[], started_at, ended_at)
```

- The client polls (or receives a WebSocket event) for state transitions.
- The Route Handler is stateless — each request reads the current session state from Supabase, executes the next state's LLM call, writes the new state back.
- This makes the system resilient to network drops mid-session. If the student's phone disconnects, the session state is preserved. They can resume.

### 3.5 Session termination rules

A session ends (transitions to SCORE) when any of these are true:

| Rule | Why |
|---|---|
| Student has answered 10 questions | Session length cap — prevents burnout |
| Student explicitly taps "End Session" | Student agency |
| Session has been running for > 30 min | Single-session time cap (the 180 min / mo cap is across all sessions) |
| 3 consecutive answers score < 30 % | Student is clearly not prepared — end with encouragement, not frustration |

### 3.6 Adaptive difficulty

Difficulty is a single integer 1–5, stored per session. It starts at 3 (medium).

| Event | Difficulty change |
|---|---|
| Answer scores ≥ 70 % | +1 (harder) |
| Answer scores < 40 % | −1 (easier) |
| Follow-up answer improves score by ≥ 20 points | No change (student recovered) |
| Difficulty hits 1 or 5 | Clamp. Don't go below 1 or above 5. |

The difficulty integer is passed to the ASK prompt: `"Generate a difficulty-[N] question on [topic]."` Gemini interprets the scale naturally.

---

## 4. Upgrade path to LangGraph

If Phase 3 adds multi-topic sessions, branching difficulty trees, or real-time scoring dashboards, the state machine's switch statement will become unwieldy. At that point:

1. Port the 4 states to LangGraph nodes (Python or TypeScript).
2. The LLM prompts and scoring logic are identical — only the orchestration layer changes.
3. Run LangGraph as a separate Edge Function or serverless function, called by the Route Handler.

This is a clean seam. The state machine is designed so that each state's input/output contract is explicit — porting one state to a graph node is mechanical, not architectural.

---

## 5. Build placement

| Component | Day | Dependency |
|---|---|---|
| `viva_bot_sessions` table + migration | 12 | Supabase |
| State machine orchestrator (`src/lib/viva-orchestrator.ts`) | 25 | `callWithFallback` from `ai-routing-fallback.md`, scoring weights from `viva-scoring.md` |
| Route Handler (`/api/viva/step`) | 25 | Orchestrator |
| Client: mic capture → POST → receive feedback loop | 25 | Voice pipeline from `voice-stt.md` |
| Session report page | 26 | All scores persisted |

---

## 6. Sources

- `model-selection.md` §3.3 — Viva Bot call map (Flash for score, R1 for strict-mode deep eval)
- `viva-scoring.md` — per-mode scoring weights (to be written)
- `00_DISCOVERY_RESOLVED.md` — "LangGraph optional for MVP, MVP uses simpler state"
- LangGraph docs (langgraph.dev) — for Phase 3 upgrade reference
