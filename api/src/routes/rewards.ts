import express from 'express';
import { Database } from '../services/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const database = new Database();

// GET /rewards → list current user rewards history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const rewards = await database.getUserRewards(userId);
    const totalEarned = rewards.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const totalClaimed = rewards.filter(r => r.status === 'claimed').reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const pending = rewards.filter(r => r.status === 'pending').reduce((sum, r) => sum + parseFloat(r.amount), 0);

    res.json({
      rewards: rewards.map(r => ({
        id: r.id,
        amount: r.amount,
        reward_type: r.reward_type,
        status: r.status,
        created_at: r.created_at,
        claimed_at: r.claimed_at,
        container: r.container,
        coin: r.coin
      })),
      summary: {
        totalEarned,
        totalClaimed,
        pending,
        rewardsCount: rewards.length
      }
    });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /rewards/claim → claim rewards → if wallet linked, send $TREND on-chain
router.post('/claim', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await database.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get pending rewards
    const pendingRewards = await database.getPendingRewards(userId);
    if (pendingRewards.length === 0) {
      return res.status(400).json({ error: 'No pending rewards to claim' });
    }

    const totalAmount = pendingRewards.reduce((sum, r) => sum + parseFloat(r.amount), 0);

    if (user.wallet_address) {
      // TODO: Implement Solana transaction
      // For now, just mark as claimed
      await database.claimRewards(userId);
      
      res.json({
        message: 'Rewards claimed successfully',
        amount: totalAmount,
        transactionHash: 'pending', // TODO: Return actual transaction hash
        rewards: pendingRewards.map(r => ({
          id: r.id,
          amount: r.amount,
          reward_type: r.reward_type
        }))
      });
    } else {
      return res.status(400).json({ 
        error: 'Wallet not connected',
        message: 'Please connect your Solana wallet to claim rewards'
      });
    }
  } catch (error) {
    console.error('Claim rewards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;