export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  score: number;
  reasoning: string;
}

export interface MarketInsight {
  type: 'trend' | 'risk' | 'opportunity';
  description: string;
  confidence: number;
}