import { AssessmentResponse, BehavioralSignal } from '@/types/models';
import { Timestamp } from 'firebase/firestore';

export interface OverconfidenceResult {
  meanConfidence: number;
  accuracy: number;
  calibrationGap: number;
  questionCount: number;
  signal: BehavioralSignal;
}

/**
 * Calculates overconfidence calibration gap.
 * C = mean(confidence), A = mean(accuracy), Gap = C - A
 */
export const calculateOverconfidence = (
  responses: AssessmentResponse[]
): OverconfidenceResult => {
  // Filter out any duplicate responses for the same item by keeping the latest
  const latestResponsesMap = new Map<string, AssessmentResponse>();
  for (const r of responses) {
    const existing = latestResponsesMap.get(r.itemId);
    if (!existing || r.createdAt.toMillis() > existing.createdAt.toMillis()) {
      latestResponsesMap.set(r.itemId, r);
    }
  }

  const uniqueResponses = Array.from(latestResponsesMap.values());
  const questionCount = uniqueResponses.length;

  if (questionCount < 5) {
    return {
      meanConfidence: 0,
      accuracy: 0,
      calibrationGap: 0,
      questionCount,
      signal: {
        type: 'overconfidence_calibration',
        rawValue: 0,
        status: 'insufficient_data',
        evidenceCount: questionCount,
        methodologyVersion: '1.0',
        calculatedAt: Timestamp.now(),
      }
    };
  }

  let totalConfidence = 0;
  let correctCount = 0;

  for (const r of uniqueResponses) {
    // strict boundary clamp just in case
    const c = Math.max(0, Math.min(r.confidence || 0, 1));
    totalConfidence += c;
    if (r.correct) correctCount++;
  }

  const meanConfidence = totalConfidence / questionCount;
  const accuracy = correctCount / questionCount;
  const calibrationGap = meanConfidence - accuracy;

  const displaySeverity = Math.min(Math.max(calibrationGap * 100, 0), 100);

  const signal: BehavioralSignal = {
    type: 'overconfidence_calibration',
    rawValue: calibrationGap,
    displaySeverity,
    status: 'sufficient',
    evidenceCount: questionCount,
    methodologyVersion: '1.0',
    calculatedAt: Timestamp.now(),
  };

  return {
    meanConfidence,
    accuracy,
    calibrationGap,
    questionCount,
    signal
  };
};
