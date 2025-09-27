export interface NewsAnalysisInput {
  companyName: string;
  ticker: string;
  articles: {
    headline: string;
    date: string;
    source: string;
    summary: string;
    isAnalysis: boolean;
    analysisType?: string;
  }[];
}

export interface AnalysisSection {
  title: string;
  points: string[];
}