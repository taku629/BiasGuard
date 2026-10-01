import { MockMarketDataProvider } from '../src/services/marketData/MockMarketDataProvider';

describe('MockMarketDataProvider', () => {
  it('generates deterministic prices', async () => {
    const provider = new MockMarketDataProvider();
    const prices1 = await provider.getDailyPrices('AAPL', '2023-01-01', '2023-01-10');
    const prices2 = await provider.getDailyPrices('AAPL', '2023-01-01', '2023-01-10');
    
    // Should be exactly identical
    expect(prices1).toEqual(prices2);
  });

  it('differentiates by ticker', async () => {
    const provider = new MockMarketDataProvider();
    const pAAPL = await provider.getDailyPrices('AAPL', '2023-01-01', '2023-01-10');
    const pMSFT = await provider.getDailyPrices('MSFT', '2023-01-01', '2023-01-10');
    
    expect(pAAPL[0].closePrice).not.toBe(pMSFT[0].closePrice);
  });

  it('aligns latest price with daily price if date matches', async () => {
    const provider = new MockMarketDataProvider();
    const latest = await provider.getLatestPrice('AAPL');
    const daily = await provider.getDailyPrices('AAPL', latest.date, latest.date);
    
    expect(latest.closePrice).toBe(daily[0].closePrice);
  });
});
