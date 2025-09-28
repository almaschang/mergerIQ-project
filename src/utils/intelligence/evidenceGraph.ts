import { MarketNews } from '../../types/market';
import { SECFiling } from '../../types/secFilings';
import { TranscriptDetails } from '../../types/transcripts';
import { MarketInsight } from '../../types/ai';
import {
  EvidenceGraph,
  EvidenceNode,
  EvidenceEdge,
  EvidenceInsight,
  EvidenceTimelineEvent,
  EvidenceRelation,
  EvidenceTone
} from '../../types/evidence';
import { determineTone, computeFreshnessScore, clamp, roundTo } from './textMetrics';

interface BuildEvidenceGraphParams {
  insights: MarketInsight[];
  news: MarketNews[];
  filings: SECFiling[];
  transcripts: TranscriptDetails[];
}

const TRUSTED_NEWS_SOURCES = [
  'reuters',
  'bloomberg',
  'financial times',
  'wall street journal',
  'cnbc',
  'seeking alpha',
  'marketwatch'
];

const MID_TRUST_SOURCES = [
  'yahoo finance',
  'motley fool',
  'investorplace',
  'benzinga',
  'techcrunch',
  'the verge'
];

function reliabilityForNode(nodeType: EvidenceNode['type'], source?: string): number {
  if (nodeType === 'filing') return 0.95;
  if (nodeType === 'transcript') return 0.75;
  if (!source) return 0.55;

  const normalized = source.toLowerCase();
  if (TRUSTED_NEWS_SOURCES.some((item) => normalized.includes(item))) {
    return 0.85;
  }
  if (MID_TRUST_SOURCES.some((item) => normalized.includes(item))) {
    return 0.7;
  }
  return 0.55;
}

function createNewsNodes(news: MarketNews[]): EvidenceNode[] {
  return news.slice(0, 20).map((article) => {
    const timestamp = (article.datetime || 0) * 1000;
    const tone = determineTone(`${article.headline} ${article.summary}`);

    return {
      id: `news-${article.id}`,
      type: 'news',
      title: article.headline,
      summary: article.summary,
      timestamp,
      source: article.source,
      url: article.url,
      tone,
      reliability: reliabilityForNode('news', article.source),
      freshness: computeFreshnessScore(timestamp),
      tags: article.analysisType ? [article.analysisType] : undefined
    } satisfies EvidenceNode;
  });
}

function createFilingNodes(filings: SECFiling[]): EvidenceNode[] {
  return filings.slice(0, 12).map((filing) => {
    const timestamp = new Date(filing.filingDate).getTime();

    return {
      id: `filing-${filing.id}`,
      type: 'filing',
      title: filing.title || filing.type,
      summary: filing.description,
      timestamp,
      source: filing.type,
      url: filing.documentUrl,
      tone: determineTone(`${filing.title} ${filing.description}`),
      reliability: reliabilityForNode('filing'),
      freshness: computeFreshnessScore(timestamp),
      tags: [filing.formType]
    } satisfies EvidenceNode;
  });
}

function createTranscriptNodes(transcripts: TranscriptDetails[]): EvidenceNode[] {
  return transcripts.map((transcript) => {
    const timestamp = new Date(transcript.publishedOn).getTime();

    return {
      id: `transcript-${transcript.id}`,
      type: 'transcript',
      title: transcript.title,
      summary: transcript.content.slice(0, 280),
      timestamp,
      source: 'Earnings Call',
      tone: determineTone(transcript.content.slice(0, 1000)),
      reliability: reliabilityForNode('transcript'),
      freshness: computeFreshnessScore(timestamp)
    } satisfies EvidenceNode;
  });
}

function createInsightNodes(insights: MarketInsight[]): EvidenceNode[] {
  return insights.map((insight, index) => ({
    id: `insight-${index}`,
    type: 'insight',
    title: `${insight.type.toUpperCase()} insight`,
    summary: insight.description,
    timestamp: Date.now(),
    tone: insight.type === 'risk' ? 'negative' : 'positive',
    reliability: 0.9,
    freshness: 1
  } satisfies EvidenceNode));
}

function relationForInsight(insight: MarketInsight, tone: EvidenceTone): EvidenceRelation {
  if (tone === 'neutral') return 'context';

  if (insight.type === 'risk') {
    return tone === 'negative' ? 'supports' : 'contradicts';
  }

  // trend & opportunity
  return tone === 'positive' ? 'supports' : 'contradicts';
}

function edgeWeight(node: EvidenceNode, relation: EvidenceRelation): number {
  const base = relation === 'context' ? 0.35 : 1;
  return roundTo(base * node.reliability * node.freshness, 3);
}

function buildEdges(
  evidenceNodes: EvidenceNode[],
  insightNodes: EvidenceNode[],
  insights: MarketInsight[]
): EvidenceEdge[] {
  const edges: EvidenceEdge[] = [];

  insightNodes.forEach((insightNode, index) => {
    const insight = insights[index];

    evidenceNodes.forEach((node) => {
      const relation = relationForInsight(insight, node.tone ?? 'neutral');
      const weight = edgeWeight(node, relation);

      if (weight < 0.1) return;

      edges.push({
        id: `${node.id}-${insightNode.id}`,
        from: node.id,
        to: insightNode.id,
        relation,
        weight,
        freshness: node.freshness,
        trust: node.reliability
      });
    });
  });

  return edges;
}

function buildInsightSummaries(
  insightNodes: EvidenceNode[],
  edges: EvidenceEdge[],
  insights: MarketInsight[],
  nodeMap: Map<string, EvidenceNode>
): EvidenceInsight[] {
  return insightNodes.map((node, index) => {
    const insight = insights[index];
    const relatedEdges = edges.filter((edge) => edge.to === node.id);

    let supportScore = 0;
    let challengeScore = 0;

    const sorted = relatedEdges.sort((a, b) => {
      const nodeA = nodeMap.get(a.from)?.timestamp ?? 0;
      const nodeB = nodeMap.get(b.from)?.timestamp ?? 0;
      return nodeA - nodeB;
    });

    let runningConfidence = insight.confidence;
    const deltas = sorted.map((edge) => {
      const evidence = nodeMap.get(edge.from);
      const impact = edge.weight * 0.08;

      if (edge.relation === 'supports') {
        supportScore += edge.weight;
        runningConfidence = clamp(runningConfidence + impact, 0, 1);
      } else if (edge.relation === 'contradicts') {
        challengeScore += edge.weight;
        runningConfidence = clamp(runningConfidence - impact, 0, 1);
      }

      return {
        timestamp: evidence?.timestamp ?? Date.now(),
        confidence: roundTo(runningConfidence, 3),
        driver: evidence?.title ?? 'Evidence update'
      };
    });

    const netDelta = clamp(runningConfidence - insight.confidence, -1, 1);

    return {
      id: node.id,
      label: insight.description,
      baseConfidence: roundTo(insight.confidence, 3),
      adjustedConfidence: roundTo(runningConfidence, 3),
      supportScore: roundTo(supportScore, 3),
      challengeScore: roundTo(challengeScore, 3),
      delta: roundTo(netDelta, 3),
      summary: `Support ${roundTo(supportScore, 2)} | Challenge ${roundTo(challengeScore, 2)}`,
      deltas
    } satisfies EvidenceInsight;
  });
}

function buildTimeline(
  evidenceNodes: EvidenceNode[],
  edges: EvidenceEdge[],
  insightSummaries: EvidenceInsight[]
): EvidenceTimelineEvent[] {
  const timeline: EvidenceTimelineEvent[] = [];
  const insightById = new Map<string, EvidenceInsight>(
    insightSummaries.map((insight) => [insight.id, insight])
  );

  evidenceNodes.forEach((node) => {
    const nodeEdges = edges.filter((edge) => edge.from === node.id);
    if (!nodeEdges.length) return;

    const ranked = nodeEdges.sort((a, b) => b.weight - a.weight);
    const dominant = ranked[0];

    const insight = insightById.get(dominant.to);
    const impactLabel = dominant.relation === 'supports' ? 'Boosts confidence' :
      dominant.relation === 'contradicts' ? 'Challenges guidance' : 'Context update';

    timeline.push({
      id: `${node.id}-timeline`,
      timestamp: node.timestamp,
      label: `${impactLabel}: ${node.title}`,
      relation: dominant.relation,
      tone: node.tone ?? 'neutral',
      nodeId: node.id,
      weight: dominant.weight,
      source: node.source,
      url: node.url || undefined
    });
  });

  return timeline.sort((a, b) => a.timestamp - b.timestamp);
}

export function buildEvidenceGraph({
  insights,
  news,
  filings,
  transcripts
}: BuildEvidenceGraphParams): EvidenceGraph {
  const insightNodes = createInsightNodes(insights);
  const newsNodes = createNewsNodes(news);
  const filingNodes = createFilingNodes(filings);
  const transcriptNodes = createTranscriptNodes(transcripts);

  const evidenceNodes = [...newsNodes, ...filingNodes, ...transcriptNodes];
  const nodes: EvidenceNode[] = [...insightNodes, ...evidenceNodes];
  const edges = buildEdges(evidenceNodes, insightNodes, insights);

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const insightSummaries = buildInsightSummaries(insightNodes, edges, insights, nodeMap);
  const timeline = buildTimeline(evidenceNodes, edges, insightSummaries);

  const overallConfidence = insightSummaries.length
    ? roundTo(
        insightSummaries.reduce((acc, insight) => acc + insight.adjustedConfidence, 0) /
          insightSummaries.length,
        3
      )
    : 0;

  return {
    nodes,
    edges,
    insights: insightSummaries,
    timeline,
    overallConfidence
  };
}
