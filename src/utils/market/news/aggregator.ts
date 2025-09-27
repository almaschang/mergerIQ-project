import { MarketNews } from '../../../types/market';
import { NEWS_SOURCES } from './sources/config';
import { parseRSSFeed } from './sources/rssParser';
import { fetchNewsApiArticles } from './sources/newsApiClient';

export async function fetchAggregatedNews(category?: string): Promise<MarketNews[]> {
  try {
    // Fetch from RSS feeds
    const rssSources = category 
      ? NEWS_SOURCES.rss[category as keyof typeof NEWS_SOURCES.rss] || []
      : Object.values(NEWS_SOURCES.rss).flat();

    const rssPromises = rssSources.map(source => parseRSSFeed(source.url));
    const rssResults = await Promise.allSettled(rssPromises);
    
    const rssNews = rssResults
      .filter((result): result is PromiseFulfilledResult<MarketNews[]> => 
        result.status === 'fulfilled'
      )
      .flatMap(result => result.value);

    // Fetch from NewsAPI
    const newsApiArticles = await fetchNewsApiArticles(category);

    // Combine all sources and remove duplicates
    const allNews = Array.from(
      new Map(
        [...rssNews, ...newsApiArticles]
          .map(item => [item.url, item])
      ).values()
    );

    // Sort by date, most recent first
    return allNews.sort((a, b) => b.datetime - a.datetime);
  } catch (error) {
    console.error('Error aggregating news:', error);
    return [];
  }
}