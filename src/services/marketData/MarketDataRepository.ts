import { MarketDataProvider } from './types';
import { PriceHistory } from '@/types/models';
import { MockMarketDataProvider } from './MockMarketDataProvider';
import { CloudMarketDataProvider } from './CloudMarketDataProvider';
import { MARKET_DATA_MODE } from '@/config/env';

export class MarketDataRepository {
  private provider: MarketDataProvider;

  constructor(provider?: MarketDataProvider) {
    if (provider) {
      this.provider = provider;
      return;
    }

    if (MARKET_DATA_MODE === 'production') {
      try {
        this.provider = new CloudMarketDataProvider();
      } catch (error) {
        console.error('Failed to initialize CloudMarketDataProvider:', error);
        throw new Error('Failed to initialize production MarketDataProvider');
      }
    } else {
      this.provider = new MockMarketDataProvider();
    }
  }

  async getDailyPrices(ticker: string, startDate: string, endDate: string): Promise<PriceHistory[]> {
    return this.provider.getDailyPrices(ticker, startDate, endDate);
  }

  async getLatestPrice(ticker: string): Promise<PriceHistory> {
    return this.provider.getLatestPrice(ticker);
  }
}

export const marketDataRepository = new MarketDataRepository();
