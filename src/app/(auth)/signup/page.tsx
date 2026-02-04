"use client";

import { useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    // signInWithOtp with shouldCreateUser: true creates the account if it doesn't exist,
    // or sends a new OTP if it does – safe to call either way.
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (err) {
      setError(err.message);
      setStatus("error");
      return;
    }

    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="glass-card rounded-2xl border border-border p-8 text-center">
        <div className="text-4xl mb-4">📧</div>
        <h2 className="text-xl font-bold text-foreground mb-2">Check your inbox</h2>
        <p className="text-sm text-muted-foreground mb-6">
          We sent a verification code to <span className="font-semibold text-foreground">{email}</span>.
          It expires in 10 minutes.
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          Click the link in the email to continue setting up your account.
        </p>
        <Button variant="ghost" size="sm" onClick={() => { setStatus("idle"); setEmail(""); }}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl border border-border p-8">
      <h1 className="text-2xl font-extrabold text-foreground mb-1">Create account</h1>
      <p className="text-sm text-muted-foreground mb-6">Use your Dow Medical College email</p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@dow.edu.pk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1"
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send verification code"}
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Already have an account?{" "}
        <a href="/login" className="text-teal-500 hover:underline">Sign in</a>
      </p>
    </form>
  );
}
