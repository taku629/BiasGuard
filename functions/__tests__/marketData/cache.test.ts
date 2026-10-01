import { getDailyPricesCache } from '../../src/marketData/cache';
import { fetchMarketstackEod } from '../../src/marketData/marketstack';
import { getFirestore } from 'firebase-admin/firestore';

jest.mock('firebase-admin/firestore', () => {
  const mockGet = jest.fn();
  const mockWhere = jest.fn().mockReturnThis();
  const mockDoc = jest.fn().mockReturnThis();
  const mockCollection = jest.fn().mockReturnThis();
  const mockSet = jest.fn();
  const mockCommit = jest.fn();
  const mockBatch = jest.fn(() => ({
    set: mockSet,
    commit: mockCommit,
  }));

  const mockDb = {
    collection: mockCollection,
    doc: mockDoc,
    where: mockWhere,
    get: mockGet,
    batch: mockBatch,
    set: mockSet,
  };

  return {
    getFirestore: jest.fn(() => mockDb),
  };
});

jest.mock('../../src/marketData/marketstack', () => ({
  fetchMarketstackEod: jest.fn().mockResolvedValue([]),
}));

describe('cache', () => {
  let db: any;

  beforeEach(() => {
    db = getFirestore();
    jest.clearAllMocks();
  });

  it('should return cache hit if coverage exists and matches date range', async () => {
    const covSnap = {
      exists: true,
      data: () => ({ coveredFrom: '2023-10-01', coveredThrough: '2023-10-10', fetchedAt: Date.now() })
    };
    const pricesSnap = {
      forEach: (cb: any) => {
        cb({ data: () => ({ ticker: 'AAPL', date: '2023-10-05', closePrice: 150 }) });
      }
    };
    
    db.get.mockResolvedValueOnce(covSnap).mockResolvedValueOnce(pricesSnap);

    const result = await getDailyPricesCache(['AAPL'], '2023-10-05', '2023-10-05', 'key');
    
    expect(result.cacheStatus).toBe('hit');
    expect(result.prices).toHaveLength(1);
    expect(fetchMarketstackEod).not.toHaveBeenCalled();
  });

  it('should return cache miss and fetch if coverage missing', async () => {
    const covSnap = { exists: false };
    const pricesSnap = {
      forEach: (cb: any) => {}
    };
    
    // 1st get: coverage check
    // 2nd get: cache read
    // 3rd get: coverage check before updating
    db.get.mockResolvedValueOnce(covSnap)
          .mockResolvedValueOnce(pricesSnap)
          .mockResolvedValueOnce(covSnap);

    (fetchMarketstackEod as jest.Mock).mockResolvedValueOnce([
      { ticker: 'AAPL', date: '2023-10-05', closePrice: 150 }
    ]);

    const result = await getDailyPricesCache(['AAPL'], '2023-10-05', '2023-10-05', 'key');
    
    expect(result.cacheStatus).toBe('miss');
    expect(result.prices).toHaveLength(1);
    expect(fetchMarketstackEod).toHaveBeenCalledWith(['AAPL'], '2023-10-05', '2023-10-05', 'key');
    expect(db.batch().commit).toHaveBeenCalled();
  });
});
