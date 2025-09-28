import { EvidenceRelation } from './evidence';
import { ScenarioModelEvaluation } from './scenario';

export type ActionModuleStatus = 'open' | 'in-progress' | 'completed' | 'abandoned';
export type ActionModuleSource = 'scenario' | 'disclosure' | 'regulatory' | 'custom';

export interface ActionModuleStep {
  id: string;
  label: string;
  status: 'pending' | 'done' | 'blocked';
  evidenceIds?: string[];
}

export interface ActionModule {
  id: string;
  title: string;
  description: string;
  owner?: string;
  createdAt: number;
  updatedAt: number;
  status: ActionModuleStatus;
  source: ActionModuleSource;
  sourceId?: string;
  confidence?: number;
  modelEvaluations?: ScenarioModelEvaluation[];
  steps: ActionModuleStep[];
  stakeholders?: ('regulators' | 'investors' | 'suppliers' | 'workforce')[];
  evidenceLinks?: {
    id: string;
    relation: EvidenceRelation;
  }[];
  adoptionCount: number;
  outcomeDelta?: number;
  notes?: string[];
}

export interface ActionFeedbackInput {
  moduleId: string;
  status: ActionModuleStatus;
  note?: string;
  outcomeDelta?: number;
}

export interface ActionMarketplaceSummary {
  totalModules: number;
  openModules: number;
  completedModules: number;
  averageConfidence: number;
  averageOutcomeDelta: number;
}
