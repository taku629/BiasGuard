export type SignalType = 'disposition_effect' | 'loss_realization_reluctance' | 'overconfidence_calibration' | 'confirmation_selective_exposure' | 'reference_price_sensitivity';

export interface DashboardSignal {
  type: SignalType;
  name: string;
  severity: number;
  rawMetric: number;
  evidenceCount: number;
  status: 'sufficient' | 'insufficient_data' | 'missing';
  explanation: string;
}
