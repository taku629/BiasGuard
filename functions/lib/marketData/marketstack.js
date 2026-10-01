"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMarketstackEod = fetchMarketstackEod;
const axios_1 = __importDefault(require("axios"));
async function fetchMarketstackEod(symbols, dateFrom, // YYYY-MM-DD
dateTo, // YYYY-MM-DD
apiKey) {
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
    const res = await axios_1.default.get('http://api.marketstack.com/v1/eod', {
        params: {
            access_key: apiKey,
            symbols: symbols.join(','),
            date_from: dateFrom,
            date_to: dateTo,
            limit: 1000
        }
    });
    const data = res.data.data;
    const prices = [];
    for (const item of data) {
        let adjClose = item.adj_close !== undefined && item.adj_close !== null ? item.adj_close : item.close;
        const close = item.close;
        if (close === undefined || close === null || isNaN(close) || close <= 0)
            continue;
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
//# sourceMappingURL=marketstack.js.map