import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import nacl from 'tweetnacl';

export interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
  uiAmount: number;
}

export interface WalletInfo {
  address: string;
  balance: number;
  tokenBalances: TokenBalance[];
}

export class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
  }

  async getWalletInfo(walletAddress: string): Promise<WalletInfo> {
    try {
      const publicKey = new PublicKey(walletAddress);
      
      // Get SOL balance
      const balance = await this.connection.getBalance(publicKey);
      const solBalance = balance / 1e9; // Convert lamports to SOL

      // Get token accounts
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      const tokenBalances: TokenBalance[] = tokenAccounts.value.map(account => {
        const parsedInfo = account.account.data.parsed.info;
        return {
          mint: parsedInfo.mint,
          amount: parsedInfo.tokenAmount.amount,
          decimals: parsedInfo.tokenAmount.decimals,
          uiAmount: parsedInfo.tokenAmount.uiAmount || 0
        };
      });

      return {
        address: walletAddress,
        balance: solBalance,
        tokenBalances
      };
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      throw new Error('Failed to fetch wallet information');
    }
  }

  async getTokenBalances(walletAddress: string): Promise<TokenBalance[]> {
    try {
      const walletInfo = await this.getWalletInfo(walletAddress);
      return walletInfo.tokenBalances;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      throw new Error('Failed to fetch token balances');
    }
  }

  async verifySignature(
    signature: number[] | Uint8Array,
    message: string,
    publicKey: string
  ): Promise<boolean> {
    try {
      // Convert message to bytes
      const messageBytes = new TextEncoder().encode(message);
      
      // Ensure signature is Uint8Array
      const signatureBytes = Uint8Array.from(signature);
      
      // Convert public key to bytes
      const publicKeyObj = new PublicKey(publicKey);
      const publicKeyBytes = publicKeyObj.toBytes();

      // Verify using nacl.sign.detached.verify
      return nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes
      );
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  async getTokenMetadata(mintAddress: string): Promise<any> {
    try {
      // This would typically use Metaplex or similar for token metadata
      // For now, return basic info
      return {
        mint: mintAddress,
        name: 'Unknown Token',
        symbol: 'UNK',
        decimals: 9,
        image: null
      };
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      return null;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const version = await this.connection.getVersion();
      return !!version;
    } catch (error) {
      console.error('Solana RPC health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const solanaService = new SolanaService();
