import { Holding, PriceHistory } from '@/types/models';
import { MarketDataRepository } from '../marketData/MarketDataRepository';
import { calculateDailyReturns, mean, sampleStdDev, sampleCovariance, sampleVariance } from '../math';
import { RiskMetrics } from './types';
import { formatDate } from '@/utils/date';

export class RiskService {
  private marketData: MarketDataRepository;

  constructor(marketDataRepository: MarketDataRepository) {
    this.marketData = marketDataRepository;
  }

  /**
   * Aligns multiple price histories by finding the intersection of trading dates.
   * Discards days that do not have data for ALL given tickers.
   */
  public alignPrices(priceHistoriesList: PriceHistory[][]): PriceHistory[][] {
    if (priceHistoriesList.length === 0) return [];
    
    // Find intersection of all dates
    const dateMaps = priceHistoriesList.map(history => {
      const map = new Map<string, PriceHistory>();
      history.forEach(p => map.set(p.date, p));
      return map;
    });

    // Start with dates from the first history
    let commonDates = Array.from(dateMaps[0].keys());

    // Intersect with the rest
    for (let i = 1; i < dateMaps.length; i++) {
      commonDates = commonDates.filter(date => dateMaps[i].has(date));
    }

    // Sort dates chronologically
    commonDates.sort((a, b) => a.localeCompare(b));

    // Construct aligned histories
    return priceHistoriesList.map(map => {
      const pMap = new Map<string, PriceHistory>();
      map.forEach(p => pMap.set(p.date, p));
      return commonDates.map(date => pMap.get(date)!);
    });
  }

  private priceAdjStats = { adjusted: 0, raw: 0 };

  private extractPrices(history: PriceHistory[]): number[] {
    return history.map(p => {
      let price: number;
      if (p.adjustedClosePrice !== undefined) {
        price = p.adjustedClosePrice;
        this.priceAdjStats.adjusted++;
      } else {
        price = p.closePrice;
        this.priceAdjStats.raw++;
      }
      
      if (price <= 0 || isNaN(price) || !isFinite(price)) {
        throw new Error(`Invalid price found for ${p.ticker} on ${p.date}`);
      }
      return price;
    });
  }

  public calculateMaxDrawdown(dailyReturns: number[]): number {
    if (dailyReturns.length === 0) return 0;
    
    let wealth = 1;
    let runningPeak = 1;
    let maxDD = 0;

    for (const r of dailyReturns) {
      wealth = wealth * (1 + r);
      if (wealth > runningPeak) {
        runningPeak = wealth;
      }
      const drawdown = wealth / runningPeak - 1;
      if (drawdown < maxDD) {
        maxDD = drawdown;
      }
    }
    return maxDD;
  }

  public async calculateCurrentCompositionRisk(
    holdings: Holding[],
    annualRiskFreeRate: number = 0,
    benchmarkTicker: string = 'SPY',
    lookbackDays: number = 252
  ): Promise<RiskMetrics> {
    if (holdings.length === 0) {
      throw new Error('Portfolio has no holdings');
    }
    for (const h of holdings) {
      if (h.quantity <= 0 || isNaN(h.quantity) || !isFinite(h.quantity)) {
        throw new Error(`Invalid quantity for ${h.ticker}`);
      }
    }

    this.priceAdjStats = { adjusted: 0, raw: 0 };

    // Determine date range (roughly lookbackDays * 1.4 to account for weekends/holidays)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - Math.ceil(lookbackDays * 1.5));
    
    const endStr = formatDate(endDate);
    const startStr = formatDate(startDate);

    // Fetch latest prices for weights
    const latestPrices = await Promise.all(holdings.map(h => this.marketData.getLatestPrice(h.ticker)));
    
    let totalMarketValue = 0;
    const marketValues = holdings.map((h, i) => {
      const price = latestPrices[i].adjustedClosePrice ?? latestPrices[i].closePrice;
      if (price <= 0 || isNaN(price) || !isFinite(price)) {
        throw new Error(`Invalid latest price for ${h.ticker}`);
      }
      const mv = h.quantity * price;
      totalMarketValue += mv;
      return mv;
    });

    if (totalMarketValue <= 0) throw new Error('Total market value is zero or negative');
    const weights = marketValues.map(mv => mv / totalMarketValue);

    // Fetch historical prices
    const historiesPromises = holdings.map(h => this.marketData.getDailyPrices(h.ticker, startStr, endStr));
    historiesPromises.push(this.marketData.getDailyPrices(benchmarkTicker, startStr, endStr));
    
    const allHistories = await Promise.all(historiesPromises);
    const benchmarkHistoryRaw = allHistories.pop()!;
    const holdingsHistoriesRaw = allHistories;

    // Align all dates (holdings + benchmark)
    const aligned = this.alignPrices([...holdingsHistoriesRaw, benchmarkHistoryRaw]);
    const benchmarkHistory = aligned.pop()!;
    const holdingsHistories = aligned;

    // Calculate daily returns for each holding
    const holdingReturns = holdingsHistories.map(history => calculateDailyReturns(this.extractPrices(history)));
    const benchReturns = calculateDailyReturns(this.extractPrices(benchmarkHistory));

    const numObservations = benchReturns.length;
    if (numObservations < 60) {
      throw new Error(`Insufficient data. Required at least 60 common return observations, found ${numObservations}`);
    }

    // Calculate portfolio daily returns
    const portfolioReturns = new Array(numObservations).fill(0);
    
    for (let t = 0; t < numObservations; t++) {
      let r_pt = 0;
      for (let i = 0; i < weights.length; i++) {
        r_pt += weights[i] * holdingReturns[i][t];
      }
      portfolioReturns[t] = r_pt;
    }

    // Calculate Risk Metrics
    const metricAvailability: RiskMetrics['metricAvailability'] = {};
    
    // 1. Annualized Volatility
    const stdDev = sampleStdDev(portfolioReturns);
    const annualizedVol = stdDev * Math.sqrt(252);

    // 2. Sharpe Ratio
    const dailyRiskFree = Math.pow(1 + annualRiskFreeRate, 1 / 252) - 1;
    const excessReturns = portfolioReturns.map(r => r - dailyRiskFree);
    const excessStdDev = sampleStdDev(excessReturns);
    let sharpeRatio: number | null = null;
    if (excessStdDev > 0) {
      sharpeRatio = (mean(excessReturns) / excessStdDev) * Math.sqrt(252);
    } else {
      metricAvailability.sharpeRatio = "zero_variance";
    }

    // 3. Max Drawdown
    const maxDrawdown = this.calculateMaxDrawdown(portfolioReturns);

    // 4. Beta
    const benchVar = sampleVariance(benchReturns);
    let beta: number | null = null;
    if (benchVar > 0) {
      beta = sampleCovariance(portfolioReturns, benchReturns) / benchVar;
    } else {
      metricAvailability.beta = "zero_benchmark_variance";
    }

    const commonDates = benchmarkHistory.map(p => p.date);
    
    let priceAdjustment: "adjusted" | "raw-fallback" | "mixed" = "mixed";
    if (this.priceAdjStats.adjusted > 0 && this.priceAdjStats.raw === 0) priceAdjustment = "adjusted";
    else if (this.priceAdjStats.adjusted === 0 && this.priceAdjStats.raw > 0) priceAdjustment = "raw-fallback";

    return {
      volatility: annualizedVol,
      sharpeRatio,
      maxDrawdown,
      beta,
      observationCount: numObservations,
      startDate: commonDates[0], // Start date of prices (returns start from +1)
      endDate: commonDates[commonDates.length - 1],
      benchmark: benchmarkTicker,
      calculatedAt: new Date().toISOString(),
      metricAvailability,
      priceAdjustment
    };
  }
}
