'use client';

import { WalletContextProvider } from './wallet-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WalletContextProvider>
      {children}
    </WalletContextProvider>
  );
}

// Export individual providers and hooks
export { WalletContextProvider, useWalletModal } from './wallet-provider';
