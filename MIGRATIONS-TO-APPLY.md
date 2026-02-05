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

## Migration 3: Modules & Subjects Lookup Tables

**File:** `src/migrations/00004_modules_subjects.sql`
**Purpose:** Define academic structure (modules, subjects, subtopics)
**Tables:** `modules`, `subjects`, `subtopics`
**Seed Data:** 5 batches × 10 subjects per batch
**RLS:** Read-only for students, no writes

```sql
-- Migration: 00004 - Modules and Subjects Lookup Tables
-- Purpose: Define the academic structure (modules, subjects, subtopics)
-- Reference: DowOS org structure (Anatomy, Physiology, Pharmacology, etc. across 5 batches)
-- Date: 2026-02-06

-- Create modules table (e.g., Batch 1, Batch 2, etc.)
CREATE TABLE IF NOT EXISTS modules (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- e.g., "Batch 1", "Batch 2"
  code TEXT NOT NULL UNIQUE, -- e.g., "B1", "B2"
  description TEXT,
  order_index INTEGER DEFAULT 0, -- Sort order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO modules (name, code, description, order_index) VALUES
  ('Batch 1 (Year 1)', 'B1', 'First year medical students', 1),
  ('Batch 2 (Year 2)', 'B2', 'Second year medical students', 2),
  ('Batch 3 (Year 3)', 'B3', 'Third year medical students', 3),
  ('Batch 4 (Year 4)', 'B4', 'Fourth year medical students', 4),
  ('Batch 5 (Year 5)', 'B5', 'Fifth year medical students', 5)
ON CONFLICT (code) DO NOTHING;

-- Create subjects table (e.g., Anatomy, Physiology, etc.)
CREATE TABLE IF NOT EXISTS subjects (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Anatomy", "Physiology"
  code TEXT NOT NULL, -- e.g., "ANAT", "PHYS"
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(module_id, code)
);

-- Seed common subjects for all batches
INSERT INTO subjects (module_id, name, code, description, order_index)
SELECT m.id, s.name, s.code, s.description, s.order_index
FROM modules m
CROSS JOIN (
  VALUES
    ('Anatomy', 'ANAT', 'Study of body structure', 1),
    ('Physiology', 'PHYS', 'Study of body functions', 2),
    ('Biochemistry', 'BIOC', 'Study of chemical processes in living organisms', 3),
    ('Pharmacology', 'PHARM', 'Study of drugs and their effects', 4),
    ('Pathology', 'PATH', 'Study of diseases', 5),
    ('Microbiology', 'MICRO', 'Study of microorganisms', 6),
    ('Forensic Medicine', 'FOREN', 'Forensic medical investigations', 7),
    ('Community Medicine', 'COMM', 'Public health and community care', 8),
    ('Surgery', 'SURG', 'Surgical specialties', 9),
    ('Medicine', 'MED', 'Internal medicine specialties', 10)
) AS s(name, code, description, order_index)
WHERE NOT EXISTS (
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
- [ ] `modules` table has 5 rows (B1-B5)
- [ ] `subjects` table has 50 rows (5 batches × 10 subjects)
- [ ] `subtopics` table exists (empty, ready for seeding)
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
