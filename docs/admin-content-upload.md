# Admin Content Upload Guide

**Audience:** Azfar (Content lead)
**Last updated:** 2026-02-05
**What this covers:** How to prepare and upload MCQs, textbooks, and Viva sheets into DowOS. Every format is defined here — if you follow this doc, the upload will work first time.

---

## 0. Before you upload anything — set up modules, subjects, and subtopics first

All three upload types (MCQs, textbooks, viva sheets) require you to tag content with a **module → subject → subtopic** hierarchy. These must exist in the system before you upload. If you tag a question with a subtopic that doesn't exist, the upload will succeed but the content won't appear anywhere.

### 0.1 The hierarchy — how it works

DowOS organises all medical content in three levels. Example:

```
Module:    Cardiovascular          (the broad clinical area)
  Subject:   Anatomy               (the discipline within it)
    Subtopic:  Coronary Circulation (the specific topic)
    Subtopic:  Aortic Arch
  Subject:   Physiology
    Subtopic:  Cardiac Output
    Subtopic:  Blood Pressure Regulation
```

Every piece of content — an MCQ, a textbook PDF, a viva question — gets tagged at all three levels.

### 0.2 How to create modules, subjects, and subtopics

1. Go to **Admin → Content → Manage Taxonomy**.
2. You'll see a tree view. Start at the top: create the **Module** first (e.g. "Cardiovascular"). Give it a short code (e.g. `CARDIO`). Also set a **display name** — this is what students see on screen (e.g. "Cardiovascular System").
3. Inside each module, create **Subjects** (e.g. "Anatomy", code `ANAT`; "Physiology", code `PHYSIO`). Each subject also has a display name.
4. Inside each subject, create **Subtopics** (e.g. "Coronary Circulation", code `CORONARY_CIRC`). Each subtopic also has a display name.

**Display names matter.** The student-facing screens show display names, not codes. If you create a subtopic with code `CORONARY_CIRC` but no display name, it will show up as `CORONARY_CIRC` on the student's screen. Always fill in the display name.

### 0.3 What to set up before the first upload batch

Before Azfar starts uploading MCQs, these must already exist in the system:

| What | Who creates it | Example |
|---|---|---|
| Modules | Salik (admin) | Cardiovascular, Respiratory, Renal |
| Subjects within each module | Salik | Anatomy, Physiology, Pathology, Pharmacology |
| Subtopics within each subject | Azfar (content lead) — he knows the topic granularity best | Coronary Circulation, Aortic Arch, Cardiac Output |
| `exam_year` values | No setup needed — it's a free integer in the CSV | Just type the year (e.g. 2023) |

Do this **before** any CSVs or PDFs are uploaded. It takes 30 minutes for the first module and 10 minutes for each additional one.

---

## 1. MCQ Upload — CSV format

### 1.1 The file

Upload a single `.csv` file. One row = one question. The file must have these exact column headers (case-sensitive, no extra spaces):

```
question,options,correct_answer,explanation,topic_tags,exam_year,module_id,subject_id,subtopic_id
```

**Note on options:** Dow MCQs have either 4 or 5 options depending on the question. The `options` column is a pipe-separated list — it can have 4 or 5 entries. The system handles any number from 3 to 5. See §1.2 for details.

### 1.2 Column-by-column

| Column | Type | Required | Rules |
|---|---|---|---|
| `question` | text | ✓ | The full question text. Can be multi-line if you wrap it in double quotes: `"First line\nSecond line"` |
| `options` | text | ✓ | Pipe-separated list of answer options. **3 to 5 options supported.** Example (4 options): `Brachiocephalic trunk\|Left common carotid\|Left subclavian\|Right subclavian`. Example (5 options): `Option A text\|Option B text\|Option C text\|Option D text\|Option E text`. The system labels them A, B, C, D, E automatically in order. |
| `correct_answer` | text | ✓ | Must be exactly one of: `A` `B` `C` `D` `E` (uppercase, single letter). Must match a valid position in the `options` list — e.g. if you have 4 options, `E` is invalid. |
| `explanation` | text | ✓ | **Write this like AMBOSS.** Don't just say "A is correct." Explain *why* — the mechanism, the clinical reasoning, why the wrong answers are wrong. 3–8 sentences minimum. This is what the student reads after answering. Our AI will also enrich these with citations (see §1.6). |
| `topic_tags` | text | ✓ | Pipe-separated list of topics. Example: `coronary_circulation\|cardiac_output`. Use snake_case. At least 1 tag, max 5. These tags are how the system groups and surfaces questions — get them right. |
| `exam_year` | integer | ✓ | The year this question appeared in (or was written for). Example: `2024` |
| `module_id` | text | ✓ | The module **code** (not display name). Get this from **Admin → Content → Manage Taxonomy**. Example: `CARDIO`. |
| `subject_id` | text | ✓ | The subject **code** within the module. Example: `ANAT`. Must already exist in the taxonomy. |
| `subtopic_id` | text | ✓ | The subtopic **code**. Example: `CORONARY_CIRC`. Must already exist in the taxonomy. |

### 1.3 Example rows

**4-option question:**

```csv
question,options,correct_answer,explanation,topic_tags,exam_year,module_id,subject_id,subtopic_id
"Which artery is the first branch of the aortic arch?","Brachiocephalic trunk|Left common carotid|Left subclavian|Right subclavian",A,"The brachiocephalic trunk (also called the innominate artery) is the first and largest branch arising from the aortic arch, appearing before either of the other two branches. It subsequently divides into the right common carotid artery and the right subclavian artery. The left common carotid (option B) arises second, and the left subclavian (option C) arises third — both directly from the arch, not from the brachiocephalic trunk. Right subclavian (option D) does not arise directly from the aortic arch in normal anatomy.",aortic_arch|brachiocephalic_trunk,2023,CARDIO,ANAT,AORTIC_ARCH
```

**5-option question:**

```csv
"A 45-year-old presents with chest pain. ECG shows ST elevation in leads II, III, aVF. Which vessel is most likely occluded?","Left anterior descending|Left circumflex|Right coronary artery|Left main coronary|Posterior descending artery",C,"ST elevation in the inferior leads (II, III, aVF) indicates an inferior STEMI. The right coronary artery (RCA) supplies the inferior wall of the left ventricle in approximately 85% of people (right-dominant circulation) via the posterior descending artery. The LAD (option A) supplies the anterior wall — ST elevation would appear in V1–V4. The circumflex (option B) supplies the lateral wall. The left main (option D) would produce diffuse ST changes. The posterior descending (option E) is a branch of the RCA in most cases, not an independent culprit vessel.",inferior_STEMI|RCA|coronary_anatomy,2024,CARDIO,PHYSIO,CORONARY_BLOOD_SUPPLY
```

### 1.4 How to prepare topic_tags

`topic_tags` is how the system groups questions for drilling and how the AI knows which area a question belongs to. Bad tags = questions disappear into the wrong bucket.

**Rules:**
- Use **snake_case** (all lowercase, underscores between words): `coronary_circulation` not `Coronary Circulation` or `coronaryCirculation`.
- Use tags that **match your subtopic codes** where possible. If the subtopic is `CORONARY_CIRC`, a good tag is `coronary_circulation` (the human-readable version of the code).
- You can add more specific tags alongside the subtopic tag. Example: a question about "blood flow in diastole" inside the Coronary Circulation subtopic gets `coronary_circulation|diastolic_flow`.
- At least 1 tag. Max 5. The first tag should always be the subtopic — everything else is detail.

**Example tag prep for a Cardiovascular → Anatomy → Coronary Circulation batch:**

| Question is about | Tags |
|---|---|
| Basic anatomy of coronary arteries | `coronary_circulation\|coronary_anatomy` |
| LAD vs RCA territory | `coronary_circulation\|coronary_anatomy\|LAD\|RCA` |
| Why blood flows in diastole | `coronary_circulation\|diastolic_flow\|myocardial_perfusion` |
| Atherosclerosis in coronary arteries | `coronary_circulation\|atherosclerosis\|coronary_disease` |

### 1.5 Common mistakes to avoid

| Mistake | What goes wrong |
|---|---|
| `correct_answer` is lowercase (`a` instead of `A`) | Validation fails. Must be uppercase. |
| `correct_answer` says `E` but `options` only has 4 entries | Validation fails. Letter must be a valid position in the options list. |
| Extra spaces after commas | The parser strips leading/trailing spaces from most fields, but `correct_answer` is strict. No spaces. |
| Missing or short `explanation` (1–2 sentences) | Upload accepts it, but the student experience suffers. Write AMBOSS-style: explain the mechanism, not just the answer. |
| `topic_tags` uses commas instead of pipes | Commas are the CSV delimiter. Use `\|` (pipe) to separate tags. |
| `module_id` / `subject_id` / `subtopic_id` doesn't match any entry in Manage Taxonomy | Upload accepts it but the questions won't appear in any module's MCQ list. Always copy codes from the taxonomy screen — don't type from memory. |
| More than 5 `topic_tags` | Max 5. Extra tags are silently dropped. |
| `options` uses commas instead of pipes | Same issue. Pipes only. |

### 1.6 What happens after upload — the citation edge function

After the MCQ CSV is uploaded and indexed, a **background Edge Function** runs automatically. It does one thing: enriches every `explanation` with **citations from the uploaded textbooks and slides**.

Here's how it works:

1. The Edge Function reads each question's explanation.
2. It searches the textbook/slide corpus (the same PDFs you uploaded in §2) for passages that support the explanation.
3. It adds inline citations to the explanation — e.g. *"The RCA supplies the inferior wall [Robbins Pathology, Ch. 12 · Coronary Anatomy]"*.
4. The enriched explanation replaces the original in the database.

**You don't need to do anything.** Just make sure the relevant textbooks/slides are uploaded *before* the MCQs, so the Edge Function has source material to cite from. If a textbook hasn't been uploaded yet, the explanation stays as you wrote it — no citations, no error. You can re-trigger the Edge Function later once the PDF is in (button in the admin panel: **Admin → Content → MCQ Upload → Re-run citations**).

### 1.7 How to upload

1. Go to **Admin → Content → MCQ Upload**.
2. Click **Upload CSV**.
3. Pick your file.
4. The admin page shows a **preview table** — scroll through it. Check that columns mapped correctly and option counts look right.
5. Click **Save**.
6. Status shows: `Processing` → `Ready` (or `Errored` with the row number and reason).
7. Once `Ready`, the citation Edge Function kicks off automatically. Status may briefly show `Enriching citations…` → `Ready`.

If any row errors, the whole file is rejected. Fix the row and re-upload. No partial uploads.

### 1.8 What happens after upload — the explanation-fix edge function

The citation Edge Function (§1.6) adds *where* information came from. The **explanation-fix Edge Function** improves *what* is written. It's a separate pass that runs on demand — not automatically after upload.

Here's what it does:

1. The Edge Function reads every `explanation` in the MCQ table for the selected module (or the whole table if "All" is chosen).
2. It sends each explanation to Gemini (with the original question + correct answer as context) and asks it to: fix factual errors, improve clarity, expand thin explanations to AMBOSS standard, and ensure all wrong-answer distractors are addressed.
3. The improved explanation replaces the original in the database.

**How to trigger it:**

Go to **Admin → Content → MCQ Upload** and click **Re-run explanation fix**. A dropdown lets you scope it: a single module, a single subject, or all content. A status indicator shows progress — it runs in the background so you can navigate away.

**When to use it:**

- After the initial upload batch, once you've reviewed the raw AI-generated explanations and they look thin or wrong.
- After a textbook PDF is uploaded that covers the same module — the Edge Function can now pull from richer source material.
- Any time Azfar flags an explanation as incorrect during QA.

**Note:** Citation enrichment (§1.6) and explanation-fix are independent. You can run them in any order. Running explanation-fix first and *then* citations is the recommended workflow — fix the content, then add sources.

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

1. **Text extraction.** The system sends the PDF to **Gemini 2.5 Pro** via the Google Files API, which reads it natively — no intermediate OCR step. It pulls out all the text while keeping the structure (headings, paragraphs, tables) intact. Gemini 2.5 Pro handles medical textbook layouts (dense tables, multi-column, diagrams with labels) better than any other model in our vendor stack. Everything downstream depends on this step.
2. **Splitting.** The text gets divided into small, focused segments — roughly one concept per segment. Think of it like cutting a textbook into individual note cards, each covering one idea.
3. **Q&A generation.** For each segment, the system automatically generates 2–3 practice Q&A pairs (like mini-flashcards). These show up in the MCQ and drill flows.
4. **Indexing.** Each segment gets a "fingerprint" (called an embedding) that lets the AI find it when a student asks a related question. This is how the AI Tutor knows which part of the textbook to reference.
5. **Citation source ready.** Once indexed, this PDF becomes a source that the MCQ citation Edge Function (see §1.6) can pull from when enriching explanations.
6. **Done.** Once all segments are indexed, the status flips to `Ready`. The content is live in the AI Tutor, MCQ drill, and citation flows for that module.

The whole process takes 2–15 minutes depending on file size and complexity. You can upload multiple files — they process in parallel. **Upload textbooks before MCQs** so the citation enrichment has source material to work from.

---

## 3. Viva Sheets — the format you should produce

### 3.1 What a Viva Sheet is

A Viva Sheet is the source material the Viva Bot uses to run a mock viva on a topic. Each sheet covers **one subtopic** (e.g. "Coronary Circulation"). It contains: the questions the bot can ask, a model answer for each, and difficulty tags so the bot can adapt.

**Note:** In the app, Viva Bot is organised **module → subject → subtopic**. Students first pick a module (e.g. Cardiovascular), then a subject within it (e.g. Anatomy), then a subtopic (e.g. Coronary Circulation). This means every subtopic must be tagged with both its module and subject — the taxonomy must be set up first (see §0). The same questions also appear in **Browse Q&A** (a list view where students can see each question and expand it to read the model answer). Make sure model answers are clear and complete — they show up in Browse Q&A as the expanded answer.

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
| MCQs | `.csv` | Admin → Content → MCQ Upload | module_id, subject_id, subtopic_id | `options` and `topic_tags` use pipes not commas. `correct_answer` uppercase A–E. Upload textbooks first (citation Edge Function needs them). Run explanation-fix Edge Function after upload to polish explanations (§1.8). |
| Textbooks / Slides | `.pdf` | Admin → Content → Textbook Upload | Module, Subject, Subtopic (optional) | No CSV — just the PDF + dropdowns. Upload these **before** MCQs. |
| Viva Sheets | `.csv` (from Google Sheet) | Admin → Content → Viva Sheet Upload | Module, Subject, Subtopic | `key_points` pipes not commas; difficulty 1–5. Model answers show in Browse Q&A too — write them clearly. |

---

## 5. Admin Education Dashboard — editing questions after upload

### 5.1 What it is

Once questions are uploaded, admins need a way to edit, delete, and reorder them without re-uploading a whole CSV. The **Admin Education Dashboard** is that page. It lives at **Admin → Education**.

### 5.2 What's on the page

The page is organised around the same taxonomy tree the students see: **Module → Subject → Subtopic**. Dropdowns at the top let the admin drill down to any level. Once a subtopic (or subject) is selected, the questions in that bucket appear as a list.

```
┌─────────────────────────────────────────────┐
│  Admin → Education                          │
├─────────────────────────────────────────────┤
│  [Module ▼]  [Subject ▼]  [Subtopic ▼]     │  ← cascade dropdowns
│  Content type: [MCQs ▼]                     │  ← switch between MCQ / Viva
├─────────────────────────────────────────────┤
│                                             │
│  1.  Which artery is the first branch…     │  ← question text (truncated)
│      ✓ A · Brachiocephalic trunk           │  ← correct answer shown
│      [Edit] [Delete] [⬆] [⬇]             │  ← action row
│                                             │
│  2.  A 45-year-old presents with…          │
│      ✓ C · Right coronary artery           │
│      [Edit] [Delete] [⬆] [⬇]             │
│  …                                          │
│                                             │
│  [+ Add question]                           │  ← opens inline form (same fields as CSV)
├─────────────────────────────────────────────┤
│  Bulk actions: [Select all] [Delete selected]│
└─────────────────────────────────────────────┘
```

### 5.3 Actions available

| Action | What it does |
|---|---|
| **Edit** | Opens an inline edit form pre-filled with the question's current data. All fields are editable: question text, options, correct answer, explanation, topic tags, exam year, taxonomy IDs. Save replaces the row in-place. |
| **Delete** | Soft-delete. The question is marked `archived = true` and disappears from student-facing drills. An admin can unarchive it from a separate "Archived" filter. **Not a hard delete** — no data is lost. |
| **⬆ / ⬇** | Reorders the question within its current subtopic bucket. This controls the order in which questions appear in non-shuffled views (e.g. year-wise drill in Tested Questions). Stored as an integer `sort_order` on the row. |
| **+ Add question** | Opens the same inline form, but blank. Saves a new row directly — no CSV needed. Useful for one-off additions. |
| **Select all / Delete selected** | Bulk soft-delete. Confirmation dialog shows how many questions will be archived. |

### 5.4 Switching between MCQ and Viva content

The **Content type** dropdown at the top switches the list between MCQs and Viva Sheet questions. The edit fields change accordingly — Viva questions show `model_answer`, `difficulty`, `key_points` instead of `options` and `correct_answer`. Same taxonomy dropdowns, same reorder and delete actions.

### 5.5 Who can access this

Role-gated: **admin only**. The route is `/admin/education`. Students and regular users cannot reach it. Salik (or any user with the `admin` role) is the only one who can edit live questions. Azfar prepares content via CSV upload — editing live questions is an admin action.

---

## 6. Target numbers (launch goal)

| Content | Target | Timeline |
|---|---|---|
| MCQs | 100 questions across 2–3 modules | Ready by Day 17 |
| Textbooks | 2–3 PDFs (one per module being launched) | Ready by Day 17 |
| Viva Sheets | 10–15 questions × 2–3 subtopics | Ready by Day 20 |

Start with the module that launches first. Once the first batch is in and working, the process is fast — it's just filling in the CSV.
