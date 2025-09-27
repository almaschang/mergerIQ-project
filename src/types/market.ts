export interface MarketNews {
  category: string;
  datetime: number;
  headline: string;
  id: string | number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
  isAnalysis?: boolean;
  analysisType?: 'professional' | 'retail' | 'mixed';
  author?: string;
}

export type ExchangeType = 
  | 'usa' | 'argentina' | 'australia' | 'austria' | 'brazil' | 'canada' 
  | 'chile' | 'china' | 'colombia' | 'cyprus' | 'czech_republic' | 'denmark' 
  | 'egypt' | 'estonia' | 'finland' | 'germany' | 'greece' | 'hungary' 
  | 'iceland' | 'india' | 'indonesia' | 'israel' | 'italy' | 'kuwait' 
  | 'latvia' | 'lithuania' | 'mexico' | 'morocco' | 'poland' | 'russia' 
  | 'south_africa' | 'spain' | 'sri_lanka' | 'switzerland' | 'taiwan' 
  | 'turkey' | 'uae' | 'venezuela' | 'vietnam' | 'forex' | 'crypto';

export interface Exchange {
  id: ExchangeType;
  name: string;
  exchanges: string[];
}