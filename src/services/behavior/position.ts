import { Transaction } from '@/types/models';
import { PositionState } from './types';

/**
 * Reconstructs position state chronologically from a list of transactions.
 * Transactions are grouped by ticker.
 */
export const reconstructPositions = (transactions: Transaction[]): Record<string, PositionState> => {
  // Sort chronologically. If same executedAt, process 'buy' before 'sell' to ensure inventory exists.
  const sorted = [...transactions].sort((a, b) => {
    const aTime = a.executedAt.toMillis();
    const bTime = b.executedAt.toMillis();
    if (aTime === bTime) {
      if (a.type === 'buy' && b.type === 'sell') return -1;
      if (a.type === 'sell' && b.type === 'buy') return 1;
      return 0;
    }
    return aTime - bTime;
  });

  const positions: Record<string, PositionState> = {};

  for (const t of sorted) {
    if (!positions[t.ticker]) {
      positions[t.ticker] = {
        ticker: t.ticker,
        quantity: 0,
        averageCost: 0,
        realizedPnL: 0,
        realizedGainCount: 0,
        realizedLossCount: 0,
        isOpen: false,
      };
    }

    const pos = positions[t.ticker];
    const fees = t.fees || 0;

    if (t.type === 'buy') {
      const newQuantity = pos.quantity + t.quantity;
      const totalCost = (pos.quantity * pos.averageCost) + (t.quantity * t.price) + fees;
      pos.averageCost = totalCost / newQuantity;
      pos.quantity = newQuantity;
      pos.isOpen = true;
    } else if (t.type === 'sell') {
      if (t.quantity > pos.quantity) {
        throw new Error(`Oversell detected for ${t.ticker}: attempting to sell ${t.quantity} but only have ${pos.quantity}`);
      }

      const pnl = (t.price - pos.averageCost) * t.quantity - fees;
      pos.realizedPnL += pnl;

      if (pnl > 0) pos.realizedGainCount++;
      else if (pnl < 0) pos.realizedLossCount++;

      pos.quantity -= t.quantity;
      if (pos.quantity === 0) {
        pos.isOpen = false;
        pos.averageCost = 0; // reset for potential future buys
      }
    }
  }

  return positions;
};
