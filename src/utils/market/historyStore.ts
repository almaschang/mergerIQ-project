import { ScenarioArbitrationResult, ScenarioResult } from '../../types/scenario';
import { PeerDriftReport } from '../../types/drift';
import { DisclosureSimulationReport } from '../../types/compliance';

const STORAGE_KEY = 'mergeriq_history_snapshots_v1';

type HistoryPayload = {
  scenarios: ScenarioSnapshot[];
  drifts: DriftSnapshot[];
  disclosures: DisclosureSnapshot[];
};

export interface ScenarioSnapshot {
  id: string;
  symbol: string;
  scenarioId: string;
  generatedAt: number;
  systemStressScore: number;
  blendedConfidence: number;
}

export interface DriftSnapshot {
  id: string;
  primarySymbol: string;
  generatedAt: number;
  overallDriftScore: number;
}

export interface DisclosureSnapshot {
  id: string;
  symbol: string;
  generatedAt: number;
  complianceScore: number;
  regulatorRisk: number;
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function load(): HistoryPayload {
  if (!canUseStorage()) {
    return { scenarios: [], drifts: [], disclosures: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { scenarios: [], drifts: [], disclosures: [] };
    }
    const data = JSON.parse(raw) as HistoryPayload;
    return {
      scenarios: Array.isArray(data?.scenarios) ? data.scenarios : [],
      drifts: Array.isArray(data?.drifts) ? data.drifts : [],
      disclosures: Array.isArray(data?.disclosures) ? data.disclosures : []
    };
  } catch (error) {
    console.warn('Failed to load history snapshots:', error);
    return { scenarios: [], drifts: [], disclosures: [] };
  }
}

let payload: HistoryPayload = load();

function persist() {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to persist history snapshots:', error);
  }
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function recordScenarioSnapshot(symbol: string, result: ScenarioResult, arbitration: ScenarioArbitrationResult) {
  const snapshot: ScenarioSnapshot = {
    id: uid('scenario'),
    symbol,
    scenarioId: result.scenarioId,
    generatedAt: arbitration.generatedAt,
    systemStressScore: result.systemStressScore,
    blendedConfidence: arbitration.blendedConfidence
  };
  payload.scenarios = [snapshot, ...payload.scenarios].slice(0, 50);
  persist();
}

export function recordDriftSnapshot(report: PeerDriftReport) {
  const snapshot: DriftSnapshot = {
    id: uid('drift'),
    primarySymbol: report.primarySymbol,
    generatedAt: report.generatedAt,
    overallDriftScore: report.overallDriftScore
  };
  payload.drifts = [snapshot, ...payload.drifts].slice(0, 100);
  persist();
}

export function recordDisclosureSnapshot(symbol: string, report: DisclosureSimulationReport) {
  const snapshot: DisclosureSnapshot = {
    id: uid('disclosure'),
    symbol,
    generatedAt: report.generatedAt,
    complianceScore: report.score.complianceScore,
    regulatorRisk: report.score.regulatorRisk
  };
  payload.disclosures = [snapshot, ...payload.disclosures].slice(0, 50);
  persist();
}

export function getHistorySnapshots(): HistoryPayload {
  return {
    scenarios: [...payload.scenarios],
    drifts: [...payload.drifts],
    disclosures: [...payload.disclosures]
  };
}


