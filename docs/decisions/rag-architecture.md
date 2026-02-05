# Decision: RAG & AI Tutor Architecture

**Date:** 2026-02-04 | **Status:** LOCKED | **Owner:** Day 3 decision sprint

---

## 1. What was already locked (do not re-debate)

From `FINAL_LOCKED_DECISIONS.md`, `00_DISCOVERY_RESOLVED.md`, and `model-selection.md`:

| Item | Decision |
|---|---|
| Tier 1 — interactive LLM | Gemini 2.5 Flash (Search grounding, streaming) |
| Tier 2 — reasoning LLM | DeepSeek V3.2 Reasoner (fires on COMPLEX queries only) |
| Tier 3 — batch / background | Gemini 2.5 Flash-Lite (ingestion, distillation, classifiers) |
| Complexity router | Flash-Lite classifier emits SIMPLE \| COMPLEX; see `model-selection.md` §3.2 |
| Embedding vendor + dims | `gemini-embedding-001`, 768 dims (MRL), asymmetric task types |
| Vector store | pgvector on Supabase (HNSW) |
| Memory tiers | Short-term (session, last 10 msgs) + Long-term (`student_memory` with weak/strong signals; see `model-selection.md` §4) |
| Knowledge corpus | 25 medical textbooks + Dow slides (PDFs) + **past-paper question banks** (CSV / JSON via admin dashboard) |
| High-yield layer | Past-paper CSV/JSON → embed + insert → Flash-Lite batch scores topic frequency → stored in `high_yield_topics`; injected into every tutor prompt |
| Rate limits | Soft 2 msgs/day (+5 s delay), Hard 4 msgs/day (blocked), Pro = unlimited |
| Tutor modes | **Auto** (default — complexity router picks Flash or R1 per query) / **Quick** (Flash, fast answers) / **Tutor** (Flash, step-by-step) / **Socratic** (R1, guiding questions, Pro-gated) — student-selected toggle |
| Pro personalisation | Weekly study plans, exam-readiness scores, Socratic deep-dive, progress narrative — all Pro-only; see §8 |
| Cost target | ~$41 / month at 500 DAU (full breakdown in `model-selection.md` §5) |

---

## 2. Open questions this doc resolves

The PRD flagged five items for Day 3:

1. Chunking strategy — fixed vs sentence vs semantic
2. Embedding model variant and output dimensions
3. Retrieval mode — dense-only vs hybrid (sparse + dense)
4. Re-ranking and context-window budget per query
5. Medical terminology density and Q&A extraction from PDFs

**Additional requirements added by product owner (Feb 4):**

6. The tutor must also be able to cite live web / Google Search results, not only the static textbook corpus.
7. The experience must feel seamless and conversational — low latency, streaming, no robotic pauses.
8. Past-paper questions will be uploaded alongside textbooks. The system must mine them to surface **high-yield topics** (frequently tested) and use that signal when teaching — so the tutor prioritises what actually shows up on exams.
9. **Pro users get a deeper personalisation layer:** weekly study-plan generation, exam-readiness scoring, Socratic deep-dive mode, and progress narratives — all driven by the same student signals the memory system already collects. Socratic mode (DeepSeek R1, guiding questions only) is the headline Pro experience alongside Quick and Tutor modes available to everyone. This is the core value prop of the PKR 3 000 / yr subscription.

---

## 3. Options evaluated

### Option A — Gemini File Search (fully managed RAG)

Google's built-in managed RAG: upload files, Gemini handles chunking, embedding, retrieval, and injection automatically. Zero infrastructure.

**Pros:** Zero ops, free storage, automatic chunking.
**Cons:** Black box — no access to chunk boundaries, no custom metadata filtering (module, subject, batch_year, difficulty), no hybrid BM25 layer, no way to weight user-specific context or inject short-term memory alongside retrieved chunks. Unsuitable for a tutor that must filter by a student's current module and cite specific Dow slides.

### Option B — Hybrid pgvector + gemini-embedding-001 + Google Search grounding ✓ CHOSEN

Custom ingestion pipeline stores textbook/slide chunks in pgvector with rich metadata. Retrieval uses hybrid search (dense vector + BM25 keyword). A separate Google Search grounding call runs in parallel on every query so the tutor can also cite live web sources. Gemini Flash streams the final answer, interleaving textbook citations and web citations.

**Pros:** Full control over chunking, metadata, and retrieval weights. Hybrid search catches exact medical terms BM25 misses semantically. Web grounding adds live citation without extra infra. Stays entirely on Supabase — no new services. pgvector benchmarks show 1185 % more QPS than Pinecone at lower cost for 1 M vectors (Supabase blog, Jan 2025). Gemini embedding-001 tops MTEB multilingual leaderboard and supports MRL truncation.
**Cons:** More code to write than File Search. Requires an ingestion pipeline triggered on admin upload.

### Option C — Separate vector DB (Qdrant or Pinecone) + Gemini embeddings

Move vectors out of Supabase into a dedicated store.

**Pros:** Specialist stores scale to billions of vectors.
**Cons:** Our corpus is ~25 textbooks + slides — conservatively 2–5 M chunks. pgvector handles that comfortably. Adding a second database doubles operational surface, adds a sync problem (metadata lives in Postgres, vectors live elsewhere), and introduces network latency for every retrieval hop. No cost or performance advantage at this scale.

---

## 4. Chosen architecture — detailed spec

```
┌──────────────────────────────────────────────────────────────────────┐
│                      Student sends message                           │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
       ┌─── Mode Toggle (student picks; Auto = default) ───┐
       │  Auto      → Complexity Router decides           │
       │  Quick     → Flash (grounding)                   │
       │  Tutor     → Flash (grounding)                   │
       │  Socratic  → DeepSeek R1 (Pro-gated)            │
       └──────┬──────────────┬────────────┬──────────────┘
              │ Auto         │ Quick/Tutor│ Socratic
              ▼              ▼            ▼
       ┌─ Complexity ─┐ ┌─ Bump ─┐  (R1 always)
       │  Router      │ │ check  │
       │ Flash-Lite   │ │Flash-  │
       │ SIMPLE →     │ │Lite    │
       │   Flash      │ │COMPLEX?│
       │ COMPLEX →    │ │→ R1    │
       │   R1         │ │(1 msg) │
       └──────┬───────┘ └───┬────┘
              │             │
                     │                 │
     ┌───────────────┼──────────────┼──────────────┼───────────────┐
     ▼               ▼              ▼              ▼               ▼
┌─ Textbook RAG ─┐ ┌─ Student  ─┐ ┌─ Past Paper ─┐ ┌── Google  ──┐
│ 1. Meta filter │ │   Memory   │ │    Intel      │ │  Search     │
│    (module,    │ │ 1. Semantic│ │ 1. High-yield │ │  Grounding  │
│     year)      │ │    search  │ │    topics for │ │  (Tier 1    │
│ 2. Dense top-20│ │ 2. Strong  │ │    this module│ │   only;     │
│ 3. Sparse top-20│ │    first   │ │ 2. Frequency  │ │   auto-     │
│ 4. RRF merge  │ │ 3. Upcoming│ │    scores     │ │   gated)    │
│ 5. Re-rank    │ │    viva    │ │ 3. Past Q&A   │ │  → chunks   │
│ 6. MMR dedup  │ │    context │ │    examples   │ │  + cites    │
│ 7. Trim budget│ └────────────┘ └───────────────┘ └─────────────┘
└───────────────┘

  All retrieved context assembled into a single prompt:
  ┌────────────────────────────────────────────────────────────┐
  │  System prompt                                             │
  │    • persona (Auto / Quick / Tutor / Socratic tone)        │
  │    • learning_style + explanation_depth                    │
  │  Short-term memory              ≤ 1 500 tokens            │
  │  Student memory signals         ≤ 1 000 tokens            │
  │  High-yield / past-paper intel  ≤   800 tokens            │
  │  Textbook chunks [T1…T5]       ≤ 4 200 tokens            │
  │  Citation instructions                                     │
  │    • [T n] = textbook  [W n] = web  [P n] = past paper   │
  │  google_search tool (Auto / Quick / Tutor — not Socratic) │
  │  ─────────────────────────────────────────                 │
  │  Total context budget           ≤ 8 000 tokens            │
  └────────────────────────────────────────────────────────────┘
                             │
                             ▼
              SSE stream → client (progressive render)
```

### 4.1 Embedding model

| Parameter | Value | Rationale |
|---|---|---|
| Model | `gemini-embedding-001` | Tops MTEB multilingual; task-type aware; single vendor with Flash |
| Output dimensions | **768** (MRL truncation) | Half the storage of 1536 with <2 % quality loss per Google benchmarks |
| Task type — documents | `RETRIEVAL_DOCUMENT` | Asymmetric: doc embeddings optimised differently from query embeddings |
| Task type — queries | `RETRIEVAL_QUERY` | Gemini enforces this split; critical for recall |
| Max input | 2 048 tokens | Chunks must stay under this limit |

### 4.2 Chunking strategy — semantic with structure preservation + parent-document indexing

**Design principles (from `rag-engineer` skill):** chunk by meaning, not arbitrary token counts. Preserve document structure. Include overlap for context continuity. Add rich metadata for filtering. Never embed everything blindly — each chunk must earn its place.

| Rule | Detail |
|---|---|
| Primary split | PDF → extract text via **Gemini 2.5 Pro** (native PDF ingestion via Files API — preserves layout, tables, multi-column structure without preprocessing). Split on section headers first (H1 → H2 → H3), then on paragraph boundaries. |
| Secondary split | If a section exceeds **400 tokens**, apply recursive character splitting with separators `["\n\n", "\n", ". ", " "]`. Never split mid-sentence. |
| Chunk size target | **300–400 tokens** (~1 200–1 600 chars). Stays well under the 2 048 token embedding limit; each chunk stays focused on one concept. |
| Overlap | **50 tokens** (~15 % of chunk) between adjacent chunks. Prevents context loss at boundaries — a sharp edge flagged by `rag-engineer`. |
| Parent-document indexing | Each chunk stores a `parent_section_id` pointing to the full section text (stored separately, not embedded). When a child chunk is retrieved, the full parent section is available for contextual compression — the model sees the chunk in its original surrounding context before deciding what to include. This follows the Parent Document Retriever pattern from `rag-implementation`. |
| Metadata attached | `source_id`, `book_title`, `chapter`, `section`, `page_number`, `module_tag` (admin-assigned), `subject_tag`, `subtopic_tag`, `batch_relevance[]`, `chunk_type` |
| Q&A extraction | During ingestion, run **Flash-Lite batch** (not Flash) per section: *"Extract up to 3 exam-style Q&A pairs from this text."* Store as sibling chunks tagged `chunk_type: qa`. These surface first for drill-mode queries. Flash-Lite is adequate for extraction; Flash is reserved for interactive calls. |
| Medical term handling | Before embedding, run a lightweight normalisation pass: expand abbreviations common in medical texts (e.g. HTN → hypertension, DM → diabetes mellitus). Attach the expanded form to the chunk's metadata `terms[]` field. BM25 sparse search indexes these expanded terms — critical for recall on medical vocabulary (sharp edge: same embedding model across content types loses domain specificity). |
| Past-paper ingestion | Past papers arrive as **CSV or JSON** (not PDF). Each row / object already contains: `question`, `correct_answer`, `explanation`, `topic_tags[]`, `exam_year`, `exam_type` (`annual` \| `supplementary` \| `mock`). No extraction step needed — admin uploads the structured file directly. Each question is embedded and inserted into `past_paper_questions`, and a mirror copy is stored in `knowledge_chunks` (type: `past_paper`) so it participates in hybrid retrieval during drill mode. These chunks are **never** surfaced as direct answers — they exist to (a) teach the retrieval layer what topics matter and (b) surface as worked examples in Tutor / Socratic drill. |
| High-yield scoring | After all past-paper questions for a module are inserted, a single Flash-Lite batch call receives the full list of `topic_tags[]` across every question and returns a JSON frequency map: `{ "coronary_circulation": 14, "cardiac_output": 9, … }`. Stored in `high_yield_topics` (one row per module-subtopic). Any subtopic appearing in ≥ 3 past papers is flagged `is_high_yield = true`. The flag is injected into the tutor's system prompt and biases retrieval: high-yield chunks get a **1.3× score multiplier** after RRF, before re-ranking. |

### 4.3 Retrieval — hybrid search with dedup and compression

**Design principles (from `rag-engineer` + `hybrid-search-implementation` skills):** pure semantic search misses exact medical terms; pure keyword search misses meaning. Hybrid with RRF is the proven sweet spot. First-stage results must always be re-ranked — using first-stage results directly is a flagged anti-pattern. Apply relevance thresholds, never cram maximum context into the prompt.

| Step | Detail |
|---|---|
| 1. Metadata pre-filter | SQL WHERE on `module_tag`, `subject_tag`, and optionally `subtopic_tag` + `batch_relevance`. Eliminates irrelevant textbooks before any vector math — critical for latency and precision. |
| 2. Dense retrieval | pgvector `<=>` cosine similarity, HNSW index, top-20 candidates. Embed the query with `gemini-embedding-001` using task type `RETRIEVAL_QUERY` (asymmetric from the `RETRIEVAL_DOCUMENT` used at index time). |
| 3. Sparse retrieval | PostgreSQL full-text search (`tsvector` / `ts_query`) on the `text` column **plus** the normalised `terms[]` metadata field, top-20 candidates. Catches exact drug names, anatomical structures, and expanded abbreviations that dense search misses. |
| 4. Reciprocal Rank Fusion | Merge: `score = 1 / (k + rank)`, `k = 60`. Default weight: **0.7 dense / 0.3 sparse**. For drill-mode (Tutor) queries, shift to 0.5 / 0.5 — exam questions rely more on exact terminology. |
| 5. Cross-encoder re-rank | Top-10 fused candidates → re-ranked with `cross-encoder/ms-marco-MiniLM-L-6-v2` (hosted as a single Edge Function, warm-started). Returns top-7. This is the step that turns "pretty good" retrieval into "actually correct" retrieval. |
| 6. MMR diversity filter | Apply Maximal Marginal Relevance on the top-7: `λ = 0.7` (relevance-heavy). Produces **top-5 diverse chunks** — avoids sending 5 chunks that all say the same thing. Pattern from `rag-implementation` skill. |
| 7. Contextual compression | For each of the 5 chunks, retrieve its `parent_section` text. Run a single Flash-Lite call: *"Given this question, extract only the sentences from these passages that are directly relevant."* This trims filler while keeping the answer grounded. Output replaces the raw chunks. |
| 8. Relevance threshold | Drop any chunk whose cross-encoder score falls below **0.3**. Do not pad context with irrelevant material — the model will hallucinate on weak context. Sharp edge from `rag-engineer`. |
| 9. Context budget | Sum token lengths of final chunks. Hard cap: **4 500 tokens** for textbook context. Remaining budget: 2 000 short-term memory + 1 500 student memory signals = 8 000 total. |

### 4.4 Google Search grounding — live web layer

| Parameter | Value |
|---|---|
| Tool | `google_search: GoogleSearch()` passed alongside the textbook context in the same request |
| Models | Gemini 2.5 Flash supports it natively |
| What it does | Gemini auto-decides whether a Google query would help. If yes, it executes queries, pulls `groundingChunks`, and weaves web citations into the response alongside textbook citations |
| Citation format | Response includes `groundingSupports` with segment indices → map to `[W1]`, `[W2]` in the rendered UI |
| When it fires | Every message. Gemini self-gates — for a question like *"what is the mechanism of metformin?"* it will likely lean on textbook context; for *"latest WHO diabetes guidelines 2026"* it will lean on web results. No manual routing needed. |
| Cost note | Billed per search query the model executes (Gemini 2.5 billing: per prompt). Within free-tier limits for ≤ 4 msgs/day per user. Monitor via Google Cloud Console. |

### 4.5 Streaming & conversational UX

| Requirement | How |
|---|---|
| Low latency first token | Gemini 2.5 Flash median first-token latency < 500 ms. Use server-sent events (SSE) from a Next.js Route Handler to stream tokens to the client. |
| No robotic pauses | Stream text as it arrives — do not buffer the full response before rendering. TanStack Query `useInfiniteQuery` or a simple `ReadableStream` consumer on the client handles progressive rendering. |
| Citation anchoring | Citations appear inline as the relevant sentence streams in, not as a footnote block at the end. Frontend maps `groundingSupports` segment indices to the streamed text positions. |
| Memory continuity | Last 10 messages (short-term) are prepended to every request so the model does not repeat itself or lose thread. Stored in `chat_messages` table, cached in TanStack Query. |
| Mode tones | System prompt switches voice per mode: Auto = balanced peer ("let me walk you through…"); Quick = direct ("here's the answer —"); Tutor = structured guide ("Step 1: …"); Socratic = questioning ("what do you think happens when…"). Learning style and depth from onboarding profile drive the detail level within each tone. |

### 4.6 Long-term memory — `student_memory` signal system

The old `user_knowledge_base` blob approach is replaced by a structured signal table (defined in `model-selection.md` §4). Full taxonomy, update triggers, and decay rules live there. This section covers only how memory integrates with the RAG pipeline.

**Injection into every query (budget: ≤ 1 500 tokens):**

1. Embed the student's query → semantic search `student_memory` (HNSW, top-5).
2. Sort results: **strong signals first**, weak signals after. Within each tier, sort by `updated_at` descending (most recent first).
3. Append **upcoming-event context**: query `viva_schedules` for the next 7 days. If any upcoming viva topic overlaps with a weak or strong struggle signal, promote that signal to the top of the injection and add: *"Upcoming viva: [topic] on [date]. Current MCQ accuracy: [value]%."*
4. Append **high-yield intel** for the student's current module: pull the top-5 subtopics from `high_yield_topics` where `is_high_yield = true`, ordered by frequency descending. Include the frequency count so the model understands exam weight.
5. Serialise everything as a compact block in the system prompt. Example:
   ```
   [STUDENT CONTEXT]
   ⚠ Upcoming viva: Coronary Circulation — Feb 8. MCQ accuracy 42 % (strong).
   • Struggles with: cardiac output regulation (strong, viva 18/25)
   • Recently confused about: Frank-Starling mechanism (weak, chat)
   • Mastery: Renal physiology 88 % (strong) — do not re-explain basics here.

   [HIGH-YIELD — Module HAE001]
   🔥 Coronary circulation        — appeared in 14 past papers
   🔥 Cardiac output regulation   — appeared in  9 past papers
      Atrial fibrillation mgmt    — appeared in  5 past papers
   → Prioritise these topics in explanations. If the student asks about something
     not on this list, answer fully but do not go deep unless they follow up.
   ```
6. If total exceeds 1 500 tokens (student memory + high-yield combined), drop weakest signals first. **Never drop** an upcoming-viva signal or a high-yield topic with frequency ≥ 5 — those are exam-critical.

**Post-session distillation (async, Flash-Lite batch):**

After 10 min of inactivity or navigation away, a background job:
1. Reads the session's `chat_messages`.
2. Runs Flash-Lite: *"Identify topics the student struggled with, topics they understood well, and any self-reported confusion. Return as JSON: `{struggles: [], understood: [], confused: []}`"*
3. For each `struggles[]` item: UPSERT `student_memory` with `signal_type = 'chat_struggle'`, `strength = 'weak'`.
4. For each `understood[]` item: if an existing strong struggle signal exists on that subtopic, reduce its `value` by 10 % (the student is improving). This is the decay-on-improvement rule from `model-selection.md` §4.6.

---

## 5. What to store and where

### Supabase tables (migration 00002 = knowledge + chat; migration 00003 = student_memory)

| Table | Migration | Purpose | Key columns |
|---|---|---|---|
| `knowledge_sources` | 00002 | Registry of uploaded PDFs / slide decks | `id`, `title`, `file_url`, `module_id`, `uploaded_by`, `status` (`pending` \| `indexed` \| `error`) |
| `knowledge_sections` | 00002 | Full-text sections (parent documents for contextual compression) | `id`, `source_id`, `section_path` (e.g. `"Ch3 > Coronary Circulation"`), `full_text`, `module_tag`, `subject_tag` |
| `knowledge_chunks` | 00002 | Pre-chunked, embedded child segments | `id`, `source_id`, `parent_section_id` (FK → `knowledge_sections`), `text`, `embedding vector(768)`, `module_tag`, `subject_tag`, `subtopic_tag`, `chunk_type` (`text` \| `qa`), `terms[]` (normalised medical terms), `metadata jsonb` |
| `chat_sessions` | 00002 | One row per conversation | `id`, `user_id`, `mode` (`auto` \| `quick` \| `tutor` \| `socratic`), `created_at`, `last_active_at` |
| `chat_messages` | 00002 | Individual messages with role + content | `id`, `session_id`, `role` (`user` \| `assistant`), `content`, `citations jsonb`, `tokens_used`, `created_at` |
| `past_paper_questions` | 00002 | Questions imported from admin-uploaded CSV / JSON files | `id`, `source_id`, `question_text`, `correct_answer`, `topic_tags[]`, `exam_year`, `exam_type`, `module_id`, `subject_id`, `subtopic_id`, `embedding vector(768)`, `created_at` |
| `high_yield_topics` | 00002 | Derived frequency table: which subtopics appear most in past papers | `id`, `module_id`, `subtopic_id`, `frequency` (int, count of past papers), `is_high_yield` (bool, freq ≥ 3), `last_recalculated` |
| `student_memory` | 00003 | Per-user, per-subtopic signal store (weak/strong) | `id`, `user_id`, `subtopic_id`, `module_id`, `signal_type`, `strength`, `value`, `summary_text`, `embedding vector(768)`, `created_at`, `updated_at` |

### Supabase indexes

```sql
-- knowledge_chunks
CREATE INDEX idx_chunks_embedding   ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_chunks_fts         ON knowledge_chunks USING gin (
  to_tsvector('english', text || ' ' || array_to_string(terms, ' '))
);
CREATE INDEX idx_chunks_module      ON knowledge_chunks (module_tag, subject_tag);
CREATE INDEX idx_chunks_parent      ON knowledge_chunks (parent_section_id);

-- knowledge_sections (no vector index — retrieved by FK, not by similarity)
CREATE INDEX idx_sections_source    ON knowledge_sections (source_id);

-- past_paper_questions
CREATE INDEX idx_pp_embedding       ON past_paper_questions USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_pp_module          ON past_paper_questions (module_id, subject_id);
CREATE INDEX idx_pp_subtopic        ON past_paper_questions (subtopic_id);

-- high_yield_topics (small table, simple btree is fine)
CREATE INDEX idx_hy_module          ON high_yield_topics (module_id, is_high_yield DESC, frequency DESC);

-- student_memory
CREATE INDEX idx_sm_user            ON student_memory (user_id);
CREATE INDEX idx_sm_subtopic        ON student_memory (user_id, subtopic_id);
CREATE INDEX idx_sm_embedding       ON student_memory USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_sm_strength        ON student_memory (user_id, strength, updated_at DESC);
```

### Supabase RLS

| Table(s) | Policy |
|---|---|
| `knowledge_sources`, `knowledge_sections`, `knowledge_chunks`, `past_paper_questions`, `high_yield_topics` | **Read:** all authenticated users. **Insert / update / delete:** service-role only (admin ingestion pipeline). |
| `chat_sessions`, `chat_messages` | **Self-only:** `user_id = auth.uid()` on all operations. |
| `student_memory` | **Self-only read:** `user_id = auth.uid()`. **Write:** service-role only (triggers + batch jobs update signals; students never write directly). |

---

## 6. Data flow — ingestion

Two upload types, two pipelines. Textbooks / slides are PDFs. Past papers are structured CSV or JSON (like AMBOSS / UWorld exports).

```
                  ┌── PDF upload (textbook / slides) ──┐
                  │                                    │
Admin uploads     │  Next.js Route Handler             │
via /admin/upload │    1. Save to Supabase Storage     │
                  │    2. Insert knowledge_sources     │
                  │       (status = pending)           │
                  │    3. Kick off Edge Function       │
                  │                                    │
                  │  Ingestion pipeline:               │
                  │    1. Extract text (Gemini 2.5 Pro │
                  │       via Files API — native PDF)  │
                  │    2. Split → sections             │
                  │       → store knowledge_sections   │
                  │    3. Split sections → chunks      │
                  │       (300-400 tok, 50 overlap)    │
                  │    4. Normalise medical terms      │
                  │       → terms[] metadata           │
                  │    5. Per chunk:                   │
                  │       a. Embed (embedding-001,     │
                  │          RETRIEVAL_DOCUMENT, 768)  │
                  │       b. Flash-Lite Q&A extract    │
                  │          → sibling qa chunks       │
                  │       c. INSERT knowledge_chunks   │
                  │    6. Status → indexed             │
                  └────────────────────────────────────┘

                  ┌── CSV / JSON upload (past papers) ─┐
                  │                                    │
Admin uploads     │  Next.js Route Handler             │
structured file   │    1. Parse CSV → JSON array       │
                  │    2. Validate schema:             │
                  │       { question, correct_answer,  │
                  │         explanation, topic_tags[],  │
                  │         exam_year, exam_type }     │
                  │    3. Insert knowledge_sources     │
                  │       (status = pending,           │
                  │        type = past_paper)          │
                  │    4. Kick off Edge Function       │
                  │                                    │
                  │  Ingestion pipeline:               │
                  │    1. For each row:                │
                  │       a. Embed question + answer   │
                  │          (embedding-001, 768)      │
                  │       b. INSERT past_paper_questions│
                  │       c. Mirror as knowledge_chunk  │
                  │          (type: past_paper)        │
                  │    2. Recalculate high_yield_topics│
                  │       for this module:             │
                  │       Flash-Lite receives all      │
                  │       topic_tags[] → frequency map │
                  │       → UPSERT high_yield_topics   │
                  │         (is_high_yield = freq ≥ 3) │
                  │    3. Status → indexed             │
                  └────────────────────────────────────┘
```

---

## 7. Data flow — query (when student asks a question)

```
Student types / speaks message
        │
        ▼
  ┌─── Mode toggle (student picks, persisted per session; Auto = default) ─┐
  │  Auto      → complexity router decides Flash or R1 per query          │
  │  Quick     → Flash, short direct answers, grounding                   │
  │  Tutor     → Flash, structured step-by-step, grounding                │
  │  Socratic  → R1, guiding questions only (Pro-gated)                   │
  └──────┬───────────────────┬──────────────┬─────────────────────────────┘
         │ Auto              │ Quick / Tutor│ Socratic
         ▼                   ▼              ▼
  ┌─ Complexity Router ─┐ ┌─ Bump ─┐  (R1 always —
  │  Flash-Lite emits   │ │ check  │   skip router)
  │  SIMPLE → Flash     │ │Flash-  │
  │  COMPLEX → R1       │ │Lite    │
  │  (every query)      │ │COMPLEX?│
  └──────┬──────────────┘ │→ R1    │
         │                │(1 msg) │
         │                └───┬────┘
         │                    │
         ▼                    ▼
  ┌─── Parallel context assembly (all run concurrently) ───────────────┐
  │                                                                    │
  │  A. Textbook RAG                                                   │
  │       a. Metadata pre-filter (module_tag, subject_tag)             │
  │       b. Dense (pgvector HNSW top-20) + Sparse (FTS top-20)       │
  │       c. RRF merge (0.7 dense / 0.3 sparse; 0.5/0.5 in Tutor)    │
  │       d. Cross-encoder re-rank → top-7                             │
  │       e. MMR diversity filter (λ=0.7) → top-5                     │
  │       f. Contextual compression (Flash-Lite, parent sections)      │
  │       g. Drop below 0.3 threshold → final chunks [T1…Tn]          │
  │                                                                    │
  │  B. Past-paper intel                                               │
  │       a. Pull high_yield_topics for this module (top-5, freq DESC) │
  │       b. If mode = Tutor AND student is weak on a high-yield topic:│
  │          pull top-2 example past-paper questions on that topic     │
  │          → label as [P1], [P2] in prompt                           │
  │       c. Budget: ≤ 800 tokens                                     │
  │                                                                    │
  │  C. Student memory                                                 │
  │       a. Embed query → HNSW search student_memory top-5           │
  │       b. Sort: strong first, weak after, updated_at DESC           │
  │       c. Overlay upcoming viva / timetable context (next 7 days)  │
  │       d. Budget: ≤ 1 000 tokens                                   │
  │                                                                    │
  │  D. Short-term memory                                              │
  │       Last 10 messages from this session (chat_messages)           │
  │       Budget: ≤ 1 500 tokens                                      │
  │                                                                    │
  └────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
  ┌─── Prompt assembly ────────────────────────────────────────────────┐
  │  System prompt:                                                    │
  │    • persona (Auto balanced / Quick direct / Tutor guide /         │
  │              Socratic questioning)                                  │
  │    • learning_style + explanation_depth (from onboarding)          │
  │    • [STUDENT CONTEXT] block (memory C)                            │
  │    • [HIGH-YIELD] block (past-paper B)                             │
  │    • citation rules: [Tn] textbook, [Wn] web, [Pn] past paper    │
  │  User turn:                                                        │
  │    • short-term history (D) + current message                      │
  │  Context:                                                          │
  │    • textbook chunks (A)                                           │
  │    • past-paper examples (B, if any)                               │
  │  Tool:                                                             │
  │    • google_search (Auto / Quick / Tutor — Flash only)             │
  │  Total: ≤ 8 000 tokens                                            │
  └────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
           Stream chosen model via SSE → client
                               │
                               ▼
  ┌─── On completion (async) ──────────────────────────────────────────┐
  │  1. Persist assistant message + citations → chat_messages          │
  │  2. Update ai_tutor_usage counter for today                        │
  │  3. If session idle 10 min → trigger memory distillation job       │
  │     (Flash-Lite batch: extract struggles / understood → UPSERT    │
  │      student_memory)                                               │
  └────────────────────────────────────────────────────────────────────┘
```

---

## 8. Pro personalisation layer

Free tier gives every student a tutor (Quick + Tutor modes) that knows the textbooks, searches the web, and remembers their struggles. Pro (PKR 3 000 / yr) unlocks **Socratic mode** plus a suite of personalised learning tools. Every feature below is gated behind `users.is_pro = true` and runs on existing signals — no new data collection required.

### 8.1 Feature map

| # | Feature | What it does | Data it uses | Model / where it runs |
|---|---|---|---|---|
| P1 | **Weekly study-plan generation** | Every Sunday night, a personalised 5-day study plan lands in the student's dashboard. It balances: upcoming vivas / exams, high-yield gaps (weak on a high-yield topic = top priority), and learning-style preferences. | `student_memory` (all signals), `high_yield_topics`, `viva_schedules`, `timetable_entries`, `progress_matrix` | Flash (not Lite — this is a reasoning-heavy plan). Runs once / week per Pro user via a scheduled Edge Function. Output stored in `study_plans` table. |
| P2 | **Exam-readiness score** | A single 0–100 score per module that tells the student "you are X % ready for this exam." Combines: MCQ accuracy on subtopics, viva scores, high-yield coverage, and attendance. Displayed on the dashboard module card. | `mcq_statistics`, `viva_bot_sessions`, `progress_matrix`, `high_yield_topics`, `attendance` | Computed as a weighted formula (no LLM). Updated via Supabase trigger on every signal change. Formula in §8.2. |
| P3 | **Socratic deep-dive** | The **Socratic** mode toggle (Pro-gated). The tutor switches to DeepSeek R1 and runs a structured Socratic drill: asks guiding questions, never gives the answer directly, forces the student to derive it. Session ends with a summary of what they learned. | Same as standard tutor + short-term memory | DeepSeek R1 (Tier 2). Prompt includes Socratic constraints. Free users see mode as locked; Pro users get unlimited Socratic sessions. |
| P4 | **Progress narrative** | Once a week, a short paragraph (3–4 sentences) summarises the student's learning journey: what improved, what needs attention, encouragement. Displayed in the dashboard. | `student_memory` diffs (this week vs last week), `progress_matrix` deltas | Flash-Lite batch, weekly, same scheduled job as P1. |

### 8.2 Exam-readiness formula

```
readiness = (
    0.40 × avg_mcq_accuracy_on_high_yield_subtopics
  + 0.30 × avg_viva_score_on_high_yield_subtopics
  + 0.20 × high_yield_coverage                 -- % of high-yield subtopics touched ≥ once
  + 0.10 × attendance_percentage_this_module
) × 100
```

All terms are 0–1 before multiplication. Score is clamped 0–100. Weights intentionally favour MCQ accuracy and viva — those are the closest proxies to actual exam performance. High-yield coverage rewards students who actively work through the most-tested topics. Attendance is a minor nudge (students who skip class tend to score lower, but it's not causal).

### 8.3 What's free vs Pro — the boundary

| Capability | Free | Pro |
|---|---|---|
| Auto mode (default) | ✓ (4 msgs / day) | ✓ (unlimited) |
| Quick mode | ✓ (4 msgs / day) | ✓ (unlimited) |
| Tutor mode | ✓ (4 msgs / day) | ✓ (unlimited) |
| Socratic mode | ✗ | ✓ (unlimited) |
| High-yield topic highlighting in tutor responses | ✓ (same for everyone — it's a retrieval feature) | ✓ |
| Past-paper example questions in drill | ✓ (2 per session) | Unlimited |
| Weekly study plan (P1) | ✗ | ✓ |
| Exam-readiness score (P2) | ✗ | ✓ |
| Progress narrative (P4) | ✗ | ✓ |
| Viva Bot | ✗ | 180 min / mo |

### 8.4 Cost — Pro features add-on

The Pro features are almost free to run because they reuse signals already collected:

| Feature | Extra AI calls / day (at 125 Pro DAU = 25 % of 500) | Extra cost / day |
|---|---|---|
| P1 weekly study plan (Flash, once / user / week) | ~18 | $0.015 |
| P3 Socratic deep-dive (R1, ~2 sessions / day across all Pro users) | ~2 | $0.003 |
| P4 progress narrative (Flash-Lite, weekly) | ~18 | $0.001 |
| P2 exam-readiness score (pure SQL, no LLM) | 0 | $0.000 |
| **Pro add-on total** | | **$0.019 / day ≈ $0.57 / month** |

Pro revenue at 125 subscribers × PKR 3 000 / yr = PKR 375 000 / yr. AI cost for Pro features: ~PKR 1 700 / yr. Margin: **99.5 %**.

---

## 9. Migration path — what to build in Phase 3 + Phase 4

### Phase 3 — Core AI tutor (Days 17–24)

| Day | Work item |
|---|---|
| 17 | Write migration `00002_knowledge.sql` — `knowledge_sources`, `knowledge_sections`, `knowledge_chunks`, `past_paper_questions`, `high_yield_topics`, `chat_sessions`, `chat_messages` + all indexes + RLS. Deploy. |
| 18 | Build **textbook ingestion pipeline**: PDF upload → section split → chunk → normalise terms → embed → Q&A extract (Flash-Lite) → insert. Test with 1 textbook. |
| 19 | Build **past-paper ingestion pipeline**: CSV / JSON upload → validate schema → embed questions → insert `past_paper_questions` + mirror as `knowledge_chunks` (type: past_paper) → recalculate `high_yield_topics`. Test with 1 past-paper file. |
| 20 | Build **hybrid retrieval function**: dense + FTS + RRF + cross-encoder re-rank + MMR + contextual compression + relevance threshold. Unit-test recall on 50 sample questions from the seeded textbook. |
| 21 | Build **chat Route Handler**: read persisted mode → Auto runs full complexity router (Flash-Lite → SIMPLE/COMPLEX); Quick/Tutor run Flash + optional bump; Socratic runs R1 directly → parallel context assembly → prompt assembly → stream via SSE. |
| 22 | Build **chat UI**: streaming message bubbles, inline citations ([T], [W], [P]), session list, **Auto / Quick / Tutor / Socratic mode toggle** (Auto = default; Socratic shows Pro paywall CTA for free users). |
| 23 | Wire **memory distillation**: post-session idle detection → Flash-Lite extract struggles/understood → UPSERT `student_memory` → decay-on-improvement. Integration test. |
| 24 | Seed 2–3 textbooks + 1 past paper via admin dashboard. Full end-to-end smoke test: ask a question, verify citations, verify high-yield block appears, verify memory persists across sessions. |

### Phase 4 — Pro personalisation (Days 25–30)

| Day | Work item |
|---|---|
| 25 | Write migration `00003_student_memory.sql` — `student_memory` table + indexes + RLS + Supabase triggers (mcq_attempts → UPSERT signal, viva_bot_session completion → UPSERT signal). |
| 26 | Build **exam-readiness score** (P2): computed column via trigger using the §8.2 formula. Display on module cards in dashboard. Build **weekly study plan** (P1): scheduled Edge Function (Sunday 23:00 PKT) → Flash generates plan → store in `study_plans` table → display on dashboard. |
| 27 | Build **Socratic deep-dive** (P3): ensure Socratic mode toggle in chat UI routes to R1 + Socratic system-prompt constraints. End-of-session summary. Build **progress narrative** (P4): same weekly job as P1, Flash-Lite paragraph → store + display. |
| 28 | Pro paywall UI: gate Socratic mode + P1–P4 features behind `is_pro` check. Show "upgrade" CTA on locked Socratic toggle and Pro dashboard widgets. Smoke test full Pro flow end-to-end. |

---

## 10. Sources consulted

- [Gemini API — Embeddings](https://ai.google.dev/gemini-api/docs/embeddings)
- [Gemini Embedding: Powering RAG and context engineering](https://developers.googleblog.com/gemini-embedding-powering-rag-context-engineering/)
- [Grounding with Google Search — Gemini API docs](https://ai.google.dev/gemini-api/docs/google-search)
- [Gemini API and AI Studio now offer Grounding with Google Search](https://developers.googleblog.com/en/gemini-api-and-ai-studio-now-offer-grounding-with-google-search/)
- [pgvector vs Pinecone: cost and performance — Supabase blog](https://supabase.com/blog/pgvector-vs-pinecone)
- [File Search Tool — Google Blog](https://blog.google/innovation-and-ai/technology/developers-tools/file-search-gemini-api/)
- [Embedding Models in 2026 — AIMultiple](https://research.aimultiple.com/embedding-models/)
- [Best RAG architectures for medical education — MDPI / Springer surveys](https://www.mdpi.com/2076-3417/16/2/963)
- [Gemini Guided Learning Mode — Tech & Learning](https://www.techlearning.com/how-to/geminis-guided-learning-mode-from-google-ai-what-educators-need-to-know)
- [Mastering the Gemini Ecosystem 2026 — Medium](https://medium.com/@kuntal-c/mastering-the-gemini-ecosystem-a-2026-guide-to-production-grade-ai-agents-53cc79130cab)
- [Socratic method in educational AI — Khan Academy eng blog](https://engineering.khanacademy.org/)
- Skills consulted: `rag-engineer`, `ai-engineer`, `rag-implementation`, `hybrid-search-implementation`, `embedding-strategies`, `ai-product`, `llm-app-patterns`, `memory-systems`
