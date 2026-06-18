import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust & Security — Derrly" },
      {
        name: "description",
        content:
          "How Derrly handles your data, accounts, and AI-generated content. Privacy, security, and platform practices in plain English.",
      },
      { property: "og:title", content: "Trust & Security — Derrly" },
      {
        property: "og:description",
        content:
          "How Derrly handles your data, accounts, and AI-generated content.",
      },
    ],
  }),
  component: TrustPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}

function TrustPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Trust & Security
      </p>
      <h1 className="mt-4 font-display text-5xl leading-tight text-foreground">
        How we handle your data and your games.
      </h1>
      <p className="mt-6 text-muted-foreground">
        This page summarizes the controls Derrly has in place today. It is
        maintained by the Derrly team and is not an independent certification.
      </p>

      <Section title="Accounts & authentication">
        <p>
          Accounts are managed by our backend authentication provider. Passwords
          are never stored in plaintext. Email/password and Google sign-in are
          supported. Sessions are scoped to your device.
        </p>
      </Section>

      <Section title="Your data">
        <p>
          Projects, build artifacts, agent activity, and chat threads you create
          are stored under your account. Row-level security rules in our
          database restrict reads and writes so that one user cannot access
          another user&apos;s private project data.
        </p>
        <p>
          Published games are public by design — their title, description,
          cover, and gameplay are visible to anyone with the link.
        </p>
      </Section>

      <Section title="AI-generated content">
        <p>
          Derrly uses third-party AI providers to generate code, assets, and
          gameplay. Prompts you submit may be sent to those providers under
          their terms. Do not paste secrets, credentials, or personal data you
          would not want processed by an AI vendor.
        </p>
      </Section>

      <Section title="Secrets & API keys">
        <p>
          Service credentials (database keys, AI keys, third-party integrations)
          live in a server-side secret store and are never shipped to the
          browser. Client code only ever sees publishable, scope-limited keys.
        </p>
      </Section>

      <Section title="Reporting a vulnerability">
        <p>
          If you believe you&apos;ve found a security issue, please open a
          report through the in-app feedback flow or contact the project owner.
          Please do not publicly disclose details until we&apos;ve had a chance
          to investigate.
        </p>
      </Section>

      <Section title="Changes to this page">
        <p>
          We update this page as the platform evolves. The current version
          reflects practices as of the latest deploy.
        </p>
      </Section>

      <div className="mt-16">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
