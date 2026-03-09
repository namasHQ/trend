import { Pool } from 'pg';
import { logger } from '../utils/logger';

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async getClient() {
    return await this.pool.connect();
  }

  async close() {
    await this.pool.end();
  }

  // Vector similarity search using pgvector
  async findSimilarTrends(embedding: number[], topK: number = 5, excludeIds: string[] = []): Promise<any[]> {
    const excludeClause = excludeIds.length > 0 ? `AND id != ALL($2)` : '';
    const params = excludeIds.length > 0 ? [embedding, excludeIds] : [embedding];
    
    const query = `
      SELECT 
        id,
        canonical_title,
        canonical_description,
        creator_wallet,
        theme_id,
        coin_list,
        created_at,
        1 - (embedding <=> $1) AS similarity
      FROM trend_containers 
      WHERE embedding IS NOT NULL ${excludeClause}
      ORDER BY embedding <=> $1
      LIMIT $${excludeIds.length > 0 ? '3' : '2'}
    `;

    const limitParam = excludeIds.length > 0 ? [topK] : [topK];
    const result = await this.query(query, [...params, ...limitParam]);
    return result.rows;
  }

  // Store trend with embedding
  async storeTrend(trendData: {
    id: string;
    title: string;
    description?: string;
    creatorWallet: string;
    themeId?: string;
    embedding: number[];
    embeddingModel: string;
    coinList?: any[];
  }): Promise<void> {
    const query = `
      INSERT INTO trend_containers (
        id, canonical_title, canonical_description, creator_wallet, 
        theme_id, embedding, embedding_model, coin_list
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        canonical_title = EXCLUDED.canonical_title,
        canonical_description = EXCLUDED.canonical_description,
        embedding = EXCLUDED.embedding,
        embedding_model = EXCLUDED.embedding_model,
        coin_list = EXCLUDED.coin_list,
        updated_at = NOW()
    `;

    await this.query(query, [
      trendData.id,
      trendData.title,
      trendData.description || null,
      trendData.creatorWallet,
      trendData.themeId || null,
      trendData.embedding,
      trendData.embeddingModel,
      JSON.stringify(trendData.coinList || [])
    ]);
  }

  // Get trend by ID
  async getTrendById(id: string): Promise<any> {
    const query = `
      SELECT 
        tc.*,
        t.name as theme_name,
        t.color as theme_color
      FROM trend_containers tc
      LEFT JOIN themes t ON tc.theme_id = t.id
      WHERE tc.id = $1
    `;

    const result = await this.query(query, [id]);
    return result.rows[0] || null;
  }

  // Get themes
  async getThemes(): Promise<any[]> {
    const query = 'SELECT * FROM themes ORDER BY name';
    const result = await this.query(query);
    return result.rows;
  }
}
