import useSWR from 'swr';
import { fetchCompanyNews } from '../utils/market/newsService';

export function useCompanyNews(symbol: string) {
  const { data, error } = useSWR(
    symbol ? ['company-news', symbol] : null,
    () => fetchCompanyNews(symbol),
    { 
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: false
    }
  );

  return {
    news: data || [],
    isLoading: !error && !data,
    isError: error
  };
}