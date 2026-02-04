# DowOS - Discovery Complete ✅

## Final Locked Architecture

### Frontend Stack

* Next.js 15 (SSG + SSR + ISR hybrid rendering)
* TypeScript
* Tailwind CSS + shadcn/ui
* Zustand (state management)
* TanStack Query (server state + caching)
* Capacitor.js (mobile wrapping)
* Web Speech API + Google Cloud Speech-to-Text (voice)

### Backend Stack

* Supabase (PostgreSQL + Realtime + Auth + Storage)
* Supabase pgvector (long-term memory embeddings)
* Next.js API routes (backend logic)
* Firebase Cloud Messaging (push notifications)

### AI Stack

* Gemini (latest model) for main tutor \& router
* DeepSeek R1 (fallback for complex reasoning, cost optimization)
* LangGraph for Viva Bot workflow (optional for MVP, MVP uses simpler state)
* Google Cloud Speech-to-Text (voice recognition, medical terms)
* Google Cloud Text-to-Speech (voice synthesis)

### Real-Time Architecture

* Supabase Realtime WebSocket for: announcements, viva sessions
* Polling (30s-1min) for: timetables, attendance tracker
* Real-time tracking (every 10s) for: driver GPS only

### Maps

* Google Maps JavaScript SDK
* Custom overlay: Point routes + destinations
* Phase 2: DMC/CHK floor-specific routing

### Rendering Strategy

|Page|Mode|Revalidation|
|-|-|-|
|Timetable|ISR|5 min|
|Announcements|Realtime + ISR|1 min fallback|
|Attendance|SSR|Always fresh|
|AI Tutor Chat|SSR|Real-time|
|Viva Bot|SSR|Real-time|
|Progress Matrix|ISR|1 hour|
|MCQ Solver|SSR|Real-time|
|Point Routes|SSR + Realtime driver locations|10s|

### Rate Limiting (Free Users)

* AI Tutor: Soft limit 20 msg/day → slow response, Hard limit 50 msg/day → "upgrade"
* MCQ Solver: Unlimited (forever free)
* Viva Bot: Pro-only, 180 min/month hard cap
* Point tracking: Unlimited

### Voice Pipeline (MVP)

1. Student speaks → Web Speech API (or Whisper fallback)
2. Transcript → Router LLM (keyword matching + feedback)
3. Route to appropriate bot (tutor or viva)
4. Response generated
5. Text-to-Speech (Google Cloud or Web API)
6. Audio played to student

### Content Strategy

* Pre-populate 2-3 viva sheets per module
* 25 major medical books (uploaded as PDFs, auto-embedded as vectors)
* Slides auto-embedded when uploaded
* All content in vector DB for RAG

### Viva Bot Scoring

* Complex adaptive scoring (out of 50)
* Based on: answer correctness, confidence, articulation
* Report includes: score breakdown, strengths, weaknesses, study tips

### Memory Architecture (Hybrid RAG)

* Short-term: Current session (TanStack Query cache)
* Long-term: Supabase pgvector (full conversation history)
* User preferences: Persistent (learning style, explanation depth)
* Knowledge base: Books + slides as vectors

### Testing

* Full unit + integration + E2E
* Modern devices (iPhone 12+, iPad 2017+)
* All critical flows must pass

### Deployment

* Vercel (frontend)
* Supabase (backend)
* Docker staging environment
* GitHub Actions (CI/CD)
* Play Store immediate submission (iOS later with funds)

## MVP Timeline

* Week 1-4: Core app launch
* Week 5+: Voice refinement, Phase 2 features
