import { DispositionEngine } from '../src/services/behavior/disposition';
import { Transaction, PriceHistory } from '../src/types/models';
import { MarketDataRepository } from '../src/services/marketData/MarketDataRepository';
import { MarketDataProvider } from '../src/services/marketData/types';
import { Timestamp } from 'firebase/firestore';

class DummyMarketData implements MarketDataProvider {
  prices: Record<string, PriceHistory> = {};
  
  async getDailyPrices(ticker: string, start: string, end: string) {
    if (this.prices[ticker]) return [this.prices[ticker]];
    return [];
  }
  async getLatestPrice(ticker: string) { return this.prices[ticker]; }
}

describe('Disposition Effect Engine', () => {
  it('calculates PGR, PLR, and DE correctly on a decision day', async () => {
    const provider = new DummyMarketData();
    const repo = new MarketDataRepository(provider);
    const engine = new DispositionEngine(repo);

    // Setup: Buy A, B, C, D on Day 1 (2023-01-01)
    // Day 2 (2023-01-02) prices:
    // A: bought at 100, now 150 (Gain)
    // B: bought at 100, now 150 (Gain)
    // C: bought at 100, now 50 (Loss)
    // D: bought at 100, now 50 (Loss)
    
    provider.prices['A'] = { ticker: 'A', date: '2023-01-02', closePrice: 150 };
    provider.prices['B'] = { ticker: 'B', date: '2023-01-02', closePrice: 150 };
    provider.prices['C'] = { ticker: 'C', date: '2023-01-02', closePrice: 50 };
    provider.prices['D'] = { ticker: 'D', date: '2023-01-02', closePrice: 50 };

    const t1 = Timestamp.fromDate(new Date('2023-01-01T10:00:00Z'));
    const t2 = Timestamp.fromDate(new Date('2023-01-02T10:00:00Z'));

    const txs: Transaction[] = [
      { id: '1', portfolioId: 'p', ticker: 'A', type: 'buy', price: 100, quantity: 10, executedAt: t1 },
      { id: '2', portfolioId: 'p', ticker: 'B', type: 'buy', price: 100, quantity: 10, executedAt: t1 },
      { id: '3', portfolioId: 'p', ticker: 'C', type: 'buy', price: 100, quantity: 10, executedAt: t1 },
      { id: '4', portfolioId: 'p', ticker: 'D', type: 'buy', price: 100, quantity: 10, executedAt: t1 },
      
      // Decision Day: 2023-01-02
      // Sell A (Winner), Sell C (Loser)
      // Hold B (Winner), Hold D (Loser)
      { id: '5', portfolioId: 'p', ticker: 'A', type: 'sell', price: 150, quantity: 10, executedAt: t2 },
      { id: '6', portfolioId: 'p', ticker: 'C', type: 'sell', price: 50, quantity: 10, executedAt: t2 },
    ];

    const result = await engine.analyze(txs);

    // Gain Opportunities: A (sold), B (held) => 2
    // Loss Opportunities: C (sold), D (held) => 2
    // RG = 1 (A), PG = 1 (B) => PGR = 1 / 2 = 0.5
    // RL = 1 (C), PL = 1 (D) => PLR = 1 / 2 = 0.5
    // DE = 0.5 - 0.5 = 0
    expect(result.realizedGains).toBe(1);
    expect(result.paperGains).toBe(1);
    expect(result.realizedLosses).toBe(1);
    expect(result.paperLosses).toBe(1);
    
    expect(result.pgr).toBe(0.5);
    expect(result.plr).toBe(0.5);
    expect(result.dispositionEffect).toBe(0);
    expect(result.lossRealizationReluctance).toBe(0.5); // 1 - 0.5
    expect(result.saleDecisionDays).toBe(1);
  });

  it('marks insufficient data if opportunities are < 5', async () => {
    const provider = new DummyMarketData();
    const engine = new DispositionEngine(new MarketDataRepository(provider));
    const t1 = Timestamp.fromDate(new Date('2023-01-01T10:00:00Z'));
    const t2 = Timestamp.fromDate(new Date('2023-01-02T10:00:00Z'));
    provider.prices['A'] = { ticker: 'A', date: '2023-01-02', closePrice: 150 };

    const txs: Transaction[] = [
      { id: '1', portfolioId: 'p', ticker: 'A', type: 'buy', price: 100, quantity: 10, executedAt: t1 },
      { id: '2', portfolioId: 'p', ticker: 'A', type: 'sell', price: 150, quantity: 10, executedAt: t2 },
    ];

    const result = await engine.analyze(txs);
    expect(result.gainOpportunities).toBe(1);
    expect(result.status).toBe('insufficient_data');
  });

  it('groups multiple sales on same day into one decision day', async () => {
    const provider = new DummyMarketData();
    const engine = new DispositionEngine(new MarketDataRepository(provider));
    provider.prices['A'] = { ticker: 'A', date: '2023-01-02', closePrice: 150 };
    provider.prices['B'] = { ticker: 'B', date: '2023-01-02', closePrice: 150 };

    const t1 = Timestamp.fromDate(new Date('2023-01-01T10:00:00Z'));
    const t2_morning = Timestamp.fromDate(new Date('2023-01-02T10:00:00Z'));
    const t2_afternoon = Timestamp.fromDate(new Date('2023-01-02T15:00:00Z'));

    const txs: Transaction[] = [
      { id: '1', portfolioId: 'p', ticker: 'A', type: 'buy', price: 100, quantity: 10, executedAt: t1 },
      { id: '2', portfolioId: 'p', ticker: 'B', type: 'buy', price: 100, quantity: 10, executedAt: t1 },
      { id: '3', portfolioId: 'p', ticker: 'A', type: 'sell', price: 150, quantity: 5, executedAt: t2_morning },
      { id: '4', portfolioId: 'p', ticker: 'B', type: 'sell', price: 150, quantity: 5, executedAt: t2_afternoon },
    ];

    const result = await engine.analyze(txs);
    // Both sold on same day (2023-01-02) -> 1 decision day
    expect(result.saleDecisionDays).toBe(1);
    expect(result.realizedGains).toBe(2); // A and B both counted as sold on this day
  });

  it('handles missing market prices by incrementing dataQuality metadata', async () => {
    const provider = new DummyMarketData();
    const engine = new DispositionEngine(new MarketDataRepository(provider));
    const t1 = Timestamp.fromDate(new Date('2023-01-01T10:00:00Z'));
    const t2 = Timestamp.fromDate(new Date('2023-01-02T10:00:00Z'));
    
    // No price provided for B
    provider.prices['A'] = { ticker: 'A', date: '2023-01-02', closePrice: 150 };

    const txs: Transaction[] = [
      { id: '1', portfolioId: 'p', ticker: 'A', type: 'buy', price: 100, quantity: 10, executedAt: t1 },
      { id: '2', portfolioId: 'p', ticker: 'B', type: 'buy', price: 100, quantity: 10, executedAt: t1 },
      { id: '3', portfolioId: 'p', ticker: 'A', type: 'sell', price: 150, quantity: 10, executedAt: t2 },
    ];

    const result = await engine.analyze(txs);
    // B was held, but missing price, so it's not counted as Paper Gain/Loss.
    expect(result.paperGains).toBe(0);
    expect(result.paperLosses).toBe(0);
    expect(result.dataQuality.missingPrices).toBe(1);
  });
});
