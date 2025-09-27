import useSWR from 'swr';
import { ComparisonData } from '../types/comparison';
import { API_CONFIG } from '../config/api';
import { getFmpApiKey } from '../utils/market/fmpApiKeys';

export function useCompareStocks(symbols: string[]) {
  const { data, error } = useSWR(
    symbols.length ? ['compare-stocks', ...symbols] : null,
    async () => {
      try {
        // Fetch data for all symbols in parallel with retries
        const companiesData = await Promise.all(
          symbols.map(async (symbol) => {
            const maxRetries = 3;
            let lastError: Error | null = null;

            for (let attempt = 0; attempt < maxRetries; attempt++) {
              try {
                const apiKey = getFmpApiKey();

                // Fetch company profile
                const profileResponse = await fetch(
                  `${API_CONFIG.FMP_BASE_URL}/profile/${symbol}?apikey=${apiKey}`
                );
                if (!profileResponse.ok) {
                  throw new Error(`Error fetching profile: ${profileResponse.status}`);
                }
                const profiles = await profileResponse.json();
                const profile = profiles[0];

                if (!profile) {
                  throw new Error('No profile data available');
                }

                // Fetch quote for current price and day change
                const quoteResponse = await fetch(
                  `${API_CONFIG.FMP_BASE_URL}/quote/${symbol}?apikey=${apiKey}`
                );
                if (!quoteResponse.ok) {
                  throw new Error(`Error fetching quote: ${quoteResponse.status}`);
                }
                const quotes = await quoteResponse.json();
                const quote = quotes[0];

                if (!quote) {
                  throw new Error('No quote data available');
                }

                // Fetch key metrics
                const metricsResponse = await fetch(
                  `${API_CONFIG.FMP_BASE_URL}/key-metrics-ttm/${symbol}?apikey=${apiKey}`
                );
                if (!metricsResponse.ok) {
                  throw new Error(`Error fetching metrics: ${metricsResponse.status}`);
                }
                const metrics = await metricsResponse.json();
                const metric = metrics[0];

                return {
                  symbol,
                  name: profile.companyName || symbol,
                  sector: profile.sector || 'N/A',
                  industry: profile.industry || 'N/A',
                  marketCap: profile.mktCap || 0,
                  enterpriseValue: metric?.enterpriseValueTTM || 0,
                  currentPrice: quote.price || 0,
                  dayChange: quote.changesPercentage || 0,
                  volume: quote.volume || 0,
                  employees: profile.fullTimeEmployees || 0,
                  analystCount: profile.analystTargetCount || 0,
                  wallStreetAnalysts: profile.analystTargetCount || 0
                };
              } catch (error) {
                lastError = error as Error;
                // If it's not the last attempt, wait before retrying
                if (attempt < maxRetries - 1) {
                  await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                  continue;
                }
                console.warn(`Failed to fetch data for ${symbol} after ${maxRetries} attempts:`, error);
              }
            }

            // If all retries failed, return a fallback object
            return {
              symbol,
              name: symbol,
              sector: 'N/A',
              industry: 'N/A',
              marketCap: 0,
              enterpriseValue: 0,
              currentPrice: 0,
              dayChange: 0,
              volume: 0,
              employees: 0,
              analystCount: 0,
              wallStreetAnalysts: 0
            };
          })
        );

        // Filter out any failed requests and sort by market cap
        return companiesData
          .filter((company): company is ComparisonData => company !== null)
          .sort((a, b) => b.marketCap - a.marketCap);
      } catch (error) {
        console.error('Error in useCompareStocks:', error);
        throw error;
      }
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 5000, // Prevent multiple requests within 5 seconds
      errorRetryCount: 3, // Retry failed requests up to 3 times
      errorRetryInterval: 5000, // Wait 5 seconds between retries
    }
  );

  return {
    comparisons: data || [],
    isLoading: !error && !data,
    isError: error
  };
}