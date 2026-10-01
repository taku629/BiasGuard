import { calculateDailyReturns, mean, sampleVariance, sampleStdDev, sampleCovariance } from '../src/services/math';

describe('Financial Math Utilities', () => {
  it('calculates daily returns correctly', () => {
    const prices = [100, 105, 102.9];
    const returns = calculateDailyReturns(prices);
    expect(returns.length).toBe(2);
    expect(returns[0]).toBeCloseTo(0.05);
    expect(returns[1]).toBeCloseTo(-0.02);
  });

  it('throws error on zero or invalid prices', () => {
    expect(() => calculateDailyReturns([100, 0, 100])).toThrow();
    expect(() => calculateDailyReturns([100, NaN, 100])).toThrow();
  });

  it('calculates mean correctly', () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
    expect(mean([])).toBe(0);
  });

  it('calculates sample variance and stddev correctly', () => {
    const arr = [10, 12, 23, 23, 16, 23, 21, 16];
    // mean = 18
    // sq diffs = 64 + 36 + 25 + 25 + 4 + 25 + 9 + 4 = 192
    // var = 192 / 7 = 27.42857...
    expect(sampleVariance(arr)).toBeCloseTo(27.42857, 4);
    expect(sampleStdDev(arr)).toBeCloseTo(5.23722, 4);
  });

  it('handles small arrays for variance', () => {
    expect(sampleVariance([1])).toBe(0);
    expect(sampleVariance([])).toBe(0);
    expect(sampleStdDev([1])).toBe(0);
  });

  it('calculates sample covariance correctly', () => {
    const x = [1692, 1978, 1884, 2151, 2519];
    const y = [68, 102, 110, 112, 154];
    // means: x=2044.8, y=109.2
    // sum prod diffs = 36429.2
    // cov = 36429.2 / 4 = 9107.3
    expect(sampleCovariance(x, y)).toBeCloseTo(9107.3, 1);
  });

  it('throws error for covariance on mismatched lengths', () => {
    expect(() => sampleCovariance([1, 2], [1])).toThrow();
  });
});
