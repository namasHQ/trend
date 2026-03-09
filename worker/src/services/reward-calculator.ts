import { DatabaseService } from './database';
import { logger } from '../utils/logger';
import * as nacl from 'tweetnacl';
import * as bs58 from 'bs58';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';

export interface PerformanceData {
  price_change_24h: number;
  volume_24h: number;
  holders_growth: number;
  liquidity_score: number;
  calculated_at: Date;
}

export interface RewardDistribution {
  coin_spotter: {
    user_id: string;
    amount: number;
    percentage: number;
  };
  container_contributors: Array<{
    user_id: string;
    amount: number;
    percentage: number;
    contribution_score: number;
  }>;
  early_supporters: Array<{
    user_id: string;
    amount: number;
    percentage: number;
    support_score: number;
  }>;
  total_amount: number;
}

export class RewardCalculator {
  private solanaConnection: Connection;
  private oraclePrivateKey: Uint8Array;
  private rewardMintAddress: PublicKey;
  private escrowAccount: PublicKey;

  constructor(private database: DatabaseService, private logger?: any) {
    this.solanaConnection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com'
    );
    
    this.oraclePrivateKey = bs58.decode(process.env.ORACLE_PRIVATE_KEY || '');
    this.rewardMintAddress = new PublicKey(process.env.REWARD_MINT_ADDRESS || '');
    this.escrowAccount = new PublicKey(process.env.ESCROW_ACCOUNT || '');
  }

  async calculateRewards(coinId: string, performanceData: PerformanceData): Promise<any> {
    try {
      logger.info(`Calculating rewards for coin ${coinId}`);

      // 1. Calculate performance score
      const performanceScore = this.calculatePerformanceScore(performanceData);
      
      // 2. Determine reward tier
      const rewardTier = this.determineRewardTier(performanceScore);
      
      if (rewardTier === 'no_reward') {
        logger.info(`Coin ${coinId} does not meet reward threshold`);
        return { status: 'no_reward', score: performanceScore };
      }

      // 3. Get coin and container data
      const coin = await this.database.getCoin(coinId);
      if (!coin) {
        throw new Error(`Coin ${coinId} not found`);
      }

      const container = await this.database.getContainer(coin.container_id);
      if (!container) {
        throw new Error(`Container ${coin.container_id} not found`);
      }

      // 4. Calculate total reward amount
      const totalReward = this.calculateTotalReward(rewardTier, performanceScore);

      // 5. Distribute rewards
      const distribution = await this.distributeRewards(coin, container, totalReward);

      // 6. Create reward distribution event
      const distributionEvent = await this.createDistributionEvent(coinId, distribution);

      // 7. Process on-chain payouts
      await this.processOnChainPayouts(distribution);

      logger.info(`Rewards calculated for coin ${coinId}: ${totalReward} $TREND`);

      return {
        status: 'success',
        coin_id: coinId,
        performance_score: performanceScore,
        reward_tier: rewardTier,
        total_reward: totalReward,
        distribution,
        distribution_event_id: distributionEvent.id
      };

    } catch (error) {
      logger.error('Error calculating rewards:', error);
      throw error;
    }
  }

  async updateCoinPerformance(coinId: string, metrics: any): Promise<any> {
    try {
      // Update coin metrics in database
      await this.database.updateCoinMetrics(coinId, metrics);
      
      // Check if coin meets reward threshold
      const performanceData: PerformanceData = {
        price_change_24h: metrics.price_change_24h || 0,
        volume_24h: metrics.volume_24h || 0,
        holders_growth: metrics.holders_growth || 0,
        liquidity_score: metrics.liquidity_score || 0,
        calculated_at: new Date()
      };

      const performanceScore = this.calculatePerformanceScore(performanceData);
      
      if (performanceScore >= 500) { // Medium threshold
        // Queue reward calculation
        return { should_calculate_rewards: true, performance_score: performanceScore };
      }

      return { should_calculate_rewards: false, performance_score: performanceScore };

    } catch (error) {
      logger.error('Error updating coin performance:', error);
      throw error;
    }
  }

  private calculatePerformanceScore(data: PerformanceData): number {
    const weights = {
      price_change: 0.4,
      volume: 0.3,
      holders_growth: 0.2,
      liquidity: 0.1
    };

    // Normalize values to 0-100 scale
    const normalizedPriceChange = Math.min(Math.max(data.price_change_24h, 0), 100);
    const normalizedVolume = Math.min(Math.max(data.volume_24h / 1000000, 0), 100); // 1M = 100
    const normalizedHolders = Math.min(Math.max(data.holders_growth, 0), 100);
    const normalizedLiquidity = Math.min(Math.max(data.liquidity_score, 0), 100);

    const score = 
      weights.price_change * normalizedPriceChange +
      weights.volume * normalizedVolume +
      weights.holders_growth * normalizedHolders +
      weights.liquidity * normalizedLiquidity;

    return Math.round(score);
  }

  private determineRewardTier(score: number): string {
    if (score < 200) return 'no_reward';
    if (score < 500) return 'small';
    if (score < 750) return 'medium';
    if (score < 900) return 'big';
    return 'jackpot';
  }

  private calculateTotalReward(tier: string, score: number): number {
    const baseRewards = {
      small: 1000,
      medium: 5000,
      big: 15000,
      jackpot: 50000
    };

    const baseReward = baseRewards[tier as keyof typeof baseRewards] || 0;
    const multiplier = score / 1000; // Scale based on performance

    return Math.round(baseReward * multiplier);
  }

  private async distributeRewards(coin: any, container: any, totalReward: number): Promise<RewardDistribution> {
    // 50% to coin spotter
    const coinSpotterReward = Math.floor(totalReward * 0.5);
    
    // 30% to container contributors
    const contributorsReward = Math.floor(totalReward * 0.3);
    
    // 20% to early supporters
    const supportersReward = Math.floor(totalReward * 0.2);

    // Get contributors and supporters
    const contributors = await this.database.getContainerContributors(container.id);
    const supporters = await this.database.getEarlySupporters(container.id, coin.created_at);

    // Distribute among contributors
    const contributorDistributions = this.distributeAmongContributors(contributors, contributorsReward);
    
    // Distribute among supporters
    const supporterDistributions = this.distributeAmongSupporters(supporters, supportersReward);

    return {
      coin_spotter: {
        user_id: coin.added_by,
        amount: coinSpotterReward,
        percentage: 50
      },
      container_contributors: contributorDistributions,
      early_supporters: supporterDistributions,
      total_amount: totalReward
    };
  }

  private distributeAmongContributors(contributors: any[], totalAmount: number): any[] {
    if (contributors.length === 0) return [];

    const totalScore = contributors.reduce((sum, c) => sum + c.contribution_score, 0);
    
    return contributors.map(contributor => ({
      user_id: contributor.user_id,
      amount: Math.floor((contributor.contribution_score / totalScore) * totalAmount),
      percentage: (contributor.contribution_score / totalScore) * 30,
      contribution_score: contributor.contribution_score
    }));
  }

  private distributeAmongSupporters(supporters: any[], totalAmount: number): any[] {
    if (supporters.length === 0) return [];

    const totalScore = supporters.reduce((sum, s) => sum + s.support_score, 0);
    
    return supporters.map(supporter => ({
      user_id: supporter.user_id,
      amount: Math.floor((supporter.support_score / totalScore) * totalAmount),
      percentage: (supporter.support_score / totalScore) * 20,
      support_score: supporter.support_score
    }));
  }

  private async createDistributionEvent(coinId: string, distribution: RewardDistribution): Promise<any> {
    return await this.database.createRewardDistributionEvent({
      coin_id: coinId,
      distribution_json: distribution,
      total_amount: distribution.total_amount
    });
  }

  private async processOnChainPayouts(distribution: RewardDistribution): Promise<void> {
    try {
      // Get all beneficiaries
      const beneficiaries = [
        distribution.coin_spotter,
        ...distribution.container_contributors,
        ...distribution.early_supporters
      ];

      // Group by user for batch processing
      const userRewards = new Map<string, number>();
      
      for (const beneficiary of beneficiaries) {
        const current = userRewards.get(beneficiary.user_id) || 0;
        userRewards.set(beneficiary.user_id, current + beneficiary.amount);
      }

      // Process each user's rewards
      for (const [userId, totalAmount] of userRewards) {
        const user = await this.database.getUser(userId);
        
        if (user?.onchain_pubkey && totalAmount > 0) {
          try {
            await this.sendOnChainReward(user.onchain_pubkey, totalAmount);
            
            // Update pending rewards status
            await this.database.updatePendingRewardsStatus(userId, 'withdrawn');
            
            logger.info(`Sent ${totalAmount} $TREND to user ${userId}`);
          } catch (error) {
            logger.error(`Failed to send reward to user ${userId}:`, error);
            await this.database.updatePendingRewardsStatus(userId, 'failed');
          }
        } else {
          // Store as pending reward
          await this.database.createPendingReward({
            user_id: userId,
            amount: totalAmount,
            status: 'pending',
            reason: 'reward_distribution'
          });
        }
      }

    } catch (error) {
      logger.error('Error processing on-chain payouts:', error);
      throw error;
    }
  }

  private async sendOnChainReward(recipientPubkey: string, amount: number): Promise<string> {
    try {
      const recipient = new PublicKey(recipientPubkey);
      const recipientTokenAccount = await getAssociatedTokenAddress(
        this.rewardMintAddress,
        recipient
      );

      const escrowTokenAccount = await getAssociatedTokenAddress(
        this.rewardMintAddress,
        this.escrowAccount
      );

      const transaction = new Transaction().add(
        createTransferInstruction(
          escrowTokenAccount,
          recipientTokenAccount,
          this.escrowAccount,
          amount
        )
      );

      // Sign and send transaction
      const signature = await this.solanaConnection.sendTransaction(transaction, []);
      
      // Wait for confirmation
      await this.solanaConnection.confirmTransaction(signature);
      
      return signature;
    } catch (error) {
      logger.error('Error sending on-chain reward:', error);
      throw error;
    }
  }

  async calculateDailyRewards(): Promise<void> {
    try {
      logger.info('Calculating daily rewards...');
      // Implementation for daily reward calculation
      // This would typically process all active users and calculate their daily earnings
    } catch (error) {
      logger.error('Error calculating daily rewards:', error);
      throw error;
    }
  }

  async calculateWeeklyRewards(): Promise<void> {
    try {
      logger.info('Calculating weekly rewards...');
      // Implementation for weekly reward calculation
      // This would typically process weekly performance bonuses
    } catch (error) {
      logger.error('Error calculating weekly rewards:', error);
      throw error;
    }
  }

  async calculateCoinPerformanceRewards(coinId: string): Promise<void> {
    try {
      logger.info(`Calculating coin performance rewards for ${coinId}...`);
      // Implementation for coin performance rewards
      await this.calculateRewards(coinId, {
        price_change_24h: 0,
        volume_24h: 0,
        holders_growth: 0,
        liquidity_score: 0,
        calculated_at: new Date()
      });
    } catch (error) {
      logger.error('Error calculating coin performance rewards:', error);
      throw error;
    }
  }
}

