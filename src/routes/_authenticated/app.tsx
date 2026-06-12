import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppShell,
});

function AppShell() {
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b hairline bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link to="/app" className="flex items-center gap-2 font-display text-xl leading-none">
            <span aria-hidden className="inline-block size-2 rounded-full bg-foreground" />
            Derrly studio
          </Link>
          <button
            onClick={signOut}
            className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
