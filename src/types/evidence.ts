export type EvidenceNodeType = 'news' | 'filing' | 'transcript' | 'insight';
export type EvidenceRelation = 'supports' | 'contradicts' | 'context';
export type EvidenceTone = 'positive' | 'negative' | 'neutral';

export interface EvidenceNode {
  id: string;
  type: EvidenceNodeType;
  title: string;
  summary: string;
  timestamp: number;
  source?: string;
  url?: string;
  tone?: EvidenceTone;
  reliability: number;
  freshness: number;
  tags?: string[];
}

export interface EvidenceEdge {
  id: string;
  from: string;
  to: string;
  relation: EvidenceRelation;
  weight: number;
  freshness: number;
  trust: number;
}

export interface EvidenceDeltaPoint {
  timestamp: number;
  confidence: number;
  driver: string;
}

export interface EvidenceInsight {
  id: string;
  label: string;
  baseConfidence: number;
  adjustedConfidence: number;
  supportScore: number;
  challengeScore: number;
  delta: number;
  summary: string;
  deltas: EvidenceDeltaPoint[];
}

export interface EvidenceTimelineEvent {
  id: string;
  timestamp: number;
  label: string;
  relation: EvidenceRelation;
  tone: EvidenceTone;
  nodeId: string;
  weight: number;
  source?: string;
  url?: string;
}

export interface EvidenceGraph {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
  insights: EvidenceInsight[];
  timeline: EvidenceTimelineEvent[];
  overallConfidence: number;
}

export type EvidenceSourceChannel = 'news' | 'filing' | 'transcript';

export interface EvidenceSourceBreakdown {
  channel: EvidenceSourceChannel;
  supportWeight: number;
  challengeWeight: number;
  supportCount: number;
  challengeCount: number;
  averageFreshness: number;
  averageReliability: number;
  mostRecentTimestamp: number | null;
}

export type EvidenceFactCheckStatus = 'supported' | 'contradicted' | 'needs-review';
export type EvidenceRefreshReason = 'stale' | 'low-confidence' | 'contradiction' | 'missing';
export type EvidencePriority = 'low' | 'medium' | 'high';

export interface EvidenceContradictionAlert {
  id: string;
  insightId: string;
  nodeId: string;
  channel: EvidenceSourceChannel;
  severity: EvidencePriority;
  message: string;
  timestamp: number;
  url?: string;
}

export interface EvidenceRefreshRecommendation {
  id: string;
  channel: EvidenceSourceChannel;
  reason: EvidenceRefreshReason;
  priority: EvidencePriority;
  message: string;
}

export interface EvidenceFactCheckSource {
  id: string;
  title: string;
  relation: EvidenceRelation;
  timestamp: number;
  freshness: number;
  reliability: number;
  url?: string;
}

export interface EvidenceFactCheckEntry {
  id: string;
  insightId: string;
  claim: string;
  status: EvidenceFactCheckStatus;
  confidence: number;
  sources: EvidenceFactCheckSource[];
  updatedAt: number;
}

export interface EvidenceCoherenceSummary {
  overallScore: number;
  breakdowns: EvidenceSourceBreakdown[];
}

export interface EvidenceIntelligenceReport {
  coherence: EvidenceCoherenceSummary;
  contradictions: EvidenceContradictionAlert[];
  refreshQueue: EvidenceRefreshRecommendation[];
  factChecks: EvidenceFactCheckEntry[];
}
