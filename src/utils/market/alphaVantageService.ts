import { StockQuote, MarketNews } from '../../types/market';
import { API_CONFIG } from '../../config/api';
import { formatNewsData } from './formatters';

export async function fetchAlphaVantageQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_CONFIG.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data['Global Quote']) {
      const quote = data['Global Quote'];
      return {
        c: parseFloat(quote['05. price']),
        d: parseFloat(quote['09. change']),
        dp: parseFloat(quote['10. change percent'].replace('%', '')),
        h: parseFloat(quote['03. high']),
        l: parseFloat(quote['04. low']),
        o: parseFloat(quote['02. open']),
        pc: parseFloat(quote['08. previous close'])
      };
    }
    return null;
  } catch (error) {
    console.warn('Alpha Vantage quote API error:', error);
    return null;
  }
}

export async function fetchAlphaVantageNews(): Promise<MarketNews[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.ALPHA_VANTAGE_BASE_URL}?function=NEWS_SENTIMENT&apikey=${API_CONFIG.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data.feed && Array.isArray(data.feed)) {
      return data.feed.map(formatNewsData);
    }
    return [];
  } catch (error) {
    console.warn('Alpha Vantage news API error:', error);
    return [];
  }
}

export async function fetchTopGainers(): Promise<string[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.ALPHA_VANTAGE_BASE_URL}?function=TOP_GAINERS_LOSERS&apikey=${API_CONFIG.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data.top_gainers) {
      return data.top_gainers.slice(0, 5).map((stock: any) => stock.ticker);
    }
    return [];
  } catch (error) {
    console.warn('Alpha Vantage top gainers API error:', error);
    return [];
  }
}