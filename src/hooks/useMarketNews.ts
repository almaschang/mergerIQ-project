import useSWR from 'swr';
import { fetchMarketNews } from '../utils/market/newsService';
import { API_CONFIG } from '../config/api';
import { NewsCategory } from '../components/market/NewsCategoryToolbar';

export function useMarketNews(category?: NewsCategory) {
  const { data, error } = useSWR(
    category ? ['market-news', category] : 'market-news',
    () => fetchMarketNews(category),
    { 
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.MARKET_NEWS,
      revalidateOnFocus: false
    }
  );

  return {
    news: data || [],
    isLoading: !error && !data,
    isError: error
  };
}