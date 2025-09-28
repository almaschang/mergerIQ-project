import {
  EvidenceGraph,
  EvidenceIntelligenceReport,
  EvidenceSourceChannel,
  EvidenceSourceBreakdown,
  EvidenceContradictionAlert,
  EvidenceRefreshRecommendation,
  EvidenceFactCheckEntry,
  EvidenceFactCheckSource,
  EvidenceFactCheckStatus,
  EvidencePriority
} from '../../types/evidence';
import { average, clamp, roundTo, hoursSince } from './textMetrics';

const CHANNELS: EvidenceSourceChannel[] = ['news', 'filing', 'transcript'];
const NOW = () => Date.now();

function isEvidenceChannel(type: string): type is EvidenceSourceChannel {
  return CHANNELS.includes(type as EvidenceSourceChannel);
}

function severityFromWeight(weight: number): EvidencePriority {
  if (weight >= 0.75) return 'high';
  if (weight >= 0.4) return 'medium';
  return 'low';
}

function factCheckStatus(support: number, challenge: number): EvidenceFactCheckStatus {
  if (support === 0 && challenge === 0) return 'needs-review';
  if (support >= challenge * 1.2) return 'supported';
  if (challenge >= support * 1.1) return 'contradicted';
  return 'needs-review';
}

interface BreakdownMutable {
  supportWeight: number;
  challengeWeight: number;
  supportCount: number;
  challengeCount: number;
  freshnessValues: number[];
  reliabilityValues: number[];
  lastTimestamps: number[];
}

function createBreakdownMap(): Map<EvidenceSourceChannel, BreakdownMutable> {
  return new Map(
    CHANNELS.map((channel) => [channel, {
      supportWeight: 0,
      challengeWeight: 0,
      supportCount: 0,
      challengeCount: 0,
      freshnessValues: [],
      reliabilityValues: [],
      lastTimestamps: []
    }])
  );
}

function toSourceBreakdown(channel: EvidenceSourceChannel, data: BreakdownMutable): EvidenceSourceBreakdown {
  return {
    channel,
    supportWeight: roundTo(data.supportWeight, 3),
    challengeWeight: roundTo(data.challengeWeight, 3),
    supportCount: data.supportCount,
    challengeCount: data.challengeCount,
    averageFreshness: roundTo(average(data.freshnessValues), 3),
    averageReliability: roundTo(average(data.reliabilityValues), 3),
    mostRecentTimestamp: data.lastTimestamps.length ? Math.max(...data.lastTimestamps) : null
  };
}

function buildContradictionAlert(
  weight: number,
  nodeTitle: string,
  insightLabel: string,
  nodeId: string,
  insightId: string,
  channel: EvidenceSourceChannel,
  timestamp: number,
  url?: string
): EvidenceContradictionAlert {
  return {
    id: `${nodeId}-${insightId}-contradiction`,
    insightId,
    nodeId,
    channel,
    severity: severityFromWeight(weight),
    message: `${nodeTitle} challenges ${insightLabel}`,
    timestamp,
    url
  };
}

function buildRefreshRecommendations(
  breakdowns: EvidenceSourceBreakdown[],
  contradictions: EvidenceContradictionAlert[],
  overallScore: number
): EvidenceRefreshRecommendation[] {
  const items: EvidenceRefreshRecommendation[] = [];

  breakdowns.forEach((breakdown) => {
    const totalInteractions = breakdown.supportCount + breakdown.challengeCount;
    const latestAgeHours = breakdown.mostRecentTimestamp
      ? hoursSince(breakdown.mostRecentTimestamp)
      : Number.POSITIVE_INFINITY;

    if (totalInteractions === 0) {
      items.push({
        id: `${breakdown.channel}-missing`,
        channel: breakdown.channel,
        reason: 'missing',
        priority: 'high',
        message: `No ${breakdown.channel} evidence available yet.`
      });
      return;
    }

    if (latestAgeHours > 72 || breakdown.averageFreshness < 0.5) {
      items.push({
        id: `${breakdown.channel}-stale`,
        channel: breakdown.channel,
        reason: 'stale',
        priority: latestAgeHours > 168 ? 'high' : 'medium',
        message: `${breakdown.channel} evidence is getting old (${Math.round(latestAgeHours)}h).`
      });
    }

    const channelTotal = breakdown.supportWeight + breakdown.challengeWeight;
    if (channelTotal > 0 && breakdown.supportWeight / channelTotal < 0.35) {
      items.push({
        id: `${breakdown.channel}-low-confidence`,
        channel: breakdown.channel,
        reason: 'low-confidence',
        priority: 'medium',
        message: `${breakdown.channel} sources lean negative-consider refreshing guidance.`
      });
    }
  });

  contradictions.forEach((alert) => {
    items.push({
      id: `${alert.channel}-contradiction-${alert.nodeId}`,
      channel: alert.channel,
      reason: 'contradiction',
      priority: alert.severity,
      message: alert.message
    });
  });

  if (overallScore < 0.45) {
    items.push({
      id: 'overall-low-confidence',
      channel: 'news',
      reason: 'low-confidence',
      priority: 'high',
      message: 'Overall evidence confidence is drifting low-broaden the collection sweep.'
    });
  }

  return items;
}

function buildFactCheckEntries(graph: EvidenceGraph): EvidenceFactCheckEntry[] {
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));

  return graph.insights.map((insight) => {
    const relatedEdges = graph.edges.filter((edge) => edge.to === insight.id);

    const supportWeight = relatedEdges
      .filter((edge) => edge.relation === 'supports')
      .reduce((sum, edge) => sum + edge.weight, 0);
    const challengeWeight = relatedEdges
      .filter((edge) => edge.relation === 'contradicts')
      .reduce((sum, edge) => sum + edge.weight, 0);

    const sources: EvidenceFactCheckSource[] = relatedEdges
      .map((edge) => {
        const node = nodeMap.get(edge.from);
        if (!node || !isEvidenceChannel(node.type)) {
          return null;
        }
        return {
          id: node.id,
          title: node.title,
          relation: edge.relation,
          timestamp: node.timestamp,
          freshness: node.freshness,
          reliability: node.reliability,
          url: node.url
        } satisfies EvidenceFactCheckSource;
      })
      .filter((source): source is EvidenceFactCheckSource => Boolean(source));

    const updatedAt = sources.length
      ? Math.max(...sources.map((source) => source.timestamp))
      : NOW();

    return {
      id: `fact-check-${insight.id}`,
      insightId: insight.id,
      claim: insight.label,
      status: factCheckStatus(supportWeight, challengeWeight),
      confidence: roundTo(insight.adjustedConfidence, 3),
      sources,
      updatedAt
    } satisfies EvidenceFactCheckEntry;
  });
}

export function analyzeEvidenceCoherence(graph: EvidenceGraph | null): EvidenceIntelligenceReport | null {
  if (!graph) return null;

  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
  const breakdownMap = createBreakdownMap();
  const contradictions: EvidenceContradictionAlert[] = [];

  graph.edges.forEach((edge) => {
    const node = nodeMap.get(edge.from);
    if (!node || !isEvidenceChannel(node.type)) {
      return;
    }

    const channelData = breakdownMap.get(node.type)!;

    if (edge.relation === 'supports') {
      channelData.supportWeight += edge.weight;
      channelData.supportCount += 1;
    } else if (edge.relation === 'contradicts') {
      channelData.challengeWeight += edge.weight;
      channelData.challengeCount += 1;
      contradictions.push(
        buildContradictionAlert(
          edge.weight,
          node.title,
          graph.insights.find((insight) => insight.id === edge.to)?.label || 'Insight',
          node.id,
          edge.to,
          node.type,
          node.timestamp,
          node.url
        )
      );
    }

    channelData.freshnessValues.push(node.freshness);
    channelData.reliabilityValues.push(node.reliability);
    channelData.lastTimestamps.push(node.timestamp);
  });

  const breakdowns = CHANNELS.map((channel) => toSourceBreakdown(channel, breakdownMap.get(channel)!));

  const totalSupport = breakdowns.reduce((sum, item) => sum + item.supportWeight, 0);
  const totalChallenge = breakdowns.reduce((sum, item) => sum + item.challengeWeight, 0);
  const totalWeight = totalSupport + totalChallenge;
  const overallScore = totalWeight > 0 ? clamp(totalSupport / totalWeight, 0, 1) : 0;

  const refreshQueue = buildRefreshRecommendations(breakdowns, contradictions, overallScore);
  const factChecks = buildFactCheckEntries(graph);

  return {
    coherence: {
      overallScore: roundTo(overallScore, 3),
      breakdowns
    },
    contradictions,
    refreshQueue,
    factChecks
  } satisfies EvidenceIntelligenceReport;
}

