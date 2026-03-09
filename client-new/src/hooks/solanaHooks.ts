import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useState } from 'react';
import { createTrend } from '@/api';

// Types for Solana operations
export interface CreateTrendParams {
  title: string;
  description: string;
  coinList: string[];
  stakeAmount?: number; // Optional stake in SOL
}

export interface CreateMarketParams {
  trendId: string;
  prediction: 'bullish' | 'bearish';
  stakeAmount: number;
  timeframe: number; // days
}

export interface VoteParams {
  trendId: string;
  voteType: 'up' | 'down';
  stakeAmount?: number;
}

export interface WalletBalance {
  sol: number;
  trend: number;
  usdc: number;
}

// Hook for wallet connection status and info
export function useWalletConnection() {
  const wallet = useWallet();
  
  return {
    isConnected: wallet.connected,
    publicKey: wallet.publicKey,
    walletAddress: wallet.publicKey?.toString(),
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    connecting: wallet.connecting,
    disconnecting: wallet.disconnecting,
  };
}

// Hook for wallet balances
export function useWalletBalances() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  return useQuery({
    queryKey: ['wallet-balances', publicKey?.toString()],
    queryFn: async (): Promise<WalletBalance> => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      try {
        // Get SOL balance
        const solBalance = await connection.getBalance(publicKey);
        const sol = solBalance / 1e9; // Convert lamports to SOL

        // Get token balances (TREND, USDC)
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        });
        
        let trend = 0;
        let usdc = 0;
        
        // TREND token mint (placeholder - replace with actual mint)
        const TREND_MINT = new PublicKey('YourTRENDTokenMintAddress');
        // USDC mint
        const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
        
        for (const account of tokenAccounts.value) {
          const mint = account.account.data.parsed.info.mint;
          const amount = account.account.data.parsed.info.tokenAmount.uiAmount || 0;
          
          if (mint === TREND_MINT.toString()) {
            trend = amount;
          } else if (mint === USDC_MINT.toString()) {
            usdc = amount;
          }
        }
        
        return { sol, trend, usdc };
      } catch (error) {
        console.error('Error fetching wallet balances:', error);
        throw error;
      }
    },
    enabled: !!publicKey,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Hook for creating trends with wallet signature
export function useCreateTrend() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateTrendParams) => {
      if (!publicKey || !signTransaction) {
        throw new Error('Wallet not connected');
      }

      try {
        // Create transaction for trend creation (only for signing, not sending)
        const transaction = new Transaction();

        // Get recent blockhash
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        // Add instruction to create trend (this would be a custom program instruction)
        // For now, we'll simulate with a simple transfer
        if (params.stakeAmount && params.stakeAmount > 0) {
          transaction.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: new PublicKey('YourTrendProgramAddress'), // Replace with actual program
              lamports: params.stakeAmount * 1e9, // Convert SOL to lamports
            })
          );
        }

        // Sign transaction (only for signature, not sending)
        const signedTransaction = await signTransaction(transaction);
        const signature = signedTransaction.signatures[0].signature; // Get the signature from the signed transaction

        if (!signature) {
          throw new Error('Failed to get signature from transaction');
        }

        // Call backend API to create the trend
        const apiResponse = await createTrend({
          title: params.title,
          description: params.description,
          coinList: params.coinList,
          source: 'wallet',
        });

        // Return both signature and API response
        return {
          signature: Array.from(signature), // Convert Uint8Array to array for JSON
          trendData: params,
          walletAddress: publicKey.toString(),
          apiResponse,
        };
      } catch (error) {
        console.error('Error creating trend:', error);
        if (error instanceof Error && error.message.includes('NetworkError')) {
          throw new Error('Network error: Unable to connect to Solana RPC. Please check your connection and try again.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate trends query to refetch data
      queryClient.invalidateQueries({ queryKey: ['trends'] });
    },
  });
}

// Hook for creating markets with wallet signature
export function useCreateMarket() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateMarketParams) => {
      if (!publicKey || !signTransaction) {
        throw new Error('Wallet not connected');
      }

      try {
        // Create transaction for market creation (only for signing, not sending)
        const transaction = new Transaction();

        // Get recent blockhash
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        // Add instruction to create market (custom program instruction)
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey('YourMarketProgramAddress'), // Replace with actual program
            lamports: params.stakeAmount * 1e9, // Convert SOL to lamports
          })
        );

        // Sign transaction (only for signature, not sending)
        const signedTransaction = await signTransaction(transaction);
        const signature = signedTransaction.signatures[0].signature; // Get the signature from the signed transaction

        if (!signature) {
          throw new Error('Failed to get signature from transaction');
        }

        // Return transaction signature for backend verification (do not send or confirm)
        return {
          signature: Array.from(signature), // Convert Uint8Array to array for JSON
          marketData: params,
          walletAddress: publicKey.toString(),
        };
      } catch (error) {
        console.error('Error creating market:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate bets/markets query
      queryClient.invalidateQueries({ queryKey: ['bets'] });
    },
  });
}

// Hook for voting with wallet signature
export function useVote() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: VoteParams) => {
      if (!publicKey || !signTransaction) {
        throw new Error('Wallet not connected');
      }

      try {
        // Create transaction for voting (only for signing, not sending)
        const transaction = new Transaction();

        // Get recent blockhash
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        // Add instruction to vote (custom program instruction)
        if (params.stakeAmount && params.stakeAmount > 0) {
          transaction.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: new PublicKey('YourVotingProgramAddress'), // Replace with actual program
              lamports: params.stakeAmount * 1e9, // Convert SOL to lamports
            })
          );
        }

        // Sign transaction (only for signature, not sending)
        const signedTransaction = await signTransaction(transaction);
        const signature = signedTransaction.signatures[0].signature; // Get the signature from the signed transaction

        if (!signature) {
          throw new Error('Failed to get signature from transaction');
        }

        // Return transaction signature for backend verification (do not send or confirm)
        return {
          signature: Array.from(signature), // Convert Uint8Array to array for JSON
          voteData: params,
          walletAddress: publicKey.toString(),
        };
      } catch (error) {
        console.error('Error voting:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate trends query to update vote counts
      queryClient.invalidateQueries({ queryKey: ['trends'] });
    },
  });
}

// Hook for signing messages (for authentication)
export function useSignMessage() {
  const { publicKey, signMessage } = useWallet();
  
  return useMutation({
    mutationFn: async (message: string) => {
      if (!publicKey || !signMessage) {
        throw new Error('Wallet not connected');
      }
      
      try {
        const messageBytes = new TextEncoder().encode(message);
        const signature = await signMessage(messageBytes);
        
        return {
          signature: Array.from(signature),
          message,
          walletAddress: publicKey.toString(),
        };
      } catch (error) {
        console.error('Error signing message:', error);
        throw error;
      }
    },
  });
}

// Hook for checking if wallet is required for an action
export function useWalletRequired() {
  const { isConnected } = useWalletConnection();
  
  return {
    isRequired: true, // All Solana operations require wallet
    isConnected,
    canProceed: isConnected,
  };
}
