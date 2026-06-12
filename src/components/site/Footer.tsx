import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t hairline">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl">
            <span aria-hidden className="inline-block size-2 rounded-full bg-foreground" />
            Derrly
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            The world&apos;s first autonomous AI game studio. Build entire games through conversation.
          </p>
        </div>

        <FooterCol
          title="Product"
          links={[
            { to: "/agents", label: "Agents" },
            { to: "/showcase", label: "Showcase" },
            { to: "/pricing", label: "Pricing" },
            { to: "/roadmap", label: "Roadmap" },
          ]}
        />
        <FooterCol
          title="Resources"
          links={[
            { to: "/faq", label: "FAQ" },
            { to: "/auth", label: "Get access" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { to: "/", label: "Home" },
            { to: "/legacy", label: "Archive" },
          ]}
        />

      </div>
      <div className="border-t hairline">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Derrly, Inc.</span>
          <span>Made for builders, by an entire AI studio.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {title}
      </h4>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-foreground/80 transition-colors hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
