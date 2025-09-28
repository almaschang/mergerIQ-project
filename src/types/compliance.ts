export interface DisclosureSimulationInput {
  text: string;
  assumptions?: string[];
}

export interface DisclosureSimulationScore {
  complianceScore: number;
  riskDelta: number;
  sentimentShift: number;
  regulatorRisk: number;
  investorRisk: number;
  supplierRisk: number;
  workforceRisk: number;
}

export interface DisclosureRecommendation {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  supportingEvidence?: string[];
}

export interface DisclosureSimulationReport {
  generatedAt: number;
  inputLength: number;
  score: DisclosureSimulationScore;
  recommendations: DisclosureRecommendation[];
}

export interface StakeholderSignal {
  stakeholder: 'regulators' | 'investors' | 'suppliers' | 'workforce';
  opportunity: number;
  risk: number;
  commentary: string;
  evidenceIds: string[];
}

export interface StakeholderMatrixReport {
  generatedAt: number;
  overallRiskScore: number;
  signals: StakeholderSignal[];
}
