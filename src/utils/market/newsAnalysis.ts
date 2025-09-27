import { MarketNews } from '../../types/market';
import { fetchArticleContent } from './articleFetcher';

export async function summarizeNews(news: MarketNews[]): Promise<string> {
  try {
    // Get full content of recent articles
    const recentNews = news.slice(0, 5);
    const articlesWithContent = await Promise.all(
      recentNews.map(async article => {
        const content = await fetchArticleContent(article.url);
        return {
          headline: article.headline,
          content: content || article.summary,
          date: new Date(article.datetime * 1000).toLocaleDateString()
        };
      })
    );

    // Extract key points from articles
    const keyPoints = articlesWithContent
      .filter(article => article.content)
      .map(article => {
        const sentences = article.content
          .split(/[.!?]+/)
          .map(s => s.trim())
          .filter(s => s.length > 20);
        
        return {
          headline: article.headline,
          date: article.date,
          mainPoint: sentences[0] || ''
        };
      });

    // Format the summary
    return keyPoints
      .map(point => `${point.date}: ${point.headline}\n${point.mainPoint}`)
      .join('\n\n');
  } catch (error) {
    return 'Unable to generate summary at this time.';
  }
}