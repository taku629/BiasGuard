import { PriceHistory } from '@/types/models';

export interface MarketDataProvider {
  /**
   * Get daily prices for a given ticker between startDate and endDate (inclusive).
   * Format of date: YYYY-MM-DD
   */
  getDailyPrices(ticker: string, startDate: string, endDate: string): Promise<PriceHistory[]>;

  /**
   * Get the latest available price for a given ticker.
   */
  getLatestPrice(ticker: string): Promise<PriceHistory>;
}
