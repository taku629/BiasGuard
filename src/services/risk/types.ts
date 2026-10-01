export interface RiskMetrics {
  volatility: number;
  sharpeRatio: number | null;
  maxDrawdown: number;
  beta: number | null;
  observationCount: number;
  startDate: string;
  endDate: string;
  benchmark: string;
  calculatedAt: string;
  
  metricAvailability?: {
    sharpeRatio?: "zero_variance" | "insufficient_data";
    beta?: "zero_benchmark_variance" | "insufficient_data";
  };

  priceAdjustment: "adjusted" | "raw-fallback" | "mixed";
}
