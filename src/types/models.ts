import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';
import {
  PortfolioSchema,
  HoldingSchema,
  TransactionSchema,
  NewsReadLogSchema,
  BiasScoreSchema,
  PriceHistorySchema,
} from '../schema/models';

export type Portfolio = z.infer<typeof PortfolioSchema>;
export type Holding = z.infer<typeof HoldingSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;

export interface NewsReadLog {
  id?: string;
  portfolioId: string;
  ticker: string;
  sentiment: number;
  readAt: Timestamp;
  priorBelief?: 'bullish' | 'bearish' | 'neutral';
}

export interface BehavioralSignal {
  id?: string;
  type: 'disposition_effect' | 'loss_realization_reluctance' | 'overconfidence_calibration' | 'confirmation_selective_exposure' | 'reference_price_sensitivity';
  rawValue: number;
  displaySeverity?: number;
  status: 'sufficient' | 'insufficient_data';
  evidenceCount: number;
  methodologyVersion: string;
  calculatedAt: Timestamp;
}

export interface BiasScore extends BehavioralSignal {} // Backward compatibility

export interface AssessmentSession {
  id?: string;
  userId: string;
  assessmentType: 'financial_knowledge' | 'selective_exposure' | 'reference_price_sensitivity';
  version: string;
  startedAt: Timestamp;
  completedAt?: Timestamp;
}

export interface AssessmentResponse {
  id?: string;
  sessionId: string;
  itemId: string;
  createdAt: Timestamp;
  
  // financial knowledge
  answer?: string;
  confidence?: number;
  correct?: boolean;
  
  // selective exposure
  initialView?: 'positive' | 'negative' | 'uncertain';
  initialConfidence?: number;
  selectedEvidenceIds?: string[];
  
  // reference price sensitivity
  userEstimate?: number;
}

export interface PriceHistory {
  ticker: string;
  date: string;
  closePrice: number;
  adjustedClosePrice?: number;
  source?: string;
}
