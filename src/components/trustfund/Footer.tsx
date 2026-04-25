import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-black">
                T
              </span>
              <span className="text-lg font-extrabold text-primary">TruSTFUnd</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-text-secondary">
              Trustless, milestone-gated funding. Powered by Celo. Secured by proof.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-4">
            {[
              { h: "Product", l: ["Explore", "Create", "Validators"] },
              { h: "Company", l: ["About", "How It Works", "Docs"] },
              { h: "Community", l: ["Twitter / X", "Telegram", "Discord"] },
              { h: "Legal", l: ["Terms", "Privacy", "Risk"] },
            ].map((c) => (
              <div key={c.h}>
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {c.h}
                </div>
                <ul className="space-y-2 text-text-secondary">
                  {c.l.map((i) => (
                    <li key={i} className="hover:text-foreground transition cursor-pointer">{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-text-muted md:flex-row">
          <span>© {new Date().getFullYear()} TruSTFUnd. All rights reserved.</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Built on Celo · cUSD settlement
          </span>
        </div>
      </div>
    </footer>
  );
}