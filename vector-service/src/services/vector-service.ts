import OpenAI from 'openai';
import { DatabaseService } from './database-service';
import { logger } from '../utils/logger';

export interface SimilarityCheckResult {
  isDuplicate: boolean;
  matchedTrend?: any;
  suggestions: any[];
  similarity: number;
}

export interface SimilarityCheckParams {
  title: string;
  description?: string;
  coinList?: any[];
  topK?: number;
  highThreshold?: number;
  lowThreshold?: number;
}

export interface StoreTrendParams {
  trendId: string;
  title: string;
  description?: string;
  coinList?: any[];
  creatorWallet: string;
  themeId?: string;
  model?: string;
}

export interface SearchParams {
  query: string;
  topK?: number;
  themeId?: string;
  excludeIds?: string[];
}

export class VectorService {
  private openai: OpenAI;
  private db: DatabaseService;
  private embeddingModel: string;

  constructor(databaseService: DatabaseService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.db = databaseService;
    this.embeddingModel = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
  }

  // Generate embedding for text using OpenAI
  async generateEmbedding(text: string, model: string = this.embeddingModel): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  // Check for similar trends and determine if it's a duplicate
  async checkSimilarity(params: SimilarityCheckParams): Promise<SimilarityCheckResult> {
    const {
      title,
      description = '',
      coinList = [],
      topK = 5,
      highThreshold = 0.86,
      lowThreshold = 0.70
    } = params;

    // Create search text combining title, description, and coin names
    const searchText = this.createSearchText(title, description, coinList);
    
    // Generate embedding
    const embedding = await this.generateEmbedding(searchText);

    // Find similar trends
    const similarTrends = await this.db.findSimilarTrends(embedding, topK);

    // Check for exact duplicates
    for (const trend of similarTrends) {
      if (trend.similarity >= highThreshold) {
        return {
          isDuplicate: true,
          matchedTrend: trend,
          suggestions: [],
          similarity: trend.similarity
        };
      }
    }

    // Filter suggestions based on low threshold
    const suggestions = similarTrends.filter(trend => trend.similarity >= lowThreshold);

    return {
      isDuplicate: false,
      suggestions,
      similarity: suggestions.length > 0 ? suggestions[0].similarity : 0
    };
  }

  // Store trend with embedding
  async storeTrendEmbedding(params: StoreTrendParams): Promise<any> {
    const {
      trendId,
      title,
      description = '',
      coinList = [],
      creatorWallet,
      themeId,
      model = this.embeddingModel
    } = params;

    // Create search text and generate embedding
    const searchText = this.createSearchText(title, description, coinList);
    const embedding = await this.generateEmbedding(searchText, model);

    // Store in database
    await this.db.storeTrend({
      id: trendId,
      title,
      description,
      creatorWallet,
      themeId,
      embedding,
      embeddingModel: model,
      coinList
    });

    return {
      trendId,
      embedding: embedding.slice(0, 10), // Return first 10 dimensions for debugging
      dimensions: embedding.length,
      model
    };
  }

  // Search for similar trends
  async searchSimilarTrends(params: SearchParams): Promise<any[]> {
    const { query, topK = 10, themeId, excludeIds = [] } = params;

    // Generate embedding for search query
    const embedding = await this.generateEmbedding(query);

    // Find similar trends
    const similarTrends = await this.db.findSimilarTrends(embedding, topK, excludeIds);

    // Filter by theme if specified
    const filteredTrends = themeId 
      ? similarTrends.filter(trend => trend.theme_id === themeId)
      : similarTrends;

    return filteredTrends.map(trend => ({
      id: trend.id,
      title: trend.canonical_title,
      description: trend.canonical_description,
      creatorWallet: trend.creator_wallet,
      themeId: trend.theme_id,
      coinList: trend.coin_list,
      similarity: trend.similarity,
      createdAt: trend.created_at
    }));
  }

  // Get trend by ID
  async getTrendById(id: string): Promise<any> {
    return await this.db.getTrendById(id);
  }

  // Create search text combining title, description, and coin information
  private createSearchText(title: string, description: string, coinList: any[]): string {
    let searchText = title;
    
    if (description) {
      searchText += ` ${description}`;
    }

    // Add coin information to improve semantic matching
    if (coinList && coinList.length > 0) {
      const coinNames = coinList.map(coin => {
        if (typeof coin === 'string') return coin;
        return coin.symbol || coin.name || coin;
      }).join(' ');
      
      if (coinNames) {
        searchText += ` ${coinNames}`;
      }
    }

    return searchText.trim();
  }

  // Calculate coin overlap between two coin lists
  calculateCoinOverlap(coins1: any[], coins2: any[]): number {
    if (!coins1 || !coins2 || coins1.length === 0 || coins2.length === 0) {
      return 0;
    }

    const set1 = new Set(coins1.map(coin => 
      typeof coin === 'string' ? coin : coin.symbol || coin.name || coin
    ));
    const set2 = new Set(coins2.map(coin => 
      typeof coin === 'string' ? coin : coin.symbol || coin.name || coin
    ));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  // Enhanced similarity check with coin overlap
  async checkSimilarityWithCoinOverlap(params: SimilarityCheckParams): Promise<SimilarityCheckResult> {
    const basicResult = await this.checkSimilarity(params);
    
    if (basicResult.isDuplicate) {
      return basicResult;
    }

    // Enhance suggestions with coin overlap information
    const enhancedSuggestions = basicResult.suggestions.map(suggestion => ({
      ...suggestion,
      coinOverlap: this.calculateCoinOverlap(params.coinList || [], suggestion.coin_list || [])
    }));

    return {
      ...basicResult,
      suggestions: enhancedSuggestions
    };
  }
}
