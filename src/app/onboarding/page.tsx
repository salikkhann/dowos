"use client";

/**
 * Onboarding – multi-step flow that runs once after email verification.
 *
 * Steps (tracked via users.onboarding_step):
 *   0 → Welcome        (no input – sets tone)
 *   1 → Identity       (batch_year, roll_number, lab_group)
 *   2 → Learning style (learning_style, explanation_depth)
 *   3 → ID upload      (id_card_url → Supabase Storage)
 *   4 → Pending        (waiting for manual verification)
 *
 * On mount we fetch the current user row.  If onboarding_step === 4 and
 * verification_status === "verified" we redirect straight to /dashboard.
 */

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { type User } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── helpers ──────────────────────────────────────────────────────────────────
const BATCH_OPTIONS = [
  { value: 1, label: "1st Year" },
  { value: 2, label: "2nd Year" },
  { value: 3, label: "3rd Year" },
  { value: 4, label: "4th Year" },
  { value: 5, label: "5th Year" },
] as const;

const LAB_GROUPS = ["A", "B", "C", "D", "E", "F"] as const;

const LEARNING_STYLES = [
  { value: "listening", label: "🎧 Listening", desc: "I learn best by hearing explanations" },
  { value: "reading", label: "📖 Reading", desc: "I prefer detailed written explanations" },
  { value: "quick_summary", label: "⚡ Quick summaries", desc: "Give me key points fast" },
] as const;

const EXPLANATION_DEPTHS = [
  { value: "brief", label: "Brief", desc: "Key points only" },
  { value: "moderate", label: "Moderate", desc: "With examples" },
  { value: "detailed", label: "Detailed", desc: "Full breakdown with clinical context" },
] as const;

// ── progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            i < step ? "bg-teal-500" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

// ── chip button (for single-select card grids) ──────────────────────────────
function ChipCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left w-full rounded-xl border p-4 transition-all duration-150 ${
        selected
          ? "border-teal-500 bg-teal-500/10 ring-2 ring-teal-500/30"
          : "border-border bg-card hover:border-teal-400"
      }`}
    >
      {children}
    </button>
  );
}

// ── step components ──────────────────────────────────────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="glass-card rounded-2xl border border-border p-8 text-center">
      <div className="text-5xl mb-4">👋</div>
      <h1 className="text-2xl font-extrabold text-foreground mb-3">Welcome to DowOS</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        A few quick questions so the app works for <em>you</em> from day one. Takes under a minute.
      </p>
      <Button className="w-full" onClick={onNext}>
        Let&apos;s go
      </Button>
    </div>
  );
}

function StepIdentity({
  user,
  onNext,
}: {
  user: Partial<User>;
  onNext: (data: { batch_year: number; roll_number: string; lab_group: string }) => void;
}) {
  const [batchYear, setBatchYear] = useState(user.batch_year ?? 1);
  const [rollNumber, setRollNumber] = useState(user.roll_number ?? "");
  const [labGroup, setLabGroup] = useState(user.lab_group ?? "A");
  const [rollError, setRollError] = useState("");

  // simple roll number format check: two or four digits / three digits
  const validateRoll = (val: string) => {
    const ok = /^(\d{2}|\d{4})\/\d{3}$/.test(val);
    setRollError(ok ? "" : "Format: YY/NNN or YYYY/NNN (e.g. 25/042)");
    return ok;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateRoll(rollNumber)) return;
    onNext({ batch_year: batchYear, roll_number: rollNumber, lab_group: labGroup });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl border border-border p-8">
      <h2 className="text-xl font-extrabold text-foreground mb-1">About you</h2>
      <p className="text-sm text-muted-foreground mb-6">
        This helps us show the right timetable, modules, and viva schedules.
      </p>

      <div className="space-y-5">
        {/* Batch year */}
        <div>
          <Label htmlFor="batch">What year are you in?</Label>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {BATCH_OPTIONS.map((b) => (
              <ChipCard key={b.value} selected={batchYear === b.value} onClick={() => setBatchYear(b.value)}>
                <span className="text-sm font-semibold text-foreground">{b.value}</span>
                <span className="block text-xs text-muted-foreground">{b.label.replace(/\d+\w+\s/, "")}</span>
              </ChipCard>
            ))}
          </div>
        </div>

        {/* Roll number */}
        <div>
          <Label htmlFor="roll">Roll number</Label>
          <Input
            id="roll"
            placeholder="25/042"
            value={rollNumber}
            onChange={(e) => { setRollNumber(e.target.value); setRollError(""); }}
            onBlur={() => validateRoll(rollNumber)}
            required
            className="mt-1"
          />
          {rollError && <p className="text-xs text-red-500 mt-1">{rollError}</p>}
        </div>

        {/* Lab group */}
        <div>
          <Label>Lab group</Label>
          <div className="grid grid-cols-6 gap-2 mt-2">
            {LAB_GROUPS.map((g) => (
              <ChipCard key={g} selected={labGroup === g} onClick={() => setLabGroup(g)}>
                <span className="text-sm font-bold text-center block text-foreground">{g}</span>
              </ChipCard>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full">Continue</Button>
      </div>
    </form>
  );
}

function StepLearning({
  user,
  onNext,
}: {
  user: Partial<User>;
  onNext: (data: { learning_style: string; explanation_depth: string }) => void;
}) {
  const [style, setStyle] = useState(user.learning_style ?? "reading");
  const [depth, setDepth] = useState(user.explanation_depth ?? "moderate");

  return (
    <div className="glass-card rounded-2xl border border-border p-8">
      <h2 className="text-xl font-extrabold text-foreground mb-1">How do you learn?</h2>
      <p className="text-sm text-muted-foreground mb-6">
        We use this to personalise AI Tutor responses for you.
      </p>

      <div className="space-y-5">
        {/* Learning style */}
        <div>
          <Label>Pick your style</Label>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {LEARNING_STYLES.map((s) => (
              <ChipCard key={s.value} selected={style === s.value} onClick={() => setStyle(s.value)}>
                <span className="text-sm font-semibold text-foreground">{s.label}</span>
                <span className="block text-xs text-muted-foreground mt-0.5">{s.desc}</span>
              </ChipCard>
            ))}
          </div>
        </div>

        {/* Explanation depth */}
        <div>
          <Label>How detailed should explanations be?</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {EXPLANATION_DEPTHS.map((d) => (
              <ChipCard key={d.value} selected={depth === d.value} onClick={() => setDepth(d.value)}>
                <span className="text-sm font-semibold text-foreground">{d.label}</span>
                <span className="block text-xs text-muted-foreground mt-0.5">{d.desc}</span>
              </ChipCard>
            ))}
          </div>
        </div>

        <Button className="w-full" onClick={() => onNext({ learning_style: style, explanation_depth: depth })}>
          Continue
        </Button>
      </div>
    </div>
  );
}

function StepIDUpload({
  onNext,
}: {
  onNext: (url: string) => void;
}) {
  const supabase = createSupabaseBrowserClient();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image (JPG or PNG).");
      return;
    }
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      setError("Session expired. Please sign in again.");
      setUploading(false);
      return;
    }

    const path = `${session.session.user.id}/id_card.${file.type === "image/png" ? "png" : "jpg"}`;

    const { error: uploadErr } = await supabase.storage
      .from("id_cards")
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      setError("Upload failed. Try again.");
      setUploading(false);
      return;
    }

    setUploading(false);
    onNext(path);
  };

  return (
    <div className="glass-card rounded-2xl border border-border p-8">
      <h2 className="text-xl font-extrabold text-foreground mb-1">Verify your identity</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Upload a photo of your Dow Medical College student ID card. We verify it manually within 5–10 minutes.
      </p>

      <div className="space-y-4">
        {/* Drop / tap zone */}
        <label
          htmlFor="id-upload"
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
            preview ? "border-teal-500 bg-teal-500/5" : "border-border hover:border-teal-400 bg-card"
          }`}
        >
          {preview ? (
            <img src={preview} alt="ID card preview" className="max-h-48 w-auto rounded-lg" />
          ) : (
            <>
              <span className="text-3xl mb-2">📷</span>
              <span className="text-sm text-muted-foreground">Tap to upload your ID card</span>
              <span className="text-xs text-muted-foreground mt-1">JPG or PNG</span>
            </>
          )}
        </label>
        <input
          id="id-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />

        {preview && (
          <Button variant="ghost" size="sm" className="w-full" onClick={() => { setPreview(null); setFile(null); }}>
            Remove photo
          </Button>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button className="w-full" disabled={!file || uploading} onClick={handleUpload}>
          {uploading ? "Uploading…" : "Upload & continue"}
        </Button>
      </div>
    </div>
  );
}

function StepPending() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    const { data } = await supabase
      .from("users")
      .select("verification_status")
      .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
      .single();

    if ((data as { verification_status?: string } | null)?.verification_status === "verified") {
      router.replace("/dashboard");
    } else {
      setChecking(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-border p-8 text-center">
      <div className="text-5xl mb-4">⏳</div>
      <h2 className="text-xl font-extrabold text-foreground mb-2">Verification in progress</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Your ID card is being reviewed. This usually takes 5–10 minutes. You can close this tab and come back.
      </p>
      <Button variant="outline" className="w-full" onClick={checkStatus} disabled={checking}>
        {checking ? "Checking…" : "Check again"}
      </Button>
    </div>
  );
}

// ── main orchestrator ────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); // 0=welcome, 1=identity, 2=learning, 3=id, 4=pending
  const [user, setUser] = useState<Partial<User>>({});

  // ── on mount: ensure user row exists, read current step ──
  useEffect(() => {
    (async () => {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) {
        router.replace("/login");
        return;
      }

      // Try to fetch existing user row
      const { data: existing } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.user.id)
        .single();

      const row = existing as User | null;

      if (row) {
        // Already fully onboarded and verified → dashboard
        if (row.onboarding_step === 4 && row.verification_status === "verified") {
          router.replace("/dashboard");
          return;
        }
        setUser(row);
        setStep(row.onboarding_step);
      } else {
        // First time: create the row
        await supabase.from("users").insert({
          id: authUser.user.id,
          email: authUser.user.email!,
          onboarding_step: 0,
          verification_status: "pending",
        });
      }

      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── generic step saver ──
  const saveAndAdvance = async (updates: Record<string, unknown>, nextStep: number) => {
    await supabase
      .from("users")
      .update({ ...updates, onboarding_step: nextStep })
      .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "");
    setStep(nextStep);
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl border border-border p-8 text-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  // 4 progress segments (welcome has no segment – it's the intro)
  const progressStep = Math.max(0, step - 1); // identity=0, learning=1, id=2, pending=3

  return (
    <div>
      {step > 0 && step <= 3 && <ProgressBar step={progressStep} total={3} />}

      {step === 0 && <StepWelcome onNext={() => setStep(1)} />}

      {step === 1 && (
        <StepIdentity
          user={user}
          onNext={(data) => saveAndAdvance(data, 2)}
        />
      )}

      {step === 2 && (
        <StepLearning
          user={user}
          onNext={(data) => saveAndAdvance(data, 3)}
        />
      )}

      {step === 3 && (
        <StepIDUpload
          onNext={(url) => saveAndAdvance({ id_card_url: url }, 4)}
        />
      )}

      {step === 4 && <StepPending />}
    </div>
  );
}
