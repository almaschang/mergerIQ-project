import { MarketNews, StockQuote } from '../types/market';

const API_KEY = 'cn7nvrhr01qjf8gk1260'; // Free API key for demo purposes
const BASE_URL = 'https://finnhub.io/api/v1';

export async function fetchMarketNews(): Promise<MarketNews[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/news?category=general&token=${API_KEY}`
    );
    const data = await response.json();
    
    // Ensure we always return an array
    if (!Array.isArray(data)) {
      console.error('Market news API did not return an array:', data);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching market news:', error);
    return [];
  }
}

export async function fetchStockQuote(symbol: string): Promise<StockQuote> {
  const response = await fetch(
    `${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`
  );
  return response.json();
}

export async function fetchTopStocks(): Promise<string[]> {
  return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
}