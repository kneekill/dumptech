"use client";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { base } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
const { chains, publicClient } = configureChains([base], [publicProvider()]);

const queryClient = new QueryClient();
export function Providers({
  children,
  projectId,
}: {
  children: React.ReactNode;
  projectId: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { connectors } = getDefaultWallets({
    appName: "Dump Tech",
    projectId,
    chains,
  });

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
  });
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <QueryClientProvider client={queryClient}>
          {mounted && children}
        </QueryClientProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
