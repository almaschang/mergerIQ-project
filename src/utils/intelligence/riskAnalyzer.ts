import { MarketNews } from '../../types/market';
import { SECFiling } from '../../types/secFilings';
import {
  RegulatoryRiskReport,
  RiskAlert,
  RiskEvidenceSummary,
  RiskPriority,
  RiskThemeInsight
} from '../../types/risk';
import { determineTone, computeFreshnessScore, clamp, roundTo } from './textMetrics';

const RISK_THEMES: Record<string, string[]> = {
  'Regulatory Compliance': ['regulation', 'compliance', 'sec', 'doj', 'audit', 'governance'],
  'Data Privacy & Cyber': ['privacy', 'data breach', 'cyber', 'security', 'gdpr', 'encryption'],
  'Environmental & ESG': ['esg', 'environment', 'emissions', 'sustainability', 'carbon'],
  'Litigation & Legal': ['lawsuit', 'litigation', 'legal', 'class action', 'settlement'],
  'Financial Reporting': ['restatement', 'accounting', 'internal control', 'material weakness'],
  'Operational & Supply': ['supply', 'inventory', 'logistics', 'operations', 'production'],
  'Labor & Workforce': ['labor', 'union', 'workforce', 'strike', 'talent', 'attrition']
};

function matchesKeywords(text: string, keywords: string[]): boolean {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function toEvidenceFromNews(article: MarketNews): RiskEvidenceSummary {
  const timestamp = (article.datetime || 0) * 1000;
  const tone = determineTone(`${article.headline} ${article.summary}`);

  return {
    id: `news-${article.id}`,
    title: article.headline,
    timestamp,
    url: article.url,
    sourceType: 'news',
    tone
  };
}

function toEvidenceFromFiling(filing: SECFiling): RiskEvidenceSummary {
  const timestamp = new Date(filing.filingDate).getTime();
  const tone = determineTone(`${filing.title} ${filing.description}`);

  return {
    id: `filing-${filing.id}`,
    title: filing.title,
    timestamp,
    url: filing.documentUrl,
    sourceType: 'filing',
    tone
  };
}

function scoreNewsMention(article: MarketNews): number {
  const timestamp = (article.datetime || 0) * 1000;
  const freshness = computeFreshnessScore(timestamp);
  const tone = determineTone(`${article.headline} ${article.summary}`);
  const toneMultiplier = tone === 'negative' ? 1.1 : tone === 'positive' ? 0.7 : 0.9;
  const analysisBoost = article.isAnalysis ? 1.15 : 1;
  return roundTo(freshness * toneMultiplier * analysisBoost, 3);
}

function scoreFilingMention(filing: SECFiling): number {
  const timestamp = new Date(filing.filingDate).getTime();
  const freshness = computeFreshnessScore(timestamp);
  const typeBoost = filing.formType?.startsWith('10') ? 1.2 : filing.formType === '8-K' ? 1 : 0.8;
  return roundTo(freshness * typeBoost, 3);
}

function priorityFromDelta(delta: number): RiskPriority {
  if (delta > 1.4) return 'high';
  if (delta > 0.7) return 'medium';
  return 'low';
}

export function analyzeRegulatoryRisk(
  symbol: string,
  news: MarketNews[],
  filings: SECFiling[]
): RegulatoryRiskReport {
  const relevantNews = news
    .filter((article) => article.summary || article.headline)
    .filter((article) => determineTone(`${article.headline} ${article.summary}`) !== 'positive')
    .slice(0, 30);

  const themeInsights: RiskThemeInsight[] = Object.entries(RISK_THEMES).map(([theme, keywords]) => {
    const newsMatches = relevantNews.filter((article) =>
      matchesKeywords(`${article.headline} ${article.summary}`, keywords)
    );

    const filingMatches = filings.filter((filing) =>
      matchesKeywords(`${filing.title} ${filing.description}`, keywords)
    );

    const newsScore = newsMatches.reduce((acc, article) => acc + scoreNewsMention(article), 0);
    const filingScore = filingMatches.reduce((acc, filing) => acc + scoreFilingMention(filing), 0);
    const delta = roundTo(newsScore - filingScore, 3);
    const priority = priorityFromDelta(delta);

    const evidence: RiskEvidenceSummary[] = [
      ...newsMatches.slice(0, 3).map(toEvidenceFromNews),
      ...filingMatches.slice(0, 2).map(toEvidenceFromFiling)
    ];

    return {
      theme,
      filingScore: roundTo(filingScore, 3),
      newsScore: roundTo(newsScore, 3),
      delta,
      priority,
      externalMentions: newsMatches.length,
      internalMentions: filingMatches.length,
      evidence
    } satisfies RiskThemeInsight;
  });

  const alerts: RiskAlert[] = [];

  themeInsights.forEach((insight) => {
    if (insight.priority === 'high' && insight.delta > 0.8) {
      const topEvidence = insight.evidence.find((item) => item.sourceType === 'news');
      alerts.push({
        id: `${insight.theme}-gap`,
        theme: insight.theme,
        message: `${insight.theme} risk is surfacing externally without matching disclosure depth.`,
        priority: 'high',
        timestamp: topEvidence?.timestamp ?? Date.now(),
        sourceType: topEvidence?.sourceType ?? 'news',
        url: topEvidence?.url
      });
    }

    if (insight.internalMentions > 0 && insight.externalMentions === 0 && insight.filingScore > 0.6) {
      const filingEvidence = insight.evidence.find((item) => item.sourceType === 'filing');
      alerts.push({
        id: `${insight.theme}-undercovered`,
        theme: insight.theme,
        message: `${insight.theme} disclosure lacks external coverage; consider proactive communications.`,
        priority: 'medium',
        timestamp: filingEvidence?.timestamp ?? Date.now(),
        sourceType: 'filing',
        url: filingEvidence?.url
      });
    }
  });

  const positiveDeltas = themeInsights.filter((insight) => insight.delta > 0).map((insight) => insight.delta);
  const disclosureGapIndex = themeInsights.length
    ? clamp(roundTo(positiveDeltas.reduce((acc, value) => acc + value, 0) * 25, 2), 0, 100)
    : 0;

  const negativeNews = relevantNews.filter(
    (article) => determineTone(`${article.headline} ${article.summary}`) === 'negative'
  ).length;
  const neutralNews = relevantNews.length - negativeNews;
  const sentimentRatio = relevantNews.length ? (negativeNews - neutralNews) / relevantNews.length : 0;
  const sentimentSkew = clamp(roundTo((sentimentRatio + 1) * 50, 2), 0, 100);

  const priorityScore = themeInsights.length
    ? themeInsights.reduce((acc, insight) => {
        if (insight.priority === 'high') return acc + 80;
        if (insight.priority === 'medium') return acc + 55;
        return acc + 25;
      }, 0) / themeInsights.length
    : 0;

  const overallRiskIndex = clamp(
    roundTo(priorityScore * 0.4 + disclosureGapIndex * 0.35 + sentimentSkew * 0.25, 2),
    0,
    100
  );

  return {
    symbol,
    generatedAt: Date.now(),
    overallRiskIndex,
    disclosureGapIndex,
    sentimentSkew,
    themes: themeInsights,
    alerts
  } satisfies RegulatoryRiskReport;
}
