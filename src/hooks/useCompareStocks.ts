import useSWR from 'swr';
import { ComparisonData } from '../types/comparison';
import { API_CONFIG } from '../config/api';
import { fetchWithFmpApiKey } from '../utils/market/fmpApiKeys';

async function fetchComparisonData(symbol: string): Promise<ComparisonData | null> {
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
      throw new Error('Incomplete comparison dataset');
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
    console.warn(`Comparison data fetch failed for ${symbol}:`, error);
    return null;
  }
}

function buildFallback(symbol: string): ComparisonData {
  return {
    symbol: symbol.toUpperCase(),
    exchange: undefined,
    name: symbol.toUpperCase(),
    sector: 'N/A',
    industry: 'N/A',
    marketCap: 0,
    enterpriseValue: 0,
    employees: 0,
    peRatio: 0,
    priceToSales: 0,
    priceToBook: 0,
    currentPrice: 0,
    dayChange: 0,
    volume: 0,
    analystCount: 0,
    wallStreetAnalysts: 0
  };
}

export function useCompareStocks(symbols: string[]) {
  const { data, error } = useSWR(
    symbols.length ? ['compare-stocks', ...symbols] : null,
    async () => {
      const companiesData = await Promise.all(symbols.map(fetchComparisonData));
      return companiesData
        .filter((company): company is ComparisonData => Boolean(company))
        .sort((a, b) => b.marketCap - a.marketCap);
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  const comparisons = data && data.length ? data : symbols.map(buildFallback);

  return {
    comparisons,
    isLoading: !error && !data,
    isError: error
  };
}

