import { calculateOverconfidence } from '../src/services/behavior/overconfidence';
import { AssessmentResponse } from '../src/types/models';
import { Timestamp } from 'firebase/firestore';

describe('Overconfidence Calibration', () => {
  const baseResponse = (id: string, correct: boolean, confidence: number, ms: number = 0): AssessmentResponse => ({
    id: `resp_${id}`,
    sessionId: 's1',
    itemId: id,
    answer: 'A',
    correct,
    confidence,
    createdAt: Timestamp.fromMillis(ms),
  });

  it('calculates correctly for 100% accurate, 100% confident', () => {
    const responses = [
      baseResponse('1', true, 1),
      baseResponse('2', true, 1),
      baseResponse('3', true, 1),
      baseResponse('4', true, 1),
      baseResponse('5', true, 1),
    ];
    const res = calculateOverconfidence(responses);
    expect(res.accuracy).toBe(1);
    expect(res.meanConfidence).toBe(1);
    expect(res.calibrationGap).toBe(0);
    expect(res.signal.displaySeverity).toBe(0);
  });

  it('calculates correctly for all incorrect, 100% confident', () => {
    const responses = [
      baseResponse('1', false, 1),
      baseResponse('2', false, 1),
      baseResponse('3', false, 1),
      baseResponse('4', false, 1),
      baseResponse('5', false, 1),
    ];
    const res = calculateOverconfidence(responses);
    expect(res.accuracy).toBe(0);
    expect(res.meanConfidence).toBe(1);
    expect(res.calibrationGap).toBe(1); // 1 - 0 = 1
    expect(res.signal.displaySeverity).toBe(100);
  });

  it('calculates 60% accuracy and 80% confidence', () => {
    const responses = [
      baseResponse('1', true, 0.8),
      baseResponse('2', true, 0.8),
      baseResponse('3', true, 0.8),
      baseResponse('4', false, 0.8),
      baseResponse('5', false, 0.8),
    ];
    const res = calculateOverconfidence(responses);
    expect(res.accuracy).toBe(0.6);
    expect(res.meanConfidence).toBe(0.8);
    expect(res.calibrationGap).toBeCloseTo(0.2);
    expect(res.signal.displaySeverity).toBeCloseTo(20);
  });

  it('clamps display severity at 0 for underconfidence', () => {
    const responses = [
      baseResponse('1', true, 0.2), // underconfident
      baseResponse('2', true, 0.2),
      baseResponse('3', true, 0.2),
      baseResponse('4', true, 0.2),
      baseResponse('5', true, 0.2),
    ];
    const res = calculateOverconfidence(responses);
    expect(res.accuracy).toBe(1);
    expect(res.meanConfidence).toBe(0.2);
    expect(res.calibrationGap).toBeCloseTo(-0.8);
    expect(res.signal.rawValue).toBeCloseTo(-0.8);
    expect(res.signal.displaySeverity).toBe(0);
  });

  it('handles invalid confidence boundaries', () => {
    const responses = [
      baseResponse('1', true, 1.5), // invalid > 1
      baseResponse('2', true, -0.5), // invalid < 0
      baseResponse('3', true, 0.5),
      baseResponse('4', true, 0.5),
      baseResponse('5', true, 0.5),
    ];
    const res = calculateOverconfidence(responses);
    // 1.5 -> 1.0, -0.5 -> 0, 0.5 * 3 = 1.5. Total conf = 2.5. Mean = 0.5.
    expect(res.meanConfidence).toBe(0.5);
  });

  it('returns insufficient_data for < 5 questions', () => {
    const responses = [
      baseResponse('1', true, 1),
    ];
    const res = calculateOverconfidence(responses);
    expect(res.signal.status).toBe('insufficient_data');
    expect(res.calibrationGap).toBe(0);
  });

  it('handles duplicate answers for the same item by keeping the latest', () => {
    const responses = [
      baseResponse('1', false, 1, 1000), // earlier, incorrect
      baseResponse('1', true, 0.5, 2000), // later, correct
      baseResponse('2', true, 0.5, 1000),
      baseResponse('3', true, 0.5, 1000),
      baseResponse('4', true, 0.5, 1000),
      baseResponse('5', true, 0.5, 1000),
    ];
    const res = calculateOverconfidence(responses);
    expect(res.questionCount).toBe(5);
    expect(res.accuracy).toBe(1); // Item 1 is true in the latest
    expect(res.meanConfidence).toBe(0.5); 
  });

  it('does not mutate input array', () => {
    const responses = [
      baseResponse('1', true, 1),
      baseResponse('2', true, 1),
      baseResponse('3', true, 1),
      baseResponse('4', true, 1),
      baseResponse('5', true, 1),
    ];
    const copy = [...responses];
    calculateOverconfidence(responses);
    expect(responses).toEqual(copy);
  });
});
