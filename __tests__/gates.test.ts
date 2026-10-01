import { BillingStatus } from '../src/contexts/BillingContext';
import { BehavioralSignal } from '../src/types/models';

// Pure logic functions that represent the gates

export const canCreatePortfolio = (status: BillingStatus, currentCount: number): boolean => {
  if (status === 'pro') return true;
  return currentCount < 1;
};

export const canAccessSignal = (status: BillingStatus, signalType: BehavioralSignal['type']): boolean => {
  if (status === 'pro') return true;
  return signalType === 'overconfidence_calibration';
};

describe('Feature Gates', () => {
  describe('Portfolio Creation Limit', () => {
    it('allows free users to create their first portfolio', () => {
      expect(canCreatePortfolio('free', 0)).toBe(true);
    });

    it('prevents free users from creating more than 1 portfolio', () => {
      expect(canCreatePortfolio('free', 1)).toBe(false);
      expect(canCreatePortfolio('free', 5)).toBe(false);
    });

    it('allows pro users to create unlimited portfolios', () => {
      expect(canCreatePortfolio('pro', 0)).toBe(true);
      expect(canCreatePortfolio('pro', 1)).toBe(true);
      expect(canCreatePortfolio('pro', 5)).toBe(true);
      expect(canCreatePortfolio('pro', 100)).toBe(true);
    });
  });

  describe('Behavioral Dashboard Signal Limits', () => {
    const allSignals: BehavioralSignal['type'][] = [
      'overconfidence_calibration',
      'disposition_effect',
      'loss_realization_reluctance',
      'confirmation_selective_exposure',
      'reference_price_sensitivity'
    ];

    it('allows free users to access overconfidence calibration only', () => {
      expect(canAccessSignal('free', 'overconfidence_calibration')).toBe(true);
      expect(canAccessSignal('free', 'disposition_effect')).toBe(false);
      expect(canAccessSignal('free', 'loss_realization_reluctance')).toBe(false);
      expect(canAccessSignal('free', 'confirmation_selective_exposure')).toBe(false);
      expect(canAccessSignal('free', 'reference_price_sensitivity')).toBe(false);
    });

    it('allows pro users to access all signals', () => {
      allSignals.forEach(signal => {
        expect(canAccessSignal('pro', signal)).toBe(true);
      });
    });
  });
});
