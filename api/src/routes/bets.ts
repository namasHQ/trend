import express from 'express';
import { database } from '../services/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /bets → get user's betting history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    console.log('🎲 Bets requested for user:', userId);

    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const offset = (pageNum - 1) * limitNum;

    // Build query conditions
    let whereConditions = ['b.user_id = $1'];
    let queryParams: any[] = [userId];
    let paramIndex = 2;

    if (status && status !== 'all') {
      whereConditions.push(`b.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    // Get bets with trend information
    const betsQuery = `
      SELECT 
        b.id,
        b.side,
        b.timeframe,
        b.stake_amount,
        b.stake_currency,
        b.implied_odds,
        b.payout_if_win,
        b.fees,
        b.settlement_date,
        b.status,
        b.result,
        b.actual_payout,
        b.tx_hash,
        b.created_at,
        t.id as trend_id,
        t.title as trend_title,
        t.performance as trend_performance
      FROM bets b
      LEFT JOIN trends t ON b.trend_id = t.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY b.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limitNum, offset);

    const betsResult = await database.query(betsQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM bets b
      WHERE ${whereConditions.join(' AND ')}
    `;
    const countResult = await database.query(countQuery, queryParams.slice(0, -2));

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limitNum);

    // Format response
    const bets = betsResult.rows.map(bet => ({
      id: bet.id,
      trend: {
        id: bet.trend_id,
        title: bet.trend_title
      },
      side: bet.side,
      timeframe: bet.timeframe,
      stakeAmount: parseFloat(bet.stake_amount),
      stakeCurrency: bet.stake_currency,
      impliedOdds: bet.implied_odds ? parseFloat(bet.implied_odds) : null,
      payoutIfWin: bet.payout_if_win ? parseFloat(bet.payout_if_win) : null,
      fees: bet.fees ? parseFloat(bet.fees) : null,
      settlementDate: bet.settlement_date,
      status: bet.status,
      result: bet.result,
      actualPayout: bet.actual_payout ? parseFloat(bet.actual_payout) : null,
      txHash: bet.tx_hash,
      createdAt: bet.created_at
    }));

    res.json({
      data: bets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get bets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /bets → place a new bet
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { trendId, side, stakeAmount, stakeCurrency, timeframe, txHash } = req.body;

    console.log('🎲 Placing bet:', { userId, trendId, side, stakeAmount });

    // Validate required fields
    if (!trendId || !side || !stakeAmount || !timeframe) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['for', 'against'].includes(side)) {
      return res.status(400).json({ error: 'Invalid side. Must be "for" or "against"' });
    }

    if (!['7d', '14d', '30d'].includes(timeframe)) {
      return res.status(400).json({ error: 'Invalid timeframe. Must be "7d", "14d", or "30d"' });
    }

    // Check if trend exists
    const trendCheck = await database.query(
      'SELECT id, title FROM trends WHERE id = $1 AND status = $2',
      [trendId, 'active']
    );

    if (trendCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Trend not found' });
    }

    const trend = trendCheck.rows[0];

    // Calculate settlement date
    const days = parseInt(timeframe.replace('d', ''));
    const settlementDate = new Date();
    settlementDate.setDate(settlementDate.getDate() + days);

    // Calculate implied odds and payout (simplified)
    const impliedOdds = 1.5; // This would be calculated based on market conditions
    const payoutIfWin = stakeAmount * impliedOdds;
    const fees = stakeAmount * 0.05; // 5% fee

    // Create bet
    const createBetQuery = `
      INSERT INTO bets (
        trend_id, user_id, side, stake_amount, stake_currency,
        implied_odds, payout_if_win, fees, settlement_date, status, tx_hash
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const betResult = await database.query(createBetQuery, [
      trendId,
      userId,
      side,
      stakeAmount,
      stakeCurrency || 'TREND',
      impliedOdds,
      payoutIfWin,
      fees,
      settlementDate,
      'active',
      txHash || null
    ]);

    const bet = betResult.rows[0];

    res.status(201).json({
      id: bet.id,
      trend: {
        id: trend.id,
        title: trend.title
      },
      side: bet.side,
      timeframe: timeframe,
      stakeAmount: parseFloat(bet.stake_amount),
      stakeCurrency: bet.stake_currency,
      impliedOdds: parseFloat(bet.implied_odds),
      payoutIfWin: parseFloat(bet.payout_if_win),
      fees: parseFloat(bet.fees),
      settlementDate: bet.settlement_date,
      status: bet.status,
      txHash: bet.tx_hash,
      createdAt: bet.created_at
    });
  } catch (error) {
    console.error('Create bet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /bets/:id → get specific bet details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log('🎲 Bet details requested:', { betId: id, userId });

    const betQuery = `
      SELECT 
        b.*,
        t.id as trend_id,
        t.title as trend_title,
        t.performance as trend_performance,
        t.confidence as trend_confidence
      FROM bets b
      LEFT JOIN trends t ON b.trend_id = t.id
      WHERE b.id = $1 AND b.user_id = $2
    `;

    const betResult = await database.query(betQuery, [id, userId]);

    if (betResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bet not found' });
    }

    const bet = betResult.rows[0];

    // Calculate time remaining if bet is active
    let timeRemaining = null;
    if (bet.status === 'active') {
      const now = new Date();
      const settlement = new Date(bet.settlement_date);
      const diffMs = settlement.getTime() - now.getTime();
      timeRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // days
    }

    const response = {
      id: bet.id,
      trend: {
        id: bet.trend_id,
        title: bet.trend_title,
        performance: bet.trend_performance ? parseFloat(bet.trend_performance) : null,
        confidence: bet.trend_confidence
      },
      side: bet.side,
      timeframe: bet.timeframe,
      stakeAmount: parseFloat(bet.stake_amount),
      stakeCurrency: bet.stake_currency,
      impliedOdds: bet.implied_odds ? parseFloat(bet.implied_odds) : null,
      payoutIfWin: bet.payout_if_win ? parseFloat(bet.payout_if_win) : null,
      fees: bet.fees ? parseFloat(bet.fees) : null,
      settlementDate: bet.settlement_date,
      status: bet.status,
      result: bet.result,
      actualPayout: bet.actual_payout ? parseFloat(bet.actual_payout) : null,
      txHash: bet.tx_hash,
      createdAt: bet.created_at,
      timeRemaining
    };

    res.json(response);
  } catch (error) {
    console.error('Get bet details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /bets/stats → get user's betting statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('🎲 Betting stats requested for user:', userId);

    const statsQuery = `
      SELECT 
        COUNT(*) as total_bets,
        COUNT(*) FILTER (WHERE status = 'active') as active_bets,
        COUNT(*) FILTER (WHERE status = 'settled') as settled_bets,
        COUNT(*) FILTER (WHERE result = 'win') as winning_bets,
        COUNT(*) FILTER (WHERE result = 'loss') as losing_bets,
        COALESCE(SUM(stake_amount), 0) as total_staked,
        COALESCE(SUM(actual_payout), 0) as total_payouts,
        COALESCE(AVG(stake_amount), 0) as avg_stake
      FROM bets
      WHERE user_id = $1
    `;

    const statsResult = await database.query(statsQuery, [userId]);
    const stats = statsResult.rows[0];

    const winRate = stats.settled_bets > 0 
      ? (parseInt(stats.winning_bets) / parseInt(stats.settled_bets)) * 100 
      : 0;

    const response = {
      totalBets: parseInt(stats.total_bets),
      activeBets: parseInt(stats.active_bets),
      settledBets: parseInt(stats.settled_bets),
      winningBets: parseInt(stats.winning_bets),
      losingBets: parseInt(stats.losing_bets),
      winRate: parseFloat(winRate.toFixed(2)),
      totalStaked: parseFloat(stats.total_staked),
      totalPayouts: parseFloat(stats.total_payouts),
      avgStake: parseFloat(stats.avg_stake),
      netProfit: parseFloat(stats.total_payouts) - parseFloat(stats.total_staked)
    };

    res.json(response);
  } catch (error) {
    console.error('Get betting stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
