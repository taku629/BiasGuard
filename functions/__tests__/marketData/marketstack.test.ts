import { fetchMarketstackEod } from '../../src/marketData/marketstack';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('marketstack adapter', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data and transform to CanonicalDailyPrice', async () => {
    const mockData = {
      data: {
        data: [
          {
            close: 150.0,
            adj_close: 148.5,
            symbol: 'AAPL',
            date: '2023-10-05T00:00:00+0000'
          },
          {
            close: 200.0,
            adj_close: null,
            symbol: 'MSFT',
            date: '2023-10-05T00:00:00+0000'
          }
        ]
      }
    };

    mockedAxios.get.mockResolvedValueOnce(mockData);

    const result = await fetchMarketstackEod(['AAPL', 'MSFT'], '2023-10-05', '2023-10-05', 'fake_api_key');

    expect(mockedAxios.get).toHaveBeenCalledWith('http://api.marketstack.com/v1/eod', {
      params: {
        access_key: 'fake_api_key',
        symbols: 'AAPL,MSFT',
        date_from: '2023-10-05',
        date_to: '2023-10-05',
        limit: 1000
      }
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      ticker: 'AAPL',
      date: '2023-10-05',
      closePrice: 150.0,
      adjustedClosePrice: 148.5,
      source: 'marketstack'
    });
    
    // MSFT fallback to close
    expect(result[1]).toEqual({
      ticker: 'MSFT',
      date: '2023-10-05',
      closePrice: 200.0,
      adjustedClosePrice: 200.0,
      source: 'marketstack'
    });
  });

  it('should reject more than 25 tickers', async () => {
    const symbols = Array(26).fill('AAPL');
    await expect(fetchMarketstackEod(symbols, '2023-10-05', '2023-10-05', 'key')).rejects.toThrow('Max 25 tickers per request');
  });

  it('should reject more than 400 days', async () => {
    await expect(fetchMarketstackEod(['AAPL'], '2022-01-01', '2023-10-05', 'key')).rejects.toThrow('Max 400 days range');
  });

  it('should ignore entries with NaN or zero close', async () => {
    const mockData = {
      data: {
        data: [
          {
            close: 0,
            symbol: 'AAPL',
            date: '2023-10-05T00:00:00+0000'
          },
          {
            close: Number.NaN,
            symbol: 'MSFT',
            date: '2023-10-05T00:00:00+0000'
          }
        ]
      }
    };

    mockedAxios.get.mockResolvedValueOnce(mockData);

    const result = await fetchMarketstackEod(['AAPL', 'MSFT'], '2023-10-05', '2023-10-05', 'key');
    expect(result).toHaveLength(0);
  });
});
