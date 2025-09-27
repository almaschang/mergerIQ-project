import { MarketNews } from '../../../types/market';
import { fetchArticleContent } from './articleFetcher';
import { extractKeyPoints, formatSummary } from './contentExtractor';
import { ArticleContent } from './types';

export async function summarizeNews(news: MarketNews[]): Promise<string> {
  try {
    // Get full content of recent articles
    const recentNews = news.slice(0, 5);
    const articlesWithContent: ArticleContent[] = await Promise.all(
      recentNews.map(async article => ({
        headline: article.headline,
        content: (await fetchArticleContent(article.url)) || article.summary,
        date: new Date(article.datetime * 1000).toLocaleDateString()
      }))
    );

    const keyPoints = extractKeyPoints(articlesWithContent);
    return formatSummary(keyPoints);
  } catch (error) {
    console.error('Error generating news summary:', error);
    return 'Unable to generate summary at this time.';
  }
}