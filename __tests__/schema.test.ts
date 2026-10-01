import { PortfolioSchema, HoldingSchema } from '../src/schema/models';

describe('Zod Schema Validation', () => {
  it('should validate a correct portfolio', () => {
    const data = {
      name: 'My Portfolio',
      createdAt: { seconds: 1620000000, nanoseconds: 0 },
    };
    const result = PortfolioSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should invalidate a portfolio without a name', () => {
    const data = {
      name: '',
      createdAt: { seconds: 1620000000, nanoseconds: 0 },
    };
    const result = PortfolioSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should validate a correct holding', () => {
    const data = {
      ticker: 'AAPL',
      quantity: 10,
      avgCost: 150,
      createdAt: { seconds: 1620000000, nanoseconds: 0 },
    };
    const result = HoldingSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should invalidate a holding with negative quantity', () => {
    const data = {
      ticker: 'AAPL',
      quantity: -5,
      avgCost: 150,
      createdAt: { seconds: 1620000000, nanoseconds: 0 },
    };
    const result = HoldingSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
