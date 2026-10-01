import { MarketDataProvider } from './types';
import { PriceHistory } from '@/types/models';
import { formatDate } from '@/utils/date';

/**
 * Deterministic Mock Provider for Market Data.
 * Generates synthetic deterministic price history for testing and dev without external API calls.
 */
export class MockMarketDataProvider implements MarketDataProvider {
  
  private generateDeterministicPrice(ticker: string, dateStr: string): number {
    // Generate a pseudo-random but deterministic price based on ticker and date
    let hash = 0;
    const str = ticker + dateStr;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    
    // Base price per ticker (deterministic)
    const basePrice = (Math.abs(hash) % 200) + 50; 
    
    // Day fluctuation (-5% to +5%)
    const fluctuation = ((Math.abs(hash * 31) % 100) / 1000) - 0.05;
    
    return Number((basePrice * (1 + fluctuation)).toFixed(2));
  }

  private generateDates(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      // Skip weekends to simulate trading days
      const day = current.getUTCDay();
      if (day !== 0 && day !== 6) {
        dates.push(formatDate(current));
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }
    return dates;
  }

  async getDailyPrices(ticker: string, startDate: string, endDate: string): Promise<PriceHistory[]> {
    const dates = this.generateDates(startDate, endDate);
    return dates.map(date => ({
      ticker,
      date,
      closePrice: this.generateDeterministicPrice(ticker, date),
      adjustedClosePrice: this.generateDeterministicPrice(ticker, date), // Same for mock
      source: 'MockMarketDataProvider'
    }));
  }

  async getLatestPrice(ticker: string): Promise<PriceHistory> {
    let current = new Date();
    // Go back to Friday if weekend
    if (current.getUTCDay() === 0) current.setUTCDate(current.getUTCDate() - 2); // Sunday -> Friday
    if (current.getUTCDay() === 6) current.setUTCDate(current.getUTCDate() - 1); // Saturday -> Friday
    
    const targetDate = formatDate(current);
    const price = this.generateDeterministicPrice(ticker, targetDate);
    return {
      ticker,
      date: targetDate,
      closePrice: price,
      adjustedClosePrice: price,
      source: 'MockMarketDataProvider'
    };
  }
}
