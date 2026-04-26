import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useWriteContract, useAccount } from "wagmi";
import { parseUnits } from "viem";
import { toast } from "sonner";
import { CUSD_ADDRESS, ERC20_ABI } from "@/lib/wagmi";
import {
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  Upload,
  ArrowLeft,
  ExternalLink,
  Share2,
  MessageSquare,
  Calendar,
  User,
  Info,
  Send,
} from "lucide-react";
import { SiteShell } from "@/components/trustfund/SiteShell";
import { Badge } from "@/components/trustfund/Badge";
import { ProgressBar } from "@/components/trustfund/ProgressBar";
import { campaigns, type Campaign, type MilestoneStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/campaign/$id")({
  loader: ({ params }): Campaign => {
    const c = campaigns.find((x) => x.id === params.id);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Campaign"} | TruSTFUnd` },
      { name: "description", content: loaderData?.description ?? "" },
      { property: "og:title", content: loaderData?.title ?? "Campaign" },
      { property: "og:description", content: loaderData?.description ?? "" },
    ],
  }),
  component: CampaignDetail,
});

const statusMap: Record<MilestoneStatus, { color: string; label: string; Icon: typeof CheckCircle2 }> = {
  completed: { color: "text-success bg-success/10 border-success/30", label: "Completed", Icon: CheckCircle2 },
  active: { color: "text-warning bg-warning/10 border-warning/30", label: "Active", Icon: Loader2 },
  pending: { color: "text-text-muted bg-secondary border-border", label: "Pending", Icon: Circle },
};

function CampaignDetail() {
  const c = Route.useLoaderData() as Campaign;

  return (
    <SiteShell>
      <CampaignPageContent campaign={c} />
    </SiteShell>
  );
}

function CampaignPageContent({ campaign: c }: { campaign: Campaign }) {
  const [amount, setAmount] = useState("25");
  const [activeTab, setActiveTab] = useState<"story" | "updates" | "comments" | "proof">("story");
  const completed = c.milestones.filter((m) => m.status === "completed").length;

  const updates = [
    { date: "2 days ago", title: "Milestone 1 Completed!", body: "We've successfully paid the first semester tuition. Thank you to everyone who contributed!" },
    { date: "1 week ago", title: "Campaign Launched", body: "Our campaign is officially live on TruSTFUnd. Let's make this happen!" },
  ];

  const comments = [
    { user: "Sarah J.", amount: "$50", message: "So happy to support your education, Amaka!", date: "1 day ago" },
    { user: "David O.", amount: "$100", message: "Education is the key. Keep pushing!", date: "3 days ago" },
    { user: "Anonymous", amount: "$25", message: "Good luck with your exams!", date: "4 days ago" },
  ];

  const { writeContractAsync } = useWriteContract();
  const { isConnected } = useAccount();

  const handleFund = async () => {
    if (!isConnected) {
      toast.error("Please connect your MiniPay wallet first");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount to fund");
      return;
    }

    try {
      toast.loading("Preparing transaction...", { id: "fund-tx" });
      const amountInUnits = parseUnits(amount, 18);
      const PLATFORM_ESCROW = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

      await writeContractAsync({
        address: CUSD_ADDRESS,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [PLATFORM_ESCROW, amountInUnits],
      });

      toast.success(`Successfully funded ${amount} cUSD!`, { id: "fund-tx" });
      setAmount("");
    } catch (err: any) {
      console.error("Funding error:", err);
      toast.error(err.shortMessage || "Transaction failed. Please try again.", { id: "fund-tx" });
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="h-56 w-full md:h-72" style={{ background: c.cover }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative -mt-24 md:-mt-32">
          <div className="mx-auto max-w-7xl px-5">
            <Link to="/explore" className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Explore
            </Link>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={c.type === "crowdfund" ? "crowdfund" : "startup"}>
                {c.type === "crowdfund" ? "Crowdfund" : "Startup"}
              </Badge>
              {c.verified && (
                <Badge variant="verified">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
              )}
              <Badge variant="neutral">{c.category}</Badge>
            </div>
            <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight md:text-5xl">{c.title}</h1>
            <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
              <span className="rounded-md bg-secondary px-2 py-1 font-mono text-xs">{c.creator}</span>
              <span>·</span>
              <span>Created {new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Funding progress */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="order-2 lg:order-1 lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 card-glow">
              <ProgressBar value={c.raised} goal={c.goal} />
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Total Raised" value={`$${c.raised.toLocaleString()}`} />
                <Stat label="Donors" value={`${c.donors}`} icon={<Users className="h-3.5 w-3.5" />} />
                <Stat label="Days Left" value={`${c.daysLeft}`} icon={<Clock className="h-3.5 w-3.5" />} />
                <Stat label="Milestones" value={`${completed}/${c.milestones.length}`} />
              </div>

              {/* Tabs Area - Nested here to eliminate the void on desktop */}
              <div className="mt-10">
                <div className="flex border-b border-border overflow-x-auto no-scrollbar">
                  {([
                    { id: "story", label: "Story", icon: Info },
                    { id: "updates", label: "Updates", count: updates.length, icon: Calendar },
                    { id: "comments", label: "Comments", count: comments.length, icon: MessageSquare },
                    { id: "proof", label: "Proof", icon: ShieldCheck },
                  ] as const).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-bold transition whitespace-nowrap ${
                        activeTab === t.id
                          ? "border-primary text-primary"
                          : "border-transparent text-text-muted hover:text-foreground"
                      }`}
                    >
                      <t.icon className="h-4 w-4" />
                      {t.label}
                      {t.count !== undefined && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px]">{t.count}</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-8 min-h-[400px]">
                  {activeTab === "story" && (
                    <div className="prose prose-invert max-w-none">
                      <h3 className="text-xl font-extrabold">About This Campaign</h3>
                      <p className="mt-4 leading-relaxed text-text-secondary whitespace-pre-wrap">{c.story}</p>
                    </div>
                  )}

                  {activeTab === "updates" && (
                    <div className="space-y-8">
                      {updates.map((u, i) => (
                        <div key={i} className="relative pl-8 before:absolute before:left-0 before:top-2 before:h-full before:w-px before:bg-border last:before:hidden">
                          <div className="absolute left-[-4px] top-2 h-2 w-2 rounded-full bg-primary" />
                          <div className="text-xs font-bold text-text-muted uppercase tracking-wider">{u.date}</div>
                          <h4 className="mt-1 text-lg font-bold">{u.title}</h4>
                          <p className="mt-2 text-text-secondary">{u.body}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "comments" && (
                    <div className="space-y-6">
                      {comments.map((cm, i) => (
                        <div key={i} className="rounded-2xl border border-border bg-card p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary">
                                <User className="h-5 w-5 text-text-muted" />
                              </div>
                              <div>
                                <div className="font-bold">{cm.user}</div>
                                <div className="text-xs text-text-muted">{cm.date}</div>
                              </div>
                            </div>
                            <Badge variant="verified">{cm.amount}</Badge>
                          </div>
                          <p className="mt-4 text-sm text-text-secondary italic">"{cm.message}"</p>
                        </div>
                      ))}
                      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                        <p className="text-sm text-text-muted">Leave a message of support when you fund this campaign.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "proof" && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-extrabold">Verification Proof</h3>
                        <p className="mt-2 text-sm text-text-secondary">Official documents and evidence uploaded by the organizer and verified by validators.</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {[
                          { title: "Admission Letter", type: "PDF", size: "1.2 MB" },
                          { title: "Bursary Invoice", type: "Image", size: "840 KB" },
                          { title: "Government ID", type: "Verified", size: "Confidential" },
                        ].map((d, i) => (
                          <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                            <div className="flex items-center gap-3">
                              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                                <ExternalLink className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="text-sm font-bold">{d.title}</div>
                                <div className="text-xs text-text-muted">{d.type} • {d.size}</div>
                              </div>
                            </div>
                            <button className="text-xs font-bold text-primary hover:underline">View</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Milestone Tracker - Moved here to cover black space on desktop */}
            <div className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8 card-glow">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Proof of Use</div>
                  <h2 className="mt-1 text-2xl font-extrabold md:text-3xl">Milestone Tracker</h2>
                </div>
              </div>
              <div className="relative space-y-4">
                {c.milestones.map((m, i) => {
                  const s = statusMap[m.status];
                  return (
                    <div key={m.id} className="relative rounded-2xl border border-border bg-background/50 p-6">
                      <div className="flex items-start gap-4">
                        <div className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl border ${s.color}`}>
                          <s.Icon className={`h-5 w-5 ${m.status === "active" ? "animate-spin" : ""}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-text-muted">M{i + 1}</span>
                            <h3 className="text-base font-bold">{m.title}</h3>
                            <Badge
                              variant={m.status === "completed" ? "verified" : m.status === "active" ? "warning" : "neutral"}
                            >
                              {s.label}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-text-secondary">{m.description}</p>
                          <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                            <Field label="Recipient" value={m.recipient} />
                            <Field label="Amount" value={`$${m.amount.toLocaleString()} cUSD`} highlight />
                            <Field label="Approvals" value={`${m.approvals} of 4 validators`} />
                          </div>
                          {m.status === "active" && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold hover:border-primary/40">
                                <Upload className="h-3.5 w-3.5" /> Upload Evidence
                              </button>
                              <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:brightness-110">
                                Request Validation
                              </button>
                            </div>
                          )}
                          {m.status === "completed" && (
                            <button className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                              View proof onchain <ExternalLink className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="order-1 lg:order-2 space-y-6">
              <div className="rounded-2xl border border-primary/30 bg-card p-6 card-glow">
            <div className="mt-3">
              <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold ml-1">Amount to Fund</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border-2 border-border bg-background px-4 py-3 focus-within:border-primary/50 transition">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="decimal"
                  placeholder="0.00"
                  className="w-full bg-transparent text-2xl font-bold outline-none"
                />
                <span className="text-sm font-bold text-primary">cUSD</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[10, 25, 50, 100].map((n) => (
                <button
                  key={n}
                  onClick={() => setAmount(String(n))}
                  className={`rounded-lg border border-border px-3 py-1.5 text-xs font-bold transition ${amount === String(n)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-text-secondary hover:border-primary/40 hover:text-foreground"
                    }`}
                >
                  ${n}
                </button>
              ))}
              <button
                onClick={() => {
                  setAmount("");
                }}
                className={`rounded-lg border border-border px-3 py-1.5 text-xs font-bold transition ${![10, 25, 50, 100].includes(Number(amount)) && amount !== ""
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-text-secondary hover:border-primary/40 hover:text-foreground"
                  }`}
              >
                Custom
              </button>
            </div>
            <button
              onClick={handleFund}
              className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:brightness-110 hover:glow-yellow"
            >
              Fund This Campaign
            </button>
            <p className="mt-3 text-center text-xs text-text-muted">
              Funds held in escrow until milestone approval.
            </p>
            <div className="mt-8 border-t border-border pt-6">
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted">Share this campaign</div>
              <div className="mt-4 flex gap-3">
                <button className="grid h-10 w-10 place-items-center rounded-xl bg-[#25D366] text-white transition hover:scale-110">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </button>
                <button className="grid h-10 w-10 place-items-center rounded-xl bg-[#1877F2] text-white transition hover:scale-110">
                  <Send className="h-5 w-5" />
                </button>
                <button className="grid h-10 w-10 place-items-center rounded-xl bg-[#000000] text-white transition hover:scale-110">
                  <Share2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast.success("Link copied!");
                  }}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground transition hover:scale-110"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-text-secondary">Organizer</h3>
              <div className="mt-4 flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-startup p-0.5">
                  <div className="h-full w-full rounded-full bg-card grid place-items-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <div className="font-bold">{c.creator}</div>
                  <div className="text-xs text-text-muted inline-flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-success" /> Verified Identity
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-text-secondary leading-relaxed">
                Registered TruSTFUnd user since March 2024. Successfully completed 2 previous campaigns.
              </p>
              <button className="mt-6 w-full rounded-xl border border-border py-2 text-xs font-bold hover:bg-secondary">
                Contact Organizer
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-text-secondary">Verified By</h3>
              <ul className="mt-4 space-y-3">
                {["0x91…fA02", "0x44…cE19", "0x7B…71dD"].map((w) => (
                  <li key={w} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-startup" />
                      <span className="font-mono text-xs">{w}</span>
                    </div>
                    <ShieldCheck className="h-4 w-4 text-success" />
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-text-secondary">Recent Donors</h3>
              <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs text-text-secondary">0x{7342 + i}…{9182 - i}</span>
                    <span className="font-bold text-primary">${120 - i * 10}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="text-xs text-text-secondary inline-flex items-center gap-1">{icon}{label}</div>
      <div className="mt-1 text-xl font-extrabold">{value}</div>
    </div>
  );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-text-muted">{label}</div>
      <div className={`mt-1 text-xs font-semibold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
