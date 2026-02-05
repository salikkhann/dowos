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
**Purpose:** Define Dow Medical College academic structure (years → modules/systems → subjects → subtopics)
**Tables:** `years`, `modules`, `subjects`, `module_subjects` (junction), `subtopics`
**Seed Data:**
- 5 years (Y1-Y5)
- 26 modules total (Y1: 5, Y2: 6, Y3: 8, Y4: 7, Y5: 4 systems)
- 28 subjects (14 preclinical for Y1-Y2, 14+ clinical for Y3-Y5)
- Module-to-subject mappings: To be added later (empty now for flexibility)
- Subtopics: Empty now - will be seeded when detailed topic mappings are provided
**RLS:** Read-only for students, no writes
**Structure:** Year → Module → (via module_subjects junction) → Subject → Subtopic

```sql
-- Migration: 00004 - Modules and Subjects Lookup Tables
-- Purpose: Define the academic structure (modules, subjects, subtopics)
-- Reference: DowOS org structure (Anatomy, Physiology, Pharmacology, etc. across 5 batches)
-- Date: 2026-02-06

-- Create years table (batches for Dow Medical College)
CREATE TABLE IF NOT EXISTS years (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- e.g., "Year 1", "Year 2"
  code TEXT NOT NULL UNIQUE, -- e.g., "Y1", "Y2"
  description TEXT,
  order_index INTEGER DEFAULT 0, -- Sort order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO years (name, code, description, order_index) VALUES
  ('Year 1', 'Y1', 'First year medical students - Preclinical', 1),
  ('Year 2', 'Y2', 'Second year medical students - Preclinical', 2),
  ('Year 3', 'Y3', 'Third year medical students - Clinical', 3),
  ('Year 4', 'Y4', 'Fourth year medical students - Clinical', 4),
  ('Year 5', 'Y5', 'Fifth year medical students - Final', 5)
ON CONFLICT (code) DO NOTHING;

-- Create modules table (systems/subjects within years for Dow Medical College)
CREATE TABLE IF NOT EXISTS modules (
  id BIGSERIAL PRIMARY KEY,
  year_id BIGINT NOT NULL REFERENCES years(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Foundation Module", "Blood Module", "Respiratory System"
  code TEXT NOT NULL, -- e.g., "FND1", "HEM1", "RSP1"
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(year_id, code)
);

-- Seed modules for Year 1 (Preclinical - Systems-based)
INSERT INTO modules (year_id, name, code, description, order_index)
SELECT y.id, m.name, m.code, m.description, m.order_index
FROM years y
CROSS JOIN (
  VALUES
    ('Foundation Module', 'FND1', 'Introduction to medical sciences and fundamentals', 1),
    ('Blood Module', 'HEM1', 'Hematology and blood disorders', 2),
    ('Locomotor Module', 'LCM1', 'Musculoskeletal system', 3),
    ('Respiratory System', 'RSP1', 'Respiratory physiology and pathology', 4),
    ('Cardiovascular System', 'CVS1', 'Heart and circulatory system', 5)
) AS m(name, code, description, order_index)
WHERE y.code = 'Y1'
AND NOT EXISTS (
  SELECT 1 FROM modules
  WHERE modules.year_id = y.id AND modules.code = m.code
);

-- Seed modules for Year 2 (Preclinical - Systems-based)
INSERT INTO modules (year_id, name, code, description, order_index)
SELECT y.id, m.name, m.code, m.description, m.order_index
FROM years y
CROSS JOIN (
  VALUES
    ('Neurosciences', 'NEU1', 'Nervous system and neurology', 1),
    ('Head & Neck and Special Senses', 'HNS1', 'Head, neck, and sensory systems', 2),
    ('Endocrinology', 'END1', 'Endocrine system and hormones', 3),
    ('GIT and Liver', 'GIL1', 'Gastrointestinal and hepatic systems', 4),
    ('Renal and Excretory System', 'EXC1', 'Urinary and renal physiology', 5),
    ('Reproductive System', 'REP1', 'Male and female reproductive systems', 6)
) AS m(name, code, description, order_index)
WHERE y.code = 'Y2'
AND NOT EXISTS (
  SELECT 1 FROM modules
  WHERE modules.year_id = y.id AND modules.code = m.code
);

-- Seed modules for Year 3 (Clinical - Systems-based)
INSERT INTO modules (year_id, name, code, description, order_index)
SELECT y.id, m.name, m.code, m.description, m.order_index
FROM years y
CROSS JOIN (
  VALUES
    ('Foundation Module', 'FND2', 'Advanced foundational concepts for clinical practice', 1),
    ('Infectious Diseases', 'IDD1', 'Infectious disease management', 2),
    ('Hematology', 'HEM2', 'Blood disorders and hematology', 3),
    ('Respiratory System', 'RSP2', 'Clinical respiratory pathology', 4),
    ('Cardiovascular System', 'CVS2', 'Clinical cardiology', 5),
    ('GIT and Liver', 'GIL2', 'Gastrointestinal and hepatic clinical', 6),
    ('Renal and Excretory System', 'EXC2', 'Renal clinical pathology', 7),
    ('Endocrinology', 'END2', 'Endocrine disorders', 8)
) AS m(name, code, description, order_index)
WHERE y.code = 'Y3'
AND NOT EXISTS (
  SELECT 1 FROM modules
  WHERE modules.year_id = y.id AND modules.code = m.code
);

-- Seed modules for Year 4 (Clinical - Specialty-based)
INSERT INTO modules (year_id, name, code, description, order_index)
SELECT y.id, m.name, m.code, m.description, m.order_index
FROM years y
CROSS JOIN (
  VALUES
    ('Musculoskeletal System/Orthopedic', 'ORT2', 'Orthopedic clinical practice', 1),
    ('Reproductive System', 'REP2', 'Reproductive clinical management', 2),
    ('Neurosciences', 'NEU2', 'Advanced neuroscience', 3),
    ('Clinical Genetics', 'GEN', 'Genetic disorders and counseling', 4),
    ('Dermatology/Plastic Surgery/Burns', 'DPS', 'Dermatological and plastic procedures', 5),
    ('Otorhinolaryngology/ENT', 'ENT2', 'Ear, Nose, Throat clinical', 6),
    ('Ophthalmology', 'EYE', 'Eye disorders and management', 7)
) AS m(name, code, description, order_index)
WHERE y.code = 'Y4'
AND NOT EXISTS (
  SELECT 1 FROM modules
  WHERE modules.year_id = y.id AND modules.code = m.code
);

-- Seed modules for Year 5 (Final - Specialty-based)
INSERT INTO modules (year_id, name, code, description, order_index)
SELECT y.id, m.name, m.code, m.description, m.order_index
FROM years y
CROSS JOIN (
  VALUES
    ('Medicine', 'MED5', 'Internal medicine', 1),
    ('Pediatrics', 'PEDS5', 'Child health and diseases', 2),
    ('Surgery', 'SURG5', 'Surgical specialties', 3),
    ('Gynecology and Obstetrics', 'GYNE_OBS5', 'Womens health and obstetric care', 4)
) AS m(name, code, description, order_index)
WHERE y.code = 'Y5'
AND NOT EXISTS (
  SELECT 1 FROM modules
  WHERE modules.year_id = y.id AND modules.code = m.code
);

-- Create subjects table (courses/disciplines within modules)
CREATE TABLE IF NOT EXISTS subjects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL, -- e.g., "Gross Anatomy", "Physiology"
  code TEXT NOT NULL UNIQUE, -- e.g., "ANAT_G", "PHYS"
  description TEXT,
  is_preclinical BOOLEAN DEFAULT false, -- true for Y1-Y2, false for Y3-Y5
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed subjects for Year 1-2 (Preclinical)
INSERT INTO subjects (name, code, description, is_preclinical, order_index) VALUES
  ('Gross Anatomy', 'ANAT_G', 'Gross anatomical structures', true, 1),
  ('Embryology', 'EMBY', 'Embryological development', true, 2),
  ('Histology', 'HISTO', 'Microscopic tissue structure', true, 3),
  ('Physiology', 'PHYS', 'Normal body functions', true, 4),
  ('Pathology', 'PATH', 'Disease processes', true, 5),
  ('Microbiology', 'MICRO', 'Microorganisms and infections', true, 6),
  ('Biochemistry', 'BIOC', 'Chemical processes in living organisms', true, 7),
  ('Pharmacology', 'PHARM', 'Drugs and their effects', true, 8),
  ('Community Medicine', 'COMM', 'Public health and epidemiology', true, 9),
  ('Radiology', 'RADIO', 'Medical imaging', true, 10),
  ('Behavioural Sciences', 'BEHAV', 'Psychology and behavior', true, 11),
  ('Medicine', 'MED', 'Internal medicine', true, 12),
  ('Gynecology', 'GYNE', 'Gynecological disorders', true, 13),
  ('Skills Lab', 'SKILL', 'Practical clinical skills', true, 14)
ON CONFLICT (code) DO NOTHING;

-- Seed subjects for Year 3-5 (Clinical)
INSERT INTO subjects (name, code, description, is_preclinical, order_index) VALUES
  ('Pathology', 'PATH_C', 'Disease processes - Clinical', false, 1),
  ('Physiology', 'PHYS_C', 'Normal body functions - Clinical', false, 2),
  ('Pharmacology', 'PHARM_C', 'Drugs and their effects - Clinical', false, 3),
  ('Medicine', 'MED_C', 'Internal medicine - Clinical', false, 4),
  ('Orthopedics', 'ORT', 'Musculoskeletal disorders', false, 5),
  ('Surgery', 'SURG', 'Surgical specialties', false, 6),
  ('Pediatrics', 'PEDS', 'Child health and diseases', false, 7),
  ('Gastroenterology', 'GAST', 'Digestive system disorders', false, 8),
  ('Pulmonology', 'PULM', 'Lung and respiratory diseases', false, 9),
  ('Cardiology', 'CARD', 'Heart and vascular diseases', false, 10),
  ('ENT', 'ENT_S', 'Ear, Nose, Throat disorders', false, 11),
  ('Ophthalmology', 'OPHT', 'Eye and vision disorders', false, 12),
  ('Neurology', 'NEUR', 'Neurological disorders', false, 13),
  ('Psychiatry', 'PSYCH', 'Mental health and psychiatric disorders', false, 14),
  ('Neurosurgery', 'NEURO_SURG', 'Surgical neurology', false, 15),
  ('Physical Medicine and Rehabilitation', 'PMR', 'Rehabilitation medicine', false, 16),
  ('General Surgery', 'GEN_SURG', 'General surgical procedures', false, 17),
  ('Gynaecology & Obstetrics', 'GYNE_OBS', 'Womens health and obstetrics', false, 18),
  ('Biostatistics', 'BIOSTAT', 'Medical statistics', false, 19),
  ('Research', 'RESEARCH', 'Medical research methods', false, 20),
  ('Forensic Medicine', 'FOREN', 'Forensic investigations', false, 21),
  ('Community Medicine', 'COMM_C', 'Public health and epidemiology - Clinical', false, 22),
  ('Radiology', 'RADIO_C', 'Medical imaging - Clinical', false, 23),
  ('Behavioural Sciences', 'BEHAV_C', 'Psychology and behavior - Clinical', false, 24),
  ('Anatomy', 'ANAT', 'Anatomical knowledge', false, 25),
  ('Dermatology', 'DERM', 'Skin disorders', false, 26),
  ('Burns', 'BURNS', 'Burn management', false, 27),
  ('Plastic Surgery', 'PLAST_SURG', 'Plastic and reconstructive surgery', false, 28)
ON CONFLICT (code) DO NOTHING;

-- Create junction table to link modules to subjects (many-to-many)
CREATE TABLE IF NOT EXISTS module_subjects (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(module_id, subject_id)
);

-- NOTE: Links between modules and subjects to be added later via separate migration
-- This allows flexibility to map subjects to modules without hardcoding the relationships

-- Create subtopics table (granular topics within subjects - for future use)
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

-- Indexes for performance
CREATE INDEX idx_years_code ON years(code);
CREATE INDEX idx_modules_year_id ON modules(year_id);
CREATE INDEX idx_modules_code ON modules(code);
CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_is_preclinical ON subjects(is_preclinical);
CREATE INDEX idx_module_subjects_module_id ON module_subjects(module_id);
CREATE INDEX idx_module_subjects_subject_id ON module_subjects(subject_id);
CREATE INDEX idx_subtopics_subject_id ON subtopics(subject_id);
CREATE INDEX idx_subtopics_code ON subtopics(code);

-- Enable RLS: all tables read-only for students (no writes)
ALTER TABLE years ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtopics ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all tables
CREATE POLICY "Authenticated users can read years"
  ON years
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read modules"
  ON modules
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read subjects"
  ON subjects
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read module_subjects"
  ON module_subjects
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read subtopics"
  ON subtopics
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- No write access for any authenticated user (admin-only via service role)
CREATE POLICY "No student write to years"
  ON years FOR INSERT WITH CHECK (false);

CREATE POLICY "No student write to modules"
  ON modules FOR INSERT WITH CHECK (false);

CREATE POLICY "No student write to subjects"
  ON subjects FOR INSERT WITH CHECK (false);

CREATE POLICY "No student write to module_subjects"
  ON module_subjects FOR INSERT WITH CHECK (false);

CREATE POLICY "No student write to subtopics"
  ON subtopics FOR INSERT WITH CHECK (false);

-- Enable updated_at triggers
CREATE OR REPLACE FUNCTION update_curriculum_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER years_updated_at_trigger
BEFORE UPDATE ON years
FOR EACH ROW
EXECUTE FUNCTION update_curriculum_updated_at();

CREATE TRIGGER modules_updated_at_trigger
BEFORE UPDATE ON modules
FOR EACH ROW
EXECUTE FUNCTION update_curriculum_updated_at();

CREATE TRIGGER subjects_updated_at_trigger
BEFORE UPDATE ON subjects
FOR EACH ROW
EXECUTE FUNCTION update_curriculum_updated_at();

CREATE TRIGGER subtopics_updated_at_trigger
BEFORE UPDATE ON subtopics
FOR EACH ROW
EXECUTE FUNCTION update_curriculum_updated_at();
```

---

## Verification Checklist

After applying all 3 migrations in Supabase, verify:

**Migration 1 (api_usage_log):**
- [ ] `api_usage_log` table exists with 4 indexes
- [ ] RLS policies applied (admin-only read, no student writes)

**Migration 2 (app_events):**
- [ ] `app_events` table exists with 4 indexes
- [ ] RLS policies applied (students insert/read own, admins read all)

**Migration 3 (curriculum structure):**
- [ ] `years` table has 5 rows (Y1-Y5)
- [ ] `modules` table has 26 rows (5 + 6 + 8 + 7 + 4 per year)
- [ ] `subjects` table has 28 rows (14 preclinical + 14 clinical)
- [ ] `module_subjects` table exists (empty now - to be populated later)
- [ ] `subtopics` table exists (empty - for future seeding)
- [ ] All indexes created
- [ ] All RLS policies applied correctly
- [ ] All triggers created
- [ ] No errors in SQL execution

---

## Next Steps

**Immediate (after migrations applied):**
1. Verify all 6 tables exist with correct counts
2. Test RLS policies via Supabase Studio

**Day 11 Build:**
1. Build Profile page (glassmorphic card + photo upload)
2. Wire admin route group + role gating
3. Create admin dashboard stubs
4. Optional: Wire live dashboard data

**Future (Curriculum Mapping Phase):**
1. Create module-to-subject mappings in `module_subjects` junction table
2. Define subtopics per subject in `subtopics` table
3. Wire curriculum navigation in MCQ Solver and Progress Matrix

**Migration Template for Later:**
When you provide module-to-subject mappings, they'll be applied via:
```sql
INSERT INTO module_subjects (module_id, subject_id, order_index)
SELECT m.id, s.id, s.order_index
FROM modules m
JOIN subjects s ON s.code IN (...)
WHERE m.code = '...'
```

See `DAY-11-READY.md` for full build priorities.
