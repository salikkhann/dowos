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
