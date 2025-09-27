import { StockQuote, MarketNews } from '../../types/market';
import { CompanyProfile } from '../../types/company';
import { API_CONFIG } from '../../config/api';

export async function fetchYahooQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.YAHOO_FINANCE_BASE_URL}/quote?symbols=${symbol}`
    );
    const data = await response.json();
    
    const quote = data?.quoteResponse?.result?.[0];
    if (!quote) return null;

    return {
      c: quote.regularMarketPrice,
      d: quote.regularMarketChange,
      dp: quote.regularMarketChangePercent,
      h: quote.regularMarketDayHigh,
      l: quote.regularMarketDayLow,
      o: quote.regularMarketOpen,
      pc: quote.regularMarketPreviousClose
    };
  } catch (error) {
    console.warn('Yahoo Finance quote API error:', error);
    return null;
  }
}

export async function fetchYahooNews(symbol?: string): Promise<MarketNews[]> {
  try {
    const query = symbol ? `?symbol=${symbol}` : '';
    const response = await fetch(
      `${API_CONFIG.YAHOO_FINANCE_BASE_URL}/news${query}`
    );
    const data = await response.json();
    
    return data?.news?.map((item: any) => ({
      category: 'general',
      datetime: item.providerPublishTime,
      headline: item.title,
      id: item.uuid,
      image: item.thumbnail?.resolutions?.[0]?.url || '',
      related: symbol || '',
      source: item.provider.displayName,
      summary: item.summary,
      url: item.link
    })) || [];
  } catch (error) {
    console.warn('Yahoo Finance news API error:', error);
    return [];
  }
}

export async function fetchYahooProfile(symbol: string): Promise<CompanyProfile | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.YAHOO_FINANCE_BASE_URL}/quoteSummary/${symbol}?modules=assetProfile,price,defaultKeyStatistics`
    );
    const data = await response.json();
    
    const profile = data?.quoteSummary?.result?.[0];
    if (!profile) return null;

    const { assetProfile, price, defaultKeyStatistics } = profile;

    return {
      country: assetProfile.country || '',
      currency: price.currency || 'USD',
      exchange: price.exchangeName || '',
      ipo: defaultKeyStatistics.firstTradingDate || '',
      marketCapitalization: price.marketCap / 1000000,
      name: assetProfile.longName || '',
      phone: assetProfile.phone || '',
      shareOutstanding: defaultKeyStatistics.sharesOutstanding || 0,
      ticker: symbol,
      weburl: assetProfile.website || '',
      logo: '',
      industry: assetProfile.industry || ''
    };
  } catch (error) {
    console.warn('Yahoo Finance profile API error:', error);
    return null;
  }
}

export async function fetchYahooTopStocks(): Promise<string[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.YAHOO_FINANCE_BASE_URL}/screener/predefined/saved?scrId=day_gainers`
    );
    const data = await response.json();
    
    return data?.finance?.result?.[0]?.quotes
      ?.slice(0, 5)
      ?.map((quote: any) => quote.symbol) || [];
  } catch (error) {
    console.warn('Yahoo Finance top stocks API error:', error);
    return [];
  }
}