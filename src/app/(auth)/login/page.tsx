"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false }, // login only – user must already exist
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
          The link in the email will sign you in automatically. You can close this tab.
        </p>
        <Button variant="ghost" size="sm" onClick={() => { setStatus("idle"); setEmail(""); }}>
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl border border-border p-8">
      <h1 className="text-2xl font-extrabold text-foreground mb-1">Welcome back</h1>
      <p className="text-sm text-muted-foreground mb-6">Sign in with your Dow email</p>

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
          {status === "sending" ? "Sending…" : "Send code"}
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="text-teal-500 hover:underline">Sign up</a>
      </p>
    </form>
  );
}
