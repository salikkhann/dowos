-- ============================================================
-- 00001 – users & user_preferences
-- Run once against the Supabase project via Studio or CLI.
-- ============================================================

-- Enable pgcrypto for uuid generation (usually already on, safe to repeat)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id                 uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email              text        NOT NULL UNIQUE,
  roll_number        text,                          -- format: YY/YYYY/NNN  (set during onboarding)
  batch_year         smallint,                      -- 1-5                  (set during onboarding)
  lab_group          text        CHECK (lab_group IN ('A','B','C','D','E','F')),
  learning_style     text        CHECK (learning_style IN ('listening','reading','quick_summary')),
  explanation_depth  text        CHECK (explanation_depth IN ('brief','moderate','detailed')),
  id_card_url        text,                          -- Supabase Storage path (set during onboarding)
  verification_status text       NOT NULL DEFAULT 'pending'
                                 CHECK (verification_status IN ('pending','verified','rejected')),
  onboarding_step    smallint    NOT NULL DEFAULT 0, -- 0=just signed up, 1=identity done, 2=learning done, 3=id uploaded, 4=approved
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- user_preferences  (1:1 with users, created after onboarding)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id            uuid        PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  theme              text        NOT NULL DEFAULT 'dark' CHECK (theme IN ('light','dark','system')),
  notifications_on   boolean     NOT NULL DEFAULT true,
  voice_enabled      boolean     NOT NULL DEFAULT true,
  voice_speed        real        NOT NULL DEFAULT 1.0 CHECK (voice_speed BETWEEN 0.5 AND 2.0),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- updated_at trigger (shared helper)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- Row-Level Security
-- ------------------------------------------------------------
ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- users: each student sees only their own row
CREATE POLICY users_self_select ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY users_self_insert ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY users_self_update ON public.users
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- user_preferences: same pattern
CREATE POLICY prefs_self_select ON public.user_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY prefs_self_insert ON public.user_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY prefs_self_update ON public.user_preferences
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ------------------------------------------------------------
-- Storage bucket for ID card uploads (public read after verification)
-- ------------------------------------------------------------
-- Run in Supabase Studio → Storage if bucket does not exist yet:
--   CREATE BUCKET IF NOT EXISTS id_cards;
-- Policy: authenticated users can upload to id_cards/<their uid>/
