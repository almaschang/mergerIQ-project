import { MarketNews } from '../../../types/market';

export function formatMarketauxArticle(article: any, isAnalysis = false): MarketNews {
  return {
    category: isAnalysis ? 'analysis' : 'news',
    datetime: new Date(article.published_at).getTime() / 1000,
    headline: article.title,
    id: article.uuid,
    image: article.image_url || '',
    related: article.entities?.[0]?.symbol || '',
    source: article.source,
    summary: article.description,
    url: article.url,
    isAnalysis,
    analysisType: isAnalysis ? determineAnalysisType(article.source) : undefined,
    author: article.author || ''
  };
}

function determineAnalysisType(source: string): 'professional' | 'retail' | 'mixed' {
  const professionalSources = ['Bloomberg', 'Reuters', 'Financial Times', 'Wall Street Journal'];
  const retailSources = ['Motley Fool', 'InvestorPlace', 'Seeking Alpha'];
  
  if (professionalSources.includes(source)) return 'professional';
  if (retailSources.includes(source)) return 'retail';
  return 'mixed';
}