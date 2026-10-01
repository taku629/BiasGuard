import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/config/firebase';
import { MarketDataProvider } from './types';
import { PriceHistory } from '@/types/models';

export class CloudMarketDataProvider implements MarketDataProvider {
  async getDailyPrices(ticker: string, startDate: string, endDate: string): Promise<PriceHistory[]> {
    const functions = getFunctions(app);
    const getDailyPricesFn = httpsCallable<{ticker: string, startDate: string, endDate: string}, {data: PriceHistory[]}>(functions, 'getDailyPrices');
    
    try {
      const result = await getDailyPricesFn({ ticker, startDate, endDate });
      return result.data.data;
    } catch (error) {
      console.error('Error fetching daily prices:', error);
      throw error;
    }
  }

  async getLatestPrice(ticker: string): Promise<PriceHistory> {
    const functions = getFunctions(app);
    const getLatestPricesFn = httpsCallable<{tickers: string[]}, {data: Record<string, PriceHistory>}>(functions, 'getLatestPrices');
    
    try {
      const result = await getLatestPricesFn({ tickers: [ticker] });
      const prices = result.data.data;
      
      if (!prices || !prices[ticker]) {
        throw new Error(`Price not found for ticker: ${ticker}`);
      }
      
      return prices[ticker];
    } catch (error) {
      console.error('Error fetching latest price:', error);
      throw error;
    }
  }
}
