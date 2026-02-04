# Decision: RAG & AI Tutor Architecture

**Date:** 2026-02-04 | **Status:** LOCKED | **Owner:** Day 3 decision sprint

---

## 1. What was already locked (do not re-debate)

From `FINAL_LOCKED_DECISIONS.md` and `00_DISCOVERY_RESOLVED.md`:

| Item | Decision |
|---|---|
| Primary LLM | Gemini Flash (latest) |
| Fallback / reasoning | DeepSeek R1 (Day 6 decision owns the routing trigger) |
| Embedding vendor | Gemini API |
| Vector store | pgvector on Supabase |
| Memory tiers | Short-term (session / TanStack cache) + Long-term (pgvector) |
| Knowledge corpus | 25 medical textbooks + Dow slides (PDFs uploaded via admin dashboard) |
| Rate limits | Soft 2 msgs/day (+5 s delay), Hard 4 msgs/day (blocked), Pro = unlimited |
| Tutor modes | Chat (free-form) + Tutor (structured drill) |

---

## 2. Open questions this doc resolves

The PRD flagged five items for Day 3:

1. Chunking strategy — fixed vs sentence vs semantic
2. Embedding model variant and output dimensions
3. Retrieval mode — dense-only vs hybrid (sparse + dense)
4. Re-ranking and context-window budget per query
5. Medical terminology density and Q&A extraction from PDFs

**Additional requirement added by product owner (Feb 4):**

6. The tutor must also be able to cite live web / Google Search results, not only the static textbook corpus.
7. The experience must feel seamless and conversational — low latency, streaming, no robotic pauses.

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
┌─────────────────────────────────────────────────────────────────┐
│                        Student sends message                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────┴──────────────┐
              ▼                            ▼
   ┌─── Textbook RAG ───┐      ┌── Google Search Grounding ──┐
   │  1. Metadata filter │      │  google_search tool enabled  │
   │     (module, year)  │      │  on the same Gemini request  │
   │  2. Hybrid retrieve │      │  Gemini auto-queries Google  │
   │     dense + BM25    │      │  and returns groundingChunks │
   │  3. Cross-encoder   │      │  + citation segment indices  │
   │     re-rank top-k   │      └──────────────────┬───────────┘
   │  4. Trim to budget  │                         │
   └────────┬────────────┘                         │
            │  ≤ 8 k tokens of                     │
            │  retrieved context                    │
            ▼                                      ▼
   ┌─────────────────────────────────────────────────────┐
   │          Gemini 2.5 Flash  (streaming)              │
   │  System prompt:                                     │
   │    • user learning_style + explanation_depth        │
   │    • short-term memory (last 10 msgs)               │
   │    • "cite [T1]… for textbook, [W1]… for web"      │
   │  → streams tokens to client                         │
   └─────────────────────────────────────────────────────┘
```

### 4.1 Embedding model

| Parameter | Value | Rationale |
|---|---|---|
| Model | `gemini-embedding-001` | Tops MTEB multilingual; task-type aware; single vendor with Flash |
| Output dimensions | **768** (MRL truncation) | Half the storage of 1536 with <2 % quality loss per Google benchmarks |
| Task type — documents | `RETRIEVAL_DOCUMENT` | Asymmetric: doc embeddings optimised differently from query embeddings |
| Task type — queries | `RETRIEVAL_QUERY` | Gemini enforces this split; critical for recall |
| Max input | 2 048 tokens | Chunks must stay under this limit |

### 4.2 Chunking strategy — semantic with structure preservation

| Rule | Detail |
|---|---|
| Primary split | PDF → extract text (pdf.js or pdfjs on server). Split on section headers first (H1 → H2 → H3), then on paragraph boundaries. |
| Secondary split | If a section exceeds **400 tokens**, use recursive character splitting with separators `["\n\n", "\n", ". ", " "]`. |
| Chunk size target | **300–400 tokens** (~1 200–1 600 chars). Stays well under the 2 048 token embedding limit and keeps each chunk focused on one concept. |
| Overlap | **50 tokens** between adjacent chunks to avoid cutting mid-concept. |
| Metadata attached | `source_id`, `book_title`, `chapter`, `section`, `page_number`, `module_tag` (admin-assigned), `subject_tag`, `batch_relevance[]` |
| Q&A extraction | During ingestion, run a lightweight Gemini Flash call per section: *"Extract up to 3 exam-style Q&A pairs from this text."* Store them as separate chunks tagged `type: qa`. These surface first for drill-mode queries. |

### 4.3 Retrieval — hybrid search

| Step | Detail |
|---|---|
| 1. Metadata pre-filter | SQL WHERE on `module_tag` and optionally `batch_relevance` — eliminates irrelevant textbooks before any vector math. |
| 2. Dense retrieval | pgvector `<=>` cosine similarity, HNSW index, top-20 candidates. |
| 3. Sparse retrieval | PostgreSQL full-text search (`tsvector` / `ts_query`) on the `text` column, top-20 candidates. Medical terms like drug names and anatomical structures are exact-match sensitive — BM25 catches what dense search misses. |
| 4. Reciprocal Rank Fusion | Merge the two result sets: `score = 1 / (k + rank)` with `k = 60`. Default weight split: 0.7 dense / 0.3 sparse. Tunable per query type. |
| 5. Cross-encoder re-rank | Top-10 fused candidates → re-ranked with a lightweight cross-encoder (e.g. `cross-encoder/ms-marco-MiniLM-L-6-v2` via a small Edge Function). Returns top-5. |
| 6. Context budget | Sum token lengths of top-5 chunks. If > 6 000 tokens, drop lowest-scored chunks until under budget. Reserve ~2 000 tokens for the short-term memory window and system prompt. Total context sent to Flash ≤ 8 000 tokens. |

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
| Tutor vs Chat tone | System prompt switches voice: Chat = peer/friend ("hey, good question —"); Tutor = structured guide ("Step 1: …"). Learning style and depth from onboarding profile drive the detail level. |

### 4.6 Long-term memory (pgvector)

After a session ends, key takeaways are embedded and stored in a per-user `user_knowledge_base` table. On the next session, a lightweight semantic search against this table surfaces *"last time you struggled with X"* context — injected into the system prompt. This closes the loop: the tutor remembers what the student already knows and what they found hard.

---

## 5. What to store and where

### Supabase tables (add in migration 00002)

| Table | Purpose | Key columns |
|---|---|---|
| `knowledge_chunks` | Textbook + slide corpus, pre-chunked and embedded | `id`, `source_id`, `text`, `embedding vector(768)`, `module_tag`, `subject_tag`, `chunk_type` (`text` \| `qa`), `metadata jsonb` |
| `knowledge_sources` | Registry of uploaded PDFs / slide decks | `id`, `title`, `file_url`, `module_id`, `uploaded_by`, `status` (`pending` \| `indexed` \| `error`) |
| `chat_sessions` | One row per conversation | `id`, `user_id`, `created_at`, `last_active_at` |
| `chat_messages` | Individual messages with role + content | `id`, `session_id`, `role` (`user` \| `assistant`), `content`, `citations jsonb`, `created_at` |
| `user_knowledge_base` | Per-user long-term memory embeddings | `id`, `user_id`, `summary_text`, `embedding vector(768)`, `created_at` |

### Supabase indexes

```sql
CREATE INDEX idx_chunks_embedding   ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_chunks_fts         ON knowledge_chunks USING gin (to_tsvector('english', text));
CREATE INDEX idx_chunks_module      ON knowledge_chunks (module_tag);
CREATE INDEX idx_user_kb_embedding  ON user_knowledge_base USING hnsw (embedding vector_cosine_ops);
```

### Supabase RLS

- `knowledge_chunks` / `knowledge_sources`: public read (all authenticated users can query the corpus). Insert / update restricted to service-role (admin pipeline only).
- `chat_sessions` / `chat_messages` / `user_knowledge_base`: self-only (user can only see their own rows).

---

## 6. Data flow — ingestion (when admin uploads a PDF)

```
Admin uploads PDF via /admin/upload
        │
        ▼
Next.js Route Handler (server)
  1. Save file to Supabase Storage (knowledge_sources bucket)
  2. Insert row into knowledge_sources (status = pending)
  3. Kick off ingestion Edge Function (or background job)
        │
        ▼
Ingestion pipeline (Edge Function or serverless)
  1. Extract text from PDF (pdf.js)
  2. Split into chunks (semantic + recursive, 300-400 tokens)
  3. For each chunk:
       a. Embed with gemini-embedding-001 (RETRIEVAL_DOCUMENT, 768 dims)
       b. Run Q&A extraction (Gemini Flash) → store as sibling qa-type chunks
       c. Insert into knowledge_chunks with metadata
  4. Update knowledge_sources status → indexed (or error)
```

---

## 7. Data flow — query (when student asks a question)

```
Student types / speaks message
        │
        ▼
Client streams to Next.js Route Handler
  1. Append message to chat_messages
  2. Build short-term memory: last 10 messages from this session
  3. Retrieve textbook context:
       a. Metadata pre-filter (module_tag from student profile)
       b. Dense search (pgvector HNSW, top-20)
       c. Sparse search (FTS, top-20)
       d. RRF merge → cross-encoder re-rank → top-5
       e. Trim to 6 000 token budget
  4. Retrieve user long-term memory (top-3 from user_knowledge_base)
  5. Build Gemini request:
       - system prompt (persona + learning style + depth)
       - short-term memory (10 msgs)
       - long-term memory snippets
       - retrieved textbook chunks with [T1]…[T5] labels
       - google_search tool enabled
  6. Stream Gemini 2.5 Flash response via SSE to client
  7. On completion:
       - persist assistant message + citations to chat_messages
       - (async) if session ended, distill key points → embed → store in user_knowledge_base
```

---

## 8. Cost estimate (per active user per day, free tier: 4 msgs)

| Component | Est. cost |
|---|---|
| Gemini Flash (4 msgs, ~2 k input + 500 output tokens each) | ~$0.002 |
| gemini-embedding-001 (query embeddings, 4 × 768 dims) | < $0.001 |
| Google Search grounding (≤ 4 search queries) | ~$0.001 |
| pgvector compute (shared across all users, amortised) | ~$0.0005 |
| **Total per user per day** | **< $0.005** |

At 500 DAU this is ~$2.50 / day ($75 / month) for the AI layer. Well within a free-tier product budget.

---

## 9. Migration path — what to build in Phase 3

| Phase 3 day | Work item |
|---|---|
| Day 17 | Write migration `00002_knowledge.sql` (tables + indexes + RLS). Deploy. |
| Day 18 | Build ingestion pipeline: PDF upload → chunk → embed → insert. Test with 1 textbook. |
| Day 19 | Build hybrid retrieval function (dense + FTS + RRF + re-rank). Unit-test recall on 50 sample questions. |
| Day 20 | Build chat Route Handler: memory assembly → Gemini streaming with Search grounding → SSE to client. |
| Day 21 | Build chat UI: streaming message bubbles, inline citations ([T] and [W]), session list. |
| Day 22 | Seed first 2–3 textbooks via admin dashboard. Run end-to-end smoke test. |
| Day 23 | Long-term memory distillation: post-session summarise + embed. Integration test. |

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
- Skills consulted: `rag-engineer`, `ai-engineer`, `rag-implementation`, `hybrid-search-implementation`, `embedding-strategies`
