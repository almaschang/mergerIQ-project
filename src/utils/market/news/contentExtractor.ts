import { ArticleContent, KeyPoint } from './types';

export function extractKeyPoints(articles: ArticleContent[]): KeyPoint[] {
  return articles
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
}

export function formatSummary(points: KeyPoint[]): string {
  return points
    .map(point => `${point.date}: ${point.headline}\n${point.mainPoint}`)
    .join('\n\n');
}