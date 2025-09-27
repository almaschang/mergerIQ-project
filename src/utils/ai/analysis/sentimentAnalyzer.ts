import { MarketNews } from '../../../types/market';
import { SentimentAnalysis } from '../../../types/ai';
import { analyzeWithGoogleAI } from '../client/googleAiClient';
import { createSentimentPrompt } from './sentimentPrompt';

export async function analyzeNewsSentimentWithAI(news: MarketNews[]): Promise<SentimentAnalysis> {
  if (!news.length) {
    return {
      sentiment: 'neutral',
      confidence: 0,
      score: 0,
      reasoning: 'No news available for analysis'
    };
  }

  try {
    const headlines = news.slice(0, 5).map(article => article.headline);
    const prompt = createSentimentPrompt(headlines);
    const response = await analyzeWithGoogleAI(prompt);
    const result = JSON.parse(response);

    // Validate response format
    if (!result.sentiment || !result.confidence || !result.score || !result.reasoning) {
      throw new Error('Invalid response format');
    }

    return result;
  } catch (error) {
    console.warn('Sentiment analysis failed:', error);
    return {
      sentiment: 'neutral',
      confidence: 0,
      score: 0,
      reasoning: 'Analysis failed'
    };
  }
}