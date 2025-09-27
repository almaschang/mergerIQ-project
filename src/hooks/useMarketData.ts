import useSWR from 'swr';
import { fetchMarketData, MarketDataItem } from '../utils/market/marketDataService';

export function useMarketData() {
  const { data, error } = useSWR('market-data', fetchMarketData, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: false
  });

  return {
    markets: data || [],
    isLoading: !error && !data,
    isError: error
  };
}