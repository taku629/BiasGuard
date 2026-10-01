import { MARKET_DATA_MODE } from '../config/env';

export const getDemoDataset = () => {
  if (MARKET_DATA_MODE === 'production') {
    throw new Error('FATAL: Demo dataset is prohibited in production.');
  }

  return {
    portfolio: {
      id: 'demo-portfolio',
      name: 'Demo Portfolio (Deterministic)',
      createdAt: { seconds: 1672531200 }, // Fixed date: 2023-01-01
    },
    holdings: [
      { id: 'h1', ticker: 'AAPL', quantity: 50, avgCost: 150.0 },
      { id: 'h2', ticker: 'TSLA', quantity: 20, avgCost: 200.0 },
      { id: 'h3', ticker: 'GOOGL', quantity: 10, avgCost: 100.0 },
    ],
    transactions: [
      { id: 't1', ticker: 'AAPL', type: 'BUY', quantity: 50, price: 150.0, date: '2023-01-01' },
      { id: 't2', ticker: 'TSLA', type: 'BUY', quantity: 30, price: 210.0, date: '2023-01-15' },
      { id: 't3', ticker: 'TSLA', type: 'SELL', quantity: 10, price: 180.0, date: '2023-02-01' },
      { id: 't4', ticker: 'GOOGL', type: 'BUY', quantity: 10, price: 100.0, date: '2023-03-01' },
    ],
    riskMetrics: {
      volatility: 0.15,
      sharpeRatio: 1.2,
      maxDrawdown: 0.12,
      beta: 1.1,
      benchmark: 'SPY',
      priceAdjustment: 'Mock'
    },
    behavioralSignals: {
      dispositionEffect: 0.65,
      lossRealizationReluctance: 0.70,
      overconfidenceCalibration: 0.45,
      selectiveExposure: 0.50
    }
  };
};
