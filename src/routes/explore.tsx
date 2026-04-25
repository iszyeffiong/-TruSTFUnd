import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { SiteShell } from "@/components/trustfund/SiteShell";
import { CampaignCard } from "@/components/trustfund/CampaignCard";
import { campaigns } from "@/lib/mock-data";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Campaigns | TruSTFUnd" },
      { name: "description", content: "Browse verified, milestone-gated campaigns and startups on TruSTFUnd." },
      { property: "og:title", content: "Explore Campaigns | TruSTFUnd" },
      { property: "og:description", content: "Verified. Milestone-gated. Every fund accounted for." },
    ],
  }),
  component: Explore,
});

const tabs = ["All", "Crowdfund", "Startup"] as const;
const filters = ["Most Funded", "Newest", "Ending Soon", "Verified Only"] as const;

function Explore() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [filter, setFilter] = useState<(typeof filters)[number]>("Most Funded");
  const [q, setQ] = useState("");

  let list = campaigns.filter((c) => {
    if (tab === "Crowdfund" && c.type !== "crowdfund") return false;
    if (tab === "Startup" && c.type !== "startup") return false;
    if (filter === "Verified Only" && !c.verified) return false;
    if (q && !c.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  if (filter === "Most Funded") list = [...list].sort((a, b) => b.raised - a.raised);
  if (filter === "Ending Soon") list = [...list].sort((a, b) => a.daysLeft - b.daysLeft);
  if (filter === "Newest") list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <SiteShell>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-12 md:py-16">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Marketplace</div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">Explore Campaigns</h1>
          <p className="mt-3 max-w-2xl text-text-secondary">
            Verified. Milestone-gated. Every fund accounted for.
          </p>
        </div>
      </section>

      <section className="sticky top-16 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  tab === t ? "bg-primary text-primary-foreground" : "text-text-secondary hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search campaigns…"
                className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary/50"
              />
            </div>
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as (typeof filters)[number])}
                className="appearance-none rounded-xl border border-border bg-card py-2.5 pl-9 pr-8 text-sm font-semibold text-foreground outline-none focus:border-primary/50"
              >
                {filters.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        {list.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-text-secondary">
            No campaigns match your filters.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <CampaignCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
