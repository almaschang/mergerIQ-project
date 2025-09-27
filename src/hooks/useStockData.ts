import useSWR from 'swr';
import { API_CONFIG } from '../config/api';
import { getFmpApiKey } from '../utils/market/fmpApiKeys';

interface StockData {
  overview: {
    currentPrice: number;
    dayChange: number;
    dayChangePercent: number;
    dayHigh: number;
    dayLow: number;
    openPrice: number;
    prevClose: number;
    weekHigh52: number;
    weekLow52: number;
    preMarket?: {
      price: number;
      change: number;
      changePercent: number;
    };
    afterHours?: {
      price: number;
      change: number;
      changePercent: number;
    };
  };
  metrics: {
    marketCap: number;
    peRatio: number;
    eps: number;
    pbRatio: number;
    debtToEquity: number;
    dividendYield: number;
    revenue: number;
    netIncome: number;
  };
  performance: {
    historicalPerformance: {
      period: string;
      change: number;
    }[];
    volatility: number;
    beta: number;
    shortInterest: number;
    institutionalHoldings: number;
    analystRatings: {
      buy: number;
      hold: number;
      sell: number;
      targetPrice: number;
    };
  };
}

export function useStockData(symbol: string) {
  const { data, error } = useSWR<StockData>(
    symbol ? `stock-data-${symbol}` : null,
    async () => {
      try {
        // Fetch quote data
        const quoteResponse = await fetch(
          `${API_CONFIG.FMP_BASE_URL}/quote/${symbol}?apikey=${getFmpApiKey()}`
        );
        const quoteData = await quoteResponse.json();
        const quote = quoteData[0];

        // Fetch key metrics
        const metricsResponse = await fetch(
          `${API_CONFIG.FMP_BASE_URL}/key-metrics-ttm/${symbol}?apikey=${getFmpApiKey()}`
        );
        const metricsData = await metricsResponse.json();
        const metrics = metricsData[0];

        // Fetch analyst ratings
        const ratingsResponse = await fetch(
          `${API_CONFIG.FMP_BASE_URL}/analyst-stock-recommendations/${symbol}?apikey=${getFmpApiKey()}`
        );
        const ratingsData = await ratingsResponse.json();
        const ratings = ratingsData[0];

        // Fetch historical data for performance
        const historicalResponse = await fetch(
          `${API_CONFIG.FMP_BASE_URL}/historical-price-full/${symbol}?apikey=${getFmpApiKey()}`
        );
        const historicalData = await historicalResponse.json();
        const historical = historicalData.historical;

        // Calculate performance periods
        const calculateChange = (days: number) => {
          if (!historical || historical.length < days) return 0;
          const currentPrice = historical[0].close;
          const pastPrice = historical[Math.min(days, historical.length - 1)].close;
          return ((currentPrice - pastPrice) / pastPrice) * 100;
        };

        return {
          overview: {
            currentPrice: quote.price || 0,
            dayChange: quote.change || 0,
            dayChangePercent: quote.changesPercentage || 0,
            dayHigh: quote.dayHigh || 0,
            dayLow: quote.dayLow || 0,
            openPrice: quote.open || 0,
            prevClose: quote.previousClose || 0,
            weekHigh52: quote.yearHigh || 0,
            weekLow52: quote.yearLow || 0
          },
          metrics: {
            marketCap: quote.marketCap || 0,
            peRatio: metrics?.peRatioTTM || 0,
            eps: metrics?.netIncomePerShareTTM || 0,
            pbRatio: metrics?.pbRatioTTM || 0,
            debtToEquity: metrics?.debtToEquityTTM || 0,
            dividendYield: (quote.lastDividend || 0) / quote.price * 100,
            revenue: metrics?.revenueTTM || 0,
            netIncome: metrics?.netIncomeTTM || 0
          },
          performance: {
            historicalPerformance: [
              { period: '1D', change: quote.changesPercentage || 0 },
              { period: '5D', change: calculateChange(5) },
              { period: '1M', change: calculateChange(30) },
              { period: '6M', change: calculateChange(180) },
              { period: 'YTD', change: calculateChange(new Date().getMonth() * 30 + new Date().getDate()) },
              { period: '1Y', change: calculateChange(365) }
            ],
            volatility: metrics?.volatilityTTM || 0,
            beta: quote.beta || 0,
            shortInterest: metrics?.shortRatioTTM || 0,
            institutionalHoldings: metrics?.institutionalOwnershipPercentageTTM || 0,
            analystRatings: {
              buy: ratings?.strongBuy + ratings?.buy || 0,
              hold: ratings?.hold || 0,
              sell: ratings?.sell + ratings?.strongSell || 0,
              targetPrice: ratings?.targetMedianPrice || 0
            }
          }
        };
      } catch (error) {
        console.error('Error fetching stock data:', error);
        throw error;
      }
    },
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true
    }
  );

  return {
    data,
    isLoading: !error && !data,
    error
  };
}