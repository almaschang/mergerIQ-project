import { MarketNews } from '../../../types/market';

// Keywords that suggest an article is analysis
const ANALYSIS_KEYWORDS = [
  'analysis', 'analyst', 'research', 'opinion', 'perspective',
  'outlook', 'forecast', 'prediction', 'recommendation',
  'bull case', 'bear case', 'technical analysis', 'fundamental analysis',
  'stock analysis', 'market analysis', 'deep dive', 'here\'s why',
  'should you buy', 'should you sell', 'investment thesis',
  'valuation', 'overvalued', 'undervalued', 'price target'
];

// Sources known for analysis content
const ANALYSIS_SOURCES = [
  'Seeking Alpha', 'Motley Fool', 'InvestorPlace', 'Zacks',
  'TheStreet', 'Benzinga Pro', 'Trading View', 'StockCharts'
];

export function classifyArticle(article: MarketNews): MarketNews {
  const text = `${article.headline} ${article.summary}`.toLowerCase();
  const source = article.source;

  // Check if source is known for analysis
  const isAnalysisSource = ANALYSIS_SOURCES.some(s => 
    source.toLowerCase().includes(s.toLowerCase())
  );

  // Check if content contains analysis keywords
  const hasAnalysisKeywords = ANALYSIS_KEYWORDS.some(keyword =>
    text.includes(keyword.toLowerCase())
  );

  // Determine analysis type based on source
  let analysisType: 'professional' | 'retail' | 'mixed' | undefined;
  if (isAnalysisSource || hasAnalysisKeywords) {
    if (['Bloomberg', 'Reuters', 'Financial Times', 'Wall Street Journal'].some(s => 
      source.toLowerCase().includes(s.toLowerCase())
    )) {
      analysisType = 'professional';
    } else if (['Seeking Alpha', 'Motley Fool', 'InvestorPlace'].some(s => 
      source.toLowerCase().includes(s.toLowerCase())
    )) {
      analysisType = 'retail';
    } else {
      analysisType = 'mixed';
    }
  }

  return {
    ...article,
    isAnalysis: isAnalysisSource || hasAnalysisKeywords,
    analysisType
  };
}