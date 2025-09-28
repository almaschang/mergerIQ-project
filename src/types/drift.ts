export interface PeerDriftSeriesPoint {
  timestamp: number;
  peerSymbol: string;
  priceDrift: number;
  valuationDrift: number;
  disclosureDrift: number;
}

export interface PeerDriftDriver {
  peerSymbol: string;
  driftScore: number;
  priceCommentary: string;
  valuationCommentary: string;
  disclosureCommentary: string;
}

export interface PeerDriftAlert {
  id: string;
  peerSymbol: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: number;
}

export interface PeerDriftReport {
  primarySymbol: string;
  generatedAt: number;
  overallDriftScore: number;
  drivers: PeerDriftDriver[];
  series: PeerDriftSeriesPoint[];
  alerts: PeerDriftAlert[];
}
