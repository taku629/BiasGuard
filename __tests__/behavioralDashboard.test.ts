import { mapSignalsToDashboard, RawSignalsMap } from '../src/features/behavior/mapping';

describe('Behavioral Dashboard Mapping', () => {
  it('handles severity 0 and 100, raw negative, insufficient signal, and missing signal', () => {
    const input: RawSignalsMap = {
      disposition_effect: { rawValue: -10, status: 'sufficient', evidenceCount: 5 },
      loss_realization_reluctance: { rawValue: 120, status: 'sufficient', evidenceCount: 10 },
      overconfidence_calibration: { rawValue: 50, status: 'insufficient_data', evidenceCount: 1 },
      confirmation_selective_exposure: { rawValue: 0, status: 'sufficient', evidenceCount: 3 }
      // reference_price_sensitivity is missing
    };

    const result = mapSignalsToDashboard(input);

    // disposition_effect: raw -10 clamped to 0
    const de = result.find(r => r.type === 'disposition_effect');
    expect(de?.severity).toBe(0);
    expect(de?.rawMetric).toBe(-10);
    expect(de?.status).toBe('sufficient');

    // loss_realization_reluctance: raw 120 clamped to 100
    const lrr = result.find(r => r.type === 'loss_realization_reluctance');
    expect(lrr?.severity).toBe(100);
    expect(lrr?.rawMetric).toBe(120);

    // overconfidence_calibration: insufficient data
    const oc = result.find(r => r.type === 'overconfidence_calibration');
    expect(oc?.status).toBe('insufficient_data');
    expect(oc?.severity).toBe(50);

    // missing signal
    const rps = result.find(r => r.type === 'reference_price_sensitivity');
    expect(rps?.status).toBe('missing');
    expect(rps?.severity).toBe(0);
    expect(rps?.rawMetric).toBe(0);
  });
});
