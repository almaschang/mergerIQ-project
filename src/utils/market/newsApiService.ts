import { MarketNews } from '../../types/market';
import { API_CONFIG } from '../../config/api';

export async function fetchNewsApiNews(): Promise<MarketNews[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.NEWS_API_BASE_URL}/everything?` +
      `q=(stock OR market OR finance OR trading)&` +
      `language=en&` +
      `sortBy=publishedAt&` +
      `pageSize=20&` +
      `apiKey=${API_CONFIG.NEWS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(data.message || 'News API request failed');
    }

    return data.articles.map((article: any) => ({
      category: 'general',
      datetime: new Date(article.publishedAt).getTime() / 1000,
      headline: article.title,
      id: article.url.hashCode(),
      image: article.urlToImage || '',
      related: '',
      source: article.source.name,
      summary: article.description,
      url: article.url
    }));
  } catch (error) {
    console.warn('News API error:', error);
    return [];
  }
}