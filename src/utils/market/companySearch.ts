import { CompanySearchResult } from '../../types/company';
import { API_CONFIG } from '../../config/api';

async function searchFinnhub(query: string): Promise<CompanySearchResult[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.FINNHUB_BASE_URL}/search?q=${encodeURIComponent(query)}&token=${API_CONFIG.FINNHUB_API_KEY}`
    );
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.warn('Finnhub search error:', error);
    return [];
  }
}

async function searchAlphaVantage(query: string): Promise<CompanySearchResult[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.ALPHA_VANTAGE_BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${API_CONFIG.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data.bestMatches) {
      return data.bestMatches.map((match: any) => ({
        description: match['2. name'],
        displaySymbol: match['1. symbol'],
        symbol: match['1. symbol'],
        type: match['3. type']
      }));
    }
    return [];
  } catch (error) {
    console.warn('Alpha Vantage search error:', error);
    return [];
  }
}

export async function searchCompanies(query: string): Promise<CompanySearchResult[]> {
  if (!query.trim()) return [];

  try {
    // Try Finnhub first
    const finnhubResults = await searchFinnhub(query);
    if (finnhubResults.length > 0) {
      return finnhubResults;
    }

    // Fallback to Alpha Vantage
    const alphaVantageResults = await searchAlphaVantage(query);
    if (alphaVantageResults.length > 0) {
      return alphaVantageResults;
    }

    return [];
  } catch (error) {
    console.error('Error searching companies:', error);
    return [];
  }
}