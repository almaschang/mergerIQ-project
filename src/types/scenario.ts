export type ScenarioSeverity = 'low' | 'medium' | 'high';

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  severity: ScenarioSeverity;
  stressHorizonDays: number;
  adjustments: {
    revenue: number;
    ebitda: number;
    netIncome: number;
    valuation: number;
    liquidity: number;
  };
  peerCorrelation: number;
  regulatoryTrigger?: string;
  tags?: string[];
}

export interface ScenarioCompanyBaseline {
  symbol: string;
  name: string;
  revenue: number;
  ebitda: number;
  netIncome: number;
  cash: number;
  debt: number;
  marketCap: number;
  peRatio: number;
  profitMargin: number;
  beta?: number;
}

export interface ScenarioImpact {
  symbol: string;
  name: string;
  revenueDelta: number;
  netIncomeDelta: number;
  ebitdaDelta: number;
  priceImpact: number;
  liquidityImpact: number;
  riskScore: number;
  isPrimary: boolean;
}

export interface ScenarioResult {
  scenarioId: string;
  generatedAt: number;
  impacts: ScenarioImpact[];
  systemStressScore: number;
  commentary: string;
}

export type ScenarioModelId = 'deterministic' | 'historical-analog' | 'narrative';

export interface ScenarioModelEvaluation {
  modelId: ScenarioModelId;
  label: string;
  confidence: number;
  rationale: string;
  evidence?: string[];
}

export interface ScenarioArbitrationResult {
  scenarioId: string;
  generatedAt: number;
  blendedConfidence: number;
  consensusRecommendation: string;
  modelEvaluations: ScenarioModelEvaluation[];
}

export interface ScenarioPlaybook {
  scenarioId: string;
  generatedAt: number;
  playbook: string;
}
