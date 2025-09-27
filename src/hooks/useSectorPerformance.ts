import useSWR from 'swr';
import { fetchSectorData, MarketDataItem } from '../utils/market/marketDataService';

export function useSectorPerformance() {
  const { data, error } = useSWR('sector-performance', fetchSectorData, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: false
  });

  return {
    sectors: data || [],
    isLoading: !error && !data,
    isError: error
  };
}