/**
 * Financial Math Utilities
 */

/**
 * Calculates simple daily returns: r_t = P_t / P_{t-1} - 1
 */
export const calculateDailyReturns = (prices: number[]): number[] => {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1];
    const curr = prices[i];
    if (prev === 0 || isNaN(prev) || isNaN(curr) || !isFinite(prev) || !isFinite(curr)) {
      throw new Error('Invalid price data for return calculation');
    }
    returns.push(curr / prev - 1);
  }
  return returns;
};

export const mean = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

export const sampleVariance = (arr: number[]): number => {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const sumSq = arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0);
  return sumSq / (arr.length - 1);
};

export const sampleStdDev = (arr: number[]): number => {
  return Math.sqrt(sampleVariance(arr));
};

export const sampleCovariance = (arr1: number[], arr2: number[]): number => {
  if (arr1.length !== arr2.length) throw new Error('Arrays must have the same length');
  if (arr1.length < 2) return 0;
  const m1 = mean(arr1);
  const m2 = mean(arr2);
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += (arr1[i] - m1) * (arr2[i] - m2);
  }
  return sum / (arr1.length - 1);
};
