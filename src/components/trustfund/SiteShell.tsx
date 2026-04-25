import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Web3Provider } from "./Web3Provider";
import { ToastHost } from "./ToastHost";

export function SiteShell({
  children,
  hideWallet,
}: {
  children: ReactNode;
  hideWallet?: boolean;
}) {
  return (
    <Web3Provider>
      <div className="flex min-h-screen flex-col bg-background text-foreground" suppressHydrationWarning>
        <Navbar hideWallet={hideWallet} />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastHost />
      </div>
    </Web3Provider>
  );
}
