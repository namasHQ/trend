import express from 'express';
import { database } from '../services/database';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import axios from 'axios';

const router = express.Router();

// Vector service endpoint
const VECTOR_SERVICE_URL = process.env.VECTOR_ENDPOINT || 'http://vector:8000';

// POST /trends/check-and-create → check for duplicates and create trend
router.post('/check-and-create', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title: rawTitle, description, source, containerId, coinList } = req.body;
    const title = rawTitle?.trim() || '';
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Check for similar trends using vector service
    const similarityResponse = await axios.post(`${VECTOR_SERVICE_URL}/api/trends/check-similarity`, {
      title,
      description,
      coinList: coinList || [],
      topK: 5,
      highThreshold: 0.86,
      lowThreshold: 0.70
    });

    const { isDuplicate, matchedTrend, suggestions } = similarityResponse.data;

    // If exact duplicate found, return the existing trend
    if (isDuplicate && matchedTrend) {
      return res.json({
        duplicate: true,
        matchedTrend: {
          id: matchedTrend.id,
          title: matchedTrend.canonical_title,
          description: matchedTrend.canonical_description,
          creatorWallet: matchedTrend.creator_wallet,
          themeId: matchedTrend.theme_id,
          coinList: matchedTrend.coin_list,
          similarity: matchedTrend.similarity,
          createdAt: matchedTrend.created_at
        },
        message: 'Similar trend already exists'
      });
    }

    // If suggestions found, return them for user to choose
    if (suggestions && suggestions.length > 0) {
      return res.json({
        duplicate: false,
        suggestions: suggestions.map(suggestion => ({
          id: suggestion.id,
          title: suggestion.canonical_title,
          description: suggestion.canonical_description,
          creatorWallet: suggestion.creator_wallet,
          themeId: suggestion.theme_id,
          coinList: suggestion.coin_list,
          similarity: suggestion.similarity,
          createdAt: suggestion.created_at
        })),
        message: 'Similar trends found. Please review or create anyway.'
      });
    }

    // No similar trends found, create new trend
    const trendId = generateUUID();
    
    // Store trend with embedding
    await axios.post(`${VECTOR_SERVICE_URL}/api/trends/store-embedding`, {
      trendId,
      title,
      description,
      coinList: coinList || [],
      creatorWallet: req.user?.wallet_address || '',
      themeId: containerId,
      model: 'text-embedding-3-small'
    });

    // Create trend in database
    const trend = await database.createTrend({
      title,
      description,
      source: source || 'manual',
      containerId,
      userId
    });

    res.status(201).json({
      duplicate: false,
      created: true,
      trend,
      message: 'Trend created successfully'
    });

  } catch (error) {
    console.error('Check and create trend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /trends → submit a new trend (title, description, source, containerId)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, description, source, containerId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const trend = await database.createTrend({
      title,
      description,
      source: source || 'manual',
      containerId,
      userId
    });

    res.status(201).json(trend);
  } catch (error) {
    console.error('Create trend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock trends data
const mockTrends = [
  {
    id: '1',
    title: 'AI & Machine Learning Tokens',
    description: 'Emerging AI tokens showing strong momentum with institutional adoption',
    creator_wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    theme_id: 'ai-ml',
    coin_list: ['SOL', 'RNDR', 'FET', 'AGIX'],
    signals_count: 1247,
    coins_count: 4,
    upvotes: 892,
    downvotes: 45,
    performance: 24.5,
    confidence: 87,
    prediction: 'bullish',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'DeFi Yield Farming',
    description: 'High-yield DeFi protocols gaining traction in the current market',
    creator_wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    theme_id: 'defi',
    coin_list: ['JUP', 'RAY', 'ORCA', 'MNDE'],
    signals_count: 892,
    coins_count: 4,
    upvotes: 654,
    downvotes: 23,
    performance: 18.2,
    confidence: 78,
    prediction: 'bullish',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Gaming & Metaverse',
    description: 'Gaming tokens and metaverse projects showing renewed interest',
    creator_wallet: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    theme_id: 'gaming',
    coin_list: ['ATLAS', 'POLIS', 'GST', 'GMT'],
    signals_count: 567,
    coins_count: 4,
    upvotes: 423,
    downvotes: 67,
    performance: -5.3,
    confidence: 65,
    prediction: 'bearish',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// GET /trends → list all trends with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'trending', category, search } = req.query;

    console.log('📊 Trends requested with params:', { page, limit, sort, category, search });

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const offset = (pageNum - 1) * limitNum;

    // Build query conditions
    let whereConditions = ['t.status = $1'];
    let queryParams: any[] = ['active'];
    let paramIndex = 2;

    if (category && category !== 'all') {
      whereConditions.push(`t.theme_id = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Build ORDER BY clause
    let orderBy = 't.created_at DESC';
    switch (sort) {
      case 'trending':
        orderBy = 't.signals_count DESC, t.upvotes DESC';
        break;
      case 'performance':
        orderBy = 't.performance DESC';
        break;
      case 'signals':
        orderBy = 't.signals_count DESC';
        break;
      case 'newest':
        orderBy = 't.created_at DESC';
        break;
    }

    // Get trends with creator info and coins
    const trendsQuery = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.theme_id,
        t.performance,
        t.confidence,
        t.prediction,
        t.signals_count,
        t.coins_count,
        t.upvotes,
        t.downvotes,
        t.created_at,
        t.updated_at,
        u.wallet_address as creator_wallet,
        u.reputation_score as creator_reputation,
        u.level as creator_level,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'symbol', c.symbol,
              'name', c.name,
              'mint_address', c.mint_address,
              'weight', tc.weight
            )
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) as coin_list
      FROM trends t
      LEFT JOIN users u ON t.creator_id = u.id
      LEFT JOIN trend_coins tc ON t.id = tc.trend_id
      LEFT JOIN coins c ON tc.coin_id = c.id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY t.id, u.wallet_address, u.reputation_score, u.level
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limitNum, offset);

    const trendsResult = await database.query(trendsQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM trends t
      WHERE ${whereConditions.join(' AND ')}
    `;
    const countResult = await database.query(countQuery, queryParams.slice(0, -2));

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limitNum);

    // Format response
    const trends = trendsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      creator_wallet: row.creator_wallet,
      theme_id: row.theme_id,
      coin_list: row.coin_list.map((coin: any) => coin.symbol),
      signals_count: row.signals_count,
      coins_count: row.coins_count,
      upvotes: row.upvotes,
      downvotes: row.downvotes,
      performance: parseFloat(row.performance),
      confidence: row.confidence,
      prediction: row.prediction,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    res.json({
      data: trends,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: totalPages
      }
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /trends/:id → get trend details + linked coins + signals
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📊 Single trend requested with id:', id);

    // Get trend details with creator info
    const trendQuery = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.theme_id,
        t.performance,
        t.confidence,
        t.prediction,
        t.signals_count,
        t.coins_count,
        t.upvotes,
        t.downvotes,
        t.created_at,
        t.updated_at,
        u.wallet_address as creator_wallet,
        u.reputation_score as creator_reputation,
        u.level as creator_level,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'symbol', c.symbol,
              'name', c.name,
              'mint_address', c.mint_address,
              'weight', tc.weight
            )
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) as coin_list
      FROM trends t
      LEFT JOIN users u ON t.creator_id = u.id
      LEFT JOIN trend_coins tc ON t.id = tc.trend_id
      LEFT JOIN coins c ON tc.coin_id = c.id
      WHERE t.id = $1 AND t.status = 'active'
      GROUP BY t.id, u.wallet_address, u.reputation_score, u.level
    `;

    const trendResult = await database.query(trendQuery, [id]);

    if (trendResult.rows.length === 0) {
      return res.status(404).json({ error: 'Trend not found' });
    }

    const trend = trendResult.rows[0];

    // Get recent signals for this trend
    const signalsQuery = `
      SELECT 
        s.id,
        s.claim,
        s.coins,
        s.result,
        s.accuracy_score,
        s.upvotes,
        s.downvotes,
        s.created_at,
        u.wallet_address as user_wallet,
        u.reputation_score as user_reputation
      FROM signals s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.trend_id = $1
      ORDER BY s.created_at DESC
      LIMIT 10
    `;

    const signalsResult = await database.query(signalsQuery, [id]);

    // Format response
    const response = {
      id: trend.id,
      title: trend.title,
      description: trend.description,
      creator_wallet: trend.creator_wallet,
      theme_id: trend.theme_id,
      coin_list: trend.coin_list.map((coin: any) => coin.symbol),
      signals_count: trend.signals_count,
      coins_count: trend.coins_count,
      upvotes: trend.upvotes,
      downvotes: trend.downvotes,
      performance: parseFloat(trend.performance),
      confidence: trend.confidence,
      prediction: trend.prediction,
      created_at: trend.created_at,
      updated_at: trend.updated_at,
      signals: signalsResult.rows.map(signal => ({
        id: signal.id,
        claim: signal.claim,
        coins: signal.coins,
        result: signal.result,
        accuracy_score: signal.accuracy_score ? parseFloat(signal.accuracy_score) : null,
        upvotes: signal.upvotes,
        downvotes: signal.downvotes,
        created_at: signal.created_at,
        user_wallet: signal.user_wallet,
        user_reputation: signal.user_reputation
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Get trend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /trends/:id/vote → upvote/downvote trend
router.post('/:id/vote', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 1 for upvote, -1 for downvote
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!voteType || (voteType !== 1 && voteType !== -1)) {
      return res.status(400).json({ error: 'Vote type must be 1 (upvote) or -1 (downvote)' });
    }

    const vote = await database.createTrendVote({
      trendId: id,
      userId,
      voteType
    });

    res.json(vote);
  } catch (error) {
    console.error('Vote trend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default router;
