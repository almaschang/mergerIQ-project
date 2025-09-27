import { MarketNews } from '../../../types/market';
import { API_CONFIG } from '../../../config/api';

export async function fetchAlphaVantageArticles(searchTerm: string): Promise<MarketNews[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.ALPHA_VANTAGE_BASE_URL}?function=NEWS_SENTIMENT&topics=${encodeURIComponent(searchTerm)}&apikey=${API_CONFIG.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    return (data.feed || []).map((item: any) => ({
      id: item.url.hashCode(),
      category: 'market',
      datetime: new Date(item.time_published).getTime() / 1000,
      headline: item.title,
      image: item.banner_image || '',
      source: item.source,
      summary: item.summary,
      url: item.url
    }));
  } catch (error) {
    console.warn('Alpha Vantage news error:', error);
    return [];
  }
}