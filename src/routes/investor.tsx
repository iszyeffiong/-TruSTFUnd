import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TrendingUp, ShieldAlert, Eye, Filter, Loader2, CheckCircle2, ArrowDownLeft } from "lucide-react";
import { useAccount } from "wagmi";
import { SiteShell } from "@/components/trustfund/SiteShell";
import { Badge } from "@/components/trustfund/Badge";
import { campaigns } from "@/lib/mock-data";
import { useToast } from "@/lib/use-toast";
import type { Milestone } from "@/lib/mock-data";

export const Route = createFileRoute("/investor")({
  head: () => ({
    meta: [
      { title: "Investor Portal | TrustFund" },
      { name: "description", content: "Track tranche releases and pull unspent funds back from underperforming campaigns." },
      { property: "og:title", content: "Investor Portal | TrustFund" },
      { property: "og:description", content: "Tranche-protected angel investment on Celo. Pull out unspent funds anytime." },
    ],
  }),
  component: Investor,
});

type TrancheStatus = "released" | "available-to-pull" | "locked" | "withdrawn" | "withdrawing";

interface TrancheView {
  milestone: Milestone;
  status: TrancheStatus;
  myShare: number; // simulated investor share
}

function classifyTranche(m: Milestone, riskFlag: "verified" | "warning" | "danger", myStake: number): TrancheView {
  // share proportional to milestone amount within the campaign
  const myShare = Math.round(myStake * 0.18); // demo: investor share of this tranche
  if (m.status === "completed") return { milestone: m, status: "released", myShare };
  // active or pending tranche of an underperforming/flagged campaign -> pullable
  if ((m.status === "active" || m.status === "pending") && riskFlag !== "verified") {
    return { milestone: m, status: "available-to-pull", myShare };
  }
  return { milestone: m, status: "locked", myShare };
}

function Investor() {
  return (
    <SiteShell>
      <InvestorContent />
    </SiteShell>
  );
}

function InvestorContent() {
  const startups = useMemo(() => campaigns.filter((c) => c.type === "startup"), []);
  const toast = useToast();
  const { isConnected } = useAccount();

  // Per-tranche status overrides keyed by `${campaignId}:${milestoneId}`
  const [pullState, setPullState] = useState<Record<string, "withdrawing" | "withdrawn">>({});

  // Demo: assign a risk flag deterministically per campaign
  const riskFlags = useMemo<Record<string, "verified" | "warning" | "danger">>(
    () =>
      startups.reduce<Record<string, "verified" | "warning" | "danger">>((acc, c, i) => {
        acc[c.id] = i === 0 ? "verified" : i === 1 ? "warning" : "danger";
        return acc;
      }, {}),
    [startups],
  );

  const portfolio = useMemo(() => {
    return startups.map((c) => {
      const myStake = 1200; // demo invested per startup
      const flag = riskFlags[c.id];
      const tranches: TrancheView[] = c.milestones.map((m) => {
        const base = classifyTranche(m, flag, myStake);
        const k = `${c.id}:${m.id}`;
        if (pullState[k]) return { ...base, status: pullState[k] as TrancheStatus };
        return base;
      });
      const released = tranches.filter((t) => t.status === "released").reduce((s, t) => s + t.myShare, 0);
      const withdrawn = tranches.filter((t) => t.status === "withdrawn").reduce((s, t) => s + t.myShare, 0);
      const protectedAmt = tranches.filter((t) => t.status === "available-to-pull").reduce((s, t) => s + t.myShare, 0);
      return { campaign: c, flag, tranches, myStake, released, withdrawn, protectedAmt };
    });
  }, [startups, riskFlags, pullState]);

  const totals = useMemo(() => {
    return portfolio.reduce(
      (acc, p) => {
        acc.invested += p.myStake;
        acc.released += p.released;
        acc.withdrawn += p.withdrawn;
        acc.protected += p.protectedAmt;
        return acc;
      },
      { invested: 0, released: 0, withdrawn: 0, protected: 0 },
    );
  }, [portfolio]);

  async function pullTranche(campaignId: string, milestoneId: string, amount: number, label: string) {
    if (!isConnected) {
      toast("Connect your wallet to withdraw unspent funds.", "error");
      return;
    }
    const key = `${campaignId}:${milestoneId}`;
    setPullState((p) => ({ ...p, [key]: "withdrawing" }));
    // Simulate escrow.withdrawUnspent(campaignId, milestoneId)
    await new Promise((r) => setTimeout(r, 1100));
    setPullState((p) => ({ ...p, [key]: "withdrawn" }));
    toast(`Withdrew $${amount.toLocaleString()} cUSD from ${label}`, "success");
  }

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-startup">Investor Portal</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Your Angel Portfolio</h1>
          <p className="mt-2 max-w-2xl text-text-secondary">
            Tranche-by-tranche protection. Withdraw your share of any unspent tranche the moment a campaign is flagged or delayed.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total Invested" value={`$${totals.invested.toLocaleString()}`} />
            <Stat label="Released to Founders" value={`$${totals.released.toLocaleString()}`} />
            <Stat label="Available to Pull" value={`$${totals.protected.toLocaleString()}`} tone="warning" />
            <Stat label="Withdrawn (Refunded)" value={`$${totals.withdrawn.toLocaleString()}`} tone="success" />
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        <h2 className="mb-5 text-xl font-extrabold">Portfolio</h2>
        <div className="space-y-4">
          {portfolio.map(({ campaign, flag, tranches, myStake, released, protectedAmt, withdrawn }) => {
            return (
              <div key={campaign.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="startup">Startup</Badge>
                      <Badge variant="neutral">{campaign.category}</Badge>
                      <Badge variant={flag}>
                        {flag === "verified" ? "On Track" : flag === "warning" ? "Delayed" : "Mismanagement Flag"}
                      </Badge>
                    </div>
                    <Link
                      to="/campaign/$id"
                      params={{ id: campaign.id }}
                      className="mt-2 block text-lg font-bold hover:text-primary"
                    >
                      {campaign.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      <span className="text-text-secondary">
                        Invested: <span className="font-bold text-foreground">${myStake.toLocaleString()} cUSD</span>
                      </span>
                      <span className="text-text-secondary">
                        Released: <span className="font-bold text-success">${released.toLocaleString()}</span>
                      </span>
                      {protectedAmt > 0 && (
                        <span className="text-text-secondary">
                          Protected: <span className="font-bold text-warning">${protectedAmt.toLocaleString()}</span>
                        </span>
                      )}
                      {withdrawn > 0 && (
                        <span className="text-text-secondary">
                          Refunded: <span className="font-bold text-primary">${withdrawn.toLocaleString()}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/campaign/$id"
                    params={{ id: campaign.id }}
                    className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-semibold hover:border-primary/40"
                  >
                    <Eye className="h-3.5 w-3.5" /> Campaign
                  </Link>
                </div>

                {/* Tranche-by-tranche grid */}
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {tranches.map((t) => (
                    <TrancheRow
                      key={t.milestone.id}
                      view={t}
                      onPull={() =>
                        pullTranche(campaign.id, t.milestone.id, t.myShare, t.milestone.title)
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Discover */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Pipeline</div>
            <h2 className="mt-1 text-2xl font-extrabold">Discover Startups to Invest In</h2>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold hover:border-primary/40">
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {startups.map((c) => (
            <Link
              key={c.id}
              to="/campaign/$id"
              params={{ id: c.id }}
              className="group rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:card-glow"
            >
              <div className="flex items-center justify-between">
                <Badge variant="startup">{c.category}</Badge>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div className="mt-3 text-base font-bold group-hover:text-primary">{c.title}</div>
              <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{c.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
                <span className="text-text-secondary">
                  Goal: <span className="font-bold text-foreground">${c.goal.toLocaleString()}</span>
                </span>
                <span className="text-primary font-bold">{Math.round((c.raised / c.goal) * 100)}% raised</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function TrancheRow({ view, onPull }: { view: TrancheView; onPull: () => void }) {
  const { milestone, status, myShare } = view;

  const meta: Record<TrancheStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    released: { label: "Released", cls: "border-success/30 bg-success/10 text-success", icon: <CheckCircle2 className="h-3 w-3" /> },
    locked: { label: "Locked", cls: "border-border bg-secondary text-text-secondary", icon: <ShieldAlert className="h-3 w-3" /> },
    "available-to-pull": { label: "Pull-Out Available", cls: "border-warning/40 bg-warning/10 text-warning", icon: <ShieldAlert className="h-3 w-3" /> },
    withdrawing: { label: "Withdrawing…", cls: "border-primary/30 bg-primary/10 text-primary", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    withdrawn: { label: "Refunded to Wallet", cls: "border-primary/40 bg-primary/15 text-primary", icon: <ArrowDownLeft className="h-3 w-3" /> },
  };
  const m = meta[status];

  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">{milestone.title.split("-")[0]?.trim() || "Tranche"}</div>
          <div className="truncate text-sm font-bold">{milestone.title}</div>
          <div className="mt-1 text-xs text-text-secondary">
            Tranche size: <span className="font-bold text-foreground">${milestone.amount.toLocaleString()}</span>
            <span className="mx-1.5 text-text-muted">·</span>
            Your share: <span className="font-bold text-foreground">${myShare.toLocaleString()}</span>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${m.cls}`}>
          {m.icon}
          {m.label}
        </span>
      </div>

      {status === "available-to-pull" && (
        <button
          onClick={onPull}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-danger px-3 py-2 text-xs font-bold text-white transition hover:brightness-110"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          Pull Out ${myShare.toLocaleString()} cUSD
        </button>
      )}
      {status === "withdrawing" && (
        <button
          disabled
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-bold text-text-secondary"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Sending refund tx…
        </button>
      )}
      {status === "withdrawn" && (
        <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-center text-xs font-bold text-primary">
          ✓ ${myShare.toLocaleString()} cUSD returned to your wallet
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" }) {
  const cls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs text-text-secondary">{label}</div>
      <div className={`mt-1 text-2xl font-extrabold ${cls}`}>{value}</div>
    </div>
  );
}
