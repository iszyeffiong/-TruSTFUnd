import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { Wallet } from "lucide-react";
import { CUSD_ADDRESS, ERC20_ABI } from "@/lib/wagmi";

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:brightness-110 hover:glow-yellow"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2 text-sm font-bold text-white"
            >
              Wrong network
            </button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <CusdBalance address={account.address as `0x${string}`} />
            <button
              onClick={openAccountModal}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-bold text-foreground transition hover:border-primary/40"
            >
              <span className="h-2 w-2 rounded-full bg-success" />
              {account.displayName}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

function CusdBalance({ address }: { address: `0x${string}` }) {
  const { data: rawBalance } = useReadContract({
    address: CUSD_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
  });
  const { data: decimals } = useReadContract({
    address: CUSD_ADDRESS,
    abi: ERC20_ABI,
    functionName: "decimals",
  });

  const formatted =
    rawBalance !== undefined && decimals !== undefined
      ? Number(formatUnits(rawBalance as bigint, decimals as number)).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })
      : "-";

  return (
    <div className="hidden items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold text-primary sm:inline-flex">
      <span className="text-primary/70">cUSD</span>
      <span>{formatted}</span>
    </div>
  );
}
