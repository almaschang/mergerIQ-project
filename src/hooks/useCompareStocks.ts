import useSWR from 'swr';
import { ComparisonData } from '../types/comparison';
import { fetchCompanyComparable } from '../utils/market/companyComparables';

export function useCompareStocks(symbols: string[]) {
  const { data, error } = useSWR(
    symbols.length ? ['compare-stocks', ...symbols] : null,
    async () => {
      const companiesData = await Promise.all(symbols.map(fetchCompanyComparable));
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

  const comparisons = data && data.length ? data : symbols.map((symbol) => ({
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
  } satisfies ComparisonData));

  return {
    comparisons,
    isLoading: !error && !data,
    isError: error
  };
}
