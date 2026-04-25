import { type ReactNode, useEffect } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { WagmiProvider, useConnect, useAccount } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig } from "@/lib/wagmi";

const queryClient = new QueryClient();

function MiniPayAutoConnect() {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();

  useEffect(() => {
    // Check if we are in a MiniPay environment and not yet connected
    const isMiniPay = typeof window !== "undefined" && (window as any).ethereum?.isMiniPay;
    
    if (isMiniPay && !isConnected) {
      const injectedConnector = connectors.find((c) => c.id === "injected");
      if (injectedConnector) {
        connect({ connector: injectedConnector });
      }
    }
  }, [isConnected, connect, connectors]);

  return null;
}

function InnerProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#FCFF52",
            accentColorForeground: "#000000",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "small",
          })}
          modalSize="compact"
          appInfo={{ appName: "TruSTFUnd" }}
        >
          <MiniPayAutoConnect />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function Web3Provider({ children }: { children: ReactNode }) {
  // Render children directly on server (no wallet context needed for SSR/SEO).
  // On client, wrap with full Web3 stack so hooks like useAccount work.
  return (
    <ClientOnly fallback={<>{children}</>}>
      <InnerProviders>{children}</InnerProviders>
    </ClientOnly>
  );
}
