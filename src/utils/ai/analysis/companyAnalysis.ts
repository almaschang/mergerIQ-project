import { CompanyProfile } from '../../../types/company';
import { MarketNews } from '../../../types/market';
import { analyzeWithGoogleAI } from '../client/googleAiClient';
import { fetchArticleContent } from './articleFetcher';

export async function generateCompanyAnalysis(
  profile: CompanyProfile,
  news: MarketNews[]
): Promise<string> {
  // Fetch full content of each article
  const articlesWithContent = await Promise.all(
    news.map(async article => {
      const content = await fetchArticleContent(article.url);
      return {
        ...article,
        fullContent: content || article.summary
      };
    })
  );

  const prompt = `
Analyze these full news articles about ${profile.name} (${profile.ticker}):

${articlesWithContent.map((article, index) => `
ARTICLE ${index + 1}
Headline: ${article.headline}
Source: ${article.source}
Date: ${new Date(article.datetime * 1000).toLocaleString()}
Full Content:
${article.fullContent}
---
`).join('\n')}

Based ONLY on the full content of these specific articles:
1. What are the key current developments?
2. What is the immediate market impact?
3. What are the specific risks and opportunities mentioned?
4. What is the overall sentiment from these articles?

Format the response in markdown with clear sections and bullet points.
Do not include any information not directly from these articles.`;

  try {
    return await analyzeWithGoogleAI(prompt);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Analysis generation failed: ${error.message}`);
    }
    throw new Error('Unknown error occurred during analysis generation');
  }
}