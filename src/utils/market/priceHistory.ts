import { API_CONFIG } from '../../config/api';
import { fetchWithFmpApiKey } from './fmpApiKeys';

export interface PriceHistoryPoint {
  date: string;
  close: number;
}

export async function fetchHistoricalPrices(
  symbol: string,
  timeseries: number = 120
): Promise<PriceHistoryPoint[]> {
  try {
    const response = await fetchWithFmpApiKey(
      `${API_CONFIG.FMP_BASE_URL}/historical-price-full/${symbol}?serietype=line&timeseries=${Math.max(30, timeseries)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch price history: ${response.status}`);
    }

    const data = await response.json();
    const history = Array.isArray(data?.historical) ? data.historical : [];

    return history
      .map((point: any) => ({
        date: point.date,
        close: Number(point.close || point.price || 0)
      }))
      .filter((point) => Number.isFinite(point.close) && point.close > 0);
  } catch (error) {
    console.warn(`Price history fetch error for ${symbol}:`, error);
    return [];
  }
}
