export type RiskPriority = 'low' | 'medium' | 'high';

export interface RiskEvidenceSummary {
  id: string;
  title: string;
  timestamp: number;
  url?: string;
  sourceType: 'news' | 'filing';
  tone: 'positive' | 'negative' | 'neutral';
}

export interface RiskThemeInsight {
  theme: string;
  filingScore: number;
  newsScore: number;
  delta: number;
  priority: RiskPriority;
  externalMentions: number;
  internalMentions: number;
  evidence: RiskEvidenceSummary[];
}

export interface RiskAlert {
  id: string;
  theme: string;
  message: string;
  priority: RiskPriority;
  timestamp: number;
  sourceType: 'news' | 'filing';
  url?: string;
}

export interface RegulatoryRiskReport {
  symbol: string;
  generatedAt: number;
  overallRiskIndex: number;
  disclosureGapIndex: number;
  sentimentSkew: number;
  themes: RiskThemeInsight[];
  alerts: RiskAlert[];
  suggestedDisclosures?: string;
}
