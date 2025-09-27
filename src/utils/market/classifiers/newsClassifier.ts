import { MarketNews } from '../../../types/market';
import { NewsCategory } from '../../../components/market/NewsCategoryToolbar';

// Keywords and phrases for each category
const CATEGORY_KEYWORDS: Record<NewsCategory, string[]> = {
  'trending': ['trending', 'popular', 'market moves', 'stock market', 'wall street'],
  'ai-tech': ['artificial intelligence', 'machine learning', 'ai', 'chatgpt', 'openai', 'neural network', 'deep learning'],
  'biotech': ['biotech', 'pharmaceutical', 'drug', 'clinical trial', 'fda approval', 'vaccine', 'therapy'],
  'buybacks': ['buyback', 'share repurchase', 'stock repurchase', 'return capital', 'share reduction'],
  'commodities': ['commodity', 'gold', 'oil', 'natural gas', 'metals', 'agriculture', 'crude'],
  'crypto': ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'defi', 'nft', 'cryptocurrency'],
  'debt-issuance': ['bond offering', 'debt offering', 'raise debt', 'notes offering', 'senior notes', 'debt issuance'],
  'dividends': ['dividend', 'yield', 'payout', 'distribution', 'income stock', 'dividend increase'],
  'earnings': ['earnings', 'quarterly results', 'financial results', 'profit', 'revenue', 'guidance'],
  'ev': ['electric vehicle', 'ev', 'tesla', 'rivian', 'lucid', 'charging', 'battery'],
  'energy': ['energy', 'renewable', 'solar', 'wind power', 'oil', 'natural gas', 'power'],
  'financials': ['bank', 'financial sector', 'banking', 'interest rates', 'lending', 'credit'],
  'global-macro': ['global economy', 'trade', 'gdp', 'economic growth', 'international', 'world economy'],
  'ipo': ['ipo', 'public offering', 'debut', 'listing', 'going public', 'market debut'],
  'ma': ['merger', 'acquisition', 'takeover', 'deal', 'buyout', 'consolidation'],
  'interest-rates': ['interest rate', 'fed', 'federal reserve', 'monetary policy', 'rate hike', 'powell'],
  'reits': ['reit', 'real estate', 'property', 'dividend yield', 'commercial property', 'rental'],
  'spacs': ['spac', 'blank check', 'special purpose', 'merger', 'pipe investment'],
  'tech': ['technology', 'software', 'hardware', 'cloud', 'cybersecurity', 'digital'],
  'us-economy': ['us economy', 'inflation', 'jobs report', 'employment', 'consumer spending', 'retail sales']
};

// Company names associated with each category
const CATEGORY_COMPANIES: Record<NewsCategory, string[]> = {
  'ai-tech': ['NVIDIA', 'Microsoft', 'Google', 'OpenAI', 'IBM', 'C3.ai', 'Palantir'],
  'biotech': ['Pfizer', 'Moderna', 'Amgen', 'Gilead', 'Regeneron', 'Biogen'],
  'ev': ['Tesla', 'Rivian', 'Lucid', 'NIO', 'ChargePoint', 'QuantumScape'],
  'tech': ['Apple', 'Microsoft', 'Google', 'Meta', 'Amazon', 'NVIDIA'],
  // Add other categories as needed
};

export function classifyNewsArticle(article: MarketNews, category: NewsCategory): boolean {
  const text = `${article.headline} ${article.summary}`.toLowerCase();
  
  // Check category keywords
  const hasKeywords = CATEGORY_KEYWORDS[category].some(keyword => 
    text.includes(keyword.toLowerCase())
  );

  // Check company names if available for the category
  const hasCompanyMention = CATEGORY_COMPANIES[category]?.some(company =>
    text.includes(company.toLowerCase())
  );

  // Special case for trending - recent articles with high engagement
  if (category === 'trending') {
    const isRecent = (Date.now() / 1000 - article.datetime) < 86400; // Last 24 hours
    return isRecent;
  }

  return hasKeywords || hasCompanyMention;
}

export function getRelevanceScore(article: MarketNews, category: NewsCategory): number {
  const text = `${article.headline} ${article.summary}`.toLowerCase();
  let score = 0;

  // Check keyword matches
  CATEGORY_KEYWORDS[category].forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      score += 1;
      // Bonus for keyword in headline
      if (article.headline.toLowerCase().includes(keyword.toLowerCase())) {
        score += 0.5;
      }
    }
  });

  // Check company mentions
  CATEGORY_COMPANIES[category]?.forEach(company => {
    if (text.includes(company.toLowerCase())) {
      score += 1;
    }
  });

  // Recency bonus
  const hoursAgo = (Date.now() / 1000 - article.datetime) / 3600;
  if (hoursAgo < 24) {
    score += 1;
  } else if (hoursAgo < 48) {
    score += 0.5;
  }

  return score;
}