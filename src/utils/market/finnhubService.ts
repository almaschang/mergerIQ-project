import { MarketNews, StockQuote } from '../../types/market';
import { API_CONFIG } from '../../config/api';

export async function fetchFinnhubNews(): Promise<MarketNews[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.FINNHUB_BASE_URL}/news?category=general&token=${API_CONFIG.FINNHUB_API_KEY}`
    );
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.warn('Finnhub news API returned invalid data:', data);
      return [];
    }
    
    return data.map(item => ({
      category: item.category,
      datetime: item.datetime,
      headline: item.headline,
      id: item.id,
      image: item.image || '',
      related: item.related || '',
      source: item.source,
      summary: item.summary,
      url: item.url
    }));
  } catch (error) {
    console.warn('Finnhub news API error:', error);
    return [];
  }
}

export async function fetchFinnhubQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${API_CONFIG.FINNHUB_API_KEY}`
    );
    const data = await response.json();
    return Object.keys(data).length > 1 ? data : null;
  } catch (error) {
    console.warn('Finnhub quote API error:', error);
    return null;
  }
}