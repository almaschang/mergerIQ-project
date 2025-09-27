import { API_CONFIG } from '../../config/api';

export interface MarketDataItem {
  symbol: string;
  name: string;
  change: number;
  changeToday: number;
  change5Day: number;
  change1Month: number;
  changeYTD: number;
  change1Year: number;
  change3Year: number;
}

const MARKET_INDICES = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'DIA', name: 'Dow Jones' },
  { symbol: 'QQQ', name: 'NASDAQ 100' },
  { symbol: 'IWM', name: 'Russell 2000' },
  { symbol: 'VTI', name: 'Total Market' }
];

const SECTOR_ETFS = [
  { symbol: 'XLK', name: 'Technology' },
  { symbol: 'XLV', name: 'Healthcare' },
  { symbol: 'XLF', name: 'Financials' },
  { symbol: 'XLC', name: 'Communication' },
  { symbol: 'XLY', name: 'Consumer Discretionary' },
  { symbol: 'XLP', name: 'Consumer Staples' },
  { symbol: 'XLI', name: 'Industrials' },
  { symbol: 'XLE', name: 'Energy' },
  { symbol: 'XLB', name: 'Materials' },
  { symbol: 'XLU', name: 'Utilities' },
  { symbol: 'XLRE', name: 'Real Estate' }
];

async function fetchQuotes(symbols: string[]): Promise<Record<string, any>> {
  try {
    const response = await fetch(
      `${API_CONFIG.FINNHUB_BASE_URL}/quote?symbols=${symbols.join(',')}&token=${API_CONFIG.FINNHUB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return {};
  }
}

export async function fetchMarketData(): Promise<MarketDataItem[]> {
  try {
    const symbols = MARKET_INDICES.map(index => index.symbol);
    const quotes = await fetchQuotes(symbols);

    return MARKET_INDICES.map(index => {
      const quote = quotes[index.symbol] || {};
      return {
        symbol: index.symbol,
        name: index.name,
        change: quote.dp || 0,
        changeToday: quote.dp || 0,
        change5Day: Math.random() * 2 - 1, // Simulated data
        change1Month: Math.random() * 5 - 2.5,
        changeYTD: Math.random() * 10 - 5,
        change1Year: Math.random() * 20 - 10,
        change3Year: Math.random() * 40 - 20
      };
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
    return [];
  }
}

export async function fetchSectorData(): Promise<MarketDataItem[]> {
  try {
    const symbols = SECTOR_ETFS.map(sector => sector.symbol);
    const quotes = await fetchQuotes(symbols);

    return SECTOR_ETFS.map(sector => {
      const quote = quotes[sector.symbol] || {};
      return {
        symbol: sector.symbol,
        name: sector.name,
        change: quote.dp || 0,
        changeToday: quote.dp || 0,
        change5Day: Math.random() * 2 - 1, // Simulated data
        change1Month: Math.random() * 5 - 2.5,
        changeYTD: Math.random() * 10 - 5,
        change1Year: Math.random() * 20 - 10,
        change3Year: Math.random() * 40 - 20
      };
    });
  } catch (error) {
    console.error('Error fetching sector data:', error);
    return [];
  }
}