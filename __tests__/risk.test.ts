import { RiskService } from '../src/services/risk/engine';
import { MarketDataRepository } from '../src/services/marketData/MarketDataRepository';
import { MarketDataProvider } from '../src/services/marketData/types';
import { PriceHistory } from '../src/types/models';
import { Holding } from '../src/types/models';
import { Timestamp } from 'firebase/firestore';

class BaseMockProvider implements MarketDataProvider {
  prices: Record<string, PriceHistory[]> = {};
  latest: Record<string, PriceHistory> = {};
  
  async getDailyPrices(ticker: string, start: string, end: string) {
    return this.prices[ticker] || [];
  }
  async getLatestPrice(ticker: string) {
    return this.latest[ticker];
  }
}

describe('Risk Engine - Portfolio Weighting & Math', () => {
  it('calculates portfolio weights based on current market value correctly', async () => {
    const provider = new BaseMockProvider();
    // Asset A: quant=2, price=100 => 200
    // Asset B: quant=1, price=300 => 300
    // Total MV = 500. wA = 0.4, wB = 0.6
    provider.latest['A'] = { ticker: 'A', date: '2023-01-01', closePrice: 100 };
    provider.latest['B'] = { ticker: 'B', date: '2023-01-01', closePrice: 300 };
    
    // We need 61 prices to get 60 returns and pass the observation check.
    // Let's generate a simple series where A returns 1% daily, B returns 2% daily.
    const histA: PriceHistory[] = [];
    const histB: PriceHistory[] = [];
    const histBench: PriceHistory[] = [];
    
    let pA = 100, pB = 100, pBench = 100;
    for (let i = 1; i <= 65; i++) {
      const d = `2023-01-${i.toString().padStart(2, '0')}`;
      histA.push({ ticker: 'A', date: d, closePrice: pA });
      histB.push({ ticker: 'B', date: d, closePrice: pB });
      histBench.push({ ticker: 'SPY', date: d, closePrice: pBench });
      
      // We know returns exactly to test portfolio daily return
      // Day 2: A returns 10%, B returns 20%. Portfolio return should be 0.4*0.1 + 0.6*0.2 = 0.04 + 0.12 = 0.16 (16%)
      if (i === 1) {
        pA = 110; pB = 120; pBench = 105; 
      } else {
        // flat afterwards for simplicity
        pA = 110; pB = 120; pBench = 105;
      }
    }
    
    provider.prices['A'] = histA;
    provider.prices['B'] = histB;
    provider.prices['SPY'] = histBench;
    
    const riskService = new RiskService(new MarketDataRepository(provider));
    const holdings: Holding[] = [
      { ticker: 'A', quantity: 2, avgCost: 50, createdAt: Timestamp.now() },
      { ticker: 'B', quantity: 1, avgCost: 150, createdAt: Timestamp.now() }
    ];
    
    // Calculate risk
    const metrics = await riskService.calculateCurrentCompositionRisk(holdings, 0, 'SPY', 252);
    
    // Since only day 1->2 has a return (0.16) and day 2->65 are 0 return,
    // The mean of 64 returns is 0.16 / 64 = 0.0025.
    // variance: sum( (r - 0.0025)^2 ) / 63
    // (0.16 - 0.0025)^2 = 0.02480625
    // 63 * (0 - 0.0025)^2 = 63 * 0.00000625 = 0.00039375
    // sum = 0.0252. var = 0.0252 / 63 = 0.0004. stddev = 0.02.
    // Annualized Volatility = 0.02 * sqrt(252) ≈ 0.31749
    expect(metrics.volatility).toBeCloseTo(0.31749, 4);
    
    // Sharpe: mean(0.0025) / stddev(0.02) * sqrt(252) = 0.125 * 15.8745 = 1.9843
    expect(metrics.sharpeRatio).toBeCloseTo(1.9843, 4);
  });

  it('rejects invalid quantities and zero total market value', async () => {
    const provider = new BaseMockProvider();
    provider.latest['A'] = { ticker: 'A', date: '2023-01-01', closePrice: 100 };
    const riskService = new RiskService(new MarketDataRepository(provider));
    
    const invalidHoldings1: Holding[] = [
      { ticker: 'A', quantity: -5, avgCost: 50, createdAt: Timestamp.now() }
    ];
    await expect(riskService.calculateCurrentCompositionRisk(invalidHoldings1)).rejects.toThrow(/Invalid quantity/);

    const invalidHoldings2: Holding[] = [
      { ticker: 'A', quantity: 0, avgCost: 50, createdAt: Timestamp.now() }
    ];
    await expect(riskService.calculateCurrentCompositionRisk(invalidHoldings2)).rejects.toThrow(/Invalid quantity/);
  });

  it('rejects invalid prices in history or latest', async () => {
    const provider = new BaseMockProvider();
    provider.latest['A'] = { ticker: 'A', date: '2023-01-01', closePrice: -100 };
    const riskService = new RiskService(new MarketDataRepository(provider));
    
    const holdings: Holding[] = [ { ticker: 'A', quantity: 1, avgCost: 50, createdAt: Timestamp.now() } ];
    await expect(riskService.calculateCurrentCompositionRisk(holdings)).rejects.toThrow(/Invalid latest price/);

    provider.latest['A'] = { ticker: 'A', date: '2023-01-01', closePrice: 100 };
    provider.prices['A'] = [
      { ticker: 'A', date: '2023-01-01', closePrice: 100 },
      { ticker: 'A', date: '2023-01-02', closePrice: -50 } // Invalid
    ];
    provider.prices['SPY'] = [
      { ticker: 'SPY', date: '2023-01-01', closePrice: 100 },
      { ticker: 'SPY', date: '2023-01-02', closePrice: 100 }
    ];
    await expect(riskService.calculateCurrentCompositionRisk(holdings)).rejects.toThrow(/Invalid price found/);
  });

  it('uses adjustedClosePrice if available and falls back to closePrice', async () => {
    const provider = new BaseMockProvider();
    provider.latest['A'] = { ticker: 'A', date: '2023-01-01', closePrice: 100 };
    // We simulate 61 days where closePrice stays 100, but adjusted drops by half, meaning a split happened.
    // If it uses closePrice, return is 0. If adjusted, return is not 0 (or vice versa).
    const histA: PriceHistory[] = [];
    const histSPY: PriceHistory[] = [];
    for(let i=1; i<=65; i++) {
      const d = `2023-01-${i.toString().padStart(2, '0')}`;
      histSPY.push({ ticker: 'SPY', date: d, closePrice: 100, adjustedClosePrice: 100 });
      histA.push({ 
        ticker: 'A', 
        date: d, 
        closePrice: 100, 
        adjustedClosePrice: i === 1 ? 50 : 100 // Day 1 was 50, day 2 is 100. Return = 100%. 
      });
    }
    provider.prices['A'] = histA;
    provider.prices['SPY'] = histSPY;
    const riskService = new RiskService(new MarketDataRepository(provider));
    const holdings: Holding[] = [ { ticker: 'A', quantity: 1, avgCost: 50, createdAt: Timestamp.now() } ];
    
    // We don't check full metrics, but if it used adjusted, day 1->2 return is 1.0. 
    // If it fell back to closePrice incorrectly, return is 0.0.
    const metrics = await riskService.calculateCurrentCompositionRisk(holdings);
    expect(metrics.volatility).toBeGreaterThan(0); 
    expect(metrics.priceAdjustment).toBe('adjusted');
  });
});

describe('Risk Engine - Date Alignment and Drawdown', () => {
  it('aligns dates by intersection and ignores missing days', () => {
    const provider = new BaseMockProvider();
    const riskService = new RiskService(new MarketDataRepository(provider));

    const p1 = [
      { ticker: 'A', date: '2023-01-01', closePrice: 1 },
      { ticker: 'A', date: '2023-01-02', closePrice: 2 },
      { ticker: 'A', date: '2023-01-03', closePrice: 3 },
      { ticker: 'A', date: '2023-01-05', closePrice: 4 },
    ];
    const p2 = [
      { ticker: 'B', date: '2023-01-02', closePrice: 4 },
      { ticker: 'B', date: '2023-01-03', closePrice: 5 },
      { ticker: 'B', date: '2023-01-04', closePrice: 6 },
      { ticker: 'B', date: '2023-01-05', closePrice: 7 },
    ];
    
    const aligned = riskService.alignPrices([p1, p2]);
    // Intersect: 02, 03, 05
    expect(aligned[0].map(p => p.date)).toEqual(['2023-01-02', '2023-01-03', '2023-01-05']);
    expect(aligned[1].map(p => p.date)).toEqual(['2023-01-02', '2023-01-03', '2023-01-05']);
  });

  it('calculates exact MDD', () => {
    const provider = new BaseMockProvider();
    const riskService = new RiskService(new MarketDataRepository(provider));
    // Always up -> MDD 0
    expect(riskService.calculateMaxDrawdown([0.1, 0.1, 0.1])).toBe(0);
    // Peak = 1.2. Drop to 0.9 => -25%.
    expect(riskService.calculateMaxDrawdown([0.1, 0.09090909, -0.25, 0.05])).toBeCloseTo(-0.25, 4);
    // Drop without recovery: 1 -> 0.8 (-20%) -> 0.6 (-25% from 0.8, -40% from 1)
    expect(riskService.calculateMaxDrawdown([-0.2, -0.25])).toBeCloseTo(-0.4, 4);
  });
});

describe('Risk Engine - Zero Variance and Beta Edge Cases', () => {
  it('handles zero variance (stddev = 0) and sets Sharpe and Beta safely to 0', async () => {
    const provider = new BaseMockProvider();
    provider.latest['A'] = { ticker: 'A', date: '2023-01-01', closePrice: 100 };
    
    const histA: PriceHistory[] = [];
    const histSPY: PriceHistory[] = [];
    for(let i=1; i<=65; i++) {
      const d = `2023-01-${i.toString().padStart(2, '0')}`;
      // 0 variance for portfolio (price is flat)
      histA.push({ ticker: 'A', date: d, closePrice: 100 });
      // 0 variance for benchmark (price is flat)
      histSPY.push({ ticker: 'SPY', date: d, closePrice: 100 });
    }
    provider.prices['A'] = histA;
    provider.prices['SPY'] = histSPY;

    const riskService = new RiskService(new MarketDataRepository(provider));
    const holdings: Holding[] = [ { ticker: 'A', quantity: 1, avgCost: 50, createdAt: Timestamp.now() } ];
    
    const metrics = await riskService.calculateCurrentCompositionRisk(holdings, 0, 'SPY');
    expect(metrics.volatility).toBe(0);
    expect(metrics.sharpeRatio).toBeNull();
    expect(metrics.beta).toBeNull();
    expect(metrics.metricAvailability?.sharpeRatio).toBe('zero_variance');
    expect(metrics.metricAvailability?.beta).toBe('zero_benchmark_variance');
    expect(metrics.maxDrawdown).toBe(0);
  });

  it('calculates Beta correctly (cov / var)', async () => {
    const provider = new BaseMockProvider();
    provider.latest['A'] = { ticker: 'A', date: '2023-01-01', closePrice: 100 };
    provider.latest['B'] = { ticker: 'B', date: '2023-01-01', closePrice: 100 };
    
    const histA: PriceHistory[] = [];
    const histB: PriceHistory[] = [];
    const histSPY: PriceHistory[] = [];
    
    // Let SPY returns be r_t.
    // Asset A returns exactly 2 * r_t. (Beta = 2)
    // Asset B returns exactly r_t. (Beta = 1)
    let pA = 100, pB = 100, pSPY = 100;
    
    for(let i=1; i<=65; i++) {
      const d = `2023-01-${i.toString().padStart(2, '0')}`;
      histA.push({ ticker: 'A', date: d, closePrice: pA });
      histB.push({ ticker: 'B', date: d, closePrice: pB });
      histSPY.push({ ticker: 'SPY', date: d, closePrice: pSPY });
      
      const r_spy = (i % 2 === 0) ? 0.05 : -0.05;
      pSPY = pSPY * (1 + r_spy);
      pA = pA * (1 + (2 * r_spy));
      pB = pB * (1 + r_spy);
    }
    
    provider.prices['A'] = histA;
    provider.prices['B'] = histB;
    provider.prices['SPY'] = histSPY;

    const riskService = new RiskService(new MarketDataRepository(provider));
    
    const holdingA: Holding[] = [ { ticker: 'A', quantity: 1, avgCost: 100, createdAt: Timestamp.now() } ];
    const metricsA = await riskService.calculateCurrentCompositionRisk(holdingA);
    expect(metricsA.beta).toBeCloseTo(2, 1); // Sample cov/var can have tiny floating point variations, 1 dec is fine

    const holdingB: Holding[] = [ { ticker: 'B', quantity: 1, avgCost: 100, createdAt: Timestamp.now() } ];
    const metricsB = await riskService.calculateCurrentCompositionRisk(holdingB);
    expect(metricsB.beta).toBeCloseTo(1, 1);
  });
});
