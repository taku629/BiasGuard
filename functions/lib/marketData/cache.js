"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyPricesCache = getDailyPricesCache;
const firestore_1 = require("firebase-admin/firestore");
const marketstack_1 = require("./marketstack");
async function getCachedPrices(db, symbol, dateFrom, dateTo) {
    const snap = await db.collection('marketDataCache')
        .doc(symbol)
        .collection('daily')
        .where('date', '>=', dateFrom)
        .where('date', '<=', dateTo)
        .get();
    const results = [];
    snap.forEach((doc) => {
        results.push(doc.data());
    });
    return results;
}
async function savePricesToCache(db, prices) {
    const batch = db.batch();
    let count = 0;
    for (const price of prices) {
        const docRef = db.collection('marketDataCache')
            .doc(price.ticker)
            .collection('daily')
            .doc(price.date);
        batch.set(docRef, price);
        count++;
        if (count === 500) {
            await batch.commit();
            count = 0;
        }
    }
    if (count > 0) {
        await batch.commit();
    }
}
async function getDailyPricesCache(symbols, dateFrom, dateTo, apiKey) {
    const db = (0, firestore_1.getFirestore)();
    const allPrices = [];
    const symbolsToFetch = [];
    let cacheStatus = 'hit';
    let totalCached = 0;
    const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours TTL for EOD data and adjusted close updates
    const now = Date.now();
    for (const symbol of symbols) {
        const covRef = db.collection('marketDataCoverage').doc(symbol);
        const covSnap = await covRef.get();
        let isHit = false;
        if (covSnap.exists) {
            const data = covSnap.data();
            const isFresh = now - (data.fetchedAt || 0) < CACHE_TTL_MS;
            if (isFresh && data.coveredFrom <= dateFrom && data.coveredThrough >= dateTo) {
                isHit = true;
            }
        }
        if (isHit) {
            const cached = await getCachedPrices(db, symbol, dateFrom, dateTo);
            allPrices.push(...cached);
            totalCached += cached.length;
        }
        else {
            symbolsToFetch.push(symbol);
            const cached = await getCachedPrices(db, symbol, dateFrom, dateTo);
            allPrices.push(...cached);
            totalCached += cached.length;
        }
    }
    if (symbolsToFetch.length > 0) {
        cacheStatus = totalCached > 0 ? 'partial' : 'miss';
        console.log(JSON.stringify({
            metric: 'providerTickerLookups',
            count: symbolsToFetch.length,
            symbols: symbolsToFetch,
            dateFrom,
            dateTo
        }));
        const fetched = await (0, marketstack_1.fetchMarketstackEod)(symbolsToFetch, dateFrom, dateTo, apiKey);
        await savePricesToCache(db, fetched);
        const existingKeys = new Set(allPrices.map(p => `${p.ticker}-${p.date}`));
        for (const f of fetched) {
            if (!existingKeys.has(`${f.ticker}-${f.date}`)) {
                if (f.date >= dateFrom && f.date <= dateTo) {
                    allPrices.push(f);
                }
            }
        }
        for (const symbol of symbolsToFetch) {
            const covRef = db.collection('marketDataCoverage').doc(symbol);
            const covSnap = await covRef.get();
            let newFrom = dateFrom;
            let newThrough = dateTo;
            if (covSnap.exists) {
                const data = covSnap.data();
                if (data.coveredFrom && data.coveredFrom < newFrom)
                    newFrom = data.coveredFrom;
                if (data.coveredThrough && data.coveredThrough > newThrough)
                    newThrough = data.coveredThrough;
            }
            await covRef.set({
                ticker: symbol,
                coveredFrom: newFrom,
                coveredThrough: newThrough,
                fetchedAt: Date.now()
            }, { merge: true });
        }
    }
    allPrices.sort((a, b) => a.date.localeCompare(b.date));
    return { prices: allPrices, cacheStatus };
}
//# sourceMappingURL=cache.js.map