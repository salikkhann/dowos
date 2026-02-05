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
