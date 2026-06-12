import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Derrly" },
      { name: "description", content: "Set a new password for your Derrly studio." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery session into the URL hash and applies it
    // automatically via detectSessionInUrl. Just confirm a session exists.
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) setReady(true);
      else setErr("This reset link has expired. Request a new one from sign in.");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => navigate({ to: "/app", replace: true }), 1200);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[80dvh] max-w-md flex-col justify-center px-6 py-24">
      <div className="inline-flex w-fit items-center gap-2 rounded-full border hairline px-3 py-1 text-xs text-muted-foreground">
        <Lock className="size-3" />
        Set a new password
      </div>
      <h1 className="mt-6 font-display text-5xl leading-[1.05] text-foreground">
        New password.
      </h1>
      {done ? (
        <p className="mt-8 text-sm text-foreground">Password updated. Redirecting…</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (8+ characters)"
            disabled={!ready}
            className="h-11 w-full rounded-full border hairline bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-50"
          />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button
            type="submit"
            disabled={busy || !ready}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Update password
          </button>
        </form>
      )}
      <p className="mt-6 text-xs text-muted-foreground">
        <Link to="/auth" className="hover:underline">← Back to sign in</Link>
      </p>
    </section>
  );
}