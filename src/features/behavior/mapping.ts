import { SignalType, DashboardSignal } from './types';

export interface RawSignal {
  rawValue: number;
  status: 'sufficient' | 'insufficient_data';
  evidenceCount: number;
}

export type RawSignalsMap = Partial<Record<SignalType, RawSignal>>;

export const SIGNAL_METADATA: Record<SignalType, { name: string; explanation: string; clamp: (val: number) => number }> = {
  disposition_effect: {
    name: 'Disposition Effect',
    explanation: 'Holding losing investments too long while selling winning ones too quickly.',
    clamp: (val: number) => Math.max(0, Math.min(100, val)),
  },
  loss_realization_reluctance: {
    name: 'Loss Realization Reluctance',
    explanation: 'Hesitation to realize a loss when the market goes against a position.',
    clamp: (val: number) => Math.max(0, Math.min(100, val)),
  },
  overconfidence_calibration: {
    name: 'Overconfidence Calibration',
    explanation: 'Gap between actual knowledge/accuracy and expressed confidence.',
    clamp: (val: number) => Math.max(0, Math.min(100, val)),
  },
  confirmation_selective_exposure: {
    name: 'Information Selection',
    explanation: 'Seeking information that confirms existing beliefs while avoiding contradictory evidence.',
    clamp: (val: number) => Math.max(0, Math.min(100, val)),
  },
  reference_price_sensitivity: {
    name: 'Reference-Price Sensitivity',
    explanation: 'Anchoring on reference points (like purchase price) when estimating value.',
    clamp: (val: number) => Math.max(0, Math.min(100, val)),
  },
};

export const mapSignalsToDashboard = (rawMap: RawSignalsMap): DashboardSignal[] => {
  const types: SignalType[] = [
    'disposition_effect',
    'loss_realization_reluctance',
    'overconfidence_calibration',
    'confirmation_selective_exposure',
    'reference_price_sensitivity'
  ];

  return types.map(type => {
    const raw = rawMap[type];
    const meta = SIGNAL_METADATA[type];

    if (!raw) {
      return {
        type,
        name: meta.name,
        severity: 0,
        rawMetric: 0,
        evidenceCount: 0,
        status: 'missing',
        explanation: meta.explanation
      };
    }

    const severity = meta.clamp(raw.rawValue);

    return {
      type,
      name: meta.name,
      severity,
      rawMetric: raw.rawValue,
      evidenceCount: raw.evidenceCount,
      status: raw.status,
      explanation: meta.explanation
    };
  });
};
