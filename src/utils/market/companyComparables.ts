import { API_CONFIG } from '../../config/api';
import { ComparisonData } from '../../types/comparison';
import { fetchWithFmpApiKey } from './fmpApiKeys';

export async function fetchCompanyComparable(symbol: string): Promise<ComparisonData | null> {
  try {
    const [profileResponse, quoteResponse, metricsResponse] = await Promise.all([
      fetchWithFmpApiKey(`${API_CONFIG.FMP_BASE_URL}/profile/${symbol}`),
      fetchWithFmpApiKey(`${API_CONFIG.FMP_BASE_URL}/quote/${symbol}`),
      fetchWithFmpApiKey(`${API_CONFIG.FMP_BASE_URL}/key-metrics-ttm/${symbol}`)
    ]);

    if (!profileResponse.ok || !quoteResponse.ok) {
      throw new Error('Failed to load comparison data');
    }

    const [profileData, quoteData, metricsData] = await Promise.all([
      profileResponse.json(),
      quoteResponse.json(),
      metricsResponse.ok ? metricsResponse.json() : Promise.resolve([])
    ]);

    const profile = profileData?.[0];
    const quote = quoteData?.[0];
    const metric = metricsData?.[0];

    if (!profile || !quote) {
      return null;
    }

    return {
      symbol: symbol.toUpperCase(),
      exchange: profile.exchangeShortName || profile.exchange || undefined,
      name: profile.companyName || quote.name || symbol,
      sector: profile.sector || 'N/A',
      industry: profile.industry || 'N/A',
      marketCap: profile.mktCap || quote.marketCap || 0,
      enterpriseValue: metric?.enterpriseValueTTM || profile.enterpriseValue || 0,
      employees: profile.fullTimeEmployees || profile.employees || 0,
      peRatio: metric?.peRatioTTM || profile.priceEarningsRatio || quote.pe || 0,
      priceToSales: metric?.priceToSalesRatioTTM || 0,
      priceToBook: metric?.pbRatioTTM || 0,
      currentPrice: quote.price || 0,
      dayChange: quote.changesPercentage || 0,
      volume: quote.volume || 0,
      analystCount: profile.analystTargetCount || 0,
      wallStreetAnalysts: profile.analystTargetCount || 0
    } satisfies ComparisonData;
  } catch (error) {
    console.warn(`Comparison fetch failed for ${symbol}:`, error);
    return null;
  }
}
