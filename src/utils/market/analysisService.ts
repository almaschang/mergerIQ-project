import { MarketNews } from '../../types/market';
import { API_CONFIG } from '../../config/api';

// Analysis sources configuration
const ANALYSIS_SOURCES = [
  { name: 'Seeking Alpha', type: 'professional' },
  { name: 'Motley Fool', type: 'retail' },
  { name: 'Zacks', type: 'professional' },
  { name: 'Barron\'s', type: 'professional' },
  { name: 'MarketWatch', type: 'mixed' },
  { name: 'Benzinga', type: 'mixed' },
  { name: 'InvestorPlace', type: 'retail' }
];

export async function fetchAnalysisArticles(symbol: string): Promise<MarketNews[]> {
  try {
    const analysisPromises = [
      fetchSeekingAlphaAnalysis(symbol),
      fetchMotleyFoolAnalysis(symbol),
      fetchZacksAnalysis(symbol),
      fetchBarronsAnalysis(symbol),
      fetchMarketWatchAnalysis(symbol),
      fetchBenzingaAnalysis(symbol),
      fetchInvestorPlaceAnalysis(symbol)
    ];

    const results = await Promise.allSettled(analysisPromises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<MarketNews[]> => 
        result.status === 'fulfilled'
      )
      .flatMap(result => result.value)
      .sort((a, b) => b.datetime - a.datetime);
  } catch (error) {
    console.error('Error fetching analysis articles:', error);
    return [];
  }
}

async function fetchSeekingAlphaAnalysis(symbol: string): Promise<MarketNews[]> {
  const headers = {
    'x-rapidapi-host': 'seeking-alpha.p.rapidapi.com',
    'x-rapidapi-key': API_CONFIG.SEEKING_ALPHA_API_KEYS[0]
  };

  try {
    const response = await fetch(
      `${API_CONFIG.SEEKING_ALPHA_BASE_URL}/analysis/v2/list?id=${symbol.toLowerCase()}&size=50&number=1`,
      { headers }
    );
    const data = await response.json();
    
    return (data.data || []).map(formatSeekingAlphaArticle);
  } catch (error) {
    console.warn('Seeking Alpha analysis error:', error);
    return [];
  }
}

async function fetchMotleyFoolAnalysis(symbol: string): Promise<MarketNews[]> {
  // Implementation for Motley Fool analysis
  // This would need actual API access
  return [];
}

async function fetchZacksAnalysis(symbol: string): Promise<MarketNews[]> {
  // Implementation for Zacks analysis
  // This would need actual API access
  return [];
}

async function fetchBarronsAnalysis(symbol: string): Promise<MarketNews[]> {
  // Implementation for Barron's analysis
  // This would need actual API access
  return [];
}

async function fetchMarketWatchAnalysis(symbol: string): Promise<MarketNews[]> {
  // Implementation for MarketWatch analysis
  // This would need actual API access
  return [];
}

async function fetchBenzingaAnalysis(symbol: string): Promise<MarketNews[]> {
  // Implementation for Benzinga analysis
  // This would need actual API access
  return [];
}

async function fetchInvestorPlaceAnalysis(symbol: string): Promise<MarketNews[]> {
  // Implementation for InvestorPlace analysis
  // This would need actual API access
  return [];
}

function formatSeekingAlphaArticle(item: any): MarketNews {
  return {
    category: 'analysis',
    datetime: new Date(item.attributes?.publishOn || item.attributes?.created).getTime() / 1000,
    headline: item.attributes?.title,
    id: item.id,
    image: item.attributes?.gettyImageUrl || '',
    related: item.attributes?.symbol || '',
    source: 'Seeking Alpha',
    summary: item.attributes?.summary || '',
    url: `https://seekingalpha.com${item.links?.self || ''}`,
    isAnalysis: true,
    analysisType: 'professional',
    author: item.attributes?.author?.name || ''
  };
}