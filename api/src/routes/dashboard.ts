import express from 'express';
import { database } from '../services/database';

const router = express.Router();

// GET /dashboard/stats → get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Dashboard stats requested');

    // Get platform statistics from database
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM trends WHERE status = 'active') as total_trends,
        (SELECT COUNT(*) FROM signals) as active_signals,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COALESCE(SUM(stake_amount), 0) FROM bets WHERE status = 'active') as total_volume,
        (SELECT AVG(performance) FROM trends WHERE status = 'active' AND performance IS NOT NULL) as avg_performance
    `;

    const statsResult = await database.query(statsQuery);
    const stats = statsResult.rows[0];

    // Determine market mood based on average performance
    let marketMood = 'neutral';
    if (stats.avg_performance > 5) {
      marketMood = 'bull';
    } else if (stats.avg_performance < -5) {
      marketMood = 'bear';
    }

    // Get top performing trends
    const topTrendsQuery = `
      SELECT 
        t.id,
        t.title,
        t.performance,
        t.signals_count,
        t.upvotes,
        t.downvotes
      FROM trends t
      WHERE t.status = 'active'
      ORDER BY t.performance DESC
      LIMIT 5
    `;

    const topTrendsResult = await database.query(topTrendsQuery);

    // Get recent activity
    const recentActivityQuery = `
      SELECT 
        'trend_created' as type,
        t.title as description,
        t.created_at as timestamp
      FROM trends t
      WHERE t.status = 'active'
      UNION ALL
      SELECT 
        'signal_created' as type,
        CONCAT('New signal: ', s.claim) as description,
        s.created_at as timestamp
      FROM signals s
      ORDER BY timestamp DESC
      LIMIT 10
    `;

    const recentActivityResult = await database.query(recentActivityQuery);

    const response = {
      total_trends: parseInt(stats.total_trends),
      active_signals: parseInt(stats.active_signals),
      total_users: parseInt(stats.total_users),
      total_volume: parseFloat(stats.total_volume),
      market_mood: marketMood,
      avg_performance: parseFloat(stats.avg_performance || 0),
      top_trends: topTrendsResult.rows.map(trend => ({
        id: trend.id,
        title: trend.title,
        performance: parseFloat(trend.performance),
        signals_count: trend.signals_count,
        upvotes: trend.upvotes,
        downvotes: trend.downvotes
      })),
      recent_activity: recentActivityResult.rows.map(activity => ({
        type: activity.type,
        description: activity.description,
        timestamp: activity.timestamp
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
