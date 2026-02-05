# Decision: Viva Bot Scoring System

**Date:** 2026-02-05 | **Status:** LOCKED | **Owner:** Product decision sprint

---

## 1. What was already decided

From `FINAL_LOCKED_DECISIONS.md`: 3 modes (Strict / Friendly / Standard), 50-point total, per-dimension weights, adaptive bonus. This doc formalises the scoring weights, the LLM prompt structure, and the report format so Windsurf can build the scoring engine directly.

---

## 2. Scoring dimensions and weights

Every answer is scored on 3 dimensions + 1 adaptive bonus. Weights differ per mode.

| Dimension | Strict | Friendly | Standard | What it measures |
|---|---|---|---|---|
| **Correctness** | 25 pts | 25 pts | 25 pts | Is the medical content accurate? Are key facts present? |
| **Confidence** | 10 pts | 15 pts | 12 pts | Did the student answer decisively or hedge? |
| **Articulation** | 10 pts | 7 pts | 8 pts | Was the answer structured and clearly expressed? |
| **Adaptive bonus** | 5 pts | 3 pts | 5 pts | Earned by answering a harder follow-up correctly |
| **Total** | **50** | **50** | **50** | |

### 2.1 Correctness (all modes: max 25)

The LLM evaluates the answer against a reference answer (generated at ASK time and stored, not shown to student). Scoring is on a 0–25 integer scale:

| Range | Meaning |
|---|---|
| 0–5 | Answer is wrong or completely off-topic |
| 6–12 | Partially correct — some key facts present but major gaps |
| 13–18 | Mostly correct — minor gaps or imprecision |
| 19–23 | Correct and complete — all key facts present |
| 24–25 | Exemplary — correct, complete, and demonstrates deep understanding |

In **Strict mode**, partial credit is harsh: a missing key fact drops the score to the lower band. In **Friendly mode**, partial credit is lenient: the presence of *some* correct facts keeps the score in the middle band even if a key fact is missing.

### 2.2 Confidence (Strict 10, Friendly 15, Standard 12)

Measured from the transcript text — not from audio (we don't have audio-level confidence analysis in MVP). Signals:

| Signal in transcript | Effect |
|---|---|
| Hedging words: "I think", "maybe", "not sure", "perhaps" | −2 per occurrence (capped at −6) |
| Self-correction: "actually", "wait", "no, I mean" | −1 per occurrence (capped at −3) |
| Definitive language: "it is", "the mechanism is", "this causes" | Neutral to +1 |
| Blank / very short answer (< 10 words) | Score = 0 |

In **Friendly mode**, the confidence dimension has a higher max (15) but the penalty for hedging is halved. The idea: Friendly mode rewards students for trying, even if they're unsure.

### 2.3 Articulation (Strict 10, Friendly 7, Standard 8)

How well-structured is the answer? The LLM evaluates:

| Criteria | What to look for |
|---|---|
| Structure | Does the answer have a logical flow (definition → mechanism → clinical significance)? |
| Completeness | Are related concepts connected, or is it just isolated facts? |
| Clarity | Is the explanation understandable to a peer? |

In **Friendly mode**, a lower max (7) means articulation matters less — the focus is on correctness and confidence (participation). In **Strict mode**, articulation is weighted equally to confidence — real viva examiners care how you explain things, not just whether you know the fact.

### 2.4 Adaptive bonus (Strict 5, Friendly 3, Standard 5)

This is earned, not given by default. It is awarded **only** if:
1. The EVALUATE state scored the main answer < 70 % (i.e. correctness < 18), AND
2. A FOLLOWUP question was asked, AND
3. The student's follow-up answer scores ≥ 70 % on correctness.

In other words: the student didn't get it the first time, but recovered. The bonus rewards recovery. In **Friendly mode**, the bonus is capped at 3 because the mode already gives lenient correctness scoring — the bonus is a smaller nudge.

---

## 3. LLM prompt structure (EVALUATE state)

The prompt sent to the scoring model (Flash for Friendly/Standard, R1 for Strict) follows this exact structure. This is what the code must implement:

```
SYSTEM:
You are a medical viva examiner scoring a student's answer.
Mode: [STRICT | FRIENDLY | STANDARD]
Topic: [topic name]
Subtopic: [subtopic name]

REFERENCE ANSWER:
[reference answer generated at ASK time]

SCORING RULES:
- Correctness: 0–25 points. [Mode-specific leniency instruction]
- Confidence: 0–[mode max] points. Deduct for hedging words.
  Hedging words: "I think", "maybe", "not sure", "perhaps" → −2 each (capped −6).
  Self-correction: "actually", "wait", "no I mean" → −1 each (capped −3).
  [FRIENDLY MODE ONLY: halve all confidence penalties]
- Articulation: 0–[mode max] points. Evaluate structure, completeness, clarity.
- Do NOT award the adaptive bonus here. That is calculated separately.

USER:
Student's answer: "[transcribed answer]"

RESPOND in valid JSON only:
{
  "correctness": <integer 0-25>,
  "confidence": <integer 0-[mode max]>,
  "articulation": <integer 0-[mode max]>,
  "correctness_feedback": "<1 sentence: what was right or wrong>",
  "confidence_feedback": "<1 sentence: hedging noted or not>",
  "articulation_feedback": "<1 sentence: structure assessment>",
  "needs_followup": <boolean: true if correctness < 18>
}
```

The Route Handler parses this JSON, calculates the total, and decides whether to transition to FOLLOWUP or loop back to ASK.

---

## 4. Session report format

After the session ends (SCORE state), the LLM generates a report. The prompt receives the full session log (all questions, answers, per-Q scores). The report structure is fixed:

```
┌─────────────────────────────────────┐
│  📊 Viva Session Report             │
│                                     │
│  Topic: Coronary Circulation        │
│  Mode: Standard                     │
│  Questions: 8                       │
│  Duration: 12 min                   │
│                                     │
│  ┌─ Final Score ──────────────────┐ │
│  │                                │ │
│  │   38 / 50                      │ │  ← large, prominent, JetBrains Mono
│  │   ████████░░  76 %             │ │  ← progress bar, colour-coded
│  │                                │ │     Green ≥ 70%, Yellow 50-69%, Red < 50%
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ Breakdown ────────────────────┐ │
│  │  Correctness   22 / 25  ████░  │ │
│  │  Confidence     9 / 12  ███░░  │ │  ← averages across all Qs
│  │  Articulation   5 /  8  ██░░░  │ │
│  │  Adaptive bonus 2 /  5  █░░░░  │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ Strengths ────────────────────┐ │
│  │  • Strong on coronary anatomy  │ │  ← bullet list, max 3
│  │  • Good use of clinical terms  │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ Areas to improve ────────────┐ │
│  │  • Mechanism of atherosclerosis│ │  ← bullet list, max 3
│  │  • Try to avoid hedging words  │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌─ Study tip ───────────────────┐ │
│  │  Review Frank-Starling law and │ │  ← 1–2 sentences, actionable
│  │  practise explaining it in     │ │
│  │  plain language.               │ │
│  └────────────────────────────────┘ │
│                                     │
│  [ Try Again ]  [ Done ]            │
└─────────────────────────────────────┘
```

The breakdown row shows **averages across all questions in the session**, not just the last one. This gives a holistic picture.

---

## 5. Signal injection into student_memory

After the session ends, the orchestrator writes signals (see `model-selection.md` §4):

| What | Signal |
|---|---|
| Topic where avg correctness < 50 % | `student_memory` UPSERT, `signal_type = 'viva_score'`, `strength = 'strong'`, `value = avg correctness %` |
| Topic where avg correctness ≥ 70 % | If an existing struggle signal exists on this topic, reduce its `value` by 10 % (decay-on-improvement) |
| Session score < 30 % overall | Flag in session record. AI Tutor will prioritise this topic in next interaction. |

---

## 6. Sources

- `FINAL_LOCKED_DECISIONS.md` — 3-mode scoring weights, 50-point scale
- `viva-bot-orchestration.md` — state machine, EVALUATE prompt, adaptive difficulty
- `model-selection.md` §3.3 — Flash for Friendly/Standard scoring, R1 for Strict deep eval
- `model-selection.md` §4 — student_memory signal taxonomy
