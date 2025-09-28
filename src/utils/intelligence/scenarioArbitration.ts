import {
  ScenarioArbitrationResult,
  ScenarioModelEvaluation,
  ScenarioResult,
  ScenarioCompanyBaseline
} from '../../types/scenario';
import { SCENARIO_DEFINITIONS } from './scenarioSimulator';
import { fetchHistoricalPrices, PriceHistoryPoint } from '../market/priceHistory';
import { clamp, roundTo } from './textMetrics';

function getScenarioDefinition(scenarioId: string) {
  return SCENARIO_DEFINITIONS.find((item) => item.id === scenarioId);
}

function computeDeterministicEvaluation(result: ScenarioResult, scenarioName: string): ScenarioModelEvaluation {
  const confidence = clamp(result.systemStressScore / 100, 0.25, 0.95);
  const evidence = result.impacts.map((impact) =>
    `${impact.symbol}: price ${impact.priceImpact.toFixed(1)}%, liquidity ${impact.liquidityImpact.toFixed(1)}%`
  );

  return {
    modelId: 'deterministic',
    label: 'Simulation Engine',
    confidence: roundTo(confidence, 3),
    rationale: `Base simulation projects ${result.systemStressScore.toFixed(1)} system stress. ${scenarioName} impacts are quantified across peers.`,
    evidence
  } satisfies ScenarioModelEvaluation;
}

interface HistoricalContext {
  latestReturn: number;
  maxDrawdown: number;
}

function analyzeHistoricalDrawdown(prices: PriceHistoryPoint[], horizonDays: number): HistoricalContext {
  if (!prices.length) {
    return { latestReturn: 0, maxDrawdown: 0 };
  }

  const sorted = [...prices].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latest = sorted[sorted.length - 1].close;
  const horizonIndex = Math.max(sorted.length - horizonDays, 0);
  const horizonPrice = sorted[horizonIndex]?.close ?? sorted[0].close;
  const latestReturn = horizonPrice ? (latest - horizonPrice) / horizonPrice : 0;

  let peak = sorted[0].close;
  let maxDrawdown = 0;
  for (const point of sorted) {
    if (point.close > peak) {
      peak = point.close;
    }
    if (peak > 0) {
      const drawdown = (point.close - peak) / peak;
      if (drawdown < maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
  }

  return {
    latestReturn,
    maxDrawdown
  };
}

function formatHistoricalRationale(context: HistoricalContext, horizonDays: number): string {
  const drop = Math.abs(context.maxDrawdown * 100).toFixed(1);
  const recent = (context.latestReturn * 100).toFixed(1);
  return `Observed max drawdown ${drop}% over lookback; latest ${horizonDays}-day return ${recent}%`;
}

function computeNarrativeEvaluation(baseline: ScenarioCompanyBaseline | undefined, severityWeight: number): ScenarioModelEvaluation {
  if (!baseline) {
    return {
      modelId: 'narrative',
      label: 'Resilience Heuristics',
      confidence: 0.35,
      rationale: 'Baseline financial resilience unknown; treat narrative guidance cautiously.'
    } satisfies ScenarioModelEvaluation;
  }

  const liquidityCoverage = baseline.cash > 0 ? clamp(baseline.cash / Math.max(baseline.debt, 1), 0, 5) : 0;
  const marginScore = clamp(baseline.profitMargin * 5, -1, 1);
  const betaScore = baseline.beta !== undefined ? clamp(1 - baseline.beta / 3, -1, 1) : 0.2;
  const resilience = clamp((liquidityCoverage * 0.25) + marginScore * 0.5 + betaScore * 0.25, 0, 1);
  const confidence = clamp(resilience * severityWeight, 0.2, 0.9);

  return {
    modelId: 'narrative',
    label: 'Resilience Heuristics',
    confidence: roundTo(confidence, 3),
    rationale: `Cash/debt ${liquidityCoverage.toFixed(2)}x, margin ${(baseline.profitMargin * 100).toFixed(1)}%, beta ${baseline.beta ?? 'n/a'} — indicates ${confidence > 0.55 ? 'capacity to absorb shocks' : 'limited absorption capacity'}.`,
    evidence: [
      `Cash ${baseline.cash.toLocaleString()} vs debt ${baseline.debt.toLocaleString()}`,
      `Market cap ${baseline.marketCap.toLocaleString()}`
    ]
  } satisfies ScenarioModelEvaluation;
}

function selectConsensusRecommendation(models: ScenarioModelEvaluation[]): string {
  const avgConfidence = models.reduce((sum, model) => sum + model.confidence, 0) / (models.length || 1);
  const highConfidence = models.filter((model) => model.confidence >= avgConfidence);

  if (!highConfidence.length) {
    return 'Monitor signals and refresh evidence before committing to an action.';
  }

  const deterministic = highConfidence.find((model) => model.modelId === 'deterministic');
  if (deterministic) {
    return `${deterministic.rationale} Execute defensive steps while monitoring peers.`;
  }

  return `${highConfidence[0].rationale} Prioritize mitigations aligned with this assessment.`;
}

export async function arbitrateScenario(
  scenarioId: string,
  result: ScenarioResult,
  baselines: ScenarioCompanyBaseline[],
  primarySymbol: string
): Promise<ScenarioArbitrationResult> {
  const definition = getScenarioDefinition(scenarioId);
  const scenarioName = definition?.name || 'Scenario';
  const primaryImpact = result.impacts.find((impact) => impact.isPrimary) || null;
  const deterministic = computeDeterministicEvaluation(result, scenarioName);

  let historical: ScenarioModelEvaluation = {
    modelId: 'historical-analog',
    label: 'Historical Analogs',
    confidence: 0.3,
    rationale: 'Historical performance unavailable.'
  } satisfies ScenarioModelEvaluation;

  if (primaryImpact) {
    const horizon = definition?.stressHorizonDays ?? 60;
    const prices = await fetchHistoricalPrices(primarySymbol, horizon * 3);
    if (prices.length) {
      const context = analyzeHistoricalDrawdown(prices, horizon);
      const expectedDrop = Math.abs(primaryImpact.priceImpact) / 100;
      const drawdownMagnitude = Math.abs(context.maxDrawdown);
      const confidence = clamp(drawdownMagnitude / Math.max(expectedDrop, 0.01), 0.2, 0.95);
      historical = {
        modelId: 'historical-analog',
        label: 'Historical Analogs',
        confidence: roundTo(confidence, 3),
        rationale: `${scenarioName}: ${formatHistoricalRationale(context, horizon)}`,
        evidence: [`Expected price swing ${(primaryImpact.priceImpact).toFixed(1)}%`, `Max drawdown ${(context.maxDrawdown * 100).toFixed(1)}%`]
      } satisfies ScenarioModelEvaluation;
    }
  }

  const severityWeight = definition?.severity === 'high' ? 0.9 : definition?.severity === 'medium' ? 0.75 : 0.6;
  const primaryBaseline = baselines.find((baseline) => baseline.symbol === primarySymbol);
  const narrative = computeNarrativeEvaluation(primaryBaseline, severityWeight || 0.7);

  const modelEvaluations = [deterministic, historical, narrative];
  const blendedConfidence = roundTo(
    modelEvaluations.reduce((sum, model) => sum + model.confidence, 0) / modelEvaluations.length,
    3
  );

  return {
    scenarioId,
    generatedAt: Date.now(),
    blendedConfidence,
    consensusRecommendation: selectConsensusRecommendation(modelEvaluations),
    modelEvaluations
  } satisfies ScenarioArbitrationResult;
}
