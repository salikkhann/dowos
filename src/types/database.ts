// Auto-maintained: keep in sync with supabase/migrations/00001_users.sql

export interface User {
  id: string; // uuid – matches auth.users.id
  email: string;
  roll_number: string | null;
  batch_year: 1 | 2 | 3 | 4 | 5 | null;
  lab_group: "A" | "B" | "C" | "D" | "E" | "F" | null;
  learning_style: "listening" | "reading" | "quick_summary" | null;
  explanation_depth: "brief" | "moderate" | "detailed" | null;
  id_card_url: string | null;
  verification_status: "pending" | "verified" | "rejected";
  onboarding_step: 0 | 1 | 2 | 3 | 4;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  user_id: string;
  theme: "light" | "dark" | "system";
  notifications_on: boolean;
  voice_enabled: boolean;
  voice_speed: number;
  created_at: string;
  updated_at: string;
}

// ── Supabase SDK generic wrapper ─────────────────────────────────────────────
// Row types must use base primitives (number, string | null) so they satisfy
// Record<string, unknown>.  Use the exported User / UserPreferences interfaces
// for application-level narrowing after you fetch.

interface UserRow {
  id: string;
  email: string;
  roll_number: string | null;
  batch_year: number | null;
  lab_group: string | null;
  learning_style: string | null;
  explanation_depth: string | null;
  id_card_url: string | null;
  verification_status: string;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

interface UserPreferencesRow {
  user_id: string;
  theme: string;
  notifications_on: boolean;
  voice_enabled: boolean;
  voice_speed: number;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Omit<UserRow, "created_at" | "updated_at">;
        Update: Partial<Omit<UserRow, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      user_preferences: {
        Row: UserPreferencesRow;
        Insert: Omit<UserPreferencesRow, "created_at" | "updated_at">;
        Update: Partial<Omit<UserPreferencesRow, "user_id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Views: {};
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Functions: {};
  };
}
