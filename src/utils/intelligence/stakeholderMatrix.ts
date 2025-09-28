import { StakeholderMatrixReport, StakeholderSignal } from '../../types/compliance';
import { analyzeRegulatoryRisk } from './riskAnalyzer';
import { getCompanyNews } from '../market/companyNews';
import { getCompanyFilings } from '../market/secService';
import { buildPeerUniverse } from '../../hooks/useScenarioCopilot';
import { analyzePeerDrift } from './peerDriftAnalyzer';
import { clamp, roundTo } from './textMetrics';

function buildSignal(
  stakeholder: StakeholderSignal['stakeholder'],
  risk: number,
  commentary: string,
  evidenceIds: string[]
): StakeholderSignal {
  return {
    stakeholder,
    risk: roundTo(clamp(risk, 0, 1), 3),
    opportunity: roundTo(clamp(1 - risk, 0, 1), 3),
    commentary,
    evidenceIds
  };
}

export async function analyzeStakeholderMatrix(symbol: string): Promise<StakeholderMatrixReport> {
  const [news, filings] = await Promise.all([
    getCompanyNews(symbol),
    getCompanyFilings(symbol, 'ALL', 12)
  ]);

  const riskReport = await analyzeRegulatoryRisk(symbol, news || [], filings || []);
  const peers = await buildPeerUniverse(symbol.toUpperCase());
  const peerSymbols = peers.filter((peer) => peer !== symbol.toUpperCase()).slice(0, 4);
  const peerDrift = peerSymbols.length ? await analyzePeerDrift(symbol, peerSymbols) : null;

  const regulatorRisk = clamp(riskReport.overallRiskIndex / 100, 0, 1);
  const investorRisk = peerDrift ? clamp(peerDrift.overallDriftScore / 5, 0, 1) : regulatorRisk * 0.8;

  const supplierTheme = riskReport.themes.find((theme) => theme.theme.toLowerCase().includes('operational') || theme.theme.toLowerCase().includes('supply'));
  const workforceTheme = riskReport.themes.find((theme) => theme.theme.toLowerCase().includes('workforce') || theme.theme.toLowerCase().includes('labor'));

  const supplierRisk = supplierTheme ? clamp((supplierTheme.newsScore + supplierTheme.delta) / 3, 0, 1) : regulatorRisk * 0.6;
  const workforceRisk = workforceTheme ? clamp((workforceTheme.newsScore + workforceTheme.delta) / 3, 0, 1) : regulatorRisk * 0.5;

  const signals: StakeholderSignal[] = [
    buildSignal(
      'regulators',
      regulatorRisk,
      `Regulatory risk index ${riskReport.overallRiskIndex.toFixed(1)} with ${riskReport.alerts.length} active alert(s).`,
      riskReport.alerts.map((alert) => alert.id)
    ),
    buildSignal(
      'investors',
      investorRisk,
      peerDrift
        ? `Peer drift score ${peerDrift.overallDriftScore.toFixed(2)} across ${peerDrift.drivers.length} peers.`
        : 'Limited peer drift signals available.',
      peerDrift ? peerDrift.alerts.map((alert) => alert.id) : []
    ),
    buildSignal(
      'suppliers',
      supplierRisk,
      supplierTheme
        ? `${supplierTheme.theme} shows delta ${supplierTheme.delta.toFixed(2)} with ${supplierTheme.externalMentions} external mentions.`
        : 'No explicit supply-chain discrepancies detected.',
      supplierTheme ? supplierTheme.evidence.map((item) => item.id?.toString() ?? '') : []
    ),
    buildSignal(
      'workforce',
      workforceRisk,
      workforceTheme
        ? `${workforceTheme.theme} flagged with ${workforceTheme.externalMentions} external mentions.`
        : 'No material workforce risk detected in recent coverage.',
      workforceTheme ? workforceTheme.evidence.map((item) => item.id?.toString() ?? '') : []
    )
  ];

  const overallRiskScore = signals.length
    ? roundTo(signals.reduce((sum, signal) => sum + signal.risk, 0) / signals.length, 3)
    : 0;

  return {
    generatedAt: Date.now(),
    overallRiskScore,
    signals
  } satisfies StakeholderMatrixReport;
}
