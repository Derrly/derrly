import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Lock } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Get access — Derrly" },
      {
        name: "description",
        content:
          "Derrly is in private beta. Request access to the autonomous AI game studio.",
      },
      { property: "og:title", content: "Get access — Derrly" },
      {
        property: "og:description",
        content: "Request access to the autonomous AI game studio.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <section className="mx-auto flex min-h-[80dvh] max-w-xl flex-col justify-center px-6 py-24">
      <div className="inline-flex w-fit items-center gap-2 rounded-full border hairline px-3 py-1 text-xs text-muted-foreground">
        <Lock className="size-3" />
        Private beta
      </div>
      <h1 className="mt-6 font-display text-5xl leading-[1.05] text-foreground md:text-6xl">
        Get a studio of your own.
      </h1>
      <p className="mt-5 text-lg text-muted-foreground">
        Derrly is in private beta while we tune the agents. Leave your email and we&apos;ll
        invite you in waves.
      </p>

      <form
        className="mt-8 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const email = (new FormData(form).get("email") as string) || "";
          if (!email) return;
          form.reset();
          (form.querySelector("[data-ok]") as HTMLElement)?.removeAttribute("hidden");
        }}
      >
        <label className="sr-only" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@studio.com"
          className="h-12 flex-1 rounded-full border hairline bg-background px-5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground"
        />
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Request access
          <ArrowUpRight className="size-4" />
        </button>
      </form>
      <p data-ok hidden className="mt-4 text-sm text-foreground">
        You&apos;re on the list. We&apos;ll be in touch.
      </p>

      <p className="mt-10 text-sm text-muted-foreground">
        Already have an invite?{" "}
        <Link to="/" className="text-foreground underline-offset-4 hover:underline">
          Sign in is coming soon.
        </Link>
      </p>
    </section>
  );
}
