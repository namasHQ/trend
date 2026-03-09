import axios from 'axios';

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  marketCap?: number;
  volume24h?: number;
}

export interface CoinGeckoPrice {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
  };
}

export class MarketDataService {
  private coingeckoApiKey: string;
  private baseUrl = 'https://api.coingecko.com/api/v3';

  constructor() {
    this.coingeckoApiKey = process.env.COINGECKO_API_KEY || '';
  }

  async getPrices(symbols: string[]): Promise<{ [symbol: string]: PriceData }> {
    try {
      // Map symbols to CoinGecko IDs
      const coinGeckoIds = this.mapSymbolsToCoinGeckoIds(symbols);
      
      const response = await axios.get(`${this.baseUrl}/simple/price`, {
        params: {
          ids: coinGeckoIds.join(','),
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_market_cap: true,
          include_24hr_vol: true
        },
        headers: this.coingeckoApiKey ? {
          'X-CG-API-KEY': this.coingeckoApiKey
        } : {}
      });

      const prices: { [symbol: string]: PriceData } = {};
      
      // Map CoinGecko response back to symbols
      Object.entries(response.data).forEach(([coinGeckoId, data]: [string, any]) => {
        const symbol = this.mapCoinGeckoIdToSymbol(coinGeckoId);
        if (symbol && symbols.includes(symbol)) {
          prices[symbol] = {
            symbol,
            price: data.usd,
            change24h: data.usd_24h_change || 0,
            change24hPercent: data.usd_24h_change || 0,
            marketCap: data.usd_market_cap,
            volume24h: data.usd_24h_vol
          };
        }
      });

      return prices;
    } catch (error) {
      console.error('Error fetching prices from CoinGecko:', error);
      // Return mock data as fallback
      return this.getMockPrices(symbols);
    }
  }

  async getPrice(symbol: string): Promise<PriceData | null> {
    const prices = await this.getPrices([symbol]);
    return prices[symbol] || null;
  }

  private mapSymbolsToCoinGeckoIds(symbols: string[]): string[] {
    const symbolToIdMap: { [key: string]: string } = {
      'SOL': 'solana',
      'USDC': 'usd-coin',
      'RNDR': 'render-token',
      'FET': 'fetch-ai',
      'AGIX': 'singularitynet',
      'TREND': 'trend-TREND' // This would need to be added to CoinGecko
    };

    return symbols
      .map(symbol => symbolToIdMap[symbol.toUpperCase()])
      .filter(Boolean);
  }

  private mapCoinGeckoIdToSymbol(coinGeckoId: string): string | null {
    const idToSymbolMap: { [key: string]: string } = {
      'solana': 'SOL',
      'usd-coin': 'USDC',
      'render-token': 'RNDR',
      'fetch-ai': 'FET',
      'singularitynet': 'AGIX',
      'trend-TREND': 'TREND'
    };

    return idToSymbolMap[coinGeckoId] || null;
  }

  private getMockPrices(symbols: string[]): { [symbol: string]: PriceData } {
    const mockPrices: { [symbol: string]: PriceData } = {
      'SOL': { symbol: 'SOL', price: 98.45, change24h: 2.3, change24hPercent: 2.3, marketCap: 45000000000, volume24h: 2500000000 },
      'USDC': { symbol: 'USDC', price: 1.00, change24h: 0, change24hPercent: 0, marketCap: 32000000000, volume24h: 8000000000 },
      'RNDR': { symbol: 'RNDR', price: 4.25, change24h: -1.2, change24hPercent: -1.2, marketCap: 1600000000, volume24h: 45000000 },
      'FET': { symbol: 'FET', price: 0.85, change24h: 3.5, change24hPercent: 3.5, marketCap: 700000000, volume24h: 25000000 },
      'AGIX': { symbol: 'AGIX', price: 0.35, change24h: -2.1, change24hPercent: -2.1, marketCap: 450000000, volume24h: 15000000 },
      'TREND': { symbol: 'TREND', price: 0.12, change24h: 5.7, change24hPercent: 5.7, marketCap: 12000000, volume24h: 500000 }
    };

    const result: { [symbol: string]: PriceData } = {};
    symbols.forEach(symbol => {
      if (mockPrices[symbol]) {
        result[symbol] = mockPrices[symbol];
      }
    });

    return result;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/ping`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.error('CoinGecko API health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const marketDataService = new MarketDataService();
