import { Link } from "@tanstack/react-router";
import { Users, Clock, ShieldCheck } from "lucide-react";
import { Badge } from "./Badge";
import { ProgressBar } from "./ProgressBar";
import type { Campaign } from "@/lib/mock-data";

export function CampaignCard({ c }: { c: Campaign }) {
  const completed = c.milestones.filter((m) => m.status === "completed").length;
  return (
    <Link
      to="/campaign/$id"
      params={{ id: c.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:card-glow"
    >
      <div className="relative h-44 w-full overflow-hidden bg-[#0A0A0A]">
        {/* Color Grade Overlay: Subtle yellow glow in top-left, fading to dark */}
        <div 
          className="absolute inset-0 opacity-40 mix-blend-screen" 
          style={{ 
            background: 'radial-gradient(circle at 0% 0%, var(--primary) 0%, transparent 70%)' 
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant={c.type === "crowdfund" ? "crowdfund" : "startup"}>
            {c.type === "crowdfund" ? "Crowdfund" : "Startup"}
          </Badge>
          {c.verified && (
            <Badge variant="verified">
              <ShieldCheck className="h-3 w-3" /> Verified
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{c.category}</div>
          <h3 className="mt-1 line-clamp-1 text-lg font-bold leading-tight text-foreground">
            {c.title}
          </h3>
        </div>
        <p className="line-clamp-2 text-sm text-text-secondary">{c.description}</p>
        <ProgressBar value={c.raised} goal={c.goal} />
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span className="rounded-full bg-secondary/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight text-text-muted">
            {completed} of {c.milestones.length} milestones
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-4 text-xs text-text-secondary">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {c.donors}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {c.daysLeft}d left
            </span>
          </div>
          <span className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:scale-105 hover:glow-yellow">
            Fund
          </span>
        </div>
      </div>
    </Link>
  );
}