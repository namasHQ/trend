import express from 'express';
import { Database } from '../services/database';

const router = express.Router();
const database = new Database();

// GET /leaderboard → ranked users by rewards, votes, coin spotting success
router.get('/', async (req, res) => {
  try {
    const { type = 'rewards', limit = 50, offset = 0 } = req.query;
    
    let leaderboard;
    
    switch (type) {
      case 'rewards':
        leaderboard = await database.getRewardsLeaderboard(
          parseInt(limit as string),
          parseInt(offset as string)
        );
        break;
      case 'votes':
        leaderboard = await database.getVotesLeaderboard(
          parseInt(limit as string),
          parseInt(offset as string)
        );
        break;
      case 'coin_spotting':
        leaderboard = await database.getCoinSpottingLeaderboard(
          parseInt(limit as string),
          parseInt(offset as string)
        );
        break;
      default:
        return res.status(400).json({ error: 'Invalid leaderboard type. Use: rewards, votes, or coin_spotting' });
    }

    res.json({
      type,
      leaderboard: leaderboard.map((user, index) => ({
        rank: offset ? parseInt(offset as string) + index + 1 : index + 1,
        user: {
          id: user.id,
          display_name: user.display_name,
          reputation: user.reputation,
          badges: user.badges
        },
        stats: {
          total_rewards: user.total_rewards || 0,
          total_votes: user.total_votes || 0,
          coins_spotted: user.coins_spotted || 0,
          trends_created: user.trends_created || 0,
          success_rate: user.success_rate || 0
        }
      })),
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: leaderboard.length
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;





