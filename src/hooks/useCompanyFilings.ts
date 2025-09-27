import useSWR from 'swr';
import { FilingType, SECFiling } from '../types/secFilings';
import { getCompanyFilings } from '../utils/market/secService';

export function useCompanyFilings(symbol: string, type?: FilingType) {
  const { data, error } = useSWR(
    symbol ? ['company-filings', symbol, type] : null,
    () => getCompanyFilings(symbol, type),
    { 
      revalidateOnFocus: false,
      dedupingInterval: 300000 // Cache for 5 minutes
    }
  );

  return {
    filings: data || [],
    isLoading: !error && !data,
    isError: error
  };
}