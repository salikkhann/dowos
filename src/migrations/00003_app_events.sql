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
