import { DisclosureSimulationInput, DisclosureSimulationReport, DisclosureRecommendation } from '../../types/compliance';
import { getCompanyNews } from '../market/companyNews';
import { getCompanyFilings } from '../market/secService';
import { getCompanyTranscripts } from '../market/transcriptService';
import { analyzeRegulatoryRisk } from './riskAnalyzer';
import { determineTone, clamp, roundTo } from './textMetrics';

const RISK_KEYWORDS = [
  'regulation', 'compliance', 'risk', 'fine', 'penalty', 'investigation',
  'lawsuit', 'legal', 'recall', 'governance', 'audit', 'restatement',
  'cyber', 'privacy', 'supply', 'logistics', 'labor', 'workforce', 'layoff'
];

const MITIGATION_KEYWORDS = [
  'mitigate', 'controls', 'complied', 'enhanced', 'strengthen', 'monitor',
  'remediation', 'improve disclosure', 'engage regulator', 'training', 'transparency'
];

function keywordScore(text: string, keywords: string[]): number {
  const normalized = text.toLowerCase();
  let hits = 0;
  keywords.forEach((keyword) => {
    if (normalized.includes(keyword.toLowerCase())) {
      hits += 1;
    }
  });
  return hits;
}

function buildRecommendation(id: string, message: string, severity: 'low' | 'medium' | 'high', evidence?: string[]): DisclosureRecommendation {
  return {
    id,
    message,
    severity,
    supportingEvidence: evidence
  };
}

export async function simulateDisclosure(
  symbol: string,
  input: DisclosureSimulationInput
): Promise<DisclosureSimulationReport> {
  const text = input.text || '';
  const trimmed = text.trim();
  const inputLength = trimmed.length;

  const [news, filings, transcripts] = await Promise.all([
    getCompanyNews(symbol),
    getCompanyFilings(symbol, 'ALL', 12),
    getCompanyTranscripts(symbol)
  ]);

  const riskReport = await analyzeRegulatoryRisk(symbol, news || [], filings || []);

  const transcriptContext = (transcripts || [])
    .slice(0, 2)
    .map((item) => (item?.content || '').toLowerCase())
    .join('\n');

  const baselineRisk = clamp(riskReport.overallRiskIndex / 100, 0, 1);
  const tone = determineTone(trimmed);
  const riskHits = keywordScore(trimmed, RISK_KEYWORDS);
  const mitigationHits = keywordScore(trimmed, MITIGATION_KEYWORDS);

  let sentimentShift = 0.5;
  if (tone === 'positive') sentimentShift = 0.7;
  if (tone === 'negative') sentimentShift = 0.3;
  sentimentShift = clamp(sentimentShift + mitigationHits * 0.05 - Math.max(0, riskHits - mitigationHits) * 0.04, 0, 1);

  let complianceScore = clamp(0.6 + mitigationHits * 0.05 - riskHits * 0.04 - baselineRisk * 0.25, 0, 1);
  if (!trimmed) {
    complianceScore = 0.3;
  }

  const riskDelta = roundTo(clamp(baselineRisk - complianceScore, -1, 1), 3);

  const regulatorRisk = clamp(baselineRisk + Math.max(0, riskHits - mitigationHits) * 0.05, 0, 1);
  const investorRisk = clamp((1 - complianceScore) * 0.5 + (1 - sentimentShift) * 0.5, 0, 1);
  const supplierRisk = clamp(((riskHits > 0 || trimmed.includes('supply') || transcriptContext.includes('supply')) ? regulatorRisk * 0.8 : baselineRisk * 0.6), 0, 1);
  const workforceRisk = clamp(((trimmed.includes('layoff') || trimmed.includes('restructuring') || transcriptContext.includes('workforce') || transcriptContext.includes('labor')) ? 0.7 : baselineRisk * 0.5), 0, 1);

  const recommendations: DisclosureRecommendation[] = [];

  if (!trimmed) {
    recommendations.push(buildRecommendation('draft-empty', 'Provide disclosure text to evaluate compliance risks.', 'high'));
  }

  if (riskReport.alerts.some((alert) => alert.priority === 'high')) {
    const uncoveredTheme = riskReport.alerts.find((alert) => !trimmed.toLowerCase().includes(alert.theme.toLowerCase()));
    if (uncoveredTheme) {
      recommendations.push(
        buildRecommendation(
          'address-alert',
          `Address ${uncoveredTheme.theme} risk acknowledged in recent alerts.`,
          'high',
          [uncoveredTheme.message]
        )
      );
    }
  }

  if (mitigationHits === 0) {
    recommendations.push(buildRecommendation('add-mitigation', 'Add mitigation language describing controls or remediation steps.', 'medium'));
  }

  if (sentimentShift < 0.4) {
    recommendations.push(buildRecommendation('tone-balance', 'Tone is predominantly negative; consider balancing with factual mitigation or outlook language.', 'medium'));
  }

  const report: DisclosureSimulationReport = {
    generatedAt: Date.now(),
    inputLength,
    score: {
      complianceScore: roundTo(complianceScore, 3),
      riskDelta,
      sentimentShift: roundTo(sentimentShift, 3),
      regulatorRisk: roundTo(regulatorRisk, 3),
      investorRisk: roundTo(investorRisk, 3),
      supplierRisk: roundTo(supplierRisk, 3),
      workforceRisk: roundTo(workforceRisk, 3)
    },
    recommendations
  };

  return report;
}
