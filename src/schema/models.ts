import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// Firestore Timestampの簡易バリデーション
const timestampSchema = z.custom<Timestamp>(
  (val: any) => val && typeof val.seconds === 'number' && typeof val.nanoseconds === 'number',
  { message: 'Invalid Firestore Timestamp' }
);

export const PortfolioSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.optional(),
});

export const HoldingSchema = z.object({
  id: z.string().optional(),
  ticker: z.string().min(1, 'Ticker is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  avgCost: z.number().min(0, 'Average cost must be non-negative'),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.optional(),
});

export const TransactionSchema = z.object({
  id: z.string().optional(),
  portfolioId: z.string().min(1),
  holdingId: z.string().optional(),
  ticker: z.string().min(1, 'Ticker is required'),
  type: z.enum(['buy', 'sell']),
  price: z.number().positive('Price must be greater than 0'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  executedAt: timestampSchema,
  fees: z.number().min(0).optional(),
});

export const NewsReadLogSchema = z.object({
  id: z.string().optional(),
  portfolioId: z.string(),
  ticker: z.string(),
  sentiment: z.number().min(-1).max(1),
  readAt: timestampSchema,
  // Preparation for confirmation bias
  priorBelief: z.enum(['bullish', 'bearish', 'neutral']).optional()
});

export const BehavioralSignalSchema = z.object({
  id: z.string().optional(),
  type: z.enum([
    'disposition_effect',
    'loss_realization_reluctance',
    'overconfidence_calibration',
    'confirmation_selective_exposure',
    'reference_price_sensitivity'
  ]),
  rawValue: z.number(),
  displaySeverity: z.number().min(0).max(100).optional(),
  status: z.enum(['sufficient', 'insufficient_data']),
  evidenceCount: z.number(),
  methodologyVersion: z.string(),
  calculatedAt: timestampSchema,
});

// For backward compatibility / migration
export const BiasScoreSchema = BehavioralSignalSchema;

export const AssessmentSessionSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  assessmentType: z.enum(['financial_knowledge', 'selective_exposure', 'reference_price_sensitivity']),
  version: z.string(),
  startedAt: timestampSchema,
  completedAt: timestampSchema.optional(),
});

export const AssessmentResponseSchema = z.object({
  id: z.string().optional(),
  sessionId: z.string().min(1),
  itemId: z.string().min(1),
  
  // financial knowledge fields
  answer: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  correct: z.boolean().optional(),
  
  // selective exposure fields
  initialView: z.enum(['positive', 'negative', 'uncertain']).optional(),
  initialConfidence: z.number().min(0).max(1).optional(),
  selectedEvidenceIds: z.array(z.string()).optional(),
  
  // reference price sensitivity fields
  userEstimate: z.number().optional(),
  
  createdAt: timestampSchema,
});

export const PriceHistorySchema = z.object({
  ticker: z.string(),
  date: z.string(), // YYYY-MM-DD
  closePrice: z.number().min(0),
  adjustedClosePrice: z.number().min(0).optional(),
  source: z.string().optional(),
});
