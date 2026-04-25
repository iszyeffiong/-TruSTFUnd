import type { ReactNode } from "react";

type Variant = "crowdfund" | "startup" | "verified" | "warning" | "danger" | "neutral";

const styles: Record<Variant, string> = {
  crowdfund: "bg-primary/15 text-primary border-primary/30",
  startup: "bg-startup/15 text-startup border-startup/30",
  verified: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  neutral: "bg-secondary text-text-secondary border-border",
};

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}