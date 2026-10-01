import { AssessmentResponse, BehavioralSignal } from '../../types/models';
import { Timestamp } from 'firebase/firestore';
import { referencePriceV1 } from '../../features/behavioralAssessments/items/referencePrice.v1';

export interface ReferencePriceResult {
  meanAnchorPull: number;
  medianAnchorPull: number;
  highAnchorMean: number;
  lowAnchorMean: number;
  trialCount: number;
  signal: BehavioralSignal;
}

export const calculateReferencePriceSensitivity = (
  responses: AssessmentResponse[]
): ReferencePriceResult => {
  // deduplicate
  const latestResponsesMap = new Map<string, AssessmentResponse>();
  for (const r of responses) {
    const existing = latestResponsesMap.get(r.itemId);
    if (!existing || r.createdAt.toMillis() > existing.createdAt.toMillis()) {
      latestResponsesMap.set(r.itemId, r);
    }
  }

  const uniqueResponses = Array.from(latestResponsesMap.values());

  const validTrials: { pull: number; type: 'high' | 'low' }[] = [];

  for (const r of uniqueResponses) {
    if (r.userEstimate === undefined || isNaN(r.userEstimate) || !isFinite(r.userEstimate) || r.userEstimate < 0) {
      continue;
    }
    
    const item = referencePriceV1.find(i => i.id === r.itemId);
    if (!item) continue;
    
    const anchorDistance = item.referencePrice - item.normativeEstimate;
    if (anchorDistance === 0) continue; // invalid item structure

    const estimateDistance = r.userEstimate - item.normativeEstimate;
    const anchorPull = estimateDistance / anchorDistance;

    validTrials.push({ pull: anchorPull, type: item.anchorType });
  }

  const highTrials = validTrials.filter(t => t.type === 'high');
  const lowTrials = validTrials.filter(t => t.type === 'low');
  const trialCount = validTrials.length;

  if (trialCount < 6 || highTrials.length < 3 || lowTrials.length < 3) {
    return {
      meanAnchorPull: 0,
      medianAnchorPull: 0,
      highAnchorMean: 0,
      lowAnchorMean: 0,
      trialCount,
      signal: {
        type: 'reference_price_sensitivity',
        rawValue: 0,
        status: 'insufficient_data',
        evidenceCount: trialCount,
        methodologyVersion: '1.0',
        calculatedAt: Timestamp.now(),
      }
    };
  }

  const totalPull = validTrials.reduce((sum, t) => sum + t.pull, 0);
  const meanAnchorPull = totalPull / trialCount;

  const pulls = validTrials.map(t => t.pull).sort((a, b) => a - b);
  const mid = Math.floor(pulls.length / 2);
  const medianAnchorPull = pulls.length % 2 !== 0 ? pulls[mid] : (pulls[mid - 1] + pulls[mid]) / 2.0;

  const highAnchorMean = highTrials.reduce((sum, t) => sum + t.pull, 0) / highTrials.length;
  const lowAnchorMean = lowTrials.reduce((sum, t) => sum + t.pull, 0) / lowTrials.length;

  // We use median as the primary aggregate to protect against extreme outliers (e.g. user entering 1,000,000,000)
  const displaySeverity = Math.min(Math.max(medianAnchorPull * 100, 0), 100);

  const signal: BehavioralSignal = {
    type: 'reference_price_sensitivity',
    rawValue: medianAnchorPull,
    displaySeverity,
    status: 'sufficient',
    evidenceCount: trialCount,
    methodologyVersion: '1.0',
    calculatedAt: Timestamp.now(),
  };

  return {
    meanAnchorPull,
    medianAnchorPull,
    highAnchorMean,
    lowAnchorMean,
    trialCount,
    signal
  };
};
