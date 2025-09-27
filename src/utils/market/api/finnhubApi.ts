import { MarketNews } from '../../../types/market';
import { API_CONFIG } from '../../../config/api';

export async function fetchFinnhubArticles(searchTerm: string): Promise<MarketNews[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.FINNHUB_BASE_URL}/news?category=${encodeURIComponent(searchTerm)}&token=${API_CONFIG.FINNHUB_API_KEY}`
    );
    const data = await response.json();
    
    return (Array.isArray(data) ? data : []).map((item: any) => ({
      id: item.id,
      category: 'market',
      datetime: item.datetime,
      headline: item.headline,
      image: item.image || '',
      source: item.source,
      summary: item.summary,
      url: item.url
    }));
  } catch (error) {
    console.warn('Finnhub news error:', error);
    return [];
  }
}