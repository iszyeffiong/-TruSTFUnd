import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function SiteShell({
  children,
  hideWallet,
}: {
  children: ReactNode;
  hideWallet?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground" suppressHydrationWarning>
      <Navbar hideWallet={hideWallet} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
