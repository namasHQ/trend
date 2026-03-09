import express from 'express';
import { Database } from '../services/database';

const router = express.Router();
const database = new Database();

// GET /metrics/coin/:id → time series metrics for one coin
router.get('/coin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hours = 24 } = req.query;
    
    const metrics = await database.getCoinMetrics(id, parseInt(hours as string));
    
    if (metrics.length === 0) {
      return res.status(404).json({ error: 'No metrics found for this coin' });
    }

    res.json({
      coinId: id,
      timeRange: `${hours} hours`,
      metrics: metrics.map(m => ({
        timestamp: m.timestamp,
        price: m.price,
        volume_24h: m.volume_24h,
        market_cap: m.market_cap,
        holders_count: m.holders_count,
        liquidity: m.liquidity,
        price_change_24h: m.price_change_24h,
        price_change_7d: m.price_change_7d
      }))
    });
  } catch (error) {
    console.error('Get coin metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /metrics/trend/:id → aggregated metrics of coins in a trend
router.get('/trend/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hours = 24 } = req.query;
    
    const trend = await database.getTrendById(id);
    if (!trend) {
      return res.status(404).json({ error: 'Trend not found' });
    }

    const coins = await database.getCoinsByTrendId(id);
    const aggregatedMetrics = await database.getAggregatedTrendMetrics(id, parseInt(hours as string));

    res.json({
      trendId: id,
      timeRange: `${hours} hours`,
      coinsCount: coins.length,
      aggregated: aggregatedMetrics,
      coins: coins.map(coin => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        performance_index: coin.performance_index
      }))
    });
  } catch (error) {
    console.error('Get trend metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /metrics/container/:id → aggregated metrics of a whole container
router.get('/container/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hours = 24 } = req.query;
    
    const container = await database.getContainerById(id);
    if (!container) {
      return res.status(404).json({ error: 'Container not found' });
    }

    const trends = await database.getTrendsByContainerId(id);
    const coins = await database.getCoinsByContainerId(id);
    const aggregatedMetrics = await database.getAggregatedContainerMetrics(id, parseInt(hours as string));

    res.json({
      containerId: id,
      timeRange: `${hours} hours`,
      trendsCount: trends.length,
      coinsCount: coins.length,
      aggregated: aggregatedMetrics,
      topPerformers: coins
        .sort((a, b) => (b.performance_index || 0) - (a.performance_index || 0))
        .slice(0, 10)
        .map(coin => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          performance_index: coin.performance_index
        }))
    });
  } catch (error) {
    console.error('Get container metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;





