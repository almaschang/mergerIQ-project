import useSWR from 'swr';
import { StockQuote } from '../types/market';
import { fetchStockQuote } from '../utils/market/stockService';
import { API_CONFIG } from '../config/api';

export function useStockQuote(symbol: string) {
  const { data, error } = useSWR(
    `stock-${symbol}`,
    () => fetchStockQuote(symbol),
    { refreshInterval: API_CONFIG.REFRESH_INTERVALS.STOCK_QUOTES }
  );

  return {
    quote: data,
    isLoading: !error && !data,
    isError: error
  };
}