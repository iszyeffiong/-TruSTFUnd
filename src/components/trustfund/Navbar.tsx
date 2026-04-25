import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Wallet } from "lucide-react";
import { ClientOnly } from "@tanstack/react-router";
import { WalletButton } from "./WalletButton";

const links = [
  { to: "/explore", label: "Explore" },
  { to: "/create", label: "Create" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/validator", label: "Validator" },
  { to: "/investor", label: "Investor" },
] as const;

export function Navbar({ hideWallet }: { hideWallet?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-5" suppressHydrationWarning>
        {/* Left Column: Logo */}
        <div className="flex flex-1 items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-black">
              T
            </span>
            <span className="text-lg font-extrabold tracking-tight text-primary">
              TruSTFUnd
            </span>
          </Link>
        </div>

        {/* Center Column: Menu */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground bg-secondary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right Column: Wallet Button or Spacer */}
        <div className="flex flex-1 items-center justify-end">
          {!hideWallet ? (
            <div className="hidden md:block">
              <ClientOnly
                fallback={
                  <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground opacity-70" disabled>
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </button>
                }
              >
                <WalletButton />
              </ClientOnly>
            </div>
          ) : (
            <div className="hidden md:block w-[140px]" /> /* Spacer to keep center balanced */
          )}

          <button
            className="rounded-lg border border-border p-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background/95 md:hidden">
          <div className="flex flex-col gap-1 px-5 py-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "text-foreground bg-secondary" }}
              >
                {l.label}
              </Link>
            ))}
            {!hideWallet && (
              <div className="mt-2">
                <ClientOnly
                  fallback={
                    <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground opacity-70" disabled>
                      <Wallet className="h-4 w-4" />
                      Connect Wallet
                    </button>
                  }
                >
                  <WalletButton />
                </ClientOnly>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}