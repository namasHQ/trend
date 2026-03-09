import { Pool, PoolClient } from 'pg';
import { config } from 'dotenv';

config();

export class Database {
  private pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }
    
    // Log connection info (without password)
    const connectionInfo = connectionString.replace(/:[^:@]+@/, ':****@');
    console.log('📊 Database connection:', connectionInfo);
    
    this.pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('❌ Unexpected error on idle client', err);
    });
  }

  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as health');
      return result.rows[0]?.health === 1;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Create a new trend
  async createTrend(trendData: { title: string; description: string; source: string; containerId?: string; userId: string }) {
    const { title, description, source, containerId, userId } = trendData;
    const id = this.generateUUID();

    const query = `
      INSERT INTO trends (id, title, description, source, theme_id, creator_id, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW(), NOW())
      RETURNING id, title, description, source, theme_id, creator_id, status, created_at, updated_at
    `;

    const params = [id, title, description, source, containerId || null, userId];
    const result = await this.query(query, params);

    return result.rows[0];
  }

  // Create a trend vote
  async createTrendVote(voteData: { trendId: string; userId: string; voteType: 1 | -1 }) {
    const { trendId, userId, voteType } = voteData;
    const id = this.generateUUID();

    const query = `
      INSERT INTO trend_votes (id, trend_id, user_id, vote_type, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;

    const params = [id, trendId, userId, voteType];
    const result = await this.query(query, params);

    // Update trend vote counts
    await this.updateTrendVotes(trendId);

    return result.rows[0];
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private async updateTrendVotes(trendId: string) {
    const query = `
      UPDATE trends 
      SET 
        upvotes = (SELECT COUNT(*) FROM trend_votes WHERE trend_id = $1 AND vote_type = 1),
        downvotes = (SELECT COUNT(*) FROM trend_votes WHERE trend_id = $1 AND vote_type = -1),
        updated_at = NOW()
      WHERE id = $1
    `;

    await this.query(query, [trendId]);
  }
}

// Export singleton instance
export const database = new Database();
