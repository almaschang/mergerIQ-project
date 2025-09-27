import { CompanyProfile } from '../../../types/company';
import { MarketNews } from '../../../types/market';
import { MarketInsight, SentimentAnalysis } from '../../../types/ai';
import { analyzeWithGoogleAI } from '../client/googleAiClient';
import { createInsightPrompt } from './insightPrompt';

export async function generateMarketInsightsWithAI(
  profile: CompanyProfile,
  news: MarketNews[],
  sentiment: SentimentAnalysis
): Promise<MarketInsight[]> {
  if (!profile || !news.length) {
    return [];
  }

  try {
    const headlines = news.slice(0, 3).map(article => article.headline);
    const prompt = createInsightPrompt(
      profile.name,
      profile.industry,
      profile.marketCapitalization,
      `${sentiment.sentiment} (${sentiment.reasoning})`,
      headlines
    );

    const response = await analyzeWithGoogleAI(prompt);
    const insights = JSON.parse(response);

    if (!Array.isArray(insights)) {
      throw new Error('Invalid response format');
    }

    return insights.filter(insight => 
      insight.type && 
      insight.description && 
      typeof insight.confidence === 'number'
    );
  } catch (error) {
    console.warn('Market analysis failed:', error);
    return [];
  }
}