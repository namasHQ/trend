import { Pool } from 'pg';
import { logger } from '../utils/logger';

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  // User operations
  async getUser(userId: string): Promise<any> {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await this.pool.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error getting user:', error);
      throw error;
    }
  }

  async getActiveUsers(): Promise<any[]> {
    try {
      const query = `
        SELECT u.id, u.display_name, u.email,
               COUNT(DISTINCT ts.id) as trends_created,
               COUNT(DISTINCT c.id) as coins_spotted,
               COALESCE(SUM(pr.amount), 0) as daily_earnings
        FROM users u
        LEFT JOIN trend_signals ts ON u.id = ts.user_id AND ts.created_at >= CURRENT_DATE
        LEFT JOIN coins c ON u.id = c.added_by AND c.created_at >= CURRENT_DATE
        LEFT JOIN pending_rewards pr ON u.id = pr.user_id AND pr.created_at >= CURRENT_DATE
        WHERE u.is_banned = false
        GROUP BY u.id, u.display_name, u.email
        HAVING COUNT(DISTINCT ts.id) > 0 OR COUNT(DISTINCT c.id) > 0
      `;
      
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting active users:', error);
      throw error;
    }
  }

  // Coin operations
  async getCoin(coinId: string): Promise<any> {
    try {
      const query = `
        SELECT c.*, tc.canonical_title as container_title
        FROM coins c
        LEFT JOIN trend_containers tc ON c.container_id = tc.id
        WHERE c.id = $1
      `;
      
      const result = await this.pool.query(query, [coinId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error getting coin:', error);
      throw error;
    }
  }

  async getPerformingCoins(): Promise<any[]> {
    try {
      const query = `
        SELECT c.id, c.mint_address, c.symbol, c.name,
               cm.price, cm.volume_24h, cm.holders,
               (cm.price - c.initial_price) / c.initial_price * 100 as price_change_24h,
               cm.holders - c.initial_holders as holders_growth,
               cm.liquidity_usd,
               json_build_object(
                 'price_change_24h', (cm.price - c.initial_price) / c.initial_price * 100,
                 'volume_24h', cm.volume_24h,
                 'holders_growth', cm.holders - c.initial_holders,
                 'liquidity_score', LEAST(cm.liquidity_usd / 100000, 100)
               ) as performance_data
        FROM coins c
        LEFT JOIN coin_metrics cm ON c.id = cm.coin_id
        WHERE cm.ts = (
          SELECT MAX(ts) FROM coin_metrics WHERE coin_id = c.id
        )
        AND (cm.price - c.initial_price) / c.initial_price * 100 > 50
        AND cm.volume_24h > 10000
        AND cm.holders > 100
      `;
      
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting performing coins:', error);
      throw error;
    }
  }

  async getHighPerformingCoins(): Promise<any[]> {
    try {
      const query = `
        SELECT c.id, c.mint_address, c.symbol,
               json_build_object(
                 'price', cm.price,
                 'volume_24h', cm.volume_24h,
                 'holders', cm.holders,
                 'liquidity_usd', cm.liquidity_usd,
                 'timestamp', cm.ts
               ) as latest_metrics
        FROM coins c
        LEFT JOIN coin_metrics cm ON c.id = cm.coin_id
        WHERE cm.ts = (
          SELECT MAX(ts) FROM coin_metrics WHERE coin_id = c.id
        )
        AND (cm.price - c.initial_price) / c.initial_price * 100 > 100
        AND cm.volume_24h > 50000
        AND cm.ts > NOW() - INTERVAL '1 hour'
      `;
      
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting high performing coins:', error);
      throw error;
    }
  }

  async updateCoinMetrics(coinId: string, metrics: any): Promise<void> {
    try {
      const query = `
        INSERT INTO coin_metrics (coin_id, ts, price, volume_24h, holders, liquidity_usd, extra)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (coin_id, ts) DO UPDATE SET
          price = EXCLUDED.price,
          volume_24h = EXCLUDED.volume_24h,
          holders = EXCLUDED.holders,
          liquidity_usd = EXCLUDED.liquidity_usd,
          extra = EXCLUDED.extra
      `;
      
      const values = [
        coinId,
        new Date(),
        metrics.price,
        metrics.volume_24h,
        metrics.holders,
        metrics.liquidity_usd,
        JSON.stringify(metrics.extra || {})
      ];
      
      await this.pool.query(query, values);
    } catch (error) {
      logger.error('Error updating coin metrics:', error);
      throw error;
    }
  }

  // Container operations
  async getContainer(containerId: string): Promise<any> {
    try {
      const query = 'SELECT * FROM trend_containers WHERE id = $1';
      const result = await this.pool.query(query, [containerId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error getting container:', error);
      throw error;
    }
  }

  async getContainerContributors(containerId: string): Promise<any[]> {
    try {
      const query = `
        SELECT ts.user_id, u.display_name,
               COUNT(ts.id) * 2 + COALESCE(SUM(v.vote), 0) as contribution_score
        FROM trend_signals ts
        LEFT JOIN users u ON ts.user_id = u.id
        LEFT JOIN votes v ON ts.id = v.signal_id
        WHERE ts.container_id = $1
        GROUP BY ts.user_id, u.display_name
        ORDER BY contribution_score DESC
      `;
      
      const result = await this.pool.query(query, [containerId]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting container contributors:', error);
      throw error;
    }
  }

  async getEarlySupporters(containerId: string, coinCreatedAt: Date): Promise<any[]> {
    try {
      const earlyWindow = new Date(coinCreatedAt.getTime() + 72 * 60 * 60 * 1000); // 72 hours
      
      const query = `
        SELECT v.user_id, u.display_name,
               COUNT(v.id) * 3 as support_score
        FROM votes v
        LEFT JOIN trend_signals ts ON v.signal_id = ts.id
        LEFT JOIN users u ON v.user_id = u.id
        WHERE ts.container_id = $1
        AND v.vote > 0
        AND v.created_at <= $2
        GROUP BY v.user_id, u.display_name
        ORDER BY support_score DESC
      `;
      
      const result = await this.pool.query(query, [containerId, earlyWindow]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting early supporters:', error);
      throw error;
    }
  }

  // Reward operations
  async createRewardDistributionEvent(data: any): Promise<any> {
    try {
      const query = `
        INSERT INTO reward_distribution_events (container_id, coin_id, distribution_json, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id
      `;
      
      const values = [
        data.container_id,
        data.coin_id,
        JSON.stringify(data.distribution_json)
      ];
      
      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating reward distribution event:', error);
      throw error;
    }
  }

  async createPendingReward(data: any): Promise<any> {
    try {
      const query = `
        INSERT INTO pending_rewards (user_id, container_id, coin_id, amount, status, reason, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id
      `;
      
      const values = [
        data.user_id,
        data.container_id,
        data.coin_id,
        data.amount,
        data.status,
        data.reason
      ];
      
      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating pending reward:', error);
      throw error;
    }
  }

  async updatePendingRewardsStatus(userId: string, status: string): Promise<void> {
    try {
      const query = `
        UPDATE pending_rewards 
        SET status = $1, updated_at = NOW()
        WHERE user_id = $2 AND status = 'pending'
      `;
      
      await this.pool.query(query, [status, userId]);
    } catch (error) {
      logger.error('Error updating pending rewards status:', error);
      throw error;
    }
  }

  // Notification operations
  async createNotification(data: any): Promise<any> {
    try {
      const query = `
        INSERT INTO notifications (user_id, type, title, message, data, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id
      `;
      
      const values = [
        data.user_id,
        data.type,
        data.title,
        data.message,
        JSON.stringify(data.data || {}),
        data.status
      ];
      
      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  async getActiveCoins(): Promise<any[]> {
    try {
      const query = `
        SELECT c.id, c.mint_address, c.symbol, c.name, c.created_at
        FROM coins c
        ORDER BY c.created_at DESC
      `;
      
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting active coins:', error);
      throw error;
    }
  }

  async storeCoinMetrics(coinId: string, metrics: any): Promise<void> {
    try {
      const query = `
        INSERT INTO coin_metrics (coin_id, ts, price, volume_24h, holders, liquidity_usd, extra)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (coin_id, ts) DO UPDATE SET
          price = EXCLUDED.price,
          volume_24h = EXCLUDED.volume_24h,
          holders = EXCLUDED.holders,
          liquidity_usd = EXCLUDED.liquidity_usd,
          extra = EXCLUDED.extra
      `;
      
      const values = [
        coinId,
        new Date(),
        metrics.price,
        metrics.volume_24h,
        metrics.holders,
        metrics.liquidity_usd,
        JSON.stringify(metrics.extra || {})
      ];
      
      await this.pool.query(query, values);
    } catch (error) {
      logger.error('Error storing coin metrics:', error);
      throw error;
    }
  }

  async getLatestCoinMetrics(coinId: string): Promise<any> {
    try {
      const query = `
        SELECT cm.*, c.initial_price, c.initial_holders
        FROM coin_metrics cm
        LEFT JOIN coins c ON cm.coin_id = c.id
        WHERE cm.coin_id = $1
        ORDER BY cm.ts DESC
        LIMIT 1
      `;
      
      const result = await this.pool.query(query, [coinId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error getting latest coin metrics:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}


