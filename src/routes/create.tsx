import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Handshake, Rocket, Plus, Trash2, Check, ArrowLeft, ArrowRight } from "lucide-react";
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

function Create() {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<"crowdfund" | "startup" | null>(null);
  const [milestones, setMilestones] = useState([
    { title: "", amount: "", recipient: "", proof: "" },
  ]);

  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-5 py-12 md:py-16">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">New Campaign</div>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">Launch Your Campaign</h1>
        <p className="mt-3 text-text-secondary">Define your milestones. Verify your proof. Release funds directly.</p>

        {/* Stepper */}
        <div className="mt-10 flex flex-wrap gap-2">
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
              {s}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-10">
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-extrabold">What are you raising?</h2>
              <p className="mt-2 text-sm text-text-secondary">Choose how funds will flow and how investors are protected.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {([
                  { id: "crowdfund" as const, Icon: Handshake, badge: "Crowdfund", title: "Crowdfund", desc: "School fees, medical, business startup. Direct vendor disbursement." },
                  { id: "startup" as const, Icon: Rocket, badge: "Startup", title: "Startup", desc: "Angel investment with milestone tranches and pull-out protection." },
                ]).map((o) => {
                  const active = type === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setType(o.id)}
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

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-extrabold">Basic Info</h2>
              <Field label="Campaign Title" placeholder="e.g. Help Amaka Finish Medical School" />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Category" placeholder="Education, Medical, Tech…" />
                <Field label="Short Description" placeholder="One-liner pitch" />
              </div>
              <Field label="Full Story" placeholder="Tell the world what this campaign is about…" textarea />
              <Field label="Cover Image" placeholder="Drag & drop or click to upload" upload />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-extrabold">Funding Goal</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Total Goal (cUSD)" placeholder="6300" />
                <Field label="Deadline" placeholder="YYYY-MM-DD" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Recipient Type" placeholder="Individual / Institution / Business" />
                <Field label="Recipient Wallet or Name" placeholder="0x… or Institution Name" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold">Milestone Builder</h2>
                  <p className="mt-1 text-sm text-text-secondary">Each milestone unlocks a tranche to a verified recipient.</p>
                </div>
              </div>
              <div className="space-y-4">
                {milestones.map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-background p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">Milestone {i + 1}</span>
                      {milestones.length > 1 && (
                        <button
                          onClick={() => setMilestones(milestones.filter((_, idx) => idx !== i))}
                          className="text-text-muted hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Title" placeholder="e.g. Tuition - First Semester" />
                      <Field label="Amount (cUSD)" placeholder="1500" />
                      <Field label="Direct Recipient" placeholder="University Bursary / Vendor name" />
                      <Field label="Proof Required" placeholder="Receipt, photo, document…" />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() =>
                    setMilestones([...milestones, { title: "", amount: "", recipient: "", proof: "" }])
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background py-3 text-sm font-semibold text-text-secondary hover:border-primary/40 hover:text-foreground"
                >
                  <Plus className="h-4 w-4" /> Add Another Milestone
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-extrabold">Verification Docs</h2>
              <Field label="Government ID" placeholder="Upload PDF or image" upload />
              <Field label="Supporting Documents" placeholder="Admission letter, business plan…" upload />
              <Field label="Social / Public Links (optional)" placeholder="Twitter, LinkedIn…" />
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl font-extrabold">Review & Submit</h2>
              <p className="mt-2 text-sm text-text-secondary">Validators will review your campaign before it goes live.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Type", type ?? "-"],
                  ["Title", "Help Amaka Finish Medical School"],
                  ["Goal", "$6,300 cUSD"],
                  ["Milestones", `${milestones.length} configured`],
                  ["Recipient Type", "Institution"],
                  ["Verification", "ID + 2 docs uploaded"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-border bg-background p-4">
                    <div className="text-[10px] uppercase tracking-wider text-text-muted">{k}</div>
                    <div className="mt-1 text-sm font-semibold">{v}</div>
                  </div>
                ))}
              </div>
              <button className="mt-8 w-full rounded-xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground hover:brightness-110 hover:glow-yellow">
                Submit for Validation
              </button>
            </div>
          )}

          {/* Nav */}
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <button
              disabled={step === 0}
              onClick={() => setStep(Math.max(0, step - 1))}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <span className="text-xs text-text-muted">Step {step + 1} of {steps.length}</span>
            <button
              disabled={step === steps.length - 1}
              onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Field({ label, placeholder, textarea, upload }: { label: string; placeholder?: string; textarea?: boolean; upload?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</span>
      {upload ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-background px-4 py-8 text-sm text-text-muted hover:border-primary/40">
          {placeholder ?? "Upload"}
        </div>
      ) : textarea ? (
        <textarea
          rows={5}
          placeholder={placeholder}
          className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50"
        />
      ) : (
        <input
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50"
        />
      )}
    </label>
  );
}
