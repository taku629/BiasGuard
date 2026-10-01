import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { getDailyPricesCache } from './cache';

const marketstackKey = defineSecret('MARKETSTACK_API_KEY');

export const getDailyPrices = onCall({ secrets: [marketstackKey] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { ticker, startDate, endDate } = request.data;
  if (!ticker || typeof ticker !== 'string') {
    throw new HttpsError('invalid-argument', 'Valid ticker required.');
  }
  if (!startDate || !endDate) {
    throw new HttpsError('invalid-argument', 'startDate and endDate required.');
  }

  const apiKey = marketstackKey.value();
  const { prices } = await getDailyPricesCache([ticker], startDate, endDate, apiKey);

  return {
    data: prices
  };
});

export const getLatestPrices = onCall({ secrets: [marketstackKey] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { tickers } = request.data;
  if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
    throw new HttpsError('invalid-argument', 'Valid tickers array required.');
  }

  const apiKey = marketstackKey.value();
  
  const today = new Date();
  const dateTo = today.toISOString().split('T')[0];
  const lastWeek = new Date(today);
  lastWeek.setUTCDate(today.getUTCDate() - 7);
  const dateFrom = lastWeek.toISOString().split('T')[0];

  const { prices } = await getDailyPricesCache(tickers, dateFrom, dateTo, apiKey);

  const latestPricesMap: Record<string, any> = {};
  for (const price of prices) {
    const existing = latestPricesMap[price.ticker];
    if (!existing || price.date > existing.date) {
      latestPricesMap[price.ticker] = price;
    }
  }

  return {
    data: latestPricesMap
  };
});
