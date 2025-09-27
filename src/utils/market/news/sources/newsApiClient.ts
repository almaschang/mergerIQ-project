import { MarketNews } from '../../../../types/market';
import { NEWS_SOURCES } from './config';

const BASE_URL = 'https://newsapi.org/v2';

export async function fetchNewsApiArticles(query?: string): Promise<MarketNews[]> {
  try {
    const params = new URLSearchParams({
      apiKey: NEWS_SOURCES.api.newsApi.apiKey,
      language: 'en',
      pageSize: '100',
      sources: NEWS_SOURCES.api.newsApi.sources.join(','),
      ...(query && { q: query })
    });

    const response = await fetch(`${BASE_URL}/everything?${params}`);
    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'NewsAPI request failed');
    }

    return data.articles.map((article: any) => ({
      id: article.url,
      category: 'market',
      datetime: new Date(article.publishedAt).getTime() / 1000,
      headline: article.title,
      image: article.urlToImage || '',
      source: article.source.name,
      summary: article.description,
      url: article.url,
      related: ''
    }));
  } catch (error) {
    console.error('NewsAPI error:', error);
    return [];
  }
}