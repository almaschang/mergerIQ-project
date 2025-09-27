import { MarketNews } from '../../types/market';
import { CompanyProfile } from '../../types/company';

interface SentimentAnalysis {
  score: number; // -1 to 1
  label: 'negative' | 'neutral' | 'positive';
  confidence: number;
}

interface MarketInsight {
  type: 'trend' | 'risk' | 'opportunity';
  description: string;
  confidence: number;
}

// Analyze news sentiment using basic NLP techniques
export function analyzeNewsSentiment(news: MarketNews[]): SentimentAnalysis {
  const positiveWords = new Set([
    'gain', 'rise', 'up', 'surge', 'jump', 'positive', 'profit', 'growth',
    'strong', 'success', 'improve', 'advantage', 'opportunity', 'outperform'
  ]);

  const negativeWords = new Set([
    'loss', 'fall', 'down', 'drop', 'decline', 'negative', 'weak', 'risk',
    'fail', 'poor', 'decrease', 'disadvantage', 'underperform', 'concern'
  ]);

  let totalScore = 0;
  let wordCount = 0;

  news.forEach(article => {
    const text = `${article.headline} ${article.summary}`.toLowerCase();
    const words = text.split(/\s+/);

    words.forEach(word => {
      if (positiveWords.has(word)) {
        totalScore += 1;
        wordCount++;
      } else if (negativeWords.has(word)) {
        totalScore -= 1;
        wordCount++;
      }
    });
  });

  const score = wordCount > 0 ? totalScore / wordCount : 0;
  const confidence = Math.min(wordCount / 50, 1); // Scale confidence based on word count

  return {
    score,
    label: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral',
    confidence
  };
}

// Generate market insights based on company data and news
export function generateMarketInsights(
  profile: CompanyProfile,
  news: MarketNews[],
  sentiment: SentimentAnalysis
): MarketInsight[] {
  const insights: MarketInsight[] = [];

  // Trend analysis
  if (sentiment.confidence > 0.5) {
    insights.push({
      type: 'trend',
      description: `Market sentiment is ${sentiment.label} with ${(sentiment.confidence * 100).toFixed(0)}% confidence based on recent news coverage`,
      confidence: sentiment.confidence
    });
  }

  // Market cap analysis
  const marketCapBillion = profile.marketCapitalization / 1000;
  if (marketCapBillion > 200) {
    insights.push({
      type: 'risk',
      description: `Large market cap of $${marketCapBillion.toFixed(1)}B suggests lower volatility but potentially limited growth compared to smaller companies`,
      confidence: 0.85
    });
  } else if (marketCapBillion < 10) {
    insights.push({
      type: 'risk',
      description: `Small market cap of $${marketCapBillion.toFixed(1)}B indicates higher growth potential but also increased volatility risk`,
      confidence: 0.8
    });
  }

  // News volume analysis
  const recentNews = news.filter(n => 
    (Date.now() / 1000 - n.datetime) < 7 * 24 * 60 * 60
  );
  if (recentNews.length > 20) {
    insights.push({
      type: 'opportunity',
      description: 'High news volume in the past week suggests significant market interest and potential price movement',
      confidence: 0.7
    });
  }

  return insights;
}