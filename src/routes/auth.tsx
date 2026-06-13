import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Derrly" },
      { name: "description", content: "Sign in to your Derrly studio." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/app`,
          },
        });
        if (error) throw error;
        navigate({ to: "/app", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/app", replace: true });
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onForgot = async () => {
    setErr(null);
    setInfo(null);
    if (!email) {
      setErr("Enter your email above first, then tap reset.");
      return;
    }
    setBusy(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setInfo("If that email is registered, you'll receive a reset link shortly.");
    } catch {
      setInfo("If that email is registered, you'll receive a reset link shortly.");
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    setErr(null);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/app`,
      });
      if (result.error) {
        setErr(result.error.message ?? "Google sign-in failed");
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/app", replace: true });
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[80dvh] max-w-md flex-col justify-center px-6 py-24">
      <div className="inline-flex w-fit items-center gap-2 rounded-full border hairline px-3 py-1 text-xs text-muted-foreground">
        <Lock className="size-3" />
        {mode === "signup" ? "Create your studio" : "Welcome back"}
      </div>
      <h1 className="mt-6 font-display text-5xl leading-[1.05] text-foreground">
        {mode === "signup" ? "Get a studio of your own." : "Sign in."}
      </h1>

      <button
        type="button"
        onClick={onGoogle}
        disabled={busy}
        className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full border hairline bg-background text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
      >
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onEmail} className="space-y-3">
        {mode === "signup" && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="h-11 w-full rounded-full border hairline bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground"
          />
        )}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@studio.com"
          className="h-11 w-full rounded-full border hairline bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="h-11 w-full rounded-full border hairline bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground"
        />
        {err && <p className="text-sm text-destructive">{err}</p>}
        {info && <p className="text-sm text-foreground">{info}</p>}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {mode === "signup" ? "Create studio" : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        {mode === "signup" ? "Already have an account?" : "New to Derrly?"}{" "}
        <button
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setErr(null);
            setInfo(null);
          }}
          className="text-foreground underline-offset-4 hover:underline"
        >
          {mode === "signup" ? "Sign in" : "Create a studio"}
        </button>
      </p>
      {mode === "signin" && (
        <p className="mt-2 text-sm text-muted-foreground">
          Forgot password?{" "}
          <button
            type="button"
            onClick={onForgot}
            className="text-foreground underline-offset-4 hover:underline"
          >
            Send reset link
          </button>
        </p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">← Back to home</Link>
      </p>
    </section>
  );
}
