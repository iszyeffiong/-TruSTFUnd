import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Target,
  Lock,
  CheckCircle2,
  FileCheck,
  Coins,
  Wallet,
  Handshake,
  Rocket,
  HelpCircle,
  ChevronDown,
  Quote,
  Globe,
  Zap,
} from "lucide-react";
import { SiteShell } from "@/components/trustfund/SiteShell";
import { Badge } from "@/components/trustfund/Badge";
import { CampaignCard } from "@/components/trustfund/CampaignCard";
import { campaigns } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TruSTFUnd | Fund with Trust. Release with Proof." },
      {
        name: "description",
        content:
          "Milestone-gated crowdfunding and startup investment on Celo. Every cUSD goes exactly where it's supposed to.",
      },
      { property: "og:title", content: "TruSTFUnd | Fund with Trust. Release with Proof." },
      {
        property: "og:description",
        content: "Trustless, milestone-gated funding on Celo. cUSD escrow with investor protection.",
      },
    ],
  }),
  component: Landing,
});

const stats = [
  { label: "Total Raised", value: "$2.4M", suffix: "cUSD" },
  { label: "Campaigns Funded", value: "1,284" },
  { label: "Milestones Completed", value: "4,902" },
  { label: "Investors Protected", value: "320" },
];

const steps = [
  { icon: FileCheck, title: "Create a Campaign", desc: "List your need - school fees, business, or startup. Define milestones and recipients." },
  { icon: ShieldCheck, title: "Get Verified", desc: "Admins and community validators authenticate your identity and claims." },
  { icon: Coins, title: "Receive Funding", desc: "Donors and investors fund in cUSD via MiniPay or any Web3 wallet." },
  { icon: Target, title: "Milestone Release", desc: "Funds release directly to schools, vendors, or business accounts - never to you." },
];

const trust = [
  { icon: Lock, title: "Escrow Smart Contracts", desc: "Funds locked on Celo. No one touches them until milestones are approved." },
  { icon: CheckCircle2, title: "Validator Network", desc: "Admins and community members verify campaigns before a single cUSD moves." },
  { icon: Target, title: "Direct Disbursement", desc: "School fees go to schools. Vendor payments go to vendors. Period." },
  { icon: ShieldCheck, title: "Investor Protection", desc: "Pull out unspent funds if a startup mismanages. Never lose everything again." },
];

function Landing() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const featured = campaigns.slice(0, 3);

  const faqs = [
    {
      q: "How is my money protected?",
      a: "All contributions are held in secure, on-chain escrow smart contracts on the Celo network. Instead of a single lump-sum payout, funds are released in predefined tranches only after specific milestones are reached and verified. This ensures that your money is spent exactly as promised, and in the case of startup mismanagement, investors retain the right to vote on pulling out any unspent capital to minimize losses.",
    },
    {
      q: "Who are the validators?",
      a: "Our validator network is a decentralized group consisting of trusted community leaders, industry subject matter experts, and TruSTFUnd administrators. They perform rigorous due diligence on every campaign before it goes live and manually verify evidence for every milestone release. By requiring multiple independent approvals (multi-sig), we eliminate any single point of failure and ensure a high standard of accountability for every project.",
    },
    {
      q: "What is cUSD and why use it?",
      a: "cUSD (Celo Dollar) is a stablecoin pegged to the value of the US Dollar, combining the stability of traditional currency with the transparency of blockchain technology. We use cUSD to protect both donors and campaigners from the price volatility often seen in other cryptocurrencies. This means that if you donate $50 today, the recipient is guaranteed to receive the equivalent of $50 in purchasing power when the milestone is reached, regardless of market conditions.",
    },
    {
      q: "Can I fund campaigns using MiniPay?",
      a: "Absolutely! TruSTFUnd is natively optimized for the mobile-first African market through full integration with Opera MiniPay and Valora. This allows users to discover, fund, and track campaigns directly from their smartphones with near-zero gas fees and sub-second transaction speeds. Our goal is to make high-trust financial tools accessible to anyone with a mobile phone, regardless of their technical background.",
    },
  ];

  return (
    <SiteShell hideWallet={true}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg radial-fade opacity-60" />
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float-orb" />
        <div className="absolute -right-32 top-60 h-[28rem] w-[28rem] rounded-full bg-startup/15 blur-3xl animate-float-orb" style={{ animationDelay: "-7s" }} />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-5 pt-20 pb-24 text-center md:pt-28 md:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-balance text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[1.05] tracking-tight"
          >
            Fund with <span className="text-primary">Trust.</span>
            <br />
            Release with <span className="text-primary">Proof.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-2xl text-balance text-base text-text-secondary md:text-lg"
          >
            Milestone-gated crowdfunding and startup investment on Celo. Every cUSD
            goes exactly where it's supposed to - to schools, vendors, and verified recipients.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/explore"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition hover:glow-yellow hover:brightness-110"
            >
              Explore Campaigns
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-6 py-3.5 text-sm font-bold text-foreground transition hover:border-primary/40 hover:bg-secondary/80"
            >
              Start a Campaign
            </Link>
          </motion.div>

          {/* Floating stats */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-20 grid w-full grid-cols-2 gap-3 md:grid-cols-4"
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card/60 p-5 text-left backdrop-blur-sm card-glow"
              >
                <div className="text-2xl font-extrabold text-primary md:text-3xl">
                  {s.value}
                  {s.suffix && <span className="ml-1 text-sm font-bold text-text-secondary">{s.suffix}</span>}
                </div>
                <div className="mt-1 text-xs text-text-secondary">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <div className="mb-12 text-center">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Process</div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">How TrustFund Works</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="relative rounded-2xl border border-border bg-card p-6 transition hover:border-primary/30"
                >
                  <div className="absolute right-4 top-4 text-xs font-bold text-text-muted">
                    0{i + 1}
                  </div>
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Two ways to fund */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <div className="mb-12 text-center">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Two Paths</div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Two Ways to Fund</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                Icon: Handshake,
                badge: "Crowdfund" as const,
                title: "Community Crowdfunding",
                desc: "For individuals needing help with school fees, medical bills, or business startup. Funds go directly to verified recipients - never to the campaigner.",
                cta: "Start a Campaign",
                href: "/create" as const,
              },
              {
                Icon: Rocket,
                badge: "Startup" as const,
                title: "Startup Investment",
                desc: "For founders seeking angel funding. Investors release tranches per milestone. Pull-out protection if funds are mismanaged.",
                cta: "List Your Startup",
                href: "/create" as const,
              },
            ].map((c) => (
              <div
                key={c.title}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition hover:border-primary/40"
              >
                <div className={`absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl opacity-20 ${c.badge === "Crowdfund" ? "bg-primary" : "bg-startup"}`} />
                <div className="relative">
                  <Badge variant={c.badge === "Crowdfund" ? "crowdfund" : "startup"}>
                    {c.badge}
                  </Badge>
                  <c.Icon className={`mt-6 h-10 w-10 ${c.badge === "Crowdfund" ? "text-primary" : "text-startup"}`} />
                  <h3 className="mt-4 text-2xl font-extrabold">{c.title}</h3>
                  <p className="mt-3 text-sm text-text-secondary leading-relaxed">{c.desc}</p>
                  <Link
                    to={c.href}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-primary transition group-hover:gap-2.5"
                  >
                    {c.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for trust */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <div className="mb-12 text-center">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Why TrustFund</div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Built for Trust</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.title} className="rounded-2xl border border-border bg-card p-6 transition hover:border-primary/30 hover:card-glow">
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold">{t.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Featured Campaigns */}
      <section className="border-t border-border bg-background/50 py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-12 flex flex-col items-end justify-between gap-4 md:flex-row">
            <div className="max-w-xl">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Live Now</div>
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Featured Campaigns</h2>
              <p className="mt-3 text-text-secondary">Explore the latest milestone-gated projects raising funds with proof.</p>
            </div>
            <Link to="/explore" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-bold transition hover:border-primary/40">
              View All Campaigns <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CampaignCard key={c.id} c={c} />
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="relative overflow-hidden border-t border-border bg-card py-24">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative mx-auto max-w-7xl px-5">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-startup">Impact Story</div>
              <h2 className="text-4xl font-extrabold tracking-tight">Real People. Real Proof.</h2>
              <p className="mt-6 text-lg leading-relaxed text-text-secondary">
                "TruSTFUnd changed how I support my community. I used to worry if my donations reached the students. Now, I see the bursary receipt on-chain before the next semester's funds are released."
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-startup" />
                <div>
                  <div className="font-bold">Chidi Opara</div>
                  <div className="text-xs text-text-muted">Education Donor since 2024</div>
                </div>
              </div>
              <div className="mt-12 grid grid-cols-2 gap-8 border-t border-border pt-8">
                <div>
                  <div className="text-3xl font-black text-primary">$1.2M+</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-text-muted">Directly Disbursed</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-startup">0%</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-text-muted">Fraud Rate</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-startup/20 p-8">
                <div className="h-full w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <div className="mt-8 space-y-6">
                    <div className="h-4 w-3/4 rounded-full bg-white/10" />
                    <div className="h-4 w-1/2 rounded-full bg-white/10" />
                    <div className="space-y-3 pt-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
                          <CheckCircle2 className="h-5 w-5 text-success" />
                          <div className="flex-1 space-y-2">
                            <div className="h-2 w-1/3 rounded-full bg-white/20" />
                            <div className="h-2 w-2/3 rounded-full bg-white/10" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 rounded-2xl bg-primary p-6 shadow-xl">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-border bg-background py-24">
        <div className="mx-auto max-w-3xl px-5">
          <div className="mb-12 text-center">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Support</div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Common Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/30"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="font-bold">{f.q}</span>
                  <ChevronDown className={`h-5 w-5 text-text-muted transition ${activeFaq === i ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === i && (
                  <div className="border-t border-border bg-background/50 p-6 text-sm leading-relaxed text-text-secondary">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem / Partners */}
      <section className="border-t border-border bg-background py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8 opacity-50 grayscale transition hover:grayscale-0">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Globe className="h-6 w-6" /> Celo Ecosystem
            </div>
            <div className="flex items-center gap-2 font-bold text-lg">
              <Zap className="h-6 w-6" /> MiniPay Ready
            </div>
            <div className="flex items-center gap-2 font-bold text-lg text-[22px]">
              opera
            </div>
            <div className="flex items-center gap-2 font-bold text-lg">
              valora
            </div>
          </div>
        </div>
      </section>

    </SiteShell>
  );
}
