import express from 'express';
import { Database } from '../services/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const database = new Database();

// POST /containers → create new container (admin or auto via signal-processor)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { canonicalTitle, canonicalDescription, themeId } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!canonicalTitle) {
      return res.status(400).json({ error: 'Canonical title is required' });
    }

    const container = await database.createContainer({
      canonicalTitle,
      canonicalDescription,
      themeId,
      creatorUserId: userId
    });

    res.status(201).json(container);
  } catch (error) {
    console.error('Create container error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /containers → list all containers + stats (trends count, coins linked, performance)
router.get('/', async (req, res) => {
  try {
    const { theme, sort = 'popularity', limit = 20, offset = 0 } = req.query;
    
    const containers = await database.getContainers({
      themeId: theme as string,
      sort: sort as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      containers,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: containers.length
      }
    });
  } catch (error) {
    console.error('Get containers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /containers/:id → container details + included trends + coins
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const container = await database.getContainerById(id);
    if (!container) {
      return res.status(404).json({ error: 'Container not found' });
    }

    const trends = await database.getTrendsByContainerId(id);
    const coins = await database.getCoinsByContainerId(id);

    res.json({
      ...container,
      trends,
      coins,
      stats: {
        trendsCount: trends.length,
        coinsCount: coins.length,
        totalUpvotes: trends.reduce((sum, t) => sum + (t.upvotes || 0), 0),
        totalDownvotes: trends.reduce((sum, t) => sum + (t.downvotes || 0), 0)
      }
    });
  } catch (error) {
    console.error('Get container error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;