import { http, createConfig } from "wagmi";
import { celo } from "wagmi/chains";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

// cUSD on Celo Mainnet
export const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a" as const;

// Minimal ERC-20 ABI (balanceOf + decimals + symbol)
export const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// WalletConnect projectId — works without one in dev but warns. Replace with real one for prod.
const WC_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "trustfund-dev-placeholder";

export const wagmiConfig = createConfig({
  chains: [celo],
  connectors: [
    injected({ shimDisconnect: true }), // covers MiniPay, MetaMask, Rabby, and other EIP-6963 wallets
    walletConnect({
      projectId: WC_PROJECT_ID,
      showQrModal: false, // RainbowKit renders its own modal
      metadata: {
        name: "TruSTFUnd",
        description: "Milestone-gated crowdfunding on Celo",
        url: "https://trustfund.app",
        icons: [],
      },
    }),
  ],
  transports: {
    [celo.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
