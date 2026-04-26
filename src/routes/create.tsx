import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Handshake, Rocket, Plus, Trash2, Check, ArrowLeft, ArrowRight, PartyPopper, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/trustfund/SiteShell";
import { Badge } from "@/components/trustfund/Badge";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create a Campaign | TruSTFUnd" },
      { name: "description", content: "Launch a milestone-gated crowdfund or startup investment campaign on Celo." },
      { property: "og:title", content: "Create a Campaign | TruSTFUnd" },
      { property: "og:description", content: "Define milestones, recipients, and proof. Funds release directly." },
    ],
  }),
  component: Create,
});

const steps = ["Type", "Basic Info", "Funding Goal", "Milestones", "Verification", "Review"] as const;

interface MilestoneInput {
  title: string;
  amount: string;
  recipient: string;
  proof: string;
}

function Create() {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<"crowdfund" | "startup" | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullStory, setFullStory] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [recipientType, setRecipientType] = useState("");
  const [recipientWallet, setRecipientWallet] = useState("");

  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { title: "", amount: "", recipient: "", proof: "" },
  ]);

  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();

  // Milestone constraints
  const maxMilestones = type === "crowdfund" ? 2 : 20;
  const minMilestones = type === "startup" ? 4 : 1;
  const canAddMilestone = milestones.length < maxMilestones;
  const canRemoveMilestone = milestones.length > 1;

  // Amount validation
  const goalNum = Number(goal) || 0;
  const milestoneSum = milestones.reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const amountRemaining = goalNum - milestoneSum;
  const amountsValid = goalNum > 0 && milestoneSum === goalNum;

  const updateMilestone = (i: number, field: keyof MilestoneInput, value: string) => {
    setMilestones(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  };

  // Validation per step
  const canProceed = (): boolean => {
    if (step === 0) return type !== null;
    if (step === 1) return title.trim().length > 0;
    if (step === 2) return goalNum > 0 && deadline.trim().length > 0;
    if (step === 3) return milestones.length >= minMilestones && amountsValid && milestones.every(m => m.title.trim());
    return true;
  };

  const handleSubmit = () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    setSubmitted(true);
  };

  // Success screen
  if (submitted) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-2xl px-5 py-20 text-center">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-success/10">
            <PartyPopper className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-3xl font-extrabold md:text-4xl">Campaign Submitted!</h1>
          <p className="mt-4 text-text-secondary">
            Your <span className="font-bold text-foreground">{type === "crowdfund" ? "Crowdfund" : "Startup"}</span> campaign
            <span className="font-bold text-foreground"> "{title}"</span> has been submitted for validation.
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left">
            <div className="flex items-center gap-2 text-sm font-bold text-primary">
              <ShieldCheck className="h-4 w-4" /> What happens next?
            </div>
            <ul className="mt-4 space-y-3 text-sm text-text-secondary">
              <li className="flex gap-2"><span className="font-bold text-success">1.</span> Our validators review your campaign and documents</li>
              <li className="flex gap-2"><span className="font-bold text-success">2.</span> 2 admins + 1 user must verify before it goes live</li>
              <li className="flex gap-2"><span className="font-bold text-success">3.</span> Once verified, donors can start contributing</li>
              <li className="flex gap-2"><span className="font-bold text-success">4.</span> Funds are released as you prove each milestone</li>
            </ul>
          </div>
          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <div className="grid grid-cols-2 gap-3 text-left text-sm">
              <div><span className="text-text-muted text-xs">TYPE</span><div className="font-bold">{type}</div></div>
              <div><span className="text-text-muted text-xs">GOAL</span><div className="font-bold">${Number(goal).toLocaleString()} cUSD</div></div>
              <div><span className="text-text-muted text-xs">MILESTONES</span><div className="font-bold">{milestones.length}</div></div>
              <div><span className="text-text-muted text-xs">WALLET</span><div className="font-bold font-mono text-xs">{address?.slice(0, 6)}...{address?.slice(-4)}</div></div>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/explore" className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:brightness-110">
              Browse Campaigns
            </Link>
            <button onClick={() => { setSubmitted(false); setStep(0); setType(null); setTitle(""); setMilestones([{ title: "", amount: "", recipient: "", proof: "" }]); }} className="rounded-xl border border-border px-6 py-3 text-sm font-bold hover:bg-secondary">
              Create Another
            </button>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 sm:px-5 py-10 md:py-16">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">New Campaign</div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">Launch Your Campaign</h1>
        <p className="mt-3 text-text-secondary">Define your milestones. Verify your proof. Release funds directly.</p>

        {/* Stepper */}
        <div className="mt-8 flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                i === step
                  ? "border-primary bg-primary/15 text-primary"
                  : i < step
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-border bg-card text-text-muted"
              }`}
            >
              {i < step ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{s}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card p-5 sm:p-6 md:p-10">
          {/* Step 0: Type */}
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-extrabold">What are you raising?</h2>
              <p className="mt-2 text-sm text-text-secondary">Choose how funds will flow and how investors are protected.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {([
                  { id: "crowdfund" as const, Icon: Handshake, badge: "Crowdfund", title: "Crowdfund", desc: "School fees, medical, community. Direct vendor disbursement. Max 2 milestones." },
                  { id: "startup" as const, Icon: Rocket, badge: "Startup", title: "Startup", desc: "Angel investment with milestone tranches and pull-out protection. Min 4 milestones." },
                ]).map((o) => {
                  const active = type === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => { setType(o.id); setMilestones([{ title: "", amount: "", recipient: "", proof: "" }]); }}
                      className={`relative overflow-hidden rounded-2xl border p-6 text-left transition ${
                        active ? "border-primary bg-primary/5 glow-yellow" : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <Badge variant={o.id === "crowdfund" ? "crowdfund" : "startup"}>{o.badge}</Badge>
                      <o.Icon className={`mt-5 h-8 w-8 ${o.id === "crowdfund" ? "text-primary" : "text-startup"}`} />
                      <div className="mt-3 text-lg font-extrabold">{o.title}</div>
                      <p className="mt-1 text-sm text-text-secondary">{o.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-extrabold">Basic Info</h2>
              <Field label="Campaign Title" placeholder="e.g. Help Amaka Finish Medical School" value={title} onChange={setTitle} />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Category" placeholder="Education, Medical, Tech…" value={category} onChange={setCategory} />
                <Field label="Short Description" placeholder="One-liner pitch" value={shortDesc} onChange={setShortDesc} />
              </div>
              <Field label="Full Story" placeholder="Tell the world what this campaign is about…" textarea value={fullStory} onChange={setFullStory} />
              <Field label="Cover Image" placeholder="Drag & drop or click to upload" upload />

              <div className="mt-2 border-t border-border pt-6">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Social Handles</div>
                <p className="text-xs text-text-secondary mb-4">Help donors and validators verify your identity. At least one is required.</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Twitter / X" placeholder="@yourhandle" value={twitter} onChange={setTwitter} />
                  <Field label="Telegram" placeholder="@yourhandle" value={telegram} onChange={setTelegram} />
                  <Field label="LinkedIn" placeholder="linkedin.com/in/yourname" value={linkedin} onChange={setLinkedin} />
                  <Field label="Instagram" placeholder="@yourhandle" value={instagram} onChange={setInstagram} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Funding Goal */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-extrabold">Funding Goal</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Total Goal (cUSD)" placeholder="6300" value={goal} onChange={setGoal} />
                <Field label="Deadline" placeholder="YYYY-MM-DD" value={deadline} onChange={setDeadline} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Recipient Type" placeholder="Individual / Institution / Business" value={recipientType} onChange={setRecipientType} />
                <Field label="Recipient Wallet or Name" placeholder="0x… or Institution Name" value={recipientWallet} onChange={setRecipientWallet} />
              </div>
              {type && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-text-secondary">
                  <span className="font-bold text-primary">{type === "crowdfund" ? "Crowdfund" : "Startup"}:</span>{" "}
                  {type === "crowdfund"
                    ? "You can set 1 or 2 proof-of-use items. Max 2."
                    : "You must set at least 4 milestones. All amounts must sum to your goal."}
                  {" "}Creation fee: <span className="font-bold text-foreground">{type === "crowdfund" ? "$1" : "$5"} cUSD</span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Milestones */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-extrabold">
                    {type === "crowdfund" ? "Proof of Use" : "Milestone Builder"}
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    {type === "crowdfund"
                      ? `Set 1–2 items showing how funds will be used. (${milestones.length}/${maxMilestones})`
                      : `Min 4 milestones required. Each unlocks a tranche. (${milestones.length}/${minMilestones}+)`}
                  </p>
                </div>
                {goalNum > 0 && (
                  <div className={`rounded-lg px-3 py-1.5 text-xs font-bold ${amountsValid ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                    {amountsValid ? "✓ Amounts balanced" : `${amountRemaining > 0 ? `$${amountRemaining.toLocaleString()} remaining` : `$${Math.abs(amountRemaining).toLocaleString()} over budget`}`}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {milestones.map((m, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-background p-4 sm:p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">
                        {type === "crowdfund" ? `Proof Item ${i + 1}` : `Milestone ${i + 1}`}
                      </span>
                      {canRemoveMilestone && (
                        <button
                          onClick={() => setMilestones(milestones.filter((_, idx) => idx !== i))}
                          className="text-text-muted hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Title" placeholder="e.g. Tuition - First Semester" value={m.title} onChange={(v) => updateMilestone(i, "title", v)} />
                      <Field label="Amount (cUSD)" placeholder="1500" value={m.amount} onChange={(v) => updateMilestone(i, "amount", v)} />
                      <Field label="Direct Recipient" placeholder="University Bursary / Vendor name" value={m.recipient} onChange={(v) => updateMilestone(i, "recipient", v)} />
                      <Field label="Proof Required" placeholder="Receipt, photo, document…" value={m.proof} onChange={(v) => updateMilestone(i, "proof", v)} />
                    </div>
                  </div>
                ))}

                {canAddMilestone && (
                  <button
                    onClick={() => setMilestones([...milestones, { title: "", amount: "", recipient: "", proof: "" }])}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background py-3 text-sm font-semibold text-text-secondary hover:border-primary/40 hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" /> Add {type === "crowdfund" ? "Proof Item" : "Milestone"}
                  </button>
                )}

                {milestones.length < minMilestones && (
                  <p className="text-xs text-warning font-semibold">
                    ⚠ You need at least {minMilestones} {type === "crowdfund" ? "proof items" : "milestones"} to continue.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Verification */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-extrabold">Verification Docs</h2>
              <p className="text-sm text-text-secondary">Upload documents to speed up the verification process.</p>
              <Field label="Government ID" placeholder="Upload PDF or image" upload />
              <Field label="Supporting Documents" placeholder="Admission letter, business plan…" upload />
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-extrabold">Review & Submit</h2>
              <p className="mt-2 text-sm text-text-secondary">Validators will review your campaign before it goes live.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Type", type === "crowdfund" ? "Crowdfund" : "Startup"],
                  ["Title", title || "-"],
                  ["Goal", goalNum > 0 ? `$${goalNum.toLocaleString()} cUSD` : "-"],
                  ["Milestones", `${milestones.length} configured`],
                  ["Deadline", deadline || "-"],
                  ["Category", category || "-"],
                  ["Creation Fee", type === "crowdfund" ? "$1 cUSD" : "$5 cUSD"],
                  ["Status", "Pending Validation"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-border bg-background p-4">
                    <div className="text-[10px] uppercase tracking-wider text-text-muted">{k}</div>
                    <div className="mt-1 text-sm font-semibold">{v}</div>
                  </div>
                ))}
              </div>

              {/* Milestone summary */}
              <div className="mt-6 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  {type === "crowdfund" ? "Proof of Use" : "Milestones"}
                </div>
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-background p-3 text-sm">
                    <span className="font-semibold">{m.title || `Milestone ${i + 1}`}</span>
                    <span className="font-bold text-primary">${Number(m.amount || 0).toLocaleString()} cUSD</span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm font-bold">
                  <span>Total</span>
                  <span className={milestoneSum === goalNum ? "text-success" : "text-warning"}>
                    ${milestoneSum.toLocaleString()} / ${goalNum.toLocaleString()} cUSD
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="mt-8 w-full rounded-xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground hover:brightness-110 hover:glow-yellow"
              >
                {isConnected ? "Submit for Validation" : "Connect Wallet & Submit"}
              </button>
              {!isConnected && (
                <p className="mt-2 text-center text-xs text-text-muted">You'll be asked to connect your wallet to sign the submission.</p>
              )}
            </div>
          )}

          {/* Nav */}
          <div className="mt-8 sm:mt-10 flex items-center justify-between border-t border-border pt-6">
            <button
              disabled={step === 0}
              onClick={() => setStep(Math.max(0, step - 1))}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <span className="text-xs text-text-muted">Step {step + 1} of {steps.length}</span>
            {step < steps.length - 1 && (
              <button
                disabled={!canProceed()}
                onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {step === steps.length - 1 && <div />}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Field({ label, placeholder, textarea, upload, value, onChange }: {
  label: string;
  placeholder?: string;
  textarea?: boolean;
  upload?: boolean;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</span>
      {upload ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-background px-4 py-8 text-sm text-text-muted hover:border-primary/40 cursor-pointer">
          {placeholder ?? "Upload"}
        </div>
      ) : textarea ? (
        <textarea
          rows={5}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50"
        />
      ) : (
        <input
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50"
        />
      )}
    </label>
  );
}
