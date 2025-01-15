'use client';
import { createConfig, WagmiProvider, http } from 'wagmi';
import { base, mainnet, polygon, arbitrum, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { walletConnect, injected, metaMask, safe } from 'wagmi/connectors';

const queryClient = new QueryClient();

const config = createConfig({
  chains: [mainnet, base, sepolia, polygon, arbitrum],
  connectors: [
    injected(),
    walletConnect({ projectId: '4c7bbc04a1721b14042a69d958c66599' }),
    metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
} 