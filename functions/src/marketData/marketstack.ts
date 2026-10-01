import axios from 'axios';

export interface CanonicalDailyPrice {
  ticker: string;
  date: string; // YYYY-MM-DD
  closePrice: number;
  adjustedClosePrice: number;
  source: 'marketstack';
}

interface MarketstackData {
  close: number;
  adj_close?: number | null;
  symbol: string;
  date: string;
}

export async function fetchMarketstackEod(
  symbols: string[],
  dateFrom: string, // YYYY-MM-DD
  dateTo: string, // YYYY-MM-DD
  apiKey: string
): Promise<CanonicalDailyPrice[]> {
  if (symbols.length > 25) {
    throw new Error('Max 25 tickers per request');
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const dFrom = new Date(dateFrom);
  const dTo = new Date(dateTo);
  const daysDiff = (dTo.getTime() - dFrom.getTime()) / msPerDay;
  if (daysDiff > 400) {
    throw new Error('Max 400 days range');
  }

  const res = await axios.get('http://api.marketstack.com/v1/eod', {
    params: {
      access_key: apiKey,
      symbols: symbols.join(','),
      date_from: dateFrom,
      date_to: dateTo,
      limit: 1000
    }
  });

  const data: MarketstackData[] = res.data.data;
  const prices: CanonicalDailyPrice[] = [];

  for (const item of data) {
    let adjClose = item.adj_close !== undefined && item.adj_close !== null ? item.adj_close : item.close;
    const close = item.close;

    if (close === undefined || close === null || isNaN(close) || close <= 0) continue;
    if (adjClose === undefined || adjClose === null || isNaN(adjClose) || adjClose <= 0) {
      adjClose = close;
    }

    const dateStr = item.date.split('T')[0];

    prices.push({
      ticker: item.symbol,
      date: dateStr,
      closePrice: close,
      adjustedClosePrice: adjClose,
      source: 'marketstack'
    });
  }

  return prices;
}
