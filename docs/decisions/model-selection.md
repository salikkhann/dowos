# Decision: Model Selection & Memory Architecture

**Date:** 2026-02-04 | **Status:** LOCKED | **Owner:** Day 3 decision sprint (extended)

---

## 1. Scope

This doc decides two things that the PRD left open:

1. **Which LLM goes where** — every AI call in DowOS mapped to a specific model with a cost justification.
2. **Memory architecture** — how student signals (attendance, MCQ scores, viva performance, module progress, chat history) get stored, weighted, and surfaced so the tutor actually learns about each student over time.

It supersedes the model references in `rag-architecture.md` where the two conflict. RAG pipeline mechanics (chunking, pgvector, hybrid search) remain unchanged.

---

## 2. Pricing baseline (Feb 2026, per 1 M tokens)

All prices verified from official docs. Batch = 50 % off standard; cached input = 10–75 % off depending on provider.

| Model | Input (standard) | Output (standard) | Input (batch) | Output (batch) | Notes |
|---|---|---|---|---|---|
| **Gemini 2.5 Flash** | $0.30 | $2.50 | $0.15 | $1.25 | Free tier available; thinking tokens billed as output |
| **Gemini 2.5 Flash-Lite** | $0.10 | $0.40 | $0.05 | $0.20 | Cheapest Gemini; no Search grounding support |
| **Gemini 2.5 Pro** | $1.25 | $10.00 | $0.625 | $5.00 | >200 k ctx = 2× input price |
| **DeepSeek V3.2 Chat** | $0.28 | $0.42 | — | — | Cache hit input = $0.028 |
| **DeepSeek V3.2 Reasoner (R1)** | $0.28 | $0.42 | — | — | Same price as Chat; thinking tokens included |
| **GPT-4o mini** | $0.15 | $0.60 | $0.075 | $0.30 | 128 k ctx; backup option only |
| **o3-mini** | $1.10 | $4.40 | $0.55 | $2.20 | Reasoning tokens invisible but billed |

**Key insight:** DeepSeek R1 is the cheapest reasoning model on the planet — $0.28 input / $0.42 output. Gemini 2.5 Flash is the cheapest model that supports Google Search grounding. Flash-Lite is cheapest overall but lacks grounding and is weaker on reasoning. The strategy: Flash for the tutor (needs grounding), DeepSeek R1 for heavy reasoning, Flash-Lite for background/batch tasks.

---

## 3. Model routing — every AI call in DowOS

### 3.1 Decision framework

Three tiers, chosen by latency + reasoning depth + cost:

| Tier | When | Model | Why |
|---|---|---|---|
| **Tier 1 — Interactive** | Student is waiting for a reply (chat, tutor, viva feedback) | Gemini 2.5 Flash | Supports Search grounding. Sub-500 ms first token. Good enough reasoning for 90 % of med questions. |
| **Tier 2 — Deep reasoning** | Query triggers the complexity router (see §3.2) | DeepSeek V3.2 Reasoner | 6× cheaper output than Flash for reasoning-heavy tasks. Matches o1-class quality on STEM benchmarks. |
| **Tier 3 — Batch / background** | Ingestion Q&A extraction, memory summarisation, MCQ explanation generation, lost-&-found match scoring | Gemini 2.5 Flash-Lite (batch) | $0.05 input / $0.20 output. No latency requirement. |

### 3.2 Complexity router — when does Tier 2 fire?

A lightweight classifier runs *before* the main call. It costs one Flash-Lite call (~200 input tokens, ~50 output tokens = $0.00001). It returns a single token: `SIMPLE` or `COMPLEX`.

**COMPLEX fires when any of these are true:**

| Signal | Example |
|---|---|
| Query contains reasoning keywords | calculate, derive, compare, why does, mechanism, pathophysiology, differentiate |
| Query length > 60 words | Indicates a multi-part or nuanced question |
| Student has struggled with this subtopic before (weak signal, see §4) | "Explain again why…" after 3 wrong MCQs on the same subtopic |
| Viva bot scored < 50 % on this topic in the last session | The topic is genuinely hard for this student |
| Query references multiple subtopics or modules | Cross-cutting reasoning required |

Everything else → SIMPLE → Tier 1 (Flash + grounding).

### 3.3 Full call map

| Feature | Model | Tier | Latency | Est. tokens per call (in / out) |
|---|---|---|---|---|
| AI Tutor — chat reply | Flash | 1 | < 1 s first token | 4 000 / 600 |
| AI Tutor — complex reasoning | DeepSeek R1 | 2 | 2–4 s first token | 4 000 / 1 200 |
| Viva Bot — score + feedback | Flash | 1 | < 1 s | 2 000 / 400 |
| Viva Bot — strict-mode deep eval | DeepSeek R1 | 2 | 2–4 s | 2 000 / 800 |
| MCQ AI explanation generation | Flash-Lite (batch) | 3 | async | 1 500 / 500 |
| Ingestion Q&A extraction | Flash-Lite (batch) | 3 | async | 2 000 / 800 |
| Memory summarisation (post-session) | Flash-Lite (batch) | 3 | async | 3 000 / 400 |
| Lost & found match scoring | Flash-Lite (batch) | 3 | async | 500 / 100 |
| Complexity classifier | Flash-Lite | 3 | < 200 ms | 200 / 50 |
| Embedding (all) | gemini-embedding-001 | — | < 100 ms | 768-dim output |
| Past-paper Q extraction (ingestion) | Flash-Lite (batch) | 3 | async | 3 000 / 1 200 |
| High-yield frequency scoring (ingestion) | Flash-Lite (batch) | 3 | async | 2 000 / 300 |
| **— Pro features —** | | | | |
| Adaptive difficulty classifier (P2) | Flash-Lite (batch) | 3 | async | 500 / 50 |
| Weekly study-plan generation (P3) | Flash | 1 | async (scheduled) | 5 000 / 800 |
| Deep-dive Socratic drill (P5) | DeepSeek R1 | 2 | < 4 s first token | 4 500 / 1 500 |
| Progress narrative (P6) | Flash-Lite (batch) | 3 | async (scheduled) | 2 000 / 200 |

### 3.4 Why not use a single model everywhere?

Flash cannot reason as deeply as R1 on hard derivation / mechanism questions — medical students encounter these daily. R1 cannot do Search grounding and has higher latency for simple chat. Flash-Lite cannot ground or reason but is 6× cheaper than Flash for batch work. Each model earns its place by being best-in-class for its job.

---

## 4. Memory architecture — weak & strong signals

### 4.1 Principle

The tutor should behave like a teacher who has been watching this student for weeks. It knows:

- What they already get (don't repeat basics)
- What they keep getting wrong (focus there)
- How they learn (style + depth from onboarding)
- What's coming up (upcoming viva, next module)

This requires structured, per-area signal tracking — not just a blob of chat history.

### 4.2 Signal taxonomy

Every piece of student data maps to a **signal strength** and an **area** (subtopic granularity).

| Signal source | Table(s) | Strength | Updates when |
|---|---|---|---|
| MCQ accuracy on a subtopic | `mcq_attempts` → `mcq_statistics` | **Strong** — high volume, objective | Every MCQ submission |
| Viva bot score on a topic | `viva_bot_responses` → `viva_bot_sessions` | **Strong** — scored, structured | Every viva session completion |
| Progress matrix mastery score | `progress_matrix` | **Strong** — composite, pre-calculated | Whenever MCQ or viva updates |
| Chat: student says "I don't understand X" | `chat_messages` (NLU extraction) | **Weak** — single data point, subjective | Post-session memory distillation |
| Chat: student asks the same subtopic 3× in a session | `chat_messages` (pattern detection) | **Weak → upgrades to Strong** after 3 occurrences | Post-session |
| Attendance on module classes | `attendance` / `attendance_summary` | **Weak** — correlates with struggle but isn't direct | Daily |
| Time spent on an MCQ (> 2× median for that question) | `mcq_attempts.time_spent_seconds` | **Weak** — indirect signal | Every MCQ submission |
| Module test marks (when available) | `annual_exam_checklist` | **Strong** — objective exam signal | Admin uploads results |
| High-yield gap (weak on a high-yield subtopic) | `student_memory` × `high_yield_topics` | **Strong** — composite: the student is weak AND the topic is exam-frequent | Recalculated whenever either signal changes |
| Spaced-rep overdue (Pro) | `student_memory` (signal_type = spaced_rep, value < now()) | **Strong** — deterministic schedule miss | Checked on every tutor request |
| Adaptive difficulty level (Pro) | `student_memory` (signal_type = difficulty_level) | **Strong** — set by Flash-Lite after every 5 MCQs | Every 5 MCQ submissions |

### 4.3 Storage — the `student_memory` table

A new table (migration 00003) stores the distilled, per-area memory:

```sql
CREATE TABLE student_memory (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subtopic_id     uuid REFERENCES subtopics(id),          -- NULL = module-level
  module_id       uuid REFERENCES modules(id),
  signal_type     text NOT NULL,                          -- 'mcq_accuracy' | 'viva_score' | 'chat_struggle' | 'time_pressure' | 'attendance' | 'self_report' | 'high_yield_gap' | 'spaced_rep' | 'difficulty_level'
  strength        text NOT NULL CHECK (strength IN ('weak', 'strong')),
  value           numeric,                                -- e.g. 0.42 accuracy, or score 18/25
  summary_text    text,                                   -- human-readable: "struggles with coronary circulation"
  embedding       vector(768),                            -- for semantic retrieval into tutor context
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),

  UNIQUE (user_id, subtopic_id, signal_type)              -- one row per signal per subtopic
);

CREATE INDEX idx_sm_user        ON student_memory (user_id);
CREATE INDEX idx_sm_subtopic    ON student_memory (user_id, subtopic_id);
CREATE INDEX idx_sm_embedding   ON student_memory USING hnsw (embedding vector_cosine_ops);
```

### 4.4 How signals get updated

```
                        ┌─── Strong signals ──────────────────────────┐
                        │  mcq_attempts row inserted                  │
                        │    → trigger updates mcq_statistics         │
                        │    → trigger updates progress_matrix        │
                        │    → trigger UPSERTS student_memory row     │
                        │      (signal_type='mcq_accuracy',           │
                        │       value = new accuracy %,               │
                        │       strength='strong')                    │
                        │                                             │
                        │  viva_bot_session completed                 │
                        │    → same pattern, signal_type='viva_score' │
                        └─────────────────────────────────────────────┘

                        ┌─── Weak signals (batch, post-session) ──────┐
                        │  Session ends (no message for 10 min        │
                        │  or user navigates away)                    │
                        │    → Flash-Lite batch job runs:             │
                        │      "Extract struggle topics and           │
                        │       self-reported confusion from          │
                        │       these chat messages"                  │
                        │    → For each extracted topic:              │
                        │      INSERT student_memory                  │
                        │      (signal_type='chat_struggle',          │
                        │       strength='weak')                      │
                        │    → If same subtopic already has           │
                        │      2 weak signals → upgrade to 'strong'   │
                        └─────────────────────────────────────────────┘

                        ┌─── Weak → Strong promotion ─────────────────┐
                        │  Rule: if a subtopic has ≥ 2 weak signals   │
                        │  within 7 days, set strength = 'strong'     │
                        │  on the most recent one.                    │
                        │  Rationale: repeated weak signals = pattern,│
                        │  not noise.                                 │
                        └─────────────────────────────────────────────┘
```

### 4.5 How memory gets injected into the tutor

When the student sends a message:

1. **Semantic retrieval:** embed the query, search `student_memory` with HNSW — top-5 by cosine similarity. This catches *related* struggles even if the student didn't mention the exact subtopic.
2. **Strong-signal priority:** if any of the top-5 are `strength = 'strong'`, they go first in the injected context. Weak signals are appended after.
3. **Upcoming context:** query `viva_schedules` and `timetable_entries` for the next 7 days. If a viva is coming up on a topic the student is weak on, the system prompt says so explicitly: *"Note: this student has a viva on Coronary Circulation on Feb 8. Their MCQ accuracy on this subtopic is 42 %."*
4. **Budget:** total memory injection ≤ 1 500 tokens (sits alongside the 6 000 token textbook context and 2 000 token short-term chat history within the 8 000 token total context budget from `rag-architecture.md`). If more than 1 500 tokens, drop weakest signals first.

### 4.6 Memory decay

Signals should not be permanent. A student who struggled in January but aced MCQs in February should no longer be flagged.

| Signal type | Decay rule |
|---|---|
| `mcq_accuracy` | Always reflects the *last 10 attempts* on that subtopic. Value auto-updates on every new attempt. |
| `viva_score` | Reflects the *most recent* viva session on that topic. Previous sessions archived but not injected. |
| `chat_struggle` (weak) | Expires after 14 days if no new weak signal on the same subtopic. Row stays but `strength` → `null` (excluded from retrieval). |
| `chat_struggle` (strong, promoted) | Expires after 30 days OR when MCQ accuracy on that subtopic rises above 70 %. |
| `attendance` | Rolling 30-day window only. |

---

## 5. Cost model — full AI spend at 500 DAU

Assumptions: 500 daily active users, 4 messages/day average (free tier hard limit), 10 % trigger Tier 2 (complex), 20 % of messages trigger a Search grounding query.

| Call type | Calls / day | Avg in tokens | Avg out tokens | Model | Cost / day |
|---|---|---|---|---|---|
| Tier 1 (Flash, interactive) | 1 800 | 4 000 | 600 | Flash | $0.68 |
| Tier 2 (R1, reasoning) | 200 | 4 000 | 1 200 | DeepSeek R1 | $0.33 |
| Complexity classifier | 2 000 | 200 | 50 | Flash-Lite | $0.002 |
| Viva feedback | 300 | 2 000 | 400 | Flash | $0.22 |
| Memory distillation (batch) | 500 | 3 000 | 400 | Flash-Lite (batch) | $0.03 |
| MCQ explanation gen (batch) | 200 | 1 500 | 500 | Flash-Lite (batch) | $0.01 |
| Ingestion Q&A (batch) | 50 | 2 000 | 800 | Flash-Lite (batch) | $0.01 |
| Search grounding queries | 400 | — | — | Gemini (per prompt) | $0.04 |
| Embeddings (queries + memory) | 3 000 | 768-dim | — | gemini-embedding-001 | $0.01 |
| **Total** | | | | | **$1.35 / day ≈ $41 / month** |

$41 / month for 500 DAU with a three-model tutor that reasons, searches the web, and remembers each student. Margin is comfortable even at free tier.

---

## 6. What changes vs. previous docs

| Item | Was (PRD / rag-architecture.md) | Now (this doc) |
|---|---|---|
| Embedding dimensions | 1 536 (schema doc) | **768** (MRL truncation, confirmed in rag-architecture.md) |
| Reasoning model | "DeepSeek R1" (vague) | DeepSeek V3.2 Reasoner, with explicit routing triggers |
| Batch / background model | Not specified | Gemini 2.5 Flash-Lite |
| Memory | "pgvector long-term embeddings" | Structured `student_memory` table with signal taxonomy, weak/strong, decay rules |
| user_knowledge_base embedding dim | 1 536 | **768** — update migration accordingly |
| embeddings table (schema doc) | 1 536 dim, IVF index | **768** dim, HNSW index — update migration |

Migration `00002_knowledge.sql` (Phase 3) should use **768 dims** everywhere. The schema doc's `embeddings` table with 1 536 dims is superseded.

---

## 7. Sources consulted

- [Gemini API pricing (official)](https://ai.google.dev/gemini-api/docs/pricing)
- [DeepSeek API pricing (official)](https://api-docs.deepseek.com/quick_start/pricing)
- [OpenAI API pricing (official)](https://openai.com/api/pricing/)
- [Titans + MIRAS: long-term memory via surprise gradients](https://research.google/blog/titans-miras-helping-ai-have-long-term-memory/)
- [AI Memory Systems: Cognitive Architecture deep-dive](https://pub.towardsai.net/ai-memory-systems-a-deep-dive-into-cognitive-architecture-83190b3e1ac5)
- [Rethinking Memory in AI: Taxonomy & Operations](https://arxiv.org/html/2505.00675v1)
- [HippoRAG: knowledge-graph-based memory indexing](https://research.google/blog/titans-miras-helping-ai-have-long-term-memory/)
- Skills consulted: `ai-engineer`, `rag-engineer`, `memory-systems`, `context-manager`
- DowOS schema: `docs/02_DATABASE_SCHEMA.md` (all 35 tables read)
