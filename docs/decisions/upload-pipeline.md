# Decision: Upload Pipeline & Background Processing

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Day 10 pre-build decisions

---

## 1. Context

Three admin upload flows need background processing:

1. **MCQ CSV upload** → parse → validate → save → trigger citation enrichment (§1.6 in `admin-content-upload.md`)
2. **Textbook PDF upload** → text extraction → chunking → embedding → indexing (§2.3)
3. **On-demand enrichment jobs** — citation enrichment + explanation-fix → call Gemini per question → update DB (§1.6, §1.8)

Each has a **fast part** (upload + validate, < 5 s) and a **slow part** (AI processing, 10 s – 5 min). The fast part returns immediately. The slow part runs in the background and streams progress back to the admin UI.

---

## 2. What was considered

| Option | Pros | Cons |
|---|---|---|
| Supabase Edge Functions | Close to DB, low-latency writes | Deno runtime (not Node.js). Supabase Pro not available at launch. |
| Vercel Route Handlers (serverless) | Next.js native. Node.js. Already the deployment target. No extra infra. | Default timeout 10 s on Free — mitigated by SSE (see §3). |
| Bull / BullMQ queue | No timeout. Proper retry. Job tracking. | Extra infra (Redis). Overkill for launch volume (< 1 000 questions total at soft launch). |

---

## 3. Decision: Vercel Route Handlers + SSE streaming

**Why:** Supabase Pro is not available at launch. Vercel is already the deployment target — keeping all API routes as Next.js Route Handlers means one deployment, one set of logs, one billing line. The slow parts use **Server-Sent Events (SSE)** to stream progress back to the admin UI, which keeps the HTTP connection alive for the full duration of the job regardless of serverless timeout limits (as long as data keeps flowing).

### 3.1 Architecture

```
Admin UI                    Vercel Route Handler           Supabase          Gemini
    │                              │                          │                 │
    │  POST /api/admin/upload      │                          │                 │
    │ ────────────────────────────>│                          │                 │
    │                              │  INSERT rows             │                 │
    │                              │ ────────────────────────>│                 │
    │  { status: "saved" }         │                          │                 │
    │ <────────────────────────────│                          │                 │
    │                              │                          │                 │
    │  GET /api/admin/enrich       │  (SSE — streaming)       │                 │
    │ ────────────────────────────>│                          │                 │
    │                              │  SELECT questions        │                 │
    │                              │ <────────────────────────│                 │
    │                              │                          │                 │
    │  event: progress { n: 3 }    │  POST → Gemini           │                 │
    │ <────────────────────────────│ ────────────────────────────────────────── >│
    │  event: progress { n: 4 }    │ <──────────────────────────────────────────│
    │ <────────────────────────────│  UPDATE explanation      │                 │
    │  …                           │ ────────────────────────>│                 │
    │  event: done { total: 100 }  │                          │                 │
    │ <────────────────────────────│                          │                 │
```

### 3.2 SSE implementation pattern

```typescript
// src/app/api/admin/enrich/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: object) => {
        controller.enqueue(
          new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        )
      }

      // Heartbeat keeps connection alive
      const heartbeat = setInterval(() => send('heartbeat', {}), 15_000)

      const questions = await fetchUnenrichedQuestions()
      for (const q of questions) {
        await enrichQuestion(q)          // calls Gemini + updates DB
        send('progress', { done: q.index, total: questions.length })
      }

      clearInterval(heartbeat)
      send('done', { enriched: questions.length })
      controller.close()
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

The admin UI opens an `EventSource` to this endpoint, updates a progress bar, and shows a "Done — 100 questions enriched" toast when the `done` event fires.

### 3.3 Idempotency

Every enrichment run checks whether a question has already been processed:

- **Citation enrichment:** skips rows where `citation_enriched_at IS NOT NULL`
- **Explanation-fix:** skips rows where `explanation_fixed_at IS NOT NULL`

This means:
- If the connection drops mid-run, the admin can re-trigger and it picks up where it left off.
- Re-running is always safe — no double-processing.

### 3.4 Timeout safety

SSE connections on Vercel serverless functions have no hard timeout as long as data is being sent. The heartbeat event (every 15 s) keeps the connection alive between questions. If Vercel kills the connection anyway (rare edge case), idempotency means the next re-trigger picks up cleanly. No data is lost.

---

## 4. Database additions

Two timestamp columns on `mcq_questions` (added in the Phase 2 migration):

| Column | Type | Purpose |
|---|---|---|
| `citation_enriched_at` | timestamptz, nullable | Set when citation enrichment completes for this row. Drives the idempotency skip. |
| `explanation_fixed_at` | timestamptz, nullable | Set when explanation-fix completes for this row. |

No separate jobs table needed at launch scale. The status columns on the questions themselves are the job tracker.

---

## 5. Migration path

When Supabase Pro becomes available and the project matures, the enrichment logic can move to **Supabase Edge Functions** if latency to the database becomes a bottleneck. The API contract (SSE streaming + idempotent per-row processing) stays the same — only the execution environment changes. The admin UI doesn't need to change at all.

---

## 6. Cost at launch scale

| Operation | Frequency | Estimated duration | Gemini cost |
|---|---|---|---|
| MCQ CSV upload + save (100 Qs) | Once per batch | < 2 s | $0 (no AI call) |
| Citation enrichment (100 Qs) | On demand, ~monthly | 2–5 min | ~$0.30 |
| Explanation-fix (100 Qs) | On demand, ~monthly | 2–5 min | ~$0.30 |
| PDF text extraction (1 PDF, best model) | Per upload (~10 PDFs total) | 1–3 min | ~$0.50–2.00 |

Total background-processing cost at launch: **< $5/month**. Negligible against the $41/mo AI budget.

---

## 7. Sources consulted

- `docs/admin-content-upload.md` — upload flows and Edge Function triggers
- `docs/decisions/rag-architecture.md` — ingestion pipeline high-level design
- Vercel serverless function docs — timeout behaviour, SSE support
