# Admin Content Upload Guide

**Audience:** Azfar (Content lead)
**Last updated:** 2026-02-05
**What this covers:** How to prepare and upload MCQs, textbooks, and Viva sheets into DowOS. Every format is defined here — if you follow this doc, the upload will work first time.

---

## 1. MCQ Upload — CSV format

### 1.1 The file

Upload a single `.csv` file. One row = one question. The file must have these exact column headers (case-sensitive, no extra spaces):

```
question,option_a,option_b,option_c,option_d,correct_answer,explanation,topic_tags,exam_year,exam_type,module_id,subject_id,subtopic_id
```

### 1.2 Column-by-column

| Column | Type | Required | Rules |
|---|---|---|---|
| `question` | text | ✓ | The full question text. Can be multi-line if you wrap it in double quotes: `"First line\nSecond line"` |
| `option_a` | text | ✓ | Text of option A |
| `option_b` | text | ✓ | Text of option B |
| `option_c` | text | ✓ | Text of option C |
| `option_d` | text | ✓ | Text of option D |
| `correct_answer` | text | ✓ | Must be exactly one of: `A` `B` `C` `D` (uppercase, single letter) |
| `explanation` | text | ✓ | Why the correct answer is correct. 1–3 sentences. This is what the student sees after they answer. |
| `topic_tags` | text | ✓ | Pipe-separated list of topics. Example: `coronary_circulation\|cardiac_output`. Use snake_case. At least 1 tag, max 5. |
| `exam_year` | integer | ✓ | The year this question appeared in (or was written for). Example: `2024` |
| `exam_type` | text | ✓ | Exactly one of: `annual` `supplementary` `mock` |
| `module_id` | text | ✓ | The module code. Get this from the admin dashboard's module list (e.g. `HAE001`). Ask Salik if you're unsure. |
| `subject_id` | text | ✓ | The subject code within the module (e.g. `CARDIO`). |
| `subtopic_id` | text | ✓ | The subtopic code (e.g. `CORONARY_CIRC`). |

### 1.3 Example row

```csv
question,option_a,option_b,option_c,option_d,correct_answer,explanation,topic_tags,exam_year,exam_type,module_id,subject_id,subtopic_id
"Which artery is the first branch of the aortic arch?",Brachiocephalic trunk,Left common carotid,Left subclavian,Right subclavian,A,"The brachiocephalic trunk (also called the innominate artery) is the first and largest branch arising from the aortic arch. It then divides into the right common carotid and right subclavian arteries.",aortic_arch|brachiocephalic_trunk,2023,annual,HAE001,CARDIO,AORTIC_ARCH
```

### 1.4 Common mistakes to avoid

| Mistake | What goes wrong |
|---|---|
| `correct_answer` is lowercase (`a` instead of `A`) | Validation fails. Must be uppercase. |
| Extra spaces after commas | The parser strips leading/trailing spaces from most fields, but `correct_answer` is strict. No spaces. |
| Missing `explanation` column | Upload rejects the file. Every question needs an explanation. |
| `topic_tags` uses commas instead of pipes | Commas are the CSV delimiter. Use `\|` (pipe) to separate tags. |
| `module_id` doesn't match any module in the system | Upload accepts it but the questions won't appear in any module's MCQ list. Double-check the code. |
| More than 5 `topic_tags` | Max 5. Extra tags are silently dropped. |

### 1.5 How to upload

1. Go to **Admin → Content → MCQ Upload**.
2. Click **Upload CSV**.
3. Pick your file.
4. The admin page shows a **preview table** — scroll through it. Check that columns mapped correctly.
5. Click **Save**.
6. Status shows: `Processing` → `Ready` (or `Errored` with the row number and reason).

If any row errors, the whole file is rejected. Fix the row and re-upload. No partial uploads.

---

## 2. Textbook / PDF Upload

### 2.1 What to upload

Any PDF — textbook chapters, lecture slides, or reference material. One file per upload. Tag it with the right module + subject on the upload page; the system handles everything else.

### 2.2 How to upload

1. Go to **Admin → Content → Textbook Upload**.
2. Click **Upload PDF**.
3. Pick the file.
4. Fill in the metadata fields on the upload page:
   - **Title** — e.g. "Robbins Pathology — Chapter 12: The Heart"
   - **Module** — pick from the dropdown (e.g. HAE001)
   - **Subject** — pick from the dropdown (e.g. Cardiology)
   - **Subtopic** *(optional)* — if this PDF covers one specific subtopic, pick it. Leave blank if it covers the whole subject.
5. Click **Upload**.
6. Status shows: `Processing` → `Ready`.

That's it. You don't need to worry about how the text gets split up or indexed — the system does that automatically (see §2.3 if you're curious).

### 2.3 What happens after you hit Upload (non-technical summary)

You don't need to understand this to upload content. But here's the short version of what the system does in the background:

1. **Text extraction.** The system reads the PDF and pulls out all the text, keeping the structure (headings, paragraphs) intact.
2. **Splitting.** The text gets divided into small, focused segments — roughly one concept per segment. Think of it like cutting a textbook into individual note cards, each covering one idea.
3. **Summarisation.** For each segment, the system automatically generates 2–3 practice Q&A pairs (like mini-flashcards). These show up in the MCQ and drill flows.
4. **Indexing.** Each segment gets a "fingerprint" (called an embedding) that lets the AI find it when a student asks a related question. This is how the AI Tutor knows which part of the textbook to reference.
5. **Done.** Once all segments are indexed, the status flips to `Ready`. The content is live in the AI Tutor and MCQ flows for that module.

The whole process takes 2–10 minutes depending on file size. You can upload multiple files — they process in parallel.

---

## 3. Viva Sheets — the format you should produce

### 3.1 What a Viva Sheet is

A Viva Sheet is the source material the Viva Bot uses to run a mock viva on a topic. Each sheet covers **one subtopic** (e.g. "Coronary Circulation"). It contains: the questions the bot can ask, a model answer for each, and difficulty tags so the bot can adapt.

### 3.2 The format — Google Sheet

Produce each Viva Sheet as a **Google Sheet** (or download as `.csv` from Google Sheets). One sheet per subtopic. One row = one question. The column headers must be exactly:

```
question,model_answer,difficulty,key_points,tags
```

### 3.3 Column-by-column

| Column | Type | Required | Rules |
|---|---|---|---|
| `question` | text | ✓ | The question the bot will ask the student. Write it as a spoken question — natural, not textbook-style. Example: `"Explain the blood supply to the myocardium."` not `"Q: Blood supply of myocardium?"` |
| `model_answer` | text | ✓ | A complete, correct answer. This is what the bot uses to score the student — the student never sees it. Be thorough: include key facts, mechanisms, clinical relevance. 3–8 sentences. |
| `difficulty` | integer | ✓ | 1 to 5. 1 = basic recall ("What is X?"). 3 = application ("How does X cause Y?"). 5 = synthesis/reasoning ("Compare X and Y in the context of Z."). Aim for a mix: roughly 30% at 1–2, 40% at 3, 30% at 4–5. |
| `key_points` | text | ✓ | Pipe-separated list of the 2–4 facts the student *must* mention to get full marks. Example: `first branch of aortic arch\|divides into RCC and RSC\|supplies right side of head and arm`. The bot uses these to check correctness. |
| `tags` | text | ✓ | Pipe-separated subtopic/concept tags. Same snake_case format as MCQ `topic_tags`. Example: `coronary_blood_supply\|myocardial_perfusion`. |

### 3.4 Example sheet

```csv
question,model_answer,difficulty,key_points,tags
"Describe the blood supply to the heart muscle.",The myocardium receives its blood supply from the left and right coronary arteries which arise from the aortic sinuses just above the aortic valve. The left coronary artery divides into the anterior descending and circumflex branches supplying the anterior and lateral walls. The right coronary artery supplies the inferior wall and in most people gives rise to the posterior descending artery. Blood flow into the coronaries is driven primarily during diastole because systolic contraction compresses the vessels.,2,"left and right coronary arteries|arise from aortic sinuses|LAD and circumflex from left|RCA supplies inferior wall|flow mainly in diastole",coronary_blood_supply|myocardial_perfusion
"Why does myocardial blood flow occur mainly during diastole?","During systole the myocardium contracts and compresses the intramural blood vessels reducing perfusion pressure. In diastole the muscle relaxes and the compressed vessels open allowing blood to flow freely. This is why conditions that shorten diastole (such as tachycardia) can reduce myocardial oxygen supply and precipitate ischaemia.",3,"systole compresses intramural vessels|diastole allows perfusion|tachycardia shortens diastole|risk of ischaemia",coronary_blood_flow|myocardial_ischaemia|cardiac_physiology
"A patient presents with chest pain on exertion that resolves at rest. Which coronary vessel is most likely affected and why?","This presentation is classic for stable angina caused by atherosclerotic narrowing. The anterior descending artery is the most commonly affected single vessel because it supplies the largest territory of myocardium (anterior wall). On exertion oxygen demand rises but the narrowed vessel cannot increase flow proportionally leading to supply-demand mismatch and ischaemic pain. Rest reduces demand and symptoms resolve.",4,"stable angina pattern|LAD most commonly affected|largest myocardial territory|supply-demand mismatch on exertion",coronary_disease|stable_angina|anterior_descending
```

### 3.5 How to upload

1. Go to **Admin → Content → Viva Sheet Upload**.
2. Click **Upload CSV** (export your Google Sheet as CSV first: File → Download → CSV).
3. Pick your file.
4. Fill in the metadata:
   - **Module** — dropdown (e.g. HAE001)
   - **Subject** — dropdown (e.g. Cardiology)
   - **Subtopic** — dropdown (e.g. Coronary Circulation). This must match — the Viva Bot organises sessions by subtopic.
5. Click **Upload**.
6. Preview the parsed questions. Check the difficulty distribution — aim for the mix described in §3.3.
7. Click **Save**.

### 3.6 How many questions per sheet?

Aim for **10–15 questions per subtopic** at launch. The Viva Bot caps a session at 10 questions, so 15 gives enough variety that students don't see the same set twice in a row. Cover the full difficulty range (1–5).

### 3.7 Common mistakes to avoid

| Mistake | What goes wrong |
|---|---|
| `key_points` uses commas | Same as MCQs — use pipes `\|`. |
| `difficulty` is a word (`easy`) instead of a number | Validation fails. Must be `1`–`5`. |
| `model_answer` is too short (1 sentence) | The bot will score students harshly because there aren't enough key facts to match against. Write 3–8 sentences. |
| Only difficulty 1 and 2 questions | The bot's adaptive system won't have material to escalate to. Include 4s and 5s. |
| Subtopic in the metadata doesn't match any subtopic in the system | Questions upload but don't appear in any Viva session. Check the dropdown carefully. |

---

## 4. Quick reference — all three upload types at a glance

| Content type | File format | Admin page | Key metadata | Gotcha |
|---|---|---|---|---|
| MCQs | `.csv` | Admin → Content → MCQ Upload | module_id, subject_id, subtopic_id | `correct_answer` must be uppercase A/B/C/D |
| Textbooks | `.pdf` | Admin → Content → Textbook Upload | Module, Subject, Subtopic (optional) | No CSV — just the PDF + dropdowns |
| Viva Sheets | `.csv` (from Google Sheet) | Admin → Content → Viva Sheet Upload | Module, Subject, Subtopic | `key_points` pipes not commas; difficulty 1–5 |

---

## 5. Target numbers (launch goal)

| Content | Target | Timeline |
|---|---|---|
| MCQs | 100 questions across 2–3 modules | Ready by Day 17 |
| Textbooks | 2–3 PDFs (one per module being launched) | Ready by Day 17 |
| Viva Sheets | 10–15 questions × 2–3 subtopics | Ready by Day 20 |

Start with the module that launches first. Once the first batch is in and working, the process is fast — it's just filling in the CSV.
