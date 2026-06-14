import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CircleUserRound, CreditCard, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppShell,
});

function AppShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
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
          <nav className="flex items-center gap-1" aria-label="Studio account">
            <Link to="/pricing" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <CreditCard className="size-4" />
              <span className="hidden sm:inline">Plans</span>
            </Link>
            <Link to="/app/profile" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              <CircleUserRound className="size-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <Button type="button" variant="ghost" size="sm" onClick={signOut} className="rounded-full text-muted-foreground hover:text-foreground">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
