# Decision: Voice / Speech-to-Text

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Day 5 decision

---

## 1. Context

DowOS uses voice in two places: **AI Tutor** (student speaks a question) and **Viva Bot** (student speaks an answer to a practice question). Both run inside a Next.js 15 app, deployed on Vercel, targeting Pakistani-accented English with heavy medical terminology (cardiology, anatomy, pathology, pharmacology).

Usage baseline at 500 DAU:
- Average audio per user per day: ~2 min
- Total audio per month: ~30 000 min (500 hrs)
- Budget ceiling: USD 30 / mo

---

## 2. Options evaluated

| Provider | Model | Accented-English WER | Medical WER | Cost / mo (500 DAU) | Fits $30 budget? | Streaming? |
|---|---|---|---|---|---|---|
| **Groq** | Whisper Large v3 Turbo | ~8.4 % (clean) | No dedicated data | **$20.10** | ✓ | No (batch) |
| Groq | Distil-Whisper | Higher than Turbo | No data | $9.90 | ✓ | No |
| OpenAI | whisper-1 / gpt-4o-transcribe | ~7.6 % | No data | $180 | ✗ | No |
| OpenAI | gpt-4o-mini-transcribe | Unknown on accents | No data | $90 | ✗ | No |
| Google Cloud | Chirp V2 | ~35 % (accented) | No data | $480 | ✗ | Yes (gRPC) |
| Web Speech API | Browser-native | Unusable on accents | Very poor | $0 | ✓ (unusable) | Yes |
| AssemblyAI | Universal-2 | ~6.68 % | No data | $75–126 | ✗ | Yes |
| ElevenLabs | Scribe v2 | <5 % (claimed) | No data | $200 | ✗ | Yes |
| Deepgram | Nova-3 Medical | ~6.84 % (general) / **3.45 % (medical)** | **Best in class** | $108–231 | ✗ | Yes |

---

## 3. Decision — Groq Whisper Large v3 Turbo + Gemini correction layer

### 3.1 Why Groq Turbo

- **Only provider that fits the budget at DowOS scale** ($20.10 / mo, or ~$10 on batch discount).
- **Identical model weights** to OpenAI Whisper Large v3 — same accuracy, same accent generalisation — at 9× lower cost than OpenAI's own endpoint.
- **OpenAI-compatible SDK.** The `groq` npm package accepts the exact same call signature as `openai`. Integration path is a near drop-in swap from the Whisper assumption already in the discovery docs.
- **Best code-switching tolerance** in the comparison. Pakistani students at Dow regularly mix Urdu words into English — Groq Whisper handles this better than any other provider in the table.
- **216× real-time processing speed** on Turbo. A 2-min clip is processed in well under a second of compute.

### 3.2 What Groq does NOT solve — and how we fix it

Whisper is a general-purpose model. Domain-specific terminology (medical Latin, clinical acronyms) degrades by 15–30 % vs general speech. Two mitigations, both zero extra STT cost:

**Layer 1 — Whisper `prompt` parameter (free, built-in):**
Pass a context string to every transcription call listing the current module's key terms:

```
prompt: "Medical terminology. [current module name]. Cardiology anatomy pathology pharmacology."
```

This biases the decoder toward medical vocabulary at no extra API cost. Light lift — catches the most common terms.

**Layer 2 — Gemini correction pass (negligible cost):**
After the raw transcript returns, send it to Gemini Flash (already in the DowOS stack) with the module context:

```
"The student is answering a question about [module/subtopic].
 Correct any medical terminology errors in this transcript.
 Return only the corrected text."
```

Gemini input/output for a 2-min utterance (~100 words) is ~200 input tokens + ~100 output tokens. At Flash pricing that's $0.00006 per correction call. At 500 DAU × 2 min / day that adds ~$0.90 / mo total. Production medical transcription systems using this pattern recover 60–80 % of domain-terminology errors.

### 3.3 Architecture

```
Student speaks (mic)
        │
        ▼
  <input type="file" capture> or MediaRecorder API
  → WebM audio blob (client-side)
        │
        ▼
  POST /api/transcribe  (Next.js Route Handler)
        │
        ├── 1. Groq Whisper Large v3 Turbo
        │      model: "whisper-large-v3-turbo"
        │      language: "en"
        │      prompt: "[module context string]"
        │      → raw transcript
        │
        ├── 2. Gemini Flash correction pass
        │      input: raw transcript + module/subtopic context
        │      → corrected transcript
        │
        └── return corrected transcript to client
                │
                ▼
        Feed into AI Tutor or Viva Bot as the user's message
```

**Latency budget:**
- MediaRecorder captures in real time. Student presses "done" after speaking.
- Groq round-trip for a 2-min clip: < 2 s (network + inference).
- Gemini correction: < 500 ms (short input).
- Total: **< 3 s** from "done" tap to transcript available. Acceptable for both Tutor and Viva flows — the user expects a brief pause after speaking.

---

## 3.5 Text-to-Speech — Viva Bot speaks to the student

The Viva Bot is a **voice-first** interaction. The bot asks questions out loud; the student answers by speaking. This means we need TTS as well as STT. TTS fires in two places:

### 3.5.1 Where TTS is used

| Where | What is spoken | When |
|---|---|---|
| **Viva Bot — question delivery** | The question the bot generates in the ASK state | Every time a new question is presented. The student hears it spoken before (or while) they read it on screen. |
| **Viva Bot — feedback** | Short conversational feedback after the student answers | After EVALUATE: e.g. "Good, let's go deeper" (if FOLLOWUP) or "Well done, next question" (if looping back to ASK). Keeps the interaction feeling like a real viva, not a silent quiz. |

The AI Tutor chat does **not** use TTS in MVP — it's text-based. TTS is scoped to Viva Bot only.

### 3.5.2 Provider — Google Cloud TTS

Google Cloud Text-to-Speech is the pick. Already in the CLAUDE.md stack entry. Key reasons:

- **Neural voice quality.** The `en-GB` neural voices sound natural and authoritative — appropriate for a medical examiner persona.
- **SSML support.** We can control prosody (pause before a key term, emphasis on clinical words) via Speech Synthesis Markup Language tags. This matters: a question spoken in a flat monotone is harder to follow than one with natural rhythm.
- **Cost.** Neural TTS at Google Cloud: ~$0.016 per 1 000 characters. A Viva Bot question + feedback = ~200–400 characters per turn. At 500 DAU × ~2 Viva turns / day (Pro users only, ~125 DAU) that's ~100 000 characters / month = **~$1.60 / mo**. Negligible.
- **Latency.** Google Cloud TTS returns audio in < 300 ms for short inputs. Combined with streaming audio playback, the question starts playing almost instantly after generation.

### 3.5.3 Architecture

```
Viva Bot generates question text (ASK state)
        │
        ▼
  POST /api/tts  (Next.js Route Handler)
        │
        ├── Input: question text + SSML hints (pause before key term)
        ├── Model: Google Cloud TTS — neural, en-GB
        ├── Output: audio blob (MP3 or WebM)
        │
        └── return audio to client
                │
                ▼
        <audio> element plays automatically
        Student reads the question on screen simultaneously
        (text + audio in parallel — student can re-tap to replay)
```

**Feedback TTS** uses the same Route Handler. The feedback text is short (< 20 words) and generated by the Viva orchestrator alongside the state transition. It plays immediately after the student's answer is scored — no perceptible delay.

### 3.5.4 UX details

- **Auto-play on question:** When a new question appears, the audio starts playing automatically. A small speaker icon with a "playing" animation sits next to the question. Tapping it pauses/replays.
- **Replay button:** Students can tap the speaker icon any time to hear the question again. Useful if they didn't catch it the first time.
- **Speed control:** A simple toggle: Normal / Slow. Slow mode reduces playback speed by ~25 %. Many students prefer slower speech for complex medical terms. This is a client-side playback control — no extra TTS call needed.
- **Quiet mode:** Students in a library can tap a "text only" toggle to disable all TTS audio. The Viva session continues as a silent text-based drill. This toggle persists for the session.

### 3.5.5 Build placement

| Component | Day | Dependency |
|---|---|---|
| `/api/tts` Route Handler (Google Cloud TTS client) | 17 | Google Cloud TTS API key in `.env.local` |
| Question auto-play + speaker icon on Viva Bot screen | 25 | Route Handler above + Viva Bot session UI |
| Feedback TTS (short phrases after scoring) | 25 | Same |
| Speed control + quiet mode toggle | 25 | Client-side only |

---

### 3.6 Upgrade path

If monthly audio volume drops below ~200 DAU or budget flexes to $75–130 / mo, **Deepgram Nova-3 Medical** becomes the correct primary pick:
- Purpose-built medical vocabulary (Keyterm Prompting, 100 terms, 6× accuracy lift).
- Lowest medical WER in any published benchmark (3.45 %).
- Real-time streaming (300 ms latency).
- $200 free credits cover month 1 entirely.

The swap is a single provider change in `/api/transcribe` — no architecture change needed. The Gemini correction layer stays regardless.

---

## 4. Pakistani accent — what we know and don't

No STT provider ships a Pakistani-English-specific model or accent profile. This is an industry-wide gap. Key facts:
- Indian English (`en-IN`) is the closest published proxy. Pakistani English shares phonological features but also has Urdu-influenced phonemes (retroflex consonants, aspirated stops) that Indian English lacks.
- Whisper's strength is generalisation to unseen accents via training data breadth (1 M+ hours).
- The Gemini correction pass is accent-agnostic — it fixes the output regardless of what the STT misheard.
- If accent accuracy proves problematic in production beta (Week 4), the upgrade path to Deepgram Nova-3 Medical or fine-tuning Whisper on a small Dow-recorded dataset are both viable Day-30+ improvements.

---

## 5. What drops from consideration

| Provider | Reason |
|---|---|
| Google Cloud STT | Worst accent performance in benchmarks (35 % WER). Most expensive. gRPC complexity in a Next.js app. |
| Web Speech API | Chrome/Chromium only — fails on iOS Safari. No vocabulary or accent control. Not production-grade. |
| OpenAI Whisper (direct) | Same model as Groq at 9× the price. No reason to use OpenAI's endpoint. |
| ElevenLabs Scribe | $200 / mo. Newer ecosystem. No medical data. |
| AssemblyAI Universal-2 | $75–126 / mo. No medical model. Over budget. |

---

## 6. Build placement

| Component | Day | Dependency |
|---|---|---|
| `/api/transcribe` Route Handler (Groq client + Gemini correction) | 17 | Groq API key in `.env.local` |
| MediaRecorder mic capture on AI Tutor chat input | 22 | Route Handler above |
| MediaRecorder mic capture on Viva Bot answer input | 25 | Same |
| Module-context string injection (dynamic per session) | 22 | Timetable / progress data wired |

---

## 7. Sources

- Soniox STT Benchmarks (multi-scenario WER comparison)
- Artificial Analysis STT Leaderboard
- Groq Whisper Large v3 Turbo announcement + pricing
- Deepgram Nova-3 Medical launch blog
- AssemblyAI Universal-2 accuracy report
- Google Cloud Speech-to-Text official pricing
- MDN Web Speech API docs
- Production medical transcription pattern: LLM post-correction (multiple vendor case studies)
