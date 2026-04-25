import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet, Edit3, Upload, Check, X, AlertTriangle } from "lucide-react";
import { SiteShell } from "@/components/trustfund/SiteShell";
import { Badge } from "@/components/trustfund/Badge";
import { ProgressBar } from "@/components/trustfund/ProgressBar";
import { campaigns } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard | TruSTFUnd" },
      { name: "description", content: "Track your funded campaigns and milestone releases on TruSTFUnd." },
      { property: "og:title", content: "Your Dashboard | TruSTFUnd" },
      { property: "og:description", content: "Your campaigns, investments, and pending validations." },
    ],
  }),
  component: Dashboard,
});

const tabs = ["My Campaigns", "Invested In", "Validations Pending"] as const;

function Dashboard() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("My Campaigns");

  return (
    <SiteShell>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Dashboard</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Welcome back</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="crowdfund">Creator</Badge>
                <Badge variant="startup">Investor</Badge>
                <Badge variant="verified">Validator</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 px-4">
              <Wallet className="h-5 w-5 text-primary" />
              <div>
                <div className="font-mono text-xs text-text-secondary">0x9aF3…c2D1</div>
                <div className="text-lg font-extrabold text-primary">$842.50 cUSD</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === t ? "bg-primary text-primary-foreground" : "text-text-secondary hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "My Campaigns" && (
          <div className="grid gap-4 md:grid-cols-2">
            {campaigns.slice(0, 3).map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Badge variant={c.type === "crowdfund" ? "crowdfund" : "startup"}>
                      {c.type === "crowdfund" ? "Crowdfund" : "Startup"}
                    </Badge>
                    <Link to="/campaign/$id" params={{ id: c.id }} className="mt-2 block truncate text-base font-bold hover:text-primary">
                      {c.title}
                    </Link>
                  </div>
                  <button className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-semibold hover:border-primary/40">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>
                <div className="mt-4">
                  <ProgressBar value={c.raised} goal={c.goal} />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Current milestone:</span>
                  <span className="font-semibold text-warning">Active - Awaiting Evidence</span>
                </div>
                <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:brightness-110">
                  <Upload className="h-4 w-4" /> Submit Evidence
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "Invested In" && (
          <div className="grid gap-4 md:grid-cols-2">
            {campaigns.filter((c) => c.type === "startup").map((c, i) => {
              const flag = i % 3 === 2 ? "danger" : i % 2 === 1 ? "warning" : "verified";
              return (
                <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="startup">Startup</Badge>
                      <Link to="/campaign/$id" params={{ id: c.id }} className="mt-2 block text-base font-bold hover:text-primary">
                        {c.title}
                      </Link>
                    </div>
                    <Badge variant={flag as "verified" | "warning" | "danger"}>
                      {flag === "verified" ? "On Track" : flag === "warning" ? "Delayed" : "Flagged"}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Mini label="Invested" value="$500" />
                    <Mini label="Released" value={`${c.milestones.filter((m) => m.status === "completed").length}/${c.milestones.length}`} />
                    <Mini label="Locked" value="$300" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link to="/campaign/$id" params={{ id: c.id }} className="flex-1 rounded-xl border border-border bg-secondary py-2.5 text-center text-xs font-semibold hover:border-primary/40">
                      View Details
                    </Link>
                    <button
                      disabled={flag !== "danger"}
                      className="flex-1 rounded-xl bg-danger py-2.5 text-center text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Pull Out Funds
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "Validations Pending" && (
          <div className="space-y-3">
            {campaigns.slice(0, 4).map((c) => (
              <div key={c.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={c.type === "crowdfund" ? "crowdfund" : "startup"}>
                      {c.type === "crowdfund" ? "Crowdfund" : "Startup"}
                    </Badge>
                    <span className="text-xs text-text-muted">Evidence submitted 2h ago</span>
                  </div>
                  <Link to="/campaign/$id" params={{ id: c.id }} className="mt-2 block truncate text-base font-bold hover:text-primary">
                    {c.title}
                  </Link>
                  <p className="mt-1 line-clamp-1 text-sm text-text-secondary">{c.description}</p>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-xs font-bold text-success border border-success/30 hover:bg-success/25">
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-lg bg-danger/15 px-3 py-2 text-xs font-bold text-danger border border-danger/30 hover:bg-danger/25">
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-lg bg-warning/15 px-3 py-2 text-xs font-bold text-warning border border-warning/30 hover:bg-warning/25">
                    <AlertTriangle className="h-3.5 w-3.5" /> Escalate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-text-muted">{label}</div>
      <div className="mt-0.5 text-sm font-extrabold text-foreground">{value}</div>
    </div>
  );
}
