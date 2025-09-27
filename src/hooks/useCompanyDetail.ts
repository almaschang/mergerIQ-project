import useSWR from 'swr';
import { getCompanyProfile } from '../utils/market/companyProfile';
import { getCompanyNews } from '../utils/market/companyNews';
import { API_CONFIG } from '../config/api';

export function useCompanyDetail(symbol: string | null) {
  const { data: profile, error: profileError } = useSWR(
    symbol ? ['company-profile', symbol] : null,
    () => symbol ? getCompanyProfile(symbol) : null,
    { 
      revalidateOnFocus: false,
      dedupingInterval: 60000 // Cache profile for 1 minute
    }
  );

  const { data: news, error: newsError } = useSWR(
    symbol ? ['company-news', symbol] : null,
    () => symbol ? getCompanyNews(symbol) : null,
    { 
      refreshInterval: API_CONFIG.REFRESH_INTERVALS.MARKET_NEWS,
      revalidateOnFocus: false
    }
  );

  return {
    profile,
    news: news || [],
    isLoading: (!profile || !news) && !profileError && !newsError,
    isError: profileError || newsError
  };
}