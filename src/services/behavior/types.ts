import { Transaction } from '@/types/models';

export interface DispositionResult {
  pgr: number;
  plr: number;
  dispositionEffect: number; // PGR - PLR
  
  realizedGains: number;
  realizedLosses: number;
  paperGains: number;
  paperLosses: number;
  
  gainOpportunities: number;
  lossOpportunities: number;
  
  saleDecisionDays: number;
  
  status: 'sufficient' | 'insufficient_data';
  
  // Behavioral Signal Score [0..100]
  biasSeverity: number; 
  // Behavioral proxy for reluctance to realize loss (1 - PLR)
  lossRealizationReluctance: number;

  dataQuality: {
    missingPrices: number;
  };
  calculatedAt: string;
}

export interface PositionState {
  ticker: string;
  quantity: number;
  averageCost: number;
  realizedPnL: number;
  realizedGainCount: number;
  realizedLossCount: number;
  isOpen: boolean;
}
