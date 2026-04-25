import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, X, AlertTriangle, FileText, ShieldCheck, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { SiteShell } from "@/components/trustfund/SiteShell";
import { Badge } from "@/components/trustfund/Badge";
import { campaigns } from "@/lib/mock-data";
import { useToast } from "@/lib/use-toast";

export const Route = createFileRoute("/validator")({
  head: () => ({
    meta: [
      { title: "Validator Portal | TruSTFUnd" },
      { name: "description", content: "Approve or reject milestone releases for campaigns on TruSTFUnd." },
      { property: "og:title", content: "Validator Portal | TruSTFUnd" },
      { property: "og:description", content: "Review milestones. Approve releases. Earn trust." },
    ],
  }),
  component: Validator,
});

const tabs = ["Milestone Reviews", "New Campaigns", "Flagged"] as const;

type Decision = "approved" | "rejected" | "escalated";
type DecisionMap = Record<string, Decision | "loading" | undefined>;

function Validator() {
  return (
    <SiteShell>
      <ValidatorContent />
    </SiteShell>
  );
}

function ValidatorContent() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Milestone Reviews");
  const [decisions, setDecisions] = useState<DecisionMap>({});
  const toast = useToast();
  const { isConnected } = useAccount();

  // Build a flat list of every milestone awaiting validator action
  const reviewItems = useMemo(
    () =>
      campaigns.flatMap((c) =>
        c.milestones
          .filter((m) => m.status === "active")
          .map((m) => ({ campaign: c, milestone: m })),
      ),
    [],
  );

  const counts = useMemo(() => {
    const vals = Object.values(decisions);
    return {
      approved: vals.filter((v) => v === "approved").length,
      rejected: vals.filter((v) => v === "rejected").length,
      escalated: vals.filter((v) => v === "escalated").length,
      pending: reviewItems.length - vals.filter((v) => v === "approved" || v === "rejected" || v === "escalated").length,
    };
  }, [decisions, reviewItems.length]);

  async function decide(key: string, decision: Decision, label: string) {
    if (!isConnected) {
      toast("Connect your wallet to sign validator actions.", "error");
      return;
    }
    setDecisions((prev) => ({ ...prev, [key]: "loading" }));
    // Simulate signing tx (real impl: wagmi useWriteContract -> escrow.approveMilestone)
    await new Promise((r) => setTimeout(r, 900));
    setDecisions((prev) => ({ ...prev, [key]: decision }));
    const map: Record<Decision, string> = {
      approved: `Approved release for ${label}`,
      rejected: `Rejected release for ${label}`,
      escalated: `Escalated ${label} to multi-sig committee`,
    };
    toast(map[decision], decision === "approved" ? "success" : decision === "rejected" ? "error" : "info");
  }

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Restricted Portal
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Validator Portal</h1>
          <p className="mt-2 text-text-secondary">
            Approve or reject milestone releases. Each approval signs an onchain attestation against the campaign escrow.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Pending Reviews" value={String(counts.pending)} tone="warning" />
            <Stat label="Approved (Session)" value={String(counts.approved)} tone="success" />
            <Stat label="Rejected" value={String(counts.rejected)} tone="danger" />
            <Stat label="Escalated" value={String(counts.escalated)} tone="primary" />
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

        {tab === "Milestone Reviews" && (
          <div className="space-y-4">
            {reviewItems.map(({ campaign, milestone }) => {
              const key = `${campaign.id}:${milestone.id}`;
              const state = decisions[key];
              const isLoading = state === "loading";
              const isResolved = state === "approved" || state === "rejected" || state === "escalated";
              return (
                <div key={key} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={campaign.type === "crowdfund" ? "crowdfund" : "startup"}>
                          {campaign.type === "crowdfund" ? "Crowdfund" : "Startup"}
                        </Badge>
                        <Badge variant="warning">Awaiting release</Badge>
                        <span className="font-mono text-xs text-text-muted">{campaign.creator}</span>
                      </div>
                      <Link
                        to="/campaign/$id"
                        params={{ id: campaign.id }}
                        className="mt-2 block text-base font-bold text-text-secondary hover:text-primary"
                      >
                        {campaign.title}
                      </Link>
                      <div className="mt-3 rounded-xl border border-border bg-background/50 p-4">
                        <div className="text-xs uppercase tracking-wider text-text-muted">Milestone request</div>
                        <div className="mt-1 text-lg font-bold">{milestone.title}</div>
                        <p className="mt-1 text-sm text-text-secondary">{milestone.description}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                          <span className="text-text-secondary">
                            Recipient: <span className="font-mono text-foreground">{milestone.recipient}</span>
                          </span>
                          <span className="text-text-secondary">
                            Amount: <span className="font-bold text-primary">${milestone.amount.toLocaleString()} cUSD</span>
                          </span>
                          <span className="text-text-secondary">
                            Existing approvals: <span className="font-bold text-foreground">{milestone.approvals}</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        {["Receipt PDF", "Vendor Invoice", "Proof of Delivery"].map((d) => (
                          <button
                            key={d}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-text-secondary hover:border-primary/40 hover:text-foreground"
                          >
                            <FileText className="h-3 w-3" /> {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 flex-col gap-2 md:w-56">
                      {isResolved ? (
                        <div
                          className={`rounded-xl border px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${
                            state === "approved"
                              ? "border-success/40 bg-success/15 text-success"
                              : state === "rejected"
                                ? "border-danger/40 bg-danger/15 text-danger"
                                : "border-warning/40 bg-warning/15 text-warning"
                          }`}
                        >
                          {state === "approved" ? "✓ Signed & Approved" : state === "rejected" ? "✕ Rejected" : "⚠ Escalated"}
                        </div>
                      ) : (
                        <>
                          <button
                            disabled={isLoading}
                            onClick={() => decide(key, "approved", milestone.title)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-success/30 bg-success/15 px-4 py-2.5 text-xs font-bold text-success hover:bg-success/25 disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            Approve & Sign
                          </button>
                          <button
                            disabled={isLoading}
                            onClick={() => decide(key, "rejected", milestone.title)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-danger/30 bg-danger/15 px-4 py-2.5 text-xs font-bold text-danger hover:bg-danger/25 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                          <button
                            disabled={isLoading}
                            onClick={() => decide(key, "escalated", milestone.title)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-warning/30 bg-warning/15 px-4 py-2.5 text-xs font-bold text-warning hover:bg-warning/25 disabled:opacity-50"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" /> Escalate
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {reviewItems.length === 0 && (
              <div className="rounded-2xl border border-border bg-card p-12 text-center text-text-secondary">
                No active milestones awaiting review.
              </div>
            )}
          </div>
        )}

        {tab === "New Campaigns" && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-text-secondary">
            Campaign-level review queue (coming soon).
          </div>
        )}
        {tab === "Flagged" && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-text-secondary">
            No flagged campaigns.
          </div>
        )}
      </section>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "warning" | "success" | "danger" | "primary" }) {
  const map = {
    warning: "text-warning",
    success: "text-success",
    danger: "text-danger",
    primary: "text-primary",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs text-text-secondary">{label}</div>
      <div className={`mt-1 text-2xl font-extrabold ${map[tone]}`}>{value}</div>
    </div>
  );
}
