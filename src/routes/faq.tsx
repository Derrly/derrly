import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Section } from "@/components/site/Section";
import { FAQS } from "@/lib/derrly-data";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Derrly" },
      {
        name: "description",
        content: "Answers to the most common questions about Derrly's AI game studio.",
      },
      { property: "og:title", content: "Derrly FAQ" },
      {
        property: "og:description",
        content: "Ownership, privacy, exports, testing — what people ask before they build.",
      },
    ],
  }),
  component: FAQPage,
});

function FAQPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return FAQS;
    return FAQS.filter(
      (f) => f.q.toLowerCase().includes(needle) || f.a.toLowerCase().includes(needle),
    );
  }, [q]);

  return (
    <>
      <section className="border-b hairline">
        <div className="mx-auto max-w-3xl px-6 pt-24 pb-12 md:pt-32 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            FAQ
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">
            Frequently asked.
          </h1>
          <div className="mx-auto mt-10 flex max-w-xl items-center gap-2 rounded-full border hairline bg-background px-4 py-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search questions"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Search FAQ"
            />
          </div>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-3xl divide-y hairline border-y hairline">
          {filtered.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">
              No questions match &ldquo;{q}&rdquo;.
            </p>
          )}
          {filtered.map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-medium">
                {f.q}
                <span className="mt-1 size-5 shrink-0 rounded-full border hairline text-center text-sm leading-4 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}
