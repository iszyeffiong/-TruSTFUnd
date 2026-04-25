export function ProgressBar({
  value,
  goal,
  showLabel = true,
}: {
  value: number;
  goal: number;
  showLabel?: boolean;
}) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/40">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary shadow-[0_0_12px_rgba(252,255,82,0.6)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="font-bold text-primary">{pct}% Funded</span>
          <span className="text-text-secondary">
            ${value.toLocaleString()} of ${goal.toLocaleString()} cUSD
          </span>
        </div>
      )}
    </div>
  );
}