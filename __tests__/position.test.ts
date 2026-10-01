import { reconstructPositions } from '../src/services/behavior/position';
import { Transaction } from '../src/types/models';
import { Timestamp } from 'firebase/firestore';

describe('Position Reconstruction', () => {
  const baseTx = { portfolioId: 'p1', ticker: 'AAPL', executedAt: Timestamp.fromMillis(1000) } as Transaction;

  it('handles buy from zero and multiple buys (weighted average cost)', () => {
    const txs: Transaction[] = [
      { ...baseTx, id: '1', type: 'buy', quantity: 10, price: 100, fees: 0, executedAt: Timestamp.fromMillis(1000) },
      { ...baseTx, id: '2', type: 'buy', quantity: 10, price: 200, fees: 0, executedAt: Timestamp.fromMillis(2000) },
    ];
    
    const pos = reconstructPositions(txs)['AAPL'];
    expect(pos.quantity).toBe(20);
    expect(pos.averageCost).toBe(150); // (1000 + 2000) / 20 = 150
    expect(pos.isOpen).toBe(true);
  });

  it('includes fees in average cost', () => {
    const txs: Transaction[] = [
      { ...baseTx, id: '1', type: 'buy', quantity: 10, price: 100, fees: 50, executedAt: Timestamp.fromMillis(1000) },
    ];
    const pos = reconstructPositions(txs)['AAPL'];
    expect(pos.averageCost).toBe(105); // (10*100 + 50)/10 = 105
  });

  it('handles partial sell and calculates realized PnL', () => {
    const txs: Transaction[] = [
      { ...baseTx, id: '1', type: 'buy', quantity: 10, price: 100, fees: 0, executedAt: Timestamp.fromMillis(1000) },
      { ...baseTx, id: '2', type: 'sell', quantity: 5, price: 150, fees: 10, executedAt: Timestamp.fromMillis(2000) },
    ];
    const pos = reconstructPositions(txs)['AAPL'];
    expect(pos.quantity).toBe(5);
    expect(pos.averageCost).toBe(100); // unaffected by sell
    expect(pos.realizedPnL).toBe(240); // (150-100)*5 - 10 = 240
    expect(pos.realizedGainCount).toBe(1);
    expect(pos.realizedLossCount).toBe(0);
  });

  it('rejects oversell', () => {
    const txs: Transaction[] = [
      { ...baseTx, id: '1', type: 'buy', quantity: 10, price: 100, fees: 0, executedAt: Timestamp.fromMillis(1000) },
      { ...baseTx, id: '2', type: 'sell', quantity: 15, price: 150, fees: 0, executedAt: Timestamp.fromMillis(2000) },
    ];
    expect(() => reconstructPositions(txs)).toThrow(/Oversell detected/);
  });

  it('handles full sell and resets position', () => {
    const txs: Transaction[] = [
      { ...baseTx, id: '1', type: 'buy', quantity: 10, price: 100, fees: 0, executedAt: Timestamp.fromMillis(1000) },
      { ...baseTx, id: '2', type: 'sell', quantity: 10, price: 150, fees: 0, executedAt: Timestamp.fromMillis(2000) },
    ];
    const pos = reconstructPositions(txs)['AAPL'];
    expect(pos.quantity).toBe(0);
    expect(pos.isOpen).toBe(false);
    expect(pos.averageCost).toBe(0);
  });

  it('sorts same timestamp deterministically (buy before sell)', () => {
    const time = Timestamp.fromMillis(1000);
    // Even if sell is first in array, it should process buy first to avoid oversell
    const txs: Transaction[] = [
      { ...baseTx, id: '2', type: 'sell', quantity: 5, price: 150, fees: 0, executedAt: time },
      { ...baseTx, id: '1', type: 'buy', quantity: 10, price: 100, fees: 0, executedAt: time },
    ];
    const pos = reconstructPositions(txs)['AAPL'];
    expect(pos.quantity).toBe(5);
    expect(pos.isOpen).toBe(true);
  });

  it('does not mutate input array', () => {
    const txs: Transaction[] = [
      { ...baseTx, id: '2', type: 'sell', quantity: 5, price: 150, fees: 0, executedAt: Timestamp.fromMillis(2000) },
      { ...baseTx, id: '1', type: 'buy', quantity: 10, price: 100, fees: 0, executedAt: Timestamp.fromMillis(1000) },
    ];
    const original = [...txs];
    reconstructPositions(txs);
    expect(txs).toEqual(original); // Should remain out of chronological order
  });
});
