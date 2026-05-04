import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { Wallet, Edit3, Upload, Check, X, AlertTriangle, Bell, Info, ShieldCheck, Clock } from "lucide-react";
import { SiteShell } from "@/components/trustfund/SiteShell";
import { Badge } from "@/components/trustfund/Badge";
import { ProgressBar } from "@/components/trustfund/ProgressBar";
import { campaigns } from "@/lib/mock-data";
import { CUSD_ADDRESS } from "@/lib/wagmi";
import { useBalance } from "wagmi";
import { formatUnits } from "viem";

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

const tabs = ["Campaigns", "Invested In", "Notifications"] as const;

const mockNotifications = [
  {
    id: "n1",
    type: "campaign",
    campaign: "Help Amaka Finish Medical School",
    campaignId: "amaka-medical-school",
    message: "Validators have requested more information regarding your admission letter. Please upload a clearer scan.",
    status: "Action Required",
    time: "2h ago",
    severity: "warning",
    icon: Info
  },
  {
    id: "n2",
    type: "investment",
    campaign: "SolarGrid Africa",
    campaignId: "solargrid-africa",
    message: "Milestone #1 (Hardware Purchase) has been completed and funds released to the vendor.",
    status: "Update",
    time: "5h ago",
    severity: "success",
    icon: Check
  },
  {
    id: "n3",
    type: "campaign",
    campaign: "Community Borehole Project",
    campaignId: "school-borehole",
    message: "Your campaign has been verified and is now live for funding!",
    status: "Verified",
    time: "1d ago",
    severity: "success",
    icon: ShieldCheck
  },
  {
    id: "n4",
    type: "investment",
    campaign: "FarmLink - SaaS",
    campaignId: "farmlink-saas",
    message: "Milestone #3 has been flagged for review by 2 investors.",
    status: "Alert",
    time: "3d ago",
    severity: "danger",
    icon: AlertTriangle
  }
];

function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({
    address: address,
    token: CUSD_ADDRESS,
  });

  const displayBalance = balanceData 
    ? `${parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
    : "0.00";

  const [tab, setTab] = useState<(typeof tabs)[number]>("Notifications");

  // Filter campaigns created by the user
  const myCampaigns = useMemo(() => {
    if (!address) return [];
    return campaigns.filter(c => c.creator.toLowerCase() === address.toLowerCase());
  }, [address]);

  // For demo purposes, if no address is connected, we'll show samples
  const displayCampaigns = isConnected ? myCampaigns : [
    { ...campaigns[0], status: "Awaiting Info", statusColor: "text-warning", statusDesc: "Validators requested docs", daysLeft: 12 },
    { 
      id: "expired-sample", 
      title: "Local Art Gallery", 
      type: "crowdfund", 
      raised: 1200, 
      goal: 5000, 
      daysLeft: 0, 
      status: "Expired - Under Goal", 
      statusColor: "text-danger", 
      statusDesc: "Goal not met by deadline",
      extensions: 0 
    }
  ];

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
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 px-4">
                <Wallet className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-mono text-[10px] text-text-secondary">
                    {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Not Connected"}
                  </div>
                  <div className="text-sm font-extrabold text-foreground">
                    ${isConnected ? displayBalance : "0.00"} cUSD
                  </div>
                  <div className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Wallet Balance</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3 px-4">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm font-extrabold text-primary">$3,420.00 cUSD</div>
                  <div className="text-[10px] uppercase font-bold text-primary/70 tracking-wider">Protected in Escrow</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-warning/20 bg-warning/5 p-3 px-4">
                <Clock className="h-5 w-5 text-warning" />
                <div>
                  <div className="text-sm font-extrabold text-warning">1,250 PTS</div>
                  <div className="text-[10px] uppercase font-bold text-warning/70 tracking-wider">Trust Points</div>
                </div>
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

        {tab === "Campaigns" && (
          <div className="grid gap-4 md:grid-cols-2">
            {displayCampaigns.length > 0 ? (
              displayCampaigns.map((c: any) => (
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
                  <span className="text-text-secondary">Net Payout ({c.type === "crowdfund" ? "93%" : "92%"}):</span>
                  <span className="font-bold text-foreground">
                    ${(c.raised * (c.type === "crowdfund" ? 0.93 : 0.92)).toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Status:</span>
                  <div className="flex flex-col items-end">
                    <span className={`font-bold ${c.statusColor || "text-success"}`}>{c.status || "Active"}</span>
                    <span className="text-[10px] text-text-muted">{c.statusDesc || "Live on Explorer"}</span>
                  </div>
                </div>
                  {c.status === "Expired - Under Goal" ? (
                    <div className="mt-4 space-y-2">
                      <div className="rounded-lg bg-danger/10 p-3 border border-danger/20 mb-3">
                        <p className="text-[10px] text-danger font-bold uppercase tracking-wider">Campaign Expired</p>
                        <p className="mt-1 text-[11px] text-text-secondary leading-tight">
                          Goal not met. You can either proceed with current funds (milestone gated) or pay to extend by 2 weeks.
                        </p>
                      </div>
                      <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary border border-border py-2.5 text-sm font-bold hover:border-primary/40">
                        Proceed with Partial Funds
                      </button>
                      <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:brightness-110">
                        Extend for 2 Weeks (Pay ${((c.extensions || 0) + 1) * 5}.00)
                      </button>
                    </div>
                  ) : c.status === "Awaiting Info" ? (
                    <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-warning/10 border border-warning/30 py-2.5 text-sm font-bold text-warning hover:bg-warning/20">
                      <Info className="h-4 w-4" /> Provide More Information
                    </button>
                  ) : (
                    <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:brightness-110">
                      <Upload className="h-4 w-4" /> Submit Evidence
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <Edit3 className="h-8 w-8 text-text-muted" />
                </div>
                <h3 className="mt-4 text-lg font-bold">No Campaigns Found</h3>
                <p className="mt-2 text-sm text-text-secondary max-w-xs">
                  You haven't created any campaigns yet. Start a crowdfund or a startup to see it here.
                </p>
                <Link to="/create" className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:brightness-110">
                  Create Campaign
                </Link>
              </div>
            )}
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
                  {flag === "danger" && (
                    <div className="mt-3 rounded-lg bg-danger/10 p-3 border border-danger/20">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-danger">
                        <span>Est. Refund ({c.type === "crowdfund" ? "87%" : "85%"})</span>
                        <span>
                          ${(300 * (c.type === "crowdfund" ? 0.87 : 0.85)).toFixed(2)}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-danger/70 leading-tight">
                        A {c.type === "crowdfund" ? "13%" : "15%"} management & maintenance fee is deducted from the locked balance upon withdrawal.
                      </p>
                    </div>
                  )}
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

        {tab === "Notifications" && (
          <div className="space-y-3">
            {mockNotifications.map((n) => (
              <Link 
                key={n.id} 
                to="/campaign/$id" 
                params={{ id: n.campaignId }}
                className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/30 cursor-pointer"
              >
                <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  n.severity === "success" ? "border-success/30 bg-success/10 text-success" :
                  n.severity === "warning" ? "border-warning/30 bg-warning/10 text-warning" :
                  n.severity === "danger" ? "border-danger/30 bg-danger/10 text-danger" :
                  "border-primary/30 bg-primary/10 text-primary"
                }`}>
                  <n.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      n.severity === "success" ? "text-success" :
                      n.severity === "warning" ? "text-warning" :
                      n.severity === "danger" ? "text-danger" :
                      "text-primary"
                    }`}>
                      {n.status}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-text-muted">
                      <Clock className="h-3 w-3" /> {n.time}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold group-hover:text-primary transition-colors">{n.campaign}</h3>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                    {n.message}
                  </p>
                  {n.status === "Action Required" && n.type === "campaign" && (
                    <div className="mt-4">
                      <button 
                        onClick={(e) => {
                          e.preventDefault(); // Prevent navigating to campaign when clicking the button
                          // Handle fix action
                        }}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:brightness-110"
                      >
                        Fix Now
                      </button>
                    </div>
                  )}
                </div>
              </Link>
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
