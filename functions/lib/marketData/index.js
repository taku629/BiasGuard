"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestPrices = exports.getDailyPrices = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const cache_1 = require("./cache");
const marketstackKey = (0, params_1.defineSecret)('MARKETSTACK_API_KEY');
exports.getDailyPrices = (0, https_1.onCall)({ secrets: [marketstackKey] }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const { ticker, startDate, endDate } = request.data;
    if (!ticker || typeof ticker !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'Valid ticker required.');
    }
    if (!startDate || !endDate) {
        throw new https_1.HttpsError('invalid-argument', 'startDate and endDate required.');
    }
    const apiKey = marketstackKey.value();
    const { prices } = await (0, cache_1.getDailyPricesCache)([ticker], startDate, endDate, apiKey);
    return {
        data: prices
    };
});
exports.getLatestPrices = (0, https_1.onCall)({ secrets: [marketstackKey] }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const { tickers } = request.data;
    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'Valid tickers array required.');
    }
    const apiKey = marketstackKey.value();
    const today = new Date();
    const dateTo = today.toISOString().split('T')[0];
    const lastWeek = new Date(today);
    lastWeek.setUTCDate(today.getUTCDate() - 7);
    const dateFrom = lastWeek.toISOString().split('T')[0];
    const { prices } = await (0, cache_1.getDailyPricesCache)(tickers, dateFrom, dateTo, apiKey);
    const latestPricesMap = {};
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
//# sourceMappingURL=index.js.map