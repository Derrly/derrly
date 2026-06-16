import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/discover", label: "Discover" },
  { to: "/agents", label: "Agents" },
  { to: "/showcase", label: "Showcase" },
  { to: "/pricing", label: "Pricing" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/faq", label: "FAQ" },
] as const;


export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors ${
        scrolled ? "bg-background/80 backdrop-blur-md border-b hairline" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl leading-none">
          <span aria-hidden className="inline-block size-2 rounded-full bg-foreground" />
          <span>Derrly</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to={signedIn ? "/app/profile" : "/auth"}
            className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {signedIn ? "Profile" : "Sign in"}
          </Link>
          <Link
            to={signedIn ? "/app" : "/auth"}
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            {signedIn ? "Open studio" : "Get access"}
          </Link>
        </div>


        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="rounded-md p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t hairline bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-6 py-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="py-3 text-base text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t hairline pt-4">
              <Link to={signedIn ? "/app/profile" : "/auth"} onClick={() => setOpen(false)} className="flex-1 rounded-full border hairline px-4 py-2 text-center text-sm">
                {signedIn ? "Profile" : "Sign in"}
              </Link>
              <Link
                to={signedIn ? "/app" : "/auth"}
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-foreground px-4 py-2 text-center text-sm font-medium text-background"
              >
                {signedIn ? "Open studio" : "Get access"}
              </Link>
            </div>

          </nav>
        </div>
      )}
    </header>
  );
}
