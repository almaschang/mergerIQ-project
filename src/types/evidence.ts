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
