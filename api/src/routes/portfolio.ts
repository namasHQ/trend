import express from 'express';
import { database } from '../services/database';
import { solanaService } from '../services/solana';
import { marketDataService } from '../services/market-data';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /portfolio → get user's portfolio information
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const walletAddress = req.user.wallet_address;

    console.log('💰 Portfolio requested for user:', userId);

    // Get wallet info from Solana
    const walletInfo = await solanaService.getWalletInfo(walletAddress);
    
    // Get USD prices for tokens
    const tokenSymbols = walletInfo.tokenBalances.map(balance => {
      // Map mint addresses to symbols (this would be more sophisticated in production)
      const mintToSymbol: { [key: string]: string } = {
        'So11111111111111111111111111111111111111112': 'SOL',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
        'rndrizKT3GT1fu8e6aW64gNyd4nSAVxw7ArB3YQ6u': 'RNDR',
        // Add more mappings as needed
      };
      return mintToSymbol[balance.mint] || 'UNKNOWN';
    }).filter(symbol => symbol !== 'UNKNOWN');

    const prices = await marketDataService.getPrices(tokenSymbols);

    // Calculate USD values for holdings
    const holdings = walletInfo.tokenBalances.map(balance => {
      const symbol = tokenSymbols.find(s => {
        const mintToSymbol: { [key: string]: string } = {
          'So11111111111111111111111111111111111111112': 'SOL',
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
          'rndrizKT3GT1fu8e6aW64gNyd4nSAVxw7ArB3YQ6u': 'RNDR',
        };
        return mintToSymbol[balance.mint] === s;
      });

      const priceData = symbol ? prices[symbol] : null;
      const usdValue = priceData ? balance.uiAmount * priceData.price : 0;

      return {
        token: symbol || 'UNKNOWN',
        amount: balance.uiAmount,
        value: usdValue,
        change24h: priceData ? priceData.change24h : 0,
        change24hPercent: priceData ? priceData.change24hPercent : 0,
        mintAddress: balance.mint
      };
    });

    const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
    const change24h = holdings.reduce((sum, holding) => sum + (holding.value * holding.change24hPercent / 100), 0);
    const change24hPercent = totalValue > 0 ? (change24h / totalValue) * 100 : 0;

    // Calculate trend exposure
    const trendExposureQuery = `
      SELECT 
        t.id as trend_id,
        t.title as trend_title,
        t.performance as trend_return,
        SUM(tc.weight) as total_weight,
        COUNT(tc.coin_id) as coins_in_trend
      FROM trends t
      JOIN trend_coins tc ON t.id = tc.trend_id
      JOIN coins c ON tc.coin_id = c.id
      WHERE c.mint_address = ANY($1)
        AND t.status = 'active'
      GROUP BY t.id, t.title, t.performance
      HAVING COUNT(tc.coin_id) > 0
    `;

    const mintAddresses = walletInfo.tokenBalances.map(b => b.mint);
    const trendExposureResult = await database.query(trendExposureQuery, [mintAddresses]);

    const trendExposure = trendExposureResult.rows.map(exposure => {
      // Calculate portfolio percentage for this trend
      const trendHoldings = holdings.filter(holding => {
        // Check if this holding's token is in the trend
        return mintAddresses.includes(holding.mintAddress);
      });
      
      const trendValue = trendHoldings.reduce((sum, holding) => sum + holding.value, 0);
      const portfolioPercentage = totalValue > 0 ? (trendValue / totalValue) * 100 : 0;

      return {
        trend_id: exposure.trend_id,
        trend_title: exposure.trend_title,
        portfolio_percentage: portfolioPercentage,
        trend_return: parseFloat(exposure.trend_return)
      };
    });

    const response = {
      walletAddress,
      totalValue,
      change24h,
      change24hPercent,
      lastSynced: new Date().toISOString(),
      holdings,
      trendExposure
    };

    res.json(response);
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /portfolio/sync → manually sync portfolio data
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const walletAddress = req.user.wallet_address;

    console.log('💰 Manual portfolio sync requested for user:', userId);

    // Force refresh wallet data
    const walletInfo = await solanaService.getWalletInfo(walletAddress);
    
    // Update user's last sync time (you could store this in database)
    const lastSynced = new Date().toISOString();

    res.json({
      success: true,
      message: 'Portfolio synced successfully',
      lastSynced,
      walletAddress
    });
  } catch (error) {
    console.error('Sync portfolio error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /portfolio/holdings → get detailed holdings breakdown
router.get('/holdings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const walletAddress = req.user.wallet_address;

    console.log('💰 Detailed holdings requested for user:', userId);

    const walletInfo = await solanaService.getWalletInfo(walletAddress);
    
    // Get detailed token information
    const detailedHoldings = await Promise.all(
      walletInfo.tokenBalances.map(async (balance) => {
        const metadata = await solanaService.getTokenMetadata(balance.mint);
        return {
          mint: balance.mint,
          symbol: metadata?.symbol || 'UNKNOWN',
          name: metadata?.name || 'Unknown Token',
          amount: balance.amount,
          uiAmount: balance.uiAmount,
          decimals: balance.decimals,
          metadata
        };
      })
    );

    res.json({
      walletAddress,
      holdings: detailedHoldings,
      lastSynced: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get detailed holdings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
