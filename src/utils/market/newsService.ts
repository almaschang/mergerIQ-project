import { MarketNews } from '../../types/market';
import { NewsCategory } from '../../components/market/NewsCategoryToolbar';
import { fetchNewsApiArticles } from './api/newsApi';
import { fetchAlphaVantageArticles } from './api/alphaVantageApi';
import { fetchFinnhubArticles } from './api/finnhubApi';
import { scrapeNews } from './scrapers/newsScraper';
import { fetchSeekingAlphaNews } from './seekingAlphaService';
import { classifyNewsArticle, getRelevanceScore } from './classifiers/newsClassifier';

export async function fetchMarketNews(category?: NewsCategory): Promise<MarketNews[]> {
  try {
    // Fetch news from all sources concurrently
    const [
      newsApiArticles, 
      alphaVantageArticles, 
      finnhubArticles, 
      scrapedArticles,
      seekingAlphaArticles
    ] = await Promise.all([
      fetchNewsApiArticles(category || 'trending'),
      fetchAlphaVantageArticles(category || 'trending'),
      fetchFinnhubArticles(category || 'trending'),
      scrapeNews(category),
      fetchSeekingAlphaNews(category)
    ]);

    // Combine all articles and remove duplicates by URL
    let allNews = Array.from(
      new Map(
        [...newsApiArticles, ...alphaVantageArticles, ...finnhubArticles, ...scrapedArticles, ...seekingAlphaArticles]
          .map(item => [item.url, item])
      ).values()
    );

    if (category) {
      // Filter and sort by relevance for specific categories
      allNews = allNews
        .filter(article => classifyNewsArticle(article, category))
        .sort((a, b) => {
          const scoreA = getRelevanceScore(a, category);
          const scoreB = getRelevanceScore(b, category);
          if (scoreA === scoreB) {
            return b.datetime - a.datetime;
          }
          return scoreB - scoreA;
        });
    } else {
      // For trending, prioritize recent articles
      allNews.sort((a, b) => b.datetime - a.datetime);
    }

    return allNews.slice(0, 50); // Return top 50 most relevant articles
  } catch (error) {
    console.error('Error fetching market news:', error);
    return [];
  }
}