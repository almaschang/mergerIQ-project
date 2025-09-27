import { MarketNews } from '../../types/market';
import { API_CONFIG } from '../../config/api';
import { NewsCategory } from '../../components/market/NewsCategoryToolbar';

let currentKeyIndex = 0;

function getNextApiKey(): string {
  const key = API_CONFIG.SEEKING_ALPHA_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_CONFIG.SEEKING_ALPHA_API_KEYS.length;
  return key;
}

function getHeaders() {
  return {
    'x-rapidapi-host': 'seeking-alpha.p.rapidapi.com',
    'x-rapidapi-key': getNextApiKey()
  };
}

export async function fetchSeekingAlphaNews(category?: NewsCategory): Promise<MarketNews[]> {
  try {
    // Map categories to Seeking Alpha themes
    const theme = category ? mapCategoryToTheme(category) : 'market-news';
    
    const response = await fetch(
      `${API_CONFIG.SEEKING_ALPHA_BASE_URL}/news/v2/list?themes=${theme}&size=20`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return formatSeekingAlphaNews(data.data || []);
  } catch (error) {
    console.warn('Seeking Alpha news error:', error);
    // Try another API key if we get a rate limit error
    if (error instanceof Error && error.message.includes('429')) {
      return fetchSeekingAlphaNews(category);
    }
    return [];
  }
}

export async function fetchSeekingAlphaCompanyNews(symbol: string): Promise<MarketNews[]> {
  try {
    const [newsResponse, pressReleasesResponse, analysisResponse] = await Promise.all([
      fetch(`${API_CONFIG.SEEKING_ALPHA_BASE_URL}/news/v2/list-by-symbol?size=20&number=1&id=${symbol.toLowerCase()}`, { headers: getHeaders() }),
      fetch(`${API_CONFIG.SEEKING_ALPHA_BASE_URL}/press-releases/v2/list?id=${symbol.toLowerCase()}&size=20&number=1`, { headers: getHeaders() }),
      fetch(`${API_CONFIG.SEEKING_ALPHA_BASE_URL}/analysis/v2/list?id=${symbol.toLowerCase()}&size=20&number=1`, { headers: getHeaders() })
    ]);

    const [newsData, pressReleasesData, analysisData] = await Promise.all([
      newsResponse.json(),
      pressReleasesResponse.json(),
      analysisResponse.json()
    ]);

    const combinedNews = [
      ...formatSeekingAlphaNews(newsData.data || [], false),
      ...formatSeekingAlphaNews(pressReleasesData.data || [], false, 'press-release'),
      ...formatSeekingAlphaNews(analysisData.data || [], true, 'analysis')
    ];

    return combinedNews;
  } catch (error) {
    console.warn(`Seeking Alpha company news error for ${symbol}:`, error);
    // Try another API key if we get a rate limit error
    if (error instanceof Error && error.message.includes('429')) {
      return fetchSeekingAlphaCompanyNews(symbol);
    }
    return [];
  }
}

function formatSeekingAlphaNews(items: any[], isAnalysis: boolean = false, category: string = 'market-news'): MarketNews[] {
  return items.map(item => ({
    category,
    datetime: new Date(item.attributes?.publishOn || item.attributes?.created).getTime() / 1000,
    headline: item.attributes?.title,
    id: item.id,
    image: item.attributes?.gettyImageUrl || '',
    related: item.attributes?.symbol || '',
    source: 'Seeking Alpha',
    summary: item.attributes?.summary || item.attributes?.description || '',
    url: `https://seekingalpha.com${item.links?.self || ''}`,
    isAnalysis,
    analysisType: isAnalysis ? 'professional' : undefined,
    author: item.attributes?.author?.name || ''
  }));
}

function mapCategoryToTheme(category: NewsCategory): string {
  const themeMap: Record<NewsCategory, string> = {
    'tech': 'technology',
    'biotech': 'healthcare',
    'energy': 'energy',
    'financials': 'financial',
    'crypto': 'cryptocurrency',
    'commodities': 'commodities',
    'global-macro': 'global-markets',
    'ma': 'merger-acquisition',
    'earnings': 'earnings',
    'ipo': 'ipo-spac',
    'interest-rates': 'economy',
    'reits': 'reits',
    // Default to market-news for other categories
    'trending': 'market-news',
    'ai-tech': 'technology',
    'buybacks': 'market-news',
    'debt-issuance': 'market-news',
    'dividends': 'dividends',
    'ev': 'technology',
    'spacs': 'ipo-spac',
    'us-economy': 'economy'
  };

  return themeMap[category] || 'market-news';
}