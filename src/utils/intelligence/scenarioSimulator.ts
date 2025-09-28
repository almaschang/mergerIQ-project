import {
  ScenarioCompanyBaseline,
  ScenarioDefinition,
  ScenarioImpact,
  ScenarioResult
} from '../../types/scenario';
import { clamp, roundTo } from './textMetrics';

export const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  {
    id: 'revenue-miss',
    name: 'Revenue Miss & Margin Compression',
    description: 'Demand softens leading to an 8% revenue miss and 120 bps margin compression in the next earnings print.',
    severity: 'high',
    stressHorizonDays: 45,
    adjustments: {
      revenue: -0.08,
      ebitda: -0.1,
      netIncome: -0.12,
      valuation: -0.07,
      liquidity: -0.05
    },
    peerCorrelation: 0.55,
    regulatoryTrigger: 'sales-guidance warning',
    tags: ['earnings', 'demand']
  },
  {
    id: 'reg-fine',
    name: 'Regulatory Fine & Disclosure Gap',
    description: 'An unexpected regulatory fine forces a one-time charge, compliance uplift, and disclosure update.',
    severity: 'medium',
    stressHorizonDays: 30,
    adjustments: {
      revenue: -0.02,
      ebitda: -0.06,
      netIncome: -0.08,
      valuation: -0.05,
      liquidity: -0.12
    },
    peerCorrelation: 0.35,
    regulatoryTrigger: 'regulator inquiry',
    tags: ['compliance', 'regulatory']
  },
  {
    id: 'supply-shock',
    name: 'Supply Chain Shock',
    description: 'Critical supplier disruption triggers inventory delays, cost inflation, and delayed deliveries.',
    severity: 'medium',
    stressHorizonDays: 60,
    adjustments: {
      revenue: -0.05,
      ebitda: -0.09,
      netIncome: -0.07,
      valuation: -0.04,
      liquidity: -0.03
    },
    peerCorrelation: 0.45,
    regulatoryTrigger: 'supply disruption',
    tags: ['supply-chain', 'operations']
  }
];

function ratio(part: number, total: number): number {
  if (!isFinite(part) || !isFinite(total) || total === 0) return 0;
  return part / total;
}

function computeRiskScore(
  revenueShockPct: number,
  netIncomeShockPct: number,
  liquidityImpactPct: number,
  leverage: number,
  isPrimary: boolean
): number {
  const base =
    Math.abs(revenueShockPct) * 40 +
    Math.abs(netIncomeShockPct) * 35 +
    Math.max(liquidityImpactPct, 0) * 0.4;

  const leverageStress = Math.min(leverage, 6) * 5;
  const anchor = isPrimary ? 10 : 0;

  return clamp(base + leverageStress + anchor, 0, 100);
}

export function simulateScenario(
  baselines: ScenarioCompanyBaseline[],
  scenarioId: string,
  primarySymbol: string
): ScenarioResult {
  const scenario = SCENARIO_DEFINITIONS.find((item) => item.id === scenarioId);
  if (!scenario) {
    return {
      scenarioId,
      generatedAt: Date.now(),
      impacts: [],
      systemStressScore: 0,
      commentary: 'Scenario not configured.'
    };
  }

  const impacts: ScenarioImpact[] = baselines.map((baseline) => {
    const isPrimary = baseline.symbol === primarySymbol;
    const correlation = isPrimary ? 1 : scenario.peerCorrelation;

    const revenueShockPct = scenario.adjustments.revenue * correlation;
    const netIncomeShockPct = scenario.adjustments.netIncome * correlation;
    const ebitdaShockPct = scenario.adjustments.ebitda * correlation;
    const valuationShockPct = scenario.adjustments.valuation * correlation;
    const liquidityShockPct = scenario.adjustments.liquidity * correlation;

    const revenueDelta = roundTo(baseline.revenue * revenueShockPct, 0);
    const netIncomeDelta = roundTo(baseline.netIncome * netIncomeShockPct, 0);
    const ebitdaDelta = roundTo(baseline.ebitda * ebitdaShockPct, 0);

    const priceImpact = roundTo(valuationShockPct * 100, 2);
    const liquidityImpact = roundTo(liquidityShockPct * 100, 2);

    const leverage = baseline.cash > 0 ? ratio(baseline.debt, baseline.cash) : ratio(baseline.debt, baseline.marketCap || 1);
    const riskScore = roundTo(
      computeRiskScore(revenueShockPct, netIncomeShockPct, liquidityImpact, leverage, isPrimary),
      2
    );

    return {
      symbol: baseline.symbol,
      name: baseline.name,
      revenueDelta,
      netIncomeDelta,
      ebitdaDelta,
      priceImpact,
      liquidityImpact,
      riskScore,
      isPrimary
    } satisfies ScenarioImpact;
  });

  const systemStressScore = impacts.length
    ? roundTo(impacts.reduce((acc, impact) => acc + impact.riskScore, 0) / impacts.length, 2)
    : 0;

  const primaryImpact = impacts.find((impact) => impact.isPrimary);
  const commentary = primaryImpact
    ? `${primaryImpact.symbol} faces a ${primaryImpact.priceImpact.toFixed(1)}% valuation drag with revenue delta ${primaryImpact.revenueDelta.toLocaleString()}. Peer spillover keeps sector stress at ${systemStressScore.toFixed(1)}.`
    : 'Unable to compute primary company impact.';

  return {
    scenarioId: scenario.id,
    generatedAt: Date.now(),
    impacts,
    systemStressScore,
    commentary
  };
}
