import { DatabaseService } from './database';
import { logger } from '../utils/logger';
import axios from 'axios';

export interface CoinMetrics {
  price: number;
  volume_24h: number;
  holders: number;
  liquidity_usd: number;
  price_change_24h: number;
  market_cap: number;
  updated_at: Date;
}

export class CoinTracker {
  private pumpFunApiUrl: string;
  private solanaRpcUrl: string;

  constructor(private database: DatabaseService) {
    this.pumpFunApiUrl = process.env.PUMPFUN_API_URL || 'https://frontend-api.pump.fun';
    this.solanaRpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  }

  async updateAllCoins(): Promise<void> {
    try {
      logger.info('Starting coin metrics update...');
      
      const coins = await this.database.getActiveCoins();
      logger.info(`Found ${coins.length} active coins to update`);

      for (const coin of coins) {
        try {
          await this.updateCoinMetrics(coin.id, coin.mint_address);
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          logger.error(`Error updating coin ${coin.id}:`, error);
        }
      }

      logger.info('Coin metrics update completed');
    } catch (error) {
      logger.error('Error updating all coins:', error);
      throw error;
    }
  }

  async updateCoinMetrics(coinId: string, mintAddress: string): Promise<CoinMetrics | null> {
    try {
      // Fetch metrics from PumpFun API
      const metrics = await this.fetchPumpFunMetrics(mintAddress);
      
      if (!metrics) {
        logger.warn(`No metrics found for coin ${mintAddress}`);
        return null;
      }

      // Store metrics in database
      await this.database.storeCoinMetrics(coinId, metrics);

      logger.info(`Updated metrics for coin ${coinId}: price=${metrics.price}, volume=${metrics.volume_24h}`);
      
      return metrics;
    } catch (error) {
      logger.error(`Error updating metrics for coin ${coinId}:`, error);
      throw error;
    }
  }

  private async fetchPumpFunMetrics(mintAddress: string): Promise<CoinMetrics | null> {
    try {
      // Try PumpFun API first
      const pumpFunResponse = await axios.get(`${this.pumpFunApiUrl}/coins/${mintAddress}`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'TREND-Platform/1.0'
        }
      });

      if (pumpFunResponse.data) {
        return this.parsePumpFunMetrics(pumpFunResponse.data);
      }
    } catch (error) {
      logger.warn(`PumpFun API failed for ${mintAddress}, trying Solana RPC...`);
    }

    try {
      // Fallback to Solana RPC
      return await this.fetchSolanaMetrics(mintAddress);
    } catch (error) {
      logger.error(`Failed to fetch metrics for ${mintAddress}:`, error);
      return null;
    }
  }

  private parsePumpFunMetrics(data: any): CoinMetrics {
    return {
      price: parseFloat(data.price || '0'),
      volume_24h: parseFloat(data.volume_24h || '0'),
      holders: parseInt(data.holders || '0'),
      liquidity_usd: parseFloat(data.liquidity_usd || '0'),
      price_change_24h: parseFloat(data.price_change_24h || '0'),
      market_cap: parseFloat(data.market_cap || '0'),
      updated_at: new Date()
    };
  }

  private async fetchSolanaMetrics(mintAddress: string): Promise<CoinMetrics | null> {
    try {
      // This would implement Solana RPC calls to get token metrics
      // For now, return null as this requires more complex implementation
      logger.warn(`Solana RPC metrics not implemented for ${mintAddress}`);
      return null;
    } catch (error) {
      logger.error(`Error fetching Solana metrics for ${mintAddress}:`, error);
      return null;
    }
  }

  async calculatePerformanceScore(coinId: string): Promise<number> {
    try {
      const metrics = await this.database.getLatestCoinMetrics(coinId);
      
      if (!metrics) {
        return 0;
      }

      // Calculate performance score based on multiple factors
      const priceScore = Math.min(Math.max(metrics.price_change_24h, 0), 100);
      const volumeScore = Math.min(Math.max(metrics.volume_24h / 1000000, 0), 100);
      const holdersScore = Math.min(Math.max(metrics.holders, 0), 100);
      const liquidityScore = Math.min(Math.max(metrics.liquidity_usd / 100000, 0), 100);

      const performanceScore = 
        (priceScore * 0.4) +
        (volumeScore * 0.3) +
        (holdersScore * 0.2) +
        (liquidityScore * 0.1);

      return Math.round(performanceScore);
    } catch (error) {
      logger.error(`Error calculating performance score for coin ${coinId}:`, error);
      return 0;
    }
  }

  async detectHighPerformers(): Promise<string[]> {
    try {
      const coins = await this.database.getActiveCoins();
      const highPerformers: string[] = [];

      for (const coin of coins) {
        const score = await this.calculatePerformanceScore(coin.id);
        
        if (score >= 500) { // High performance threshold
          highPerformers.push(coin.id);
          logger.info(`High performer detected: ${coin.id} (score: ${score})`);
        }
      }

      return highPerformers;
    } catch (error) {
      logger.error('Error detecting high performers:', error);
      return [];
    }
  }

  async getTopPerformers(limit: number = 10): Promise<any[]> {
    try {
      const coins = await this.database.getActiveCoins();
      const performers: any[] = [];

      for (const coin of coins) {
        const score = await this.calculatePerformanceScore(coin.id);
        performers.push({
          coin_id: coin.id,
          mint_address: coin.mint_address,
          symbol: coin.symbol,
          name: coin.name,
          performance_score: score,
          container_id: coin.container_id
        });
      }

      // Sort by performance score and return top performers
      return performers
        .sort((a, b) => b.performance_score - a.performance_score)
        .slice(0, limit);
    } catch (error) {
      logger.error('Error getting top performers:', error);
      return [];
    }
  }
}

