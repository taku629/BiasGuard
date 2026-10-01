import { AssessmentResponse, BehavioralSignal } from '../../types/models';
import { Timestamp } from 'firebase/firestore';
import { selectiveExposureV1 } from '../../features/behavioralAssessments/items/selectiveExposure.v1';

export interface SelectiveExposureResult {
  confirmingSelections: number;
  disconfirmingSelections: number;
  confirmationSelectionRate: number;
  selectionBalance: number;
  directionalTrials: number;
  totalTrials: number;
  signal: BehavioralSignal;
}

export const calculateSelectiveExposure = (
  responses: AssessmentResponse[]
): SelectiveExposureResult => {
  // deduplicate responses by keeping the latest
  const latestResponsesMap = new Map<string, AssessmentResponse>();
  for (const r of responses) {
    const existing = latestResponsesMap.get(r.itemId);
    if (!existing || r.createdAt.toMillis() > existing.createdAt.toMillis()) {
      latestResponsesMap.set(r.itemId, r);
    }
  }

  const uniqueResponses = Array.from(latestResponsesMap.values());
  const totalTrials = uniqueResponses.length;

  // We only score trials where initialView was positive or negative
  const directionalResponses = uniqueResponses.filter(r => 
    r.initialView === 'positive' || r.initialView === 'negative'
  );

  const directionalTrials = directionalResponses.length;

  if (directionalTrials < 5) {
    return {
      confirmingSelections: 0,
      disconfirmingSelections: 0,
      confirmationSelectionRate: 0,
      selectionBalance: 0,
      directionalTrials,
      totalTrials,
      signal: {
        type: 'confirmation_selective_exposure',
        rawValue: 0,
        status: 'insufficient_data',
        evidenceCount: directionalTrials,
        methodologyVersion: '1.0',
        calculatedAt: Timestamp.now(),
      }
    };
  }

  let confirmingSelections = 0;
  let disconfirmingSelections = 0;

  for (const r of directionalResponses) {
    const item = selectiveExposureV1.find(i => i.id === r.itemId);
    if (!item) continue;
    
    const selectedIds = r.selectedEvidenceIds || [];
    // To prevent manipulation, only take the first 2 unique selections
    const uniqueSelections = Array.from(new Set(selectedIds)).slice(0, 2);

    for (const evId of uniqueSelections) {
      const ev = item.evidence.find(e => e.id === evId);
      if (!ev) continue;

      const isConfirming = 
        (r.initialView === 'positive' && ev.direction === 'bullish') ||
        (r.initialView === 'negative' && ev.direction === 'bearish');

      if (isConfirming) {
        confirmingSelections++;
      } else {
        disconfirmingSelections++;
      }
    }
  }

  const totalDirectionalSelections = confirmingSelections + disconfirmingSelections;

  const confirmationSelectionRate = totalDirectionalSelections > 0 
    ? confirmingSelections / totalDirectionalSelections 
    : 0;

  const selectionBalance = totalDirectionalSelections > 0
    ? (confirmingSelections - disconfirmingSelections) / totalDirectionalSelections
    : 0;

  const displaySeverity = Math.min(Math.max(selectionBalance * 100, 0), 100);

  const signal: BehavioralSignal = {
    type: 'confirmation_selective_exposure',
    rawValue: selectionBalance,
    displaySeverity,
    status: 'sufficient',
    evidenceCount: directionalTrials,
    methodologyVersion: '1.0',
    calculatedAt: Timestamp.now(),
  };

  return {
    confirmingSelections,
    disconfirmingSelections,
    confirmationSelectionRate,
    selectionBalance,
    directionalTrials,
    totalTrials,
    signal
  };
};
