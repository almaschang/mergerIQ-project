import { StockQuote } from '../../types/market';
import { API_CONFIG } from '../../config/api';
import { getFmpApiKey } from './fmpApiKeys';

// Pool of Finnhub API keys
const FINNHUB_KEYS = [
  'cuok3mhr01qve8ptqqjgcuok3mhr01qve8ptqqk0',
  'cuok4ahr01qve8ptqu30cuok4ahr01qve8ptqu3g',
  'cuok4mpr01qve8ptqvv0cuok4mpr01qve8ptqvvg',
  'cuok4v9r01qve8ptr1dgcuok4v9r01qve8ptr1e0',
  'cuok581r01qve8ptr2vgcuok581r01qve8ptr300',
  'cuok5g9r01qve8ptr4egcuok5g9r01qve8ptr4f0',
  'cuok5npr01qve8ptr5o0cuok5npr01qve8ptr5og'
];

// Pool of Alpha Vantage keys
const ALPHA_VANTAGE_KEYS = [
  '1CS9ZDELAIA5DP8I',
  'Y1SJE0HC1CMVGLRI',
  'JNANPEC13JUETWV7',
  'MBOU40OBMIQ8ZUS9',
  'J5ZMDZB07WO0C4LU',
  'ORPA8LMMZLR5N9AD',
  'RKWRP1OYHI0Y9L6J'
];

let currentFinnhubKeyIndex = 0;
let currentAlphaVantageKeyIndex = 0;

function getNextFinnhubKey(): string {
  const key = FINNHUB_KEYS[currentFinnhubKeyIndex];
  currentFinnhubKeyIndex = (currentFinnhubKeyIndex + 1) % FINNHUB_KEYS.length;
  return key;
}

function getNextAlphaVantageKey(): string {
  const key = ALPHA_VANTAGE_KEYS[currentAlphaVantageKeyIndex];
  currentAlphaVantageKeyIndex = (currentAlphaVantageKeyIndex + 1) % ALPHA_VANTAGE_KEYS.length;
  return key;
}

async function fetchFinnhubQuote(symbol: string): Promise<StockQuote | null> {
  const maxRetries = FINNHUB_KEYS.length;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = getNextFinnhubKey();
      const response = await fetch(
        `${API_CONFIG.FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${apiKey}`
      );

      if (response.status === 429) {
        // Rate limited, try next key
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate the data has actual values
      if (!data || typeof data.c !== 'number') {
        continue;
      }

      return {
        c: data.c,
        d: data.d,
        dp: data.dp,
        h: data.h,
        l: data.l,
        o: data.o,
        pc: data.pc
      };
    } catch (error) {
      lastError = error as Error;
      if (error instanceof Error && !error.message.includes('429')) {
        console.warn(`Finnhub error with key ${attempt + 1}:`, error);
      }
    }
  }

  console.warn('All Finnhub API keys exhausted:', lastError);
  return null;
}

async function fetchAlphaVantageQuote(symbol: string): Promise<StockQuote | null> {
  const maxRetries = ALPHA_VANTAGE_KEYS.length;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = getNextAlphaVantageKey();
      const response = await fetch(
        `${API_CONFIG.ALPHA_VANTAGE_BASE_URL}/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );

      if (response.status === 429) {
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const quote = data['Global Quote'];

      if (!quote || !quote['05. price']) {
        continue;
      }

      return {
        c: parseFloat(quote['05. price']),
        d: parseFloat(quote['09. change']),
        dp: parseFloat(quote['10. change percent'].replace('%', '')),
        h: parseFloat(quote['03. high']),
        l: parseFloat(quote['04. low']),
        o: parseFloat(quote['02. open']),
        pc: parseFloat(quote['08. previous close'])
      };
    } catch (error) {
      lastError = error as Error;
      if (error instanceof Error && !error.message.includes('429')) {
        console.warn(`Alpha Vantage error with key ${attempt + 1}:`, error);
      }
    }
  }

  console.warn('All Alpha Vantage API keys exhausted:', lastError);
  return null;
}

async function fetchFmpQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.FMP_BASE_URL}/quote/${symbol}?apikey=${getFmpApiKey()}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0 || !data[0].price) {
      return null;
    }

    const quote = data[0];
    return {
      c: quote.price,
      d: quote.change,
      dp: quote.changesPercentage,
      h: quote.dayHigh,
      l: quote.dayLow,
      o: quote.open,
      pc: quote.previousClose
    };
  } catch (error) {
    console.warn('FMP quote error:', error);
    return null;
  }
}

export async function fetchStockQuote(symbol: string): Promise<StockQuote> {
  try {
    // Try all sources concurrently
    const [finnhubQuote, alphaVantageQuote, fmpQuote] = await Promise.all([
      fetchFinnhubQuote(symbol),
      fetchAlphaVantageQuote(symbol),
      fetchFmpQuote(symbol)
    ]);

    // Use the first valid quote that has actual data
    if (finnhubQuote?.c) return finnhubQuote;
    if (alphaVantageQuote?.c) return alphaVantageQuote;
    if (fmpQuote?.c) return fmpQuote;

    throw new Error('No valid quote data available from any source');
  } catch (error) {
    console.error(`Error fetching stock quote for ${symbol}:`, error);
    throw error;
  }
}

export async function fetchStockMetrics(symbol: string) {
  try {
    const response = await fetch(
      `${API_CONFIG.FMP_BASE_URL}/key-metrics-ttm/${symbol}?apikey=${getFmpApiKey()}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const metrics = data[0];
    return {
      marketCap: metrics.marketCapTTM || 0,
      peRatio: metrics.peRatioTTM || 0,
      pbRatio: metrics.pbRatioTTM || 0,
      debtToEquity: metrics.debtToEquityTTM || 0,
      eps: metrics.netIncomePerShareTTM || 0,
      dividendYield: metrics.dividendYieldTTM || 0,
      revenue: metrics.revenueTTM || 0,
      netIncome: metrics.netIncomeTTM || 0
    };
  } catch (error) {
    console.error('Error fetching stock metrics:', error);
    return null;
  }
}

export async function fetchTopStocks(): Promise<string[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.FMP_BASE_URL}/stock-screener?marketCapMoreThan=100000000000&limit=5&apikey=${getFmpApiKey()}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map(stock => stock.symbol);
    }

    return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
  } catch (error) {
    console.error('Error fetching top stocks:', error);
    return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
  }
}