import { MarketNews } from '../../types/market';
import { API_CONFIG } from '../../config/api';
import { fetchSeekingAlphaCompanyNews } from './seekingAlphaService';
import { classifyArticle } from './classifiers/articleClassifier';

async function getFinnhubNews(symbol: string): Promise<MarketNews[]> {
  try {
    const today = new Date();
    const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3));
    
    const response = await fetch(
      `${API_CONFIG.FINNHUB_BASE_URL}/company-news?symbol=${symbol}` +
      `&from=${threeMonthsAgo.toISOString().split('T')[0]}` +
      `&to=${new Date().toISOString().split('T')[0]}` +
      `&token=${API_CONFIG.FINNHUB_API_KEY}`
    );
    const data = await response.json();
    return Array.isArray(data) ? data.map(classifyArticle) : [];
  } catch (error) {
    console.warn('Finnhub company news error:', error);
    return [];
  }
}

export async function getCompanyNews(symbol: string): Promise<MarketNews[]> {
  try {
    // Fetch news from all sources concurrently
    const [finnhubNews, seekingAlphaNews] = await Promise.all([
      getFinnhubNews(symbol),
      fetchSeekingAlphaCompanyNews(symbol)
    ]);

    const allNews = [...finnhubNews, ...seekingAlphaNews].map(classifyArticle);

    // Remove duplicates and sort by datetime
    const uniqueNews = Array.from(
      new Map(
        allNews
          .filter(item => item.datetime && item.url)
          .map(item => [item.url, item])
      ).values()
    );

    return uniqueNews.sort((a, b) => b.datetime - a.datetime);
  } catch (error) {
    console.error('Error fetching company news:', error);
    return [];
  }
}