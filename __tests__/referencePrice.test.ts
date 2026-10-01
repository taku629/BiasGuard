import { calculateReferencePriceSensitivity } from '../src/services/behavior/referencePrice';
import { AssessmentResponse } from '../src/types/models';
import { Timestamp } from 'firebase/firestore';
import { referencePriceV1 } from '../src/features/behavioralAssessments/items/referencePrice.v1';

describe('Reference Price Sensitivity', () => {
  const mockBase = (id: string, estimate: number): AssessmentResponse => ({
    id: `resp_${id}`,
    sessionId: 's1',
    itemId: id,
    userEstimate: estimate,
    createdAt: Timestamp.now(),
  });

  it('calculates 0 pull for exactly normative estimates', () => {
    const responses = referencePriceV1.map(item => mockBase(item.id, item.normativeEstimate));
    const res = calculateReferencePriceSensitivity(responses);
    
    expect(res.meanAnchorPull).toBe(0);
    expect(res.medianAnchorPull).toBe(0);
    expect(res.signal.displaySeverity).toBe(0);
  });

  it('calculates 0.5 pull for halfway estimates', () => {
    const responses = referencePriceV1.map(item => {
      const halfway = item.normativeEstimate + (item.referencePrice - item.normativeEstimate) * 0.5;
      return mockBase(item.id, halfway);
    });
    const res = calculateReferencePriceSensitivity(responses);
    
    expect(res.meanAnchorPull).toBeCloseTo(0.5);
    expect(res.medianAnchorPull).toBeCloseTo(0.5);
    expect(res.signal.displaySeverity).toBe(50);
  });

  it('calculates 1 pull for exact anchor estimates', () => {
    const responses = referencePriceV1.map(item => mockBase(item.id, item.referencePrice));
    const res = calculateReferencePriceSensitivity(responses);
    
    expect(res.meanAnchorPull).toBeCloseTo(1);
    expect(res.medianAnchorPull).toBeCloseTo(1);
    expect(res.signal.displaySeverity).toBe(100);
  });

  it('calculates negative pull for opposite direction', () => {
    const responses = referencePriceV1.map(item => {
      const dist = item.referencePrice - item.normativeEstimate;
      return mockBase(item.id, item.normativeEstimate + dist * -0.1);
    });
    const res = calculateReferencePriceSensitivity(responses);
    
    expect(res.meanAnchorPull).toBeCloseTo(-0.1);
    expect(res.signal.rawValue).toBeCloseTo(-0.1);
    expect(res.signal.displaySeverity).toBe(0); // Clamped
  });

  it('rejects invalid estimates (negative)', () => {
    // 5 valid, 1 invalid (negative)
    const responses = referencePriceV1.map((item, index) => 
      mockBase(item.id, index === 0 ? -100 : item.normativeEstimate)
    );
    const res = calculateReferencePriceSensitivity(responses);
    
    // Total is 5, requires 6
    expect(res.signal.status).toBe('insufficient_data');
    expect(res.trialCount).toBe(5);
  });

  it('requires at least 3 high and 3 low', () => {
    // Only pass the first 5
    const responses = referencePriceV1.slice(0, 5).map(item => mockBase(item.id, item.normativeEstimate));
    const res = calculateReferencePriceSensitivity(responses);
    
    expect(res.signal.status).toBe('insufficient_data');
  });

  it('does not mutate input array', () => {
    const responses = referencePriceV1.map(item => mockBase(item.id, item.normativeEstimate));
    const copy = [...responses];
    calculateReferencePriceSensitivity(responses);
    expect(responses).toEqual(copy);
  });
});
