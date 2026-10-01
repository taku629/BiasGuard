import { calculateSelectiveExposure } from '../src/services/behavior/selectiveExposure';
import { AssessmentResponse } from '../src/types/models';
import { Timestamp } from 'firebase/firestore';
import { selectiveExposureV1 } from '../src/features/behavioralAssessments/items/selectiveExposure.v1';

describe('Selective Exposure', () => {
  const mockBase = (id: string, initialView: 'positive'|'negative'|'uncertain', evIds: string[]): AssessmentResponse => ({
    id: `resp_${id}`,
    sessionId: 's1',
    itemId: id,
    initialView,
    initialConfidence: 0.5,
    selectedEvidenceIds: evIds,
    createdAt: Timestamp.now(),
  });

  const getBullishEvIds = (itemId: string) => selectiveExposureV1.find(i => i.id === itemId)!.evidence.filter(e => e.direction === 'bullish').map(e => e.id);
  const getBearishEvIds = (itemId: string) => selectiveExposureV1.find(i => i.id === itemId)!.evidence.filter(e => e.direction === 'bearish').map(e => e.id);

  it('calculates all confirming selections correctly', () => {
    const responses = selectiveExposureV1.map(item => mockBase(item.id, 'positive', getBullishEvIds(item.id)));
    const res = calculateSelectiveExposure(responses);
    
    expect(res.confirmingSelections).toBe(10);
    expect(res.disconfirmingSelections).toBe(0);
    expect(res.selectionBalance).toBe(1);
    expect(res.signal.displaySeverity).toBe(100);
    expect(res.directionalTrials).toBe(5);
  });

  it('calculates all disconfirming selections correctly', () => {
    const responses = selectiveExposureV1.map(item => mockBase(item.id, 'positive', getBearishEvIds(item.id)));
    const res = calculateSelectiveExposure(responses);
    
    expect(res.confirmingSelections).toBe(0);
    expect(res.disconfirmingSelections).toBe(10);
    expect(res.selectionBalance).toBe(-1);
    expect(res.signal.displaySeverity).toBe(0);
  });

  it('calculates exact 50/50 balance', () => {
    const responses = selectiveExposureV1.map(item => {
      const bulls = getBullishEvIds(item.id);
      const bears = getBearishEvIds(item.id);
      return mockBase(item.id, 'positive', [bulls[0], bears[0]]);
    });
    const res = calculateSelectiveExposure(responses);
    
    expect(res.confirmingSelections).toBe(5);
    expect(res.disconfirmingSelections).toBe(5);
    expect(res.selectionBalance).toBe(0);
    expect(res.signal.displaySeverity).toBe(0);
  });

  it('excludes uncertain priors', () => {
    const responses = selectiveExposureV1.map((item, index) => {
      const bulls = getBullishEvIds(item.id);
      return mockBase(item.id, index === 0 ? 'uncertain' : 'positive', bulls);
    });
    const res = calculateSelectiveExposure(responses);
    
    expect(res.totalTrials).toBe(5);
    expect(res.directionalTrials).toBe(4);
    expect(res.signal.status).toBe('insufficient_data'); // Needs 5 directional
  });

  it('rejects duplicated evidence selection', () => {
    // Need at least 5 to be sufficient
    const responses = selectiveExposureV1.map(item => {
      const bulls = getBullishEvIds(item.id);
      // passing the same bull ev id twice
      return mockBase(item.id, 'positive', [bulls[0], bulls[0]]);
    });
    const res = calculateSelectiveExposure(responses);
    
    // Each trial should only count 1 selection if duplicated
    expect(res.confirmingSelections).toBe(5); // Not 10
    expect(res.disconfirmingSelections).toBe(0);
  });

  it('does not mutate input array', () => {
    const responses = selectiveExposureV1.map(item => mockBase(item.id, 'positive', getBullishEvIds(item.id)));
    const copy = [...responses];
    calculateSelectiveExposure(responses);
    expect(responses).toEqual(copy);
  });
});
