import { useToasts } from "@/lib/use-toast";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export function ToastHost() {
  const items = useToasts();
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-2">
      {items.map((t) => {
        const tone =
          t.tone === "success"
            ? "border-primary/50 bg-card text-primary"
            : t.tone === "error"
              ? "border-danger/50 bg-card text-danger"
              : "border-border bg-card text-foreground";
        const Icon = t.tone === "success" ? CheckCircle2 : t.tone === "error" ? AlertCircle : Info;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md animate-in slide-in-from-right ${tone}`}
          >
            <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div className="text-sm font-semibold">{t.message}</div>
          </div>
        );
      })}
    </div>
  );
}
