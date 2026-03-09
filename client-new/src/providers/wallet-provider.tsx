'use client';

import React, { FC, ReactNode, useMemo, useEffect, createContext, useContext, useState } from 'react';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModal } from '@/components/features/wallet/wallet-modal';

// Wallet Modal Context
interface WalletModalContextState {
  visible: boolean;
  setVisible: (open: boolean) => void;
}

const WalletModalContext = createContext<WalletModalContextState | null>(null);

export function useWalletModal() {
  const context = useContext(WalletModalContext);
  if (!context) {
    throw new Error("useWalletModal must be used within a WalletContextProvider");
  }
  return context;
}

// Wallet Modal Provider Component
function WalletModalProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  return (
    <WalletModalContext.Provider value={{ visible, setVisible }}>
      {children}
      {visible && <WalletModal />}
    </WalletModalContext.Provider>
  );
}

// Main Wallet Context Provider
interface WalletContextProviderProps {
  children: ReactNode;
}


export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  // Use configured RPC endpoint, fallback to public devnet endpoint.
  const endpoint = useMemo(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    console.log('🌐 Solana endpoint:', rpcUrl);
    return rpcUrl;
  }, []);


  const wallets = useMemo(() => {
    const walletAdapters = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ];
    console.log('👛 Wallet adapters initialized:', walletAdapters.map(w => w.name));
    return walletAdapters;
  }, []);

  const onError = (error: Error) => {
    console.error('🚨 Wallet error:', error);
  };

  // Set up wallet event listeners
  useEffect(() => {
    const setupWalletListeners = (wallet: any) => {
      if (!wallet?.adapter) return;

      wallet.adapter.on('connect', () => {
        console.log('✅ Wallet connected');
      });

      wallet.adapter.on('disconnect', () => {
        console.log('🔌 Wallet disconnected');
        localStorage.removeItem('trend-auth-token');
      });

      wallet.adapter.on('error', onError);

      return () => {
        wallet.adapter.off('connect');
        wallet.adapter.off('disconnect');
        wallet.adapter.off('error');
      };
    };

    // Set up listeners for each wallet
    const cleanupFns = wallets.map(setupWalletListeners);

    return () => {
      cleanupFns.forEach(cleanup => cleanup && cleanup());
    };
  }, [wallets]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={true}
        onError={(error: Error) => {
          console.error('🚨 Wallet error:', error);
        }}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
