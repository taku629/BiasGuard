import { Transaction, PriceHistory } from '@/types/models';
import { DispositionResult, PositionState } from './types';
import { MarketDataRepository } from '../marketData/MarketDataRepository';
import { formatDate } from '@/utils/date';

export class DispositionEngine {
  private marketData: MarketDataRepository;

  constructor(marketDataRepo: MarketDataRepository) {
    this.marketData = marketDataRepo;
  }

  /**
   * Group transactions by YYYY-MM-DD in chronological order.
   */
  private groupTransactionsByDay(transactions: Transaction[]) {
    const map = new Map<string, { buys: Transaction[]; sells: Transaction[] }>();
    
    // Sort transactions globally first
    const sorted = [...transactions].sort((a, b) => a.executedAt.toMillis() - b.executedAt.toMillis());

    for (const t of sorted) {
      const dateStr = formatDate(t.executedAt.toDate());
      if (!map.has(dateStr)) {
        map.set(dateStr, { buys: [], sells: [] });
      }
      const group = map.get(dateStr)!;
      if (t.type === 'buy') group.buys.push(t);
      else group.sells.push(t);
    }

    // Return as array sorted by date
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }

  public async analyze(transactions: Transaction[]): Promise<DispositionResult> {
    let rg = 0;
    let rl = 0;
    let pg = 0;
    let pl = 0;
    let missingPrices = 0;
    let decisionDays = 0;

    const positions: Record<string, PositionState> = {};
    const grouped = this.groupTransactionsByDay(transactions);

    for (const [date, { buys, sells }] of grouped) {
      // 1. Apply Buys for the day
      for (const t of buys) {
        if (!positions[t.ticker]) {
          positions[t.ticker] = { ticker: t.ticker, quantity: 0, averageCost: 0, realizedPnL: 0, realizedGainCount: 0, realizedLossCount: 0, isOpen: false };
        }
        const pos = positions[t.ticker];
        const fees = t.fees || 0;
        const newQuantity = pos.quantity + t.quantity;
        pos.averageCost = ((pos.quantity * pos.averageCost) + (t.quantity * t.price) + fees) / newQuantity;
        pos.quantity = newQuantity;
        pos.isOpen = true;
      }

      // 2. If it's a decision day (has sells)
      if (sells.length > 0) {
        decisionDays++;
        
        // Find which tickers were sold today
        const soldTickers = new Set(sells.map(s => s.ticker));

        // For all OPEN positions, fetch market price and classify
        const openTickers = Object.values(positions).filter(p => p.isOpen).map(p => p.ticker);
        
        for (const ticker of openTickers) {
          const pos = positions[ticker];
          
          let prices: PriceHistory[];
          try {
            prices = await this.marketData.getDailyPrices(ticker, date, date);
          } catch (e) {
            prices = [];
          }

          if (prices.length === 0) {
            missingPrices++;
            continue; // Skip classification if no market price available
          }

          const priceRecord = prices[0];
          const marketPrice = priceRecord.adjustedClosePrice ?? priceRecord.closePrice;

          const isGain = marketPrice > pos.averageCost;
          const isLoss = marketPrice < pos.averageCost;
          const wasSold = soldTickers.has(ticker);

          if (isGain) {
            if (wasSold) rg++;
            else pg++;
          } else if (isLoss) {
            if (wasSold) rl++;
            else pl++;
          }
          // if marketPrice === avgCost, neither (ignored in Odean framework)
        }
      }

      // 3. Apply Sells for the day (to update state for next days)
      for (const t of sells) {
        const pos = positions[t.ticker];
        if (!pos) throw new Error(`Sell on ${t.ticker} but position does not exist.`);
        
        // (Oversell validation happens in UI/DB, but we enforce strictly here too)
        if (t.quantity > pos.quantity) {
          throw new Error(`Oversell detected: ${t.ticker}`);
        }

        pos.quantity -= t.quantity;
        if (pos.quantity === 0) {
          pos.isOpen = false;
          pos.averageCost = 0;
        }
      }
    }

    const gainOpps = rg + pg;
    const lossOpps = rl + pl;

    const pgr = gainOpps > 0 ? rg / gainOpps : 0;
    const plr = lossOpps > 0 ? rl / lossOpps : 0;
    const de = pgr - plr;

    const isSufficient = gainOpps >= 5 && lossOpps >= 5;

    // Severity score [0, 100]
    const biasSeverity = Math.min(Math.max(de * 100, 0), 100);
    const lossReluctance = 1 - plr;

    return {
      pgr,
      plr,
      dispositionEffect: de,
      realizedGains: rg,
      realizedLosses: rl,
      paperGains: pg,
      paperLosses: pl,
      gainOpportunities: gainOpps,
      lossOpportunities: lossOpps,
      saleDecisionDays: decisionDays,
      status: isSufficient ? 'sufficient' : 'insufficient_data',
      biasSeverity,
      lossRealizationReluctance: lossReluctance,
      dataQuality: { missingPrices },
      calculatedAt: new Date().toISOString()
    };
  }
}
