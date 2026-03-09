import express from 'express';
import { Database } from '../services/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const database = new Database();

// POST /coins → link a new coin to a trend (mint address, name, symbol)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { mintAddress, name, symbol, containerId } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!mintAddress || !name || !symbol) {
      return res.status(400).json({ error: 'Mint address, name, and symbol are required' });
    }

    const coin = await database.createCoin({
      mintAddress,
      name,
      symbol,
      containerId,
      addedByUserId: userId
    });

    res.status(201).json(coin);
  } catch (error) {
    console.error('Create coin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /coins → list all coins (filters: trendId, sort by % increase, volume)
router.get('/', async (req, res) => {
  try {
    const { container, sort = 'performance', limit = 20, offset = 0 } = req.query;
    
    const coins = await database.getCoins({
      containerId: container as string,
      sort: sort as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      coins,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: coins.length
      }
    });
  } catch (error) {
    console.error('Get coins error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /coins/:id → coin details + performance metrics
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const coin = await database.getCoinById(id);
    if (!coin) {
      return res.status(404).json({ error: 'Coin not found' });
    }

    const metrics = await database.getCoinMetrics(id, 24); // Last 24 hours

    res.json({
      ...coin,
      metrics: {
        current: metrics[0] || null,
        history: metrics,
        performance: {
          priceChange24h: metrics[0]?.price_change_24h || 0,
          volume24h: metrics[0]?.volume_24h || 0,
          marketCap: metrics[0]?.market_cap || 0
        }
      }
    });
  } catch (error) {
    console.error('Get coin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;