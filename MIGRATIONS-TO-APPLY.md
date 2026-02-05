# SQL Migrations Ready to Apply to Supabase

**Status:** Ready for Day 11
**Date Created:** 2026-02-06
**Total Migrations:** 3

---

## How to Apply

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select DowOS project
3. Go to **SQL Editor** → **New Query**
4. Copy-paste **Migration 1** below
5. Click **Run**
6. Repeat for Migrations 2 and 3 (apply one at a time)

---

## Migration 1: API Usage Logging Table

**File:** `src/migrations/00002_api_usage_log.sql`
**Purpose:** Track all AI/API calls for cost monitoring and analytics
**Tables:** `api_usage_log`
**Indexes:** 4 (user_id, created_at, model, feature)
**RLS:** Admin-only read, no student writes

```sql
-- Migration: 00002 - API Usage Logging Table
-- Purpose: Track all AI/API calls for cost monitoring and analytics
-- Date: 2026-02-06

-- Create api_usage_log table
CREATE TABLE IF NOT EXISTS api_usage_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL, -- Model key (e.g., 'gemini_flash', 'groq_whisper')
  feature TEXT NOT NULL, -- Feature that called the API (e.g., 'mcq-solver', 'viva-bot-stt')
  input_tokens INTEGER DEFAULT 0, -- Number of input tokens (for LLMs) or seconds (for STT)
  output_tokens INTEGER DEFAULT 0, -- Number of output tokens (for LLMs)
  cost_usd DECIMAL(10, 6) DEFAULT 0, -- Cost in USD
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Indexes for fast queries
  CONSTRAINT api_usage_log_valid_tokens CHECK (input_tokens >= 0 AND output_tokens >= 0),
  CONSTRAINT api_usage_log_valid_cost CHECK (cost_usd >= 0)
);

CREATE INDEX idx_api_usage_log_user_id ON api_usage_log(user_id);
CREATE INDEX idx_api_usage_log_created_at ON api_usage_log(created_at DESC);
CREATE INDEX idx_api_usage_log_model ON api_usage_log(model);
CREATE INDEX idx_api_usage_log_feature ON api_usage_log(feature);

-- Enable RLS: admins can read all, users cannot read their own logs (cost is hidden)
ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;

-- Admin-only read access
CREATE POLICY "Admins can read all api_usage_log"
  ON api_usage_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- No write access for students (only server-side inserts via service role)
CREATE POLICY "No student write access to api_usage_log"
  ON api_usage_log
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No student update access to api_usage_log"
  ON api_usage_log
  FOR UPDATE
  USING (false);

-- Enable updated_at trigger
CREATE OR REPLACE FUNCTION update_api_usage_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER api_usage_log_updated_at_trigger
BEFORE UPDATE ON api_usage_log
FOR EACH ROW
EXECUTE FUNCTION update_api_usage_log_updated_at();
```

---

## Migration 2: App Events Logging Table

**File:** `src/migrations/00003_app_events.sql`
**Purpose:** Track user actions (login, logout, uploads, etc.) for analytics
**Tables:** `app_events`
**Indexes:** 4 (user_id, created_at, event_type, metadata GIN)
**RLS:** Students insert/read own, admins read all

```sql
-- Migration: 00003 - App Events Logging Table
-- Purpose: Track user actions (login, logout, uploads, etc.) for analytics and debugging
-- Date: 2026-02-06

-- Create app_events table
CREATE TABLE IF NOT EXISTS app_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- Event type: 'user_login', 'user_logout', 'id_upload', 'content_upload', etc.
  metadata JSONB DEFAULT '{}'::jsonb, -- Flexible metadata (e.g., { module: 'Biology', file_size: 1024 })
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT app_events_event_type_not_empty CHECK (event_type != '')
);

CREATE INDEX idx_app_events_user_id ON app_events(user_id);
CREATE INDEX idx_app_events_created_at ON app_events(created_at DESC);
CREATE INDEX idx_app_events_event_type ON app_events(event_type);
CREATE INDEX idx_app_events_metadata ON app_events USING GIN(metadata);

-- Enable RLS: students insert their own events, only admins can read all
ALTER TABLE app_events ENABLE ROW LEVEL SECURITY;

-- Students can insert their own events
CREATE POLICY "Students can insert own app_events"
  ON app_events
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Students can read their own events
CREATE POLICY "Students can read own app_events"
  ON app_events
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read all events
CREATE POLICY "Admins can read all app_events"
  ON app_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- No update/delete by students
CREATE POLICY "No student update to app_events"
  ON app_events
  FOR UPDATE
  USING (false);

CREATE POLICY "No student delete to app_events"
  ON app_events
  FOR DELETE
  USING (false);
```

---

## Migration 3: Modules & Subjects Lookup Tables (Dow Medical College Curriculum)

**File:** `src/migrations/00004_modules_subjects.sql`
**Purpose:** Define Dow Medical College academic structure (years 1-5, all subjects per year)
**Tables:** `modules`, `subjects`, `subtopics`
**Seed Data:** 5 years × curriculum-specific subjects (Y1: 19, Y2: 20, Y3: 37, Y4: 30, Y5: 24)
**RLS:** Read-only for students, no writes
**Subtopics:** Empty now - will be seeded later when detailed topic mappings are provided

```sql
-- Migration: 00004 - Modules and Subjects Lookup Tables
-- Purpose: Define the academic structure (modules, subjects, subtopics)
-- Reference: DowOS org structure (Anatomy, Physiology, Pharmacology, etc. across 5 batches)
-- Date: 2026-02-06

-- Create modules table (batches/years for Dow Medical College)
CREATE TABLE IF NOT EXISTS modules (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- e.g., "Year 1", "Year 2"
  code TEXT NOT NULL UNIQUE, -- e.g., "Y1", "Y2"
  description TEXT,
  order_index INTEGER DEFAULT 0, -- Sort order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO modules (name, code, description, order_index) VALUES
  ('Year 1', 'Y1', 'First year medical students - Preclinical', 1),
  ('Year 2', 'Y2', 'Second year medical students - Preclinical', 2),
  ('Year 3', 'Y3', 'Third year medical students - Clinical', 3),
  ('Year 4', 'Y4', 'Fourth year medical students - Clinical', 4),
  ('Year 5', 'Y5', 'Fifth year medical students - Final', 5)
ON CONFLICT (code) DO NOTHING;

-- Create subjects table (Dow Medical College curriculum)
CREATE TABLE IF NOT EXISTS subjects (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Foundation Module", "Blood Module"
  code TEXT NOT NULL, -- e.g., "FND1", "HEM1"
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(module_id, code)
);

-- Seed subjects for Year 1 (Preclinical)
INSERT INTO subjects (module_id, name, code, description, order_index)
SELECT m.id, s.name, s.code, s.description, s.order_index
FROM modules m
CROSS JOIN (
  VALUES
    ('Foundation Module', 'FND1', 'Introduction to medical sciences', 1),
    ('Blood Module', 'HEM1', 'Hematology and blood disorders', 2),
    ('Locomotor Module', 'LCM1', 'Musculoskeletal system', 3),
    ('Respiratory System', 'RSP1', 'Respiratory physiology and pathology', 4),
    ('Cardiovascular System', 'CVS1', 'Heart and circulatory system', 5),
    ('Gross Anatomy', 'ANAT_G', 'Gross anatomical structures', 6),
    ('Embryology', 'EMBY', 'Embryological development', 7),
    ('Histology', 'HISTO', 'Microscopic tissue structure', 8),
    ('Physiology', 'PHYS', 'Normal body functions', 9),
    ('Pathology', 'PATH', 'Disease processes', 10),
    ('Microbiology', 'MICRO', 'Microorganisms and infections', 11),
    ('Biochemistry', 'BIOC', 'Chemical processes in living organisms', 12),
    ('Pharmacology', 'PHARM', 'Drugs and their effects', 13),
    ('Community Medicine', 'COMM', 'Public health and epidemiology', 14),
    ('Radiology', 'RADIO', 'Medical imaging', 15),
    ('Behavioural Sciences', 'BEHAV', 'Psychology and behavior', 16),
    ('Medicine', 'MED', 'Internal medicine', 17),
    ('Gynecology', 'GYNE', 'Gynecological disorders', 18),
    ('Skills Lab', 'SKILL', 'Practical clinical skills', 19)
) AS s(name, code, description, order_index)
WHERE m.code = 'Y1'
AND NOT EXISTS (
  SELECT 1 FROM subjects
  WHERE subjects.module_id = m.id
    AND subjects.code = s.code
);

-- Seed subjects for Year 2 (Preclinical)
INSERT INTO subjects (module_id, name, code, description, order_index)
SELECT m.id, s.name, s.code, s.description, s.order_index
FROM modules m
CROSS JOIN (
  VALUES
    ('Neurosciences', 'NEU1', 'Nervous system and neurology', 1),
    ('Head & Neck and Special Senses', 'HNS1', 'Head, neck, and sensory systems', 2),
    ('Endocrinology', 'END1', 'Endocrine system and hormones', 3),
    ('GIT and Liver', 'GIL1', 'Gastrointestinal and hepatic systems', 4),
    ('Renal and Excretory System', 'EXC1', 'Urinary and renal physiology', 5),
    ('Reproductive System', 'REP1', 'Male and female reproductive systems', 6),
    ('Gross Anatomy', 'ANAT_G', 'Gross anatomical structures', 7),
    ('Embryology', 'EMBY', 'Embryological development', 8),
    ('Histology', 'HISTO', 'Microscopic tissue structure', 9),
    ('Physiology', 'PHYS', 'Normal body functions', 10),
    ('Pathology', 'PATH', 'Disease processes', 11),
    ('Microbiology', 'MICRO', 'Microorganisms and infections', 12),
    ('Biochemistry', 'BIOC', 'Chemical processes in living organisms', 13),
    ('Pharmacology', 'PHARM', 'Drugs and their effects', 14),
    ('Community Medicine', 'COMM', 'Public health and epidemiology', 15),
    ('Radiology', 'RADIO', 'Medical imaging', 16),
    ('Behavioural Sciences', 'BEHAV', 'Psychology and behavior', 17),
    ('Medicine', 'MED', 'Internal medicine', 18),
    ('Gynecology', 'GYNE', 'Gynecological disorders', 19),
    ('Skills Lab', 'SKILL', 'Practical clinical skills', 20)
) AS s(name, code, description, order_index)
WHERE m.code = 'Y2'
AND NOT EXISTS (
  SELECT 1 FROM subjects
  WHERE subjects.module_id = m.id
    AND subjects.code = s.code
);

-- Seed subjects for Year 3 (Clinical)
INSERT INTO subjects (module_id, name, code, description, order_index)
SELECT m.id, s.name, s.code, s.description, s.order_index
FROM modules m
CROSS JOIN (
  VALUES
    ('Foundation Module', 'FND2', 'Advanced foundational concepts', 1),
    ('Infectious Diseases', 'IDD1', 'Infectious disease management', 2),
    ('Hematology', 'HEM2', 'Blood disorders and hematology', 3),
    ('Respiratory System', 'RSP2', 'Clinical respiratory pathology', 4),
    ('Cardiovascular System', 'CVS2', 'Clinical cardiology', 5),
    ('GIT and Liver', 'GIL2', 'Gastrointestinal and hepatic clinical', 6),
    ('Renal and Excretory System', 'EXC2', 'Renal clinical pathology', 7),
    ('Endocrinology', 'END2', 'Endocrine disorders', 8),
    ('Pathology', 'PATH', 'Disease processes', 9),
    ('Physiology', 'PHYS', 'Normal body functions', 10),
    ('Pharmacology', 'PHARM', 'Drugs and their effects', 11),
    ('Medicine', 'MED', 'Internal medicine', 12),
    ('Orthopedics', 'ORT', 'Musculoskeletal disorders', 13),
    ('Surgery', 'SURG', 'Surgical specialties', 14),
    ('Pediatrics', 'PEDS', 'Child health and diseases', 15),
    ('Gastroenterology', 'GAST', 'Digestive system disorders', 16),
    ('Pulmonology', 'PULM', 'Lung and respiratory diseases', 17),
    ('Cardiology', 'CARD', 'Heart and vascular diseases', 18),
    ('ENT', 'ENT', 'Ear, Nose, Throat disorders', 19),
    ('Ophthalmology', 'OPHT', 'Eye and vision disorders', 20),
    ('Neurology', 'NEUR', 'Neurological disorders', 21),
    ('Psychiatry', 'PSYCH', 'Mental health and psychiatric disorders', 22),
    ('Neurosurgery', 'NEURO_SURG', 'Surgical neurology', 23),
    ('Physical Medicine and Rehabilitation', 'PMR', 'Rehabilitation medicine', 24),
    ('General Surgery', 'GEN_SURG', 'General surgical procedures', 25),
    ('Gynecology & Obstetrics', 'GYNE_OBS', 'Womens health', 26),
    ('Biostatistics', 'BIOSTAT', 'Medical statistics', 27),
    ('Research', 'RESEARCH', 'Medical research methods', 28),
    ('Forensic Medicine', 'FOREN', 'Forensic investigations', 29),
    ('Community Medicine', 'COMM', 'Public health and epidemiology', 30),
    ('Radiology', 'RADIO', 'Medical imaging', 31),
    ('Behavioural Sciences', 'BEHAV', 'Psychology and behavior', 32),
    ('Anatomy', 'ANAT', 'Advanced anatomical knowledge', 33),
    ('Biochemistry', 'BIOC', 'Advanced biochemistry', 34),
    ('Dermatology', 'DERM', 'Skin disorders', 35),
    ('Burns', 'BURNS', 'Burn management', 36),
    ('Plastic Surgery', 'PLAST_SURG', 'Plastic and reconstructive surgery', 37)
) AS s(name, code, description, order_index)
WHERE m.code = 'Y3'
AND NOT EXISTS (
  SELECT 1 FROM subjects
  WHERE subjects.module_id = m.id
    AND subjects.code = s.code
);

-- Seed subjects for Year 4 (Clinical)
INSERT INTO subjects (module_id, name, code, description, order_index)
SELECT m.id, s.name, s.code, s.description, s.order_index
FROM modules m
CROSS JOIN (
  VALUES
    ('Musculoskeletal System/Orthopedic', 'ORT2', 'Orthopedic clinical practice', 1),
    ('Reproductive System', 'REP2', 'Reproductive clinical management', 2),
    ('Neurosciences', 'NEU2', 'Advanced neuroscience', 3),
    ('Clinical Genetics', 'GEN', 'Genetic disorders and counseling', 4),
    ('Dermatology/Plastic Surgery/Burns', 'DERM_PLAST', 'Dermatological and plastic procedures', 5),
    ('Otorhinolaryngology/ENT', 'ENT2', 'Ear, Nose, Throat clinical', 6),
    ('Ophthalmology', 'EYE', 'Eye disorders and management', 7),
    ('Pathology', 'PATH', 'Disease processes', 8),
    ('Physiology', 'PHYS', 'Normal body functions', 9),
    ('Pharmacology', 'PHARM', 'Drugs and their effects', 10),
    ('Medicine', 'MED', 'Internal medicine', 11),
    ('Pediatrics', 'PEDS', 'Child health and diseases', 12),
    ('Surgery', 'SURG', 'Surgical specialties', 13),
    ('Gastroenterology', 'GAST', 'Digestive system disorders', 14),
    ('Pulmonology', 'PULM', 'Lung and respiratory diseases', 15),
    ('Cardiology', 'CARD', 'Heart and vascular diseases', 16),
    ('Neurology', 'NEUR', 'Neurological disorders', 17),
    ('Psychiatry', 'PSYCH', 'Mental health and psychiatric disorders', 18),
    ('Neurosurgery', 'NEURO_SURG', 'Surgical neurology', 19),
    ('Physical Medicine and Rehabilitation', 'PMR', 'Rehabilitation medicine', 20),
    ('General Surgery', 'GEN_SURG', 'General surgical procedures', 21),
    ('Gynecology & Obstetrics', 'GYNE_OBS', 'Womens health', 22),
    ('Biostatistics', 'BIOSTAT', 'Medical statistics', 23),
    ('Research', 'RESEARCH', 'Medical research methods', 24),
    ('Forensic Medicine', 'FOREN', 'Forensic investigations', 25),
    ('Community Medicine', 'COMM', 'Public health and epidemiology', 26),
    ('Radiology', 'RADIO', 'Medical imaging', 27),
    ('Behavioural Sciences', 'BEHAV', 'Psychology and behavior', 28),
    ('Anatomy', 'ANAT', 'Advanced anatomical knowledge', 29),
    ('Biochemistry', 'BIOC', 'Advanced biochemistry', 30)
) AS s(name, code, description, order_index)
WHERE m.code = 'Y4'
AND NOT EXISTS (
  SELECT 1 FROM subjects
  WHERE subjects.module_id = m.id
    AND subjects.code = s.code
);

-- Seed subjects for Year 5 (Final)
INSERT INTO subjects (module_id, name, code, description, order_index)
SELECT m.id, s.name, s.code, s.description, s.order_index
FROM modules m
CROSS JOIN (
  VALUES
    ('Medicine', 'MED', 'Internal medicine', 1),
    ('Pediatrics', 'PEDS', 'Child health and diseases', 2),
    ('Surgery', 'SURG', 'Surgical specialties', 3),
    ('Gynecology', 'GYNE', 'Gynecological disorders', 4),
    ('Obstetrics', 'OBS', 'Obstetric care', 5),
    ('Pathology', 'PATH', 'Disease processes', 6),
    ('Pharmacology', 'PHARM', 'Drugs and their effects', 7),
    ('Radiology', 'RADIO', 'Medical imaging', 8),
    ('Forensic Medicine', 'FOREN', 'Forensic investigations', 9),
    ('Community Medicine', 'COMM', 'Public health and epidemiology', 10),
    ('Orthopedics', 'ORT', 'Musculoskeletal disorders', 11),
    ('Gastroenterology', 'GAST', 'Digestive system disorders', 12),
    ('Pulmonology', 'PULM', 'Lung and respiratory diseases', 13),
    ('Cardiology', 'CARD', 'Heart and vascular diseases', 14),
    ('ENT', 'ENT', 'Ear, Nose, Throat disorders', 15),
    ('Ophthalmology', 'OPHT', 'Eye and vision disorders', 16),
    ('Neurology', 'NEUR', 'Neurological disorders', 17),
    ('Psychiatry', 'PSYCH', 'Mental health and psychiatric disorders', 18),
    ('Neurosurgery', 'NEURO_SURG', 'Surgical neurology', 19),
    ('Physical Medicine and Rehabilitation', 'PMR', 'Rehabilitation medicine', 20),
    ('General Surgery', 'GEN_SURG', 'General surgical procedures', 21),
    ('Biostatistics', 'BIOSTAT', 'Medical statistics', 22),
    ('Research', 'RESEARCH', 'Medical research methods', 23),
    ('Behavioral Sciences', 'BEHAV', 'Psychology and behavior', 24)
) AS s(name, code, description, order_index)
WHERE m.code = 'Y5'
AND NOT EXISTS (
  SELECT 1 FROM subjects
  WHERE subjects.module_id = m.id
    AND subjects.code = s.code
);

-- Create subtopics table (granular topics within subjects)
CREATE TABLE IF NOT EXISTS subtopics (
  id BIGSERIAL PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Gross Anatomy", "Neuroanatomy"
  code TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(subject_id, code)
);

-- Indexes
CREATE INDEX idx_modules_code ON modules(code);
CREATE INDEX idx_subjects_module_id ON subjects(module_id);
CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subtopics_subject_id ON subtopics(subject_id);
CREATE INDEX idx_subtopics_code ON subtopics(code);

-- Enable RLS: all authenticated users can read (no write)
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtopics ENABLE ROW LEVEL SECURITY;

-- Students can read all modules/subjects/subtopics
CREATE POLICY "Authenticated users can read modules"
  ON modules
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read subjects"
  ON subjects
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read subtopics"
  ON subtopics
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- No write access for students (admin-only via service role)
CREATE POLICY "No student write to modules"
  ON modules
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No student write to subjects"
  ON subjects
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No student write to subtopics"
  ON subtopics
  FOR INSERT
  WITH CHECK (false);

-- Enable updated_at triggers
CREATE OR REPLACE FUNCTION update_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER modules_updated_at_trigger
BEFORE UPDATE ON modules
FOR EACH ROW
EXECUTE FUNCTION update_modules_updated_at();

CREATE OR REPLACE FUNCTION update_subjects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subjects_updated_at_trigger
BEFORE UPDATE ON subjects
FOR EACH ROW
EXECUTE FUNCTION update_subjects_updated_at();

CREATE OR REPLACE FUNCTION update_subtopics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subtopics_updated_at_trigger
BEFORE UPDATE ON subtopics
FOR EACH ROW
EXECUTE FUNCTION update_subtopics_updated_at();
```

---

## Verification Checklist

After applying all 3 migrations in Supabase, verify:

- [ ] `api_usage_log` table exists with 4 indexes
- [ ] `app_events` table exists with 4 indexes
- [ ] `modules` table has 5 rows (Y1-Y5)
- [ ] `subjects` table has 180+ rows (Y1: 19 subjects, Y2: 20 subjects, Y3: 37 subjects, Y4: 30 subjects, Y5: 24 subjects = 130 total)
- [ ] `subtopics` table exists (empty, ready for seeding with specific topics per subject later)
- [ ] All RLS policies applied correctly
- [ ] All triggers created
- [ ] No errors in SQL execution

---

## Next Steps (Day 11)

After migrations are applied:

1. Build Profile page (glassmorphic card + photo upload)
2. Wire admin route group + role gating
3. Create admin dashboard stubs
4. Optional: Wire live dashboard data

See `DAY-11-READY.md` for full build priorities.
